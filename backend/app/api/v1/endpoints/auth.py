from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.deps import get_db
from app.core.security import create_access_token, create_refresh_token, decode_token
from app.core.email import send_otp_email
from app.core.config import settings
from app.models.user import User, UserRole
from app.schemas.auth import SendOTPRequest, VerifyOTPRequest, TokenResponse, RefreshRequest
from app.services.otp_service import OTPService, get_redis

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/send-otp", status_code=status.HTTP_204_NO_CONTENT)
async def send_otp(req: SendOTPRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == req.email, User.deleted_at.is_(None)))
    user = result.scalar_one_or_none()

    if not user:
        # Auto-create user on first login
        user = User(email=req.email)
        # First user with admin email gets admin role
        if req.email == settings.ADMIN_EMAIL:
            user.role = UserRole.ADMIN
        db.add(user)
        await db.commit()
        await db.refresh(user)

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is disabled")

    redis = await get_redis()
    otp_svc = OTPService(redis)
    otp = await otp_svc.create_otp(req.email)
    await send_otp_email(req.email, otp, is_admin=user.role == UserRole.ADMIN)
    await redis.aclose()


@router.post("/verify-otp", response_model=TokenResponse)
async def verify_otp(req: VerifyOTPRequest, db: AsyncSession = Depends(get_db)):
    redis = await get_redis()
    otp_svc = OTPService(redis)

    valid = await otp_svc.verify_otp(req.email, req.otp)
    if not valid:
        await redis.aclose()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired OTP")

    result = await db.execute(select(User).where(User.email == req.email, User.deleted_at.is_(None)))
    user = result.scalar_one_or_none()
    if not user or not user.is_active:
        await redis.aclose()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    is_admin = user.role == UserRole.ADMIN
    access_token = create_access_token(user.id, {"role": user.role.value})
    refresh_token = create_refresh_token(user.id, is_admin=is_admin)
    await otp_svc.store_refresh_token(user.id, refresh_token, is_admin=is_admin)
    await redis.aclose()

    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/refresh", response_model=TokenResponse)
async def refresh_tokens(req: RefreshRequest, db: AsyncSession = Depends(get_db)):
    try:
        payload = decode_token(req.refresh_token)
        user_id = payload["sub"]
        is_admin = payload.get("is_admin", False)
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    redis = await get_redis()
    otp_svc = OTPService(redis)
    valid = await otp_svc.is_refresh_token_valid(user_id, req.refresh_token)
    if not valid:
        await redis.aclose()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token revoked")

    result = await db.execute(select(User).where(User.id == user_id, User.deleted_at.is_(None)))
    user = result.scalar_one_or_none()
    if not user or not user.is_active:
        await redis.aclose()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    await otp_svc.revoke_refresh_token(user_id, req.refresh_token)
    access_token = create_access_token(user.id, {"role": user.role.value})
    new_refresh = create_refresh_token(user.id, is_admin=is_admin)
    await otp_svc.store_refresh_token(user.id, new_refresh, is_admin=is_admin)
    await redis.aclose()

    return TokenResponse(access_token=access_token, refresh_token=new_refresh)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(req: RefreshRequest):
    try:
        payload = decode_token(req.refresh_token)
        user_id = payload["sub"]
    except Exception:
        return

    redis = await get_redis()
    otp_svc = OTPService(redis)
    await otp_svc.revoke_refresh_token(user_id, req.refresh_token)
    await redis.aclose()
