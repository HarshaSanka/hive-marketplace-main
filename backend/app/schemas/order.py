from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class ShippingAddress(BaseModel):
    name: str
    address_line1: str
    address_line2: Optional[str] = None
    city: str
    state: str
    pincode: str
    mobile: str


class OrderCreate(BaseModel):
    shipping_address: ShippingAddress
    payment_method: str  # 'card', 'upi', 'wallet'


class BuyNowOrderCreate(BaseModel):
    product_id: str
    quantity: int
    shipping_address: ShippingAddress
    payment_method: str  # 'card', 'upi', 'wallet'


class OrderItemResponse(BaseModel):
    id: str
    product_id: str
    title: str
    images: List[str]
    quantity: int
    price_at_order: float
    subtotal: float
    seller: dict

    class Config:
        from_attributes = True


class OrderResponse(BaseModel):
    id: str
    total_amount: float
    status: str
    shipping_name: str
    shipping_address_line1: str
    shipping_address_line2: Optional[str] = None
    shipping_city: str
    shipping_state: str
    shipping_pincode: str
    shipping_mobile: str
    payment_method: str
    payment_transaction_id: Optional[str] = None
    tracking_number: Optional[str] = None
    items: List[OrderItemResponse]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class OrderSummary(BaseModel):
    id: str
    total_amount: float
    status: str
    items_count: int
    created_at: datetime
    buyer: Optional[dict] = None  # For seller view

    class Config:
        from_attributes = True


class OrderListResponse(BaseModel):
    orders: List[OrderSummary]
    total: int
    page: int
    limit: int
    total_pages: int

    class Config:
        from_attributes = True


class OrderShipResponse(BaseModel):
    id: str
    status: str
    tracking_number: str
    updated_at: datetime

    class Config:
        from_attributes = True
