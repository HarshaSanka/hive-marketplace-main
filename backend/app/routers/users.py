from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.user import UserResponse, UserUpdate, PasswordUpdate
from app.services.user_service import update_user_profile, update_user_password
from app.middleware.auth import get_current_user
from app.models.user import User

router = APIRouter()


@router.get("/profile", response_model=UserResponse)
async def get_profile(current_user: User = Depends(get_current_user)):
    """Get current user's profile"""
    return UserResponse.model_validate(current_user)


@router.put("/profile", response_model=UserResponse)
async def update_profile(
    update_data: UserUpdate,
    profile_picture: UploadFile = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user's profile"""
    # Validate profile picture if provided
    if profile_picture:
        if profile_picture.content_type not in ["image/jpeg", "image/png", "image/jpg"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Profile picture must be JPG or PNG"
            )
        # Check file size (5MB max)
        file_size = 0
        for chunk in profile_picture.file:
            file_size += len(chunk)
            if file_size > 5242880:  # 5MB
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Profile picture must be less than 5MB"
                )
        profile_picture.file.seek(0)  # Reset file pointer
    
    updated_user = update_user_profile(db, current_user, update_data, profile_picture)
    return UserResponse.model_validate(updated_user)


@router.put("/password")
async def update_password(
    password_data: PasswordUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user password"""
    update_user_password(db, current_user, password_data.current_password, password_data.new_password)
    return {"message": "Password updated successfully"}
