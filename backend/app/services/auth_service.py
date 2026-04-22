from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import timedelta
from app.models.user import User
from app.schemas.user import UserRegisterBuyer, UserRegisterSeller
from app.utils.security import get_password_hash, verify_password, create_access_token
from app.config import settings
from app.services.email_service import email_service


async def register_user(db: Session, user_data: UserRegisterBuyer | UserRegisterSeller) -> User:
    """Register a new user (buyer or seller)"""
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user
    user_dict = user_data.model_dump(exclude={"password"})
    user_dict["password_hash"] = get_password_hash(user_data.password)
    
    user = User(**user_dict)
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Send welcome email
    await email_service.send_welcome_email(
        user.email,
        user.full_name,
        user.account_type
    )
    
    return user


def authenticate_user(db: Session, email: str, password: str) -> User | None:
    """Authenticate a user with email and password"""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user


def create_token_for_user(user: User, remember_me: bool = False) -> str:
    """Create a JWT token for a user"""
    expires_delta = timedelta(days=settings.REMEMBER_ME_EXPIRE_DAYS if remember_me else settings.ACCESS_TOKEN_EXPIRE_DAYS)
    token_data = {"sub": user.id, "email": user.email, "account_type": user.account_type}
    return create_access_token(data=token_data, expires_delta=expires_delta)
