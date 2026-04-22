from pydantic import BaseModel
from typing import List
from datetime import datetime
from app.schemas.product import ProductResponse


class WishlistItemCreate(BaseModel):
    product_id: str


class WishlistItemResponse(BaseModel):
    id: str
    product: ProductResponse
    added_at: datetime

    class Config:
        from_attributes = True


class WishlistResponse(BaseModel):
    id: str
    items: List[WishlistItemResponse]
    total_items: int

    class Config:
        from_attributes = True
