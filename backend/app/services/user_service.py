from sqlalchemy.orm import Session
from fastapi import HTTPException, status, UploadFile
from app.models.user import User
from app.schemas.user import UserUpdate
from app.utils.security import verify_password, get_password_hash
from app.config import settings
import os
import uuid
import shutil

def update_user_profile(db: Session, user: User, update_data: UserUpdate, profile_picture: UploadFile = None) -> User:
    """Update user profile information"""
    update_dict = update_data.model_dump(exclude_unset=True)
    
    # Handle profile picture upload
    if profile_picture:
        # Create uploads directory if it doesn't exist
        upload_dir = os.path.join(settings.UPLOAD_DIR, "profiles")
        os.makedirs(upload_dir, exist_ok=True)
        
        # Generate unique filename
        file_ext = os.path.splitext(profile_picture.filename)[1]
        filename = f"{user.id}_{uuid.uuid4()}{file_ext}"
        file_path = os.path.join(upload_dir, filename)
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(profile_picture.file, buffer)
        
        # Update profile picture path
        update_dict["profile_picture"] = f"/uploads/profiles/{filename}"
    
    # Update user fields
    for field, value in update_dict.items():
        setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    return user


def update_user_password(db: Session, user: User, current_password: str, new_password: str) -> None:
    """Update user password"""
    if not verify_password(current_password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Current password is incorrect"
        )
    
    user.password_hash = get_password_hash(new_password)
    db.commit()
