from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file="../.env", extra="ignore")

    PROJECT_NAME: str = "otzovik"
    DOMAIN: str = "otzovik.systemtool.ru"
    ENVIRONMENT: str = "production"

    DATABASE_URL: str
    REDIS_URL: str = "redis://redis:6379/0"

    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS_ADMIN: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS_USER: int = 1

    RESEND_API_KEY: str
    SMTP_FROM: str

    ADMIN_EMAIL: str

    OPENAI_API_KEY: str

    SEARXNG_URL: str = "http://searxng:8080"

    CORS_ORIGINS: list[str] = ["https://otzovik.systemtool.ru"]

    CELERY_BROKER_URL: str = "redis://redis:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://redis:6379/2"

    MAX_SITES_PER_QUERY: int = 20
    MAX_QUERIES_PER_HOUR: int = 5

    OTP_EXPIRE_SECONDS: int = 600  # 10 min
    OTP_LENGTH: int = 6


settings = Settings()
