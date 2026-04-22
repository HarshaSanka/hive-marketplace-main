from sqlalchemy import Column, String, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.sql import func
from app.database import Base
import uuid


class Wishlist(Base):
    __tablename__ = "wishlists"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    # Exactly one default wishlist per user.
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class WishlistItem(Base):
    __tablename__ = "wishlist_items"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    wishlist_id = Column(String, ForeignKey("wishlists.id"), nullable=False, index=True)
    product_id = Column(String, ForeignKey("products.id"), nullable=False, index=True)
    added_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint("wishlist_id", "product_id", name="uq_wishlist_items_wishlist_id_product_id"),
    )
