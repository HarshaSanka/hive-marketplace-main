from sqlalchemy import Column, String, Float, Integer, Text, ForeignKey, DateTime
from sqlalchemy.sql import func
from sqlalchemy.dialects.sqlite import JSON
from app.database import Base
import uuid


class Product(Base):
    __tablename__ = "products"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    seller_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    category = Column(String, nullable=False, index=True)
    stock_quantity = Column(Integer, nullable=False, default=0)
    status = Column(String, nullable=False, default="active", index=True)  # 'active' or 'inactive'
    images = Column(JSON, nullable=True)  # JSON array of image URLs
    views_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
