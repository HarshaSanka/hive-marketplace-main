from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
from datetime import datetime


class UserRegisterBase(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str
    mobile: str
    account_type: str = Field(..., pattern="^(buyer|seller)$")


class UserRegisterBuyer(UserRegisterBase):
    account_type: str = "buyer"


class UserRegisterSeller(UserRegisterBase):
    account_type: str = "seller"
    business_name: str
    business_address: str

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one number")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str
    remember_me: bool = False


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    mobile: str
    account_type: str
    business_name: Optional[str] = None
    business_address: Optional[str] = None
    profile_picture: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    mobile: Optional[str] = None
    business_name: Optional[str] = None
    business_address: Optional[str] = None


class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)

    @field_validator("new_password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one number")
        return v
