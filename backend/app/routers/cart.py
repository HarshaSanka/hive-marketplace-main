from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.cart import CartItemCreate, CartItemUpdate, CartResponse, CartItemResponse
from app.services.cart_service import (
    get_or_create_cart, add_cart_item, update_cart_item,
    remove_cart_item, clear_cart
)
from app.middleware.auth import get_current_user
from app.models.user import User
from app.models.cart import CartItem
from app.models.product import Product

router = APIRouter()


@router.get("", response_model=CartResponse)
async def get_cart(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's cart"""
    cart = get_or_create_cart(db, current_user.id)
    cart_items = db.query(CartItem).filter(CartItem.cart_id == cart.id).all()
    
    items_response = []
    total_amount = 0
    total_items = 0
    
    for item in cart_items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            continue
        
        subtotal = product.price * item.quantity
        total_amount += subtotal
        total_items += 1
        
        # Get seller info
        from app.models.user import User as UserModel
        seller = db.query(UserModel).filter(UserModel.id == product.seller_id).first()
        
        items_response.append(CartItemResponse(
            id=item.id,
            product={
                "id": product.id,
                "title": product.title,
                "description": product.description,
                "price": product.price,
                "category": product.category,
                "stock_quantity": product.stock_quantity,
                "status": product.status,
                "images": product.images or [],
                "views_count": product.views_count,
                "seller": {
                    "id": seller.id,
                    "business_name": seller.business_name or seller.full_name
                },
                "average_rating": None,
                "total_reviews": 0,
                "created_at": product.created_at
            },
            quantity=item.quantity,
            subtotal=subtotal
        ))
    
    return CartResponse(
        id=cart.id,
        items=items_response,
        total_items=total_items,
        total_amount=total_amount
    )


@router.post("/items", response_model=CartItemResponse, status_code=status.HTTP_201_CREATED)
async def add_item(
    item_data: CartItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add item to cart"""
    cart_item = add_cart_item(db, current_user.id, item_data)
    
    product = db.query(Product).filter(Product.id == cart_item.product_id).first()
    from app.models.user import User as UserModel
    seller = db.query(UserModel).filter(UserModel.id == product.seller_id).first()
    
    return CartItemResponse(
        id=cart_item.id,
        product={
            "id": product.id,
            "title": product.title,
            "description": product.description,
            "price": product.price,
            "category": product.category,
            "stock_quantity": product.stock_quantity,
            "status": product.status,
            "images": product.images or [],
            "views_count": product.views_count,
            "seller": {
                "id": seller.id,
                "business_name": seller.business_name or seller.full_name
            },
            "average_rating": None,
            "total_reviews": 0,
            "created_at": product.created_at
        },
        quantity=cart_item.quantity,
        subtotal=product.price * cart_item.quantity
    )


@router.put("/items/{item_id}", response_model=CartItemResponse)
async def update_item(
    item_id: str,
    item_data: CartItemUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update cart item quantity"""
    cart_item = update_cart_item(db, current_user.id, item_id, item_data)
    
    product = db.query(Product).filter(Product.id == cart_item.product_id).first()
    from app.models.user import User as UserModel
    seller = db.query(UserModel).filter(UserModel.id == product.seller_id).first()
    
    return CartItemResponse(
        id=cart_item.id,
        product={
            "id": product.id,
            "title": product.title,
            "description": product.description,
            "price": product.price,
            "category": product.category,
            "stock_quantity": product.stock_quantity,
            "status": product.status,
            "images": product.images or [],
            "views_count": product.views_count,
            "seller": {
                "id": seller.id,
                "business_name": seller.business_name or seller.full_name
            },
            "average_rating": None,
            "total_reviews": 0,
            "created_at": product.created_at
        },
        quantity=cart_item.quantity,
        subtotal=product.price * cart_item.quantity
    )


@router.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_item(
    item_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove item from cart"""
    remove_cart_item(db, current_user.id, item_id)


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
async def clear_cart_endpoint(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Clear entire cart"""
    clear_cart(db, current_user.id)
