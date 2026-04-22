from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.wishlist import Wishlist, WishlistItem
from app.models.product import Product
from app.schemas.wishlist import WishlistItemCreate


def get_or_create_wishlist(db: Session, user_id: str) -> Wishlist:
    """Get existing wishlist or create the default wishlist for a user."""
    wishlist = db.query(Wishlist).filter(Wishlist.user_id == user_id).first()
    if not wishlist:
        wishlist = Wishlist(user_id=user_id)
        db.add(wishlist)
        db.commit()
        db.refresh(wishlist)
    return wishlist


def add_wishlist_item(db: Session, user_id: str, item_data: WishlistItemCreate) -> WishlistItem:
    """Add a product to the user's default wishlist (idempotent)."""
    wishlist = get_or_create_wishlist(db, user_id)

    product = db.query(Product).filter(Product.id == item_data.product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    existing_item = db.query(WishlistItem).filter(
        WishlistItem.wishlist_id == wishlist.id,
        WishlistItem.product_id == item_data.product_id,
    ).first()
    if existing_item:
        return existing_item

    wishlist_item = WishlistItem(
        wishlist_id=wishlist.id,
        product_id=item_data.product_id,
    )
    db.add(wishlist_item)
    db.commit()
    db.refresh(wishlist_item)
    return wishlist_item


def remove_wishlist_item(db: Session, user_id: str, item_id: str) -> None:
    """Remove an item from the user's wishlist."""
    wishlist = get_or_create_wishlist(db, user_id)
    item = db.query(WishlistItem).filter(
        WishlistItem.id == item_id,
        WishlistItem.wishlist_id == wishlist.id,
    ).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wishlist item not found",
        )
    db.delete(item)
    db.commit()
