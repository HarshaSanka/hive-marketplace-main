import logging
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.cart import Cart, CartItem
from app.models.product import Product
from app.schemas.cart import CartItemCreate, CartItemUpdate

logger = logging.getLogger(__name__)

def get_or_create_cart(db: Session, user_id: str) -> Cart:
    """Get existing cart or create a new one for user"""
    logger.info(
        "cart.get_or_create_cart.start",
        extra={"user_id": user_id},
    )
    cart = db.query(Cart).filter(Cart.user_id == user_id).first()
    if not cart:
        cart = Cart(user_id=user_id)
        db.add(cart)
        db.commit()
        db.refresh(cart)
    return cart


def add_cart_item(db: Session, user_id: str, item_data: CartItemCreate) -> CartItem:
    """Add item to cart"""
    logger.info(
        "cart.add_cart_item.start",
        extra={
            "user_id": user_id,
            "product_id": str(item_data.product_id),
            "quantity": item_data.quantity,
        },
    )
    cart = get_or_create_cart(db, user_id)
    
    # Check if product exists and has stock
    product = db.query(Product).filter(Product.id == item_data.product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    if product.stock_quantity < item_data.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient stock"
        )
    
    # Check if item already in cart
    existing_item = db.query(CartItem).filter(
        CartItem.cart_id == cart.id,
        CartItem.product_id == item_data.product_id
    ).first()
    
    if existing_item:
        # Update quantity
        new_quantity = existing_item.quantity + item_data.quantity
        if product.stock_quantity < new_quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Insufficient stock"
            )
        existing_item.quantity = new_quantity
        db.commit()
        db.refresh(existing_item)
        return existing_item
    else:
        # Create new cart item
        cart_item = CartItem(
            cart_id=cart.id,
            product_id=item_data.product_id,
            quantity=item_data.quantity
        )
        db.add(cart_item)
        db.commit()
        db.refresh(cart_item)
        return cart_item


def update_cart_item(db: Session, user_id: str, item_id: str, item_data: CartItemUpdate) -> CartItem:
    """Update cart item quantity"""
    logger.info(
        "cart.update_cart_item.start",
        extra={
            "user_id": user_id,
            "item_id": item_id,
            "quantity": item_data.quantity,
        },
    )
    cart = get_or_create_cart(db, user_id)
    cart_item = db.query(CartItem).filter(
        CartItem.id == item_id,
        CartItem.cart_id == cart.id
    ).first()
    
    if not cart_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found"
        )
    
    # Check stock
    product = db.query(Product).filter(Product.id == cart_item.product_id).first()
    if product.stock_quantity < item_data.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient stock"
        )
    
    cart_item.quantity = item_data.quantity
    db.commit()
    db.refresh(cart_item)
    return cart_item


def remove_cart_item(db: Session, user_id: str, item_id: str) -> None:
    """Remove item from cart"""
    logger.info(
        "cart.remove_cart_item.start",
        extra={"user_id": user_id, "item_id": item_id},
    )
    cart = get_or_create_cart(db, user_id)
    cart_item = db.query(CartItem).filter(
        CartItem.id == item_id,
        CartItem.cart_id == cart.id
    ).first()
    
    if not cart_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found"
        )
    
    db.delete(cart_item)
    db.commit()


def clear_cart(db: Session, user_id: str) -> None:
    """Clear all items from cart"""
    logger.info(
        "cart.clear_cart.start",
        extra={"user_id": user_id},
    )
    cart = get_or_create_cart(db, user_id)
    db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
    db.commit()
