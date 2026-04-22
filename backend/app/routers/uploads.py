from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from app.middleware.auth import get_current_user
from app.models.user import User
from app.services.file_service import save_uploaded_file

router = APIRouter()


@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    type: str = "product",
    current_user: User = Depends(get_current_user)
):
    """Upload an image file (product or profile)"""
    if type not in ["product", "profile"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Type must be 'product' or 'profile'"
        )
    
    url = save_uploaded_file(file, type)
    return {"url": url}
