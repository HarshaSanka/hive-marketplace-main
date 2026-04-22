from pydantic import BaseModel
from typing import List
from app.schemas.product import ProductResponse


class CartItemCreate(BaseModel):
    product_id: str
    quantity: int = 1


class CartItemUpdate(BaseModel):
    quantity: int


class CartItemResponse(BaseModel):
    id: str
    product: ProductResponse
    quantity: int
    subtotal: float

    class Config:
        from_attributes = True


class CartResponse(BaseModel):
    id: str
    items: List[CartItemResponse]
    total_items: int
    total_amount: float

    class Config:
        from_attributes = True
