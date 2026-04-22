from sqlalchemy import Column, String, Integer, Text, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.sql import func
from app.database import Base
import uuid


class Review(Base):
    __tablename__ = "reviews"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    product_id = Column(String, ForeignKey("products.id"), nullable=False, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    rating = Column(Integer, nullable=False)  # 1-5
    review_text = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    __table_args__ = (
        UniqueConstraint('product_id', 'user_id', name='unique_product_user_review'),
    )
