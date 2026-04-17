import secrets
import string
from datetime import datetime, timedelta, timezone
from typing import Any

from jose import jwt

from app.core.config import settings

ALGORITHM = "HS256"


def create_access_token(subject: str | Any, extra: dict | None = None) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": str(subject), "exp": expire, **(extra or {})}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(subject: str | Any, is_admin: bool = False) -> str:
    days = settings.REFRESH_TOKEN_EXPIRE_DAYS_ADMIN if is_admin else settings.REFRESH_TOKEN_EXPIRE_DAYS_USER
    expire = datetime.now(timezone.utc) + timedelta(days=days)
    payload = {"sub": str(subject), "exp": expire, "type": "refresh", "is_admin": is_admin}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])


def generate_otp() -> str:
    return "".join(secrets.choice(string.digits) for _ in range(settings.OTP_LENGTH))


def generate_token(length: int = 32) -> str:
    return secrets.token_urlsafe(length)
