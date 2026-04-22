from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.user import UserRegisterBuyer, UserRegisterSeller, UserLogin, TokenResponse, UserResponse
from app.services.auth_service import register_user, authenticate_user, create_token_for_user
from app.middleware.auth import get_current_user
from app.models.user import User

router = APIRouter()


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserRegisterBuyer | UserRegisterSeller,
    db: Session = Depends(get_db)
):
    """Register a new user (buyer or seller) and send welcome email"""
    user = await register_user(db, user_data)
    token = create_token_for_user(user)
    return TokenResponse(
        access_token=token,
        user=UserResponse.model_validate(user)
    )


@router.post("/login", response_model=TokenResponse)
async def login(
    credentials: UserLogin,
    db: Session = Depends(get_db)
):
    """Login with email and password"""
    user = authenticate_user(db, credentials.email, credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    token = create_token_for_user(user, remember_me=credentials.remember_me)
    return TokenResponse(
        access_token=token,
        user=UserResponse.model_validate(user)
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current authenticated user information"""
    return UserResponse.model_validate(current_user)
