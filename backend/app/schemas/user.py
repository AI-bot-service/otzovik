from datetime import datetime
from pydantic import BaseModel, EmailStr
from app.models.user import UserRole


class UserRead(BaseModel):
    id: str
    email: EmailStr
    full_name: str | None
    role: UserRole
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    full_name: str | None = None


class UserAdminUpdate(BaseModel):
    role: UserRole | None = None
    is_active: bool | None = None
