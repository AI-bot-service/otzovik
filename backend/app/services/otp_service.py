import redis.asyncio as aioredis
from app.core.config import settings
from app.core.security import generate_otp

OTP_PREFIX = "otp:"
REFRESH_PREFIX = "refresh:"


class OTPService:
    def __init__(self, redis: aioredis.Redis) -> None:
        self.redis = redis

    async def create_otp(self, email: str) -> str:
        otp = generate_otp()
        key = f"{OTP_PREFIX}{email}"
        await self.redis.setex(key, settings.OTP_EXPIRE_SECONDS, otp)
        return otp

    async def verify_otp(self, email: str, otp: str) -> bool:
        key = f"{OTP_PREFIX}{email}"
        stored = await self.redis.get(key)
        if not stored:
            return False
        if stored.decode() != otp:
            return False
        await self.redis.delete(key)
        return True

    async def store_refresh_token(self, user_id: str, token: str, is_admin: bool) -> None:
        days = settings.REFRESH_TOKEN_EXPIRE_DAYS_ADMIN if is_admin else settings.REFRESH_TOKEN_EXPIRE_DAYS_USER
        key = f"{REFRESH_PREFIX}{user_id}:{token[-16:]}"
        await self.redis.setex(key, days * 86400, token)

    async def revoke_refresh_token(self, user_id: str, token: str) -> None:
        key = f"{REFRESH_PREFIX}{user_id}:{token[-16:]}"
        await self.redis.delete(key)

    async def is_refresh_token_valid(self, user_id: str, token: str) -> bool:
        key = f"{REFRESH_PREFIX}{user_id}:{token[-16:]}"
        stored = await self.redis.get(key)
        return stored is not None


async def get_redis() -> aioredis.Redis:
    return await aioredis.from_url(settings.REDIS_URL, decode_responses=False)
