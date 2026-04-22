from sqlalchemy import Column, String, Float, Integer, Text, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.database import Base
import uuid


class Order(Base):
    __tablename__ = "orders"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    buyer_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    total_amount = Column(Float, nullable=False)
    status = Column(String, nullable=False, default="pending", index=True)  # 'pending', 'shipped', 'delivered'
    shipping_name = Column(String, nullable=False)
    shipping_address_line1 = Column(String, nullable=False)
    shipping_address_line2 = Column(Text, nullable=True)
    shipping_city = Column(String, nullable=False)
    shipping_state = Column(String, nullable=False)
    shipping_pincode = Column(String, nullable=False)
    shipping_mobile = Column(String, nullable=False)
    payment_method = Column(String, nullable=False)
    payment_transaction_id = Column(String, nullable=True)
    tracking_number = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class OrderItem(Base):
    __tablename__ = "order_items"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id = Column(String, ForeignKey("orders.id"), nullable=False, index=True)
    product_id = Column(String, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    price_at_order = Column(Float, nullable=False)
    seller_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
