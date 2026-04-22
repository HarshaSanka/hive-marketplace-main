from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class ProductCreate(BaseModel):
    title: str = Field(..., max_length=100)
    description: Optional[str] = Field(None, max_length=1000)
    price: float = Field(..., gt=0)
    category: str
    stock_quantity: int = Field(..., ge=0)
    images: Optional[List[str]] = None


class ProductUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = Field(None, max_length=1000)
    price: Optional[float] = Field(None, gt=0)
    category: Optional[str] = None
    stock_quantity: Optional[int] = Field(None, ge=0)
    status: Optional[str] = None
    images: Optional[List[str]] = None


class SellerInfo(BaseModel):
    id: str
    business_name: str

    class Config:
        from_attributes = True


class ProductResponse(BaseModel):
    id: str
    title: str
    description: Optional[str]
    price: float
    category: str
    stock_quantity: int
    status: str
    images: Optional[List[str]]
    views_count: int
    seller: SellerInfo
    average_rating: Optional[float] = None
    total_reviews: int = 0
    created_at: datetime

    class Config:
        from_attributes = True


class ProductListResponse(BaseModel):
    products: List[ProductResponse]
    total: int
    page: int
    limit: int
    total_pages: int


class ReviewCreate(BaseModel):
    product_id: str
    order_id: str
    rating: int = Field(..., ge=1, le=5)
    review_text: Optional[str] = Field(None, max_length=500)


class ReviewUserInfo(BaseModel):
    name: str  # First name only

    class Config:
        from_attributes = True


class ReviewResponse(BaseModel):
    id: str
    user: ReviewUserInfo
    rating: int
    review_text: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class ReviewListResponse(BaseModel):
    reviews: List[ReviewResponse]
    average_rating: float
    total_reviews: int
    rating_distribution: dict
