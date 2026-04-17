from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.deps import get_db, require_admin
from app.models.user import User
from app.models.search_query import SearchQuery, QueryStatus
from app.schemas.user import UserRead, UserAdminUpdate

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users", response_model=list[UserRead])
async def list_users(
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    result = await db.execute(
        select(User).where(User.deleted_at.is_(None)).offset(skip).limit(limit)
    )
    return result.scalars().all()


@router.patch("/users/{user_id}", response_model=UserRead)
async def update_user(
    user_id: str,
    data: UserAdminUpdate,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    from fastapi import HTTPException, status
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if data.role is not None:
        user.role = data.role
    if data.is_active is not None:
        user.is_active = data.is_active
    await db.commit()
    await db.refresh(user)
    return user


@router.get("/stats")
async def get_stats(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    users_count = (await db.execute(select(func.count()).select_from(User).where(User.deleted_at.is_(None)))).scalar_one()
    queries_count = (await db.execute(select(func.count()).select_from(SearchQuery).where(SearchQuery.deleted_at.is_(None)))).scalar_one()
    completed = (await db.execute(select(func.count()).select_from(SearchQuery).where(SearchQuery.status == QueryStatus.COMPLETED))).scalar_one()
    failed = (await db.execute(select(func.count()).select_from(SearchQuery).where(SearchQuery.status == QueryStatus.FAILED))).scalar_one()
    return {
        "users": users_count,
        "queries_total": queries_count,
        "queries_completed": completed,
        "queries_failed": failed,
    }
