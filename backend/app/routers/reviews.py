from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.schemas.product import ReviewCreate, ReviewResponse, ReviewListResponse, ReviewUserInfo
from app.models.user import User
from app.models.product import Product
from app.models.review import Review
from app.models.order import Order, OrderItem
from app.middleware.auth import get_current_user
from app.services.product_service import get_product_rating_stats


router = APIRouter()


@router.post("", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
async def create_review(
    review_data: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new review.
    
    Validations:
    - User must have a delivered order containing this product
    - User can only review a product once
    """
    product_id = review_data.product_id
    order_id = review_data.order_id
    
    # Check if product exists
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Check if user already reviewed this product
    existing_review = db.query(Review).filter(
        Review.product_id == product_id,
        Review.user_id == current_user.id
    ).first()
    
    if existing_review:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already reviewed this product"
        )
    
    # Check if user has a delivered order with this product
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.buyer_id == current_user.id
    ).first()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    if order.status != "delivered":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only review products from delivered orders"
        )
    
    # Check if the product is in this order
    order_item = db.query(OrderItem).filter(
        OrderItem.order_id == order_id,
        OrderItem.product_id == product_id
    ).first()
    
    if not order_item:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This product is not in the specified order"
        )
    
    # Create the review
    review = Review(
        product_id=product_id,
        user_id=current_user.id,
        rating=review_data.rating,
        review_text=review_data.review_text
    )
    
    db.add(review)
    db.commit()
    db.refresh(review)
    
    # Get first name only for privacy
    first_name = current_user.full_name.split()[0] if current_user.full_name else "Anonymous"
    
    return ReviewResponse(
        id=review.id,
        user=ReviewUserInfo(name=first_name),
        rating=review.rating,
        review_text=review.review_text,
        created_at=review.created_at
    )


@router.get("/product/{product_id}", response_model=ReviewListResponse)
async def get_product_reviews(
    product_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """
    Get reviews for a product with pagination and rating statistics.
    """
    # Check if product exists
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Get rating statistics
    average_rating, total_reviews, rating_distribution = get_product_rating_stats(db, product_id)
    
    # Get paginated reviews
    offset = (page - 1) * limit
    reviews = db.query(Review).filter(
        Review.product_id == product_id
    ).order_by(
        Review.created_at.desc()
    ).offset(offset).limit(limit).all()
    
    # Build response with user names
    reviews_response = []
    for review in reviews:
        user = db.query(User).filter(User.id == review.user_id).first()
        first_name = user.full_name.split()[0] if user and user.full_name else "Anonymous"
        
        reviews_response.append(ReviewResponse(
            id=review.id,
            user=ReviewUserInfo(name=first_name),
            rating=review.rating,
            review_text=review.review_text,
            created_at=review.created_at
        ))
    
    return ReviewListResponse(
        reviews=reviews_response,
        average_rating=round(average_rating, 1) if average_rating > 0 else 0.0,
        total_reviews=total_reviews,
        rating_distribution=rating_distribution
    )


@router.get("/user/can-review", response_model=dict)
async def check_can_review(
    product_id: str = Query(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Check if user can review a product.
    Returns whether user has a delivered order and hasn't reviewed yet.
    """
    # Check if already reviewed
    existing_review = db.query(Review).filter(
        Review.product_id == product_id,
        Review.user_id == current_user.id
    ).first()
    
    if existing_review:
        return {
            "can_review": False,
            "reason": "already_reviewed",
            "message": "You have already reviewed this product"
        }
    
    # Check if user has a delivered order with this product
    delivered_order = db.query(Order).join(OrderItem).filter(
        Order.buyer_id == current_user.id,
        Order.status == "delivered",
        OrderItem.product_id == product_id
    ).first()
    
    if not delivered_order:
        return {
            "can_review": False,
            "reason": "no_delivered_order",
            "message": "You need a delivered order to review this product"
        }
    
    return {
        "can_review": True,
        "order_id": delivered_order.id,
        "message": "You can review this product"
    }
