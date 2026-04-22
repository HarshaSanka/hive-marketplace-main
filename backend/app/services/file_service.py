import os
import uuid
import shutil
from fastapi import UploadFile, HTTPException, status
from app.config import settings
from typing import Literal


def validate_image_file(file: UploadFile) -> None:
    """Validate image file type and size"""
    allowed_types = ["image/jpeg", "image/jpg", "image/png"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be JPG or PNG"
        )
    
    # Check file size
    file.file.seek(0, os.SEEK_END)
    file_size = file.file.tell()
    file.file.seek(0)
    
    if file_size > settings.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File size must be less than {settings.MAX_FILE_SIZE / 1024 / 1024}MB"
        )


def save_uploaded_file(file: UploadFile, file_type: Literal["product", "profile"]) -> str:
    """Save uploaded file and return URL path"""
    validate_image_file(file)
    
    # Create upload directory if it doesn't exist
    upload_dir = os.path.join(settings.UPLOAD_DIR, f"{file_type}s")
    os.makedirs(upload_dir, exist_ok=True)
    
    # Generate unique filename
    file_ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(upload_dir, filename)
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Return URL path
    return f"/uploads/{file_type}s/{filename}"
