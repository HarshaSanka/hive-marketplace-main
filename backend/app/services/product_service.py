from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from typing import List, Optional, Tuple
from app.models.product import Product
from app.models.review import Review
from app.models.user import User
from app.schemas.product import ProductCreate, ProductUpdate
from datetime import datetime, timedelta


def create_product(db: Session, seller_id: str, product_data: ProductCreate) -> Product:
    """Create a new product"""
    product = Product(
        seller_id=seller_id,
        **product_data.model_dump()
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def get_product(db: Session, product_id: str) -> Optional[Product]:
    """Get a product by ID"""
    product = db.query(Product).filter(Product.id == product_id).first()
    if product:
        # Increment views count
        product.views_count += 1
        db.commit()
        db.refresh(product)
    return product


def update_product(db: Session, product_id: str, seller_id: str, product_data: ProductUpdate) -> Optional[Product]:
    """Update a product (only by owner)"""
    product = db.query(Product).filter(
        and_(Product.id == product_id, Product.seller_id == seller_id)
    ).first()
    
    if not product:
        return None
    
    update_data = product_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)
    
    db.commit()
    db.refresh(product)
    return product


def delete_product(db: Session, product_id: str, seller_id: str) -> bool:
    """Delete a product (only by owner)"""
    product = db.query(Product).filter(
        and_(Product.id == product_id, Product.seller_id == seller_id)
    ).first()
    
    if not product:
        return False
    
    db.delete(product)
    db.commit()
    return True


def search_products(
    db: Session,
    search: Optional[str] = None,
    category: Optional[List[str]] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    rating: Optional[int] = None,
    sort: str = "relevance",
    page: int = 1,
    limit: int = 20
) -> Tuple[List[Product], int]:
    """Search and filter products"""
    query = db.query(Product).filter(Product.status == "active")
    
    # Search in title and description
    if search:
        search_term = f"%{search.lower()}%"
        query = query.filter(
            or_(
                func.lower(Product.title).like(search_term),
                func.lower(Product.description).like(search_term)
            )
        )
    
    # Filter by category
    if category:
        query = query.filter(Product.category.in_(category))
    
    # Filter by price range
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    if max_price is not None:
        query = query.filter(Product.price <= max_price)
    
    # Get total count before filtering by rating
    total = query.count()
    
    # Filter by rating (requires subquery for average rating)
    if rating:
        # This is a simplified version - in production, you'd want to join with reviews
        # For MVP, we'll filter after getting products with reviews
        pass
    
    # Sort
    if sort == "price_asc":
        query = query.order_by(Product.price.asc())
    elif sort == "price_desc":
        query = query.order_by(Product.price.desc())
    elif sort == "newest":
        query = query.order_by(Product.created_at.desc())
    else:  # relevance (default)
        query = query.order_by(Product.views_count.desc(), Product.created_at.desc())
    
    # Pagination
    offset = (page - 1) * limit
    products = query.offset(offset).limit(limit).all()
    
    return products, total


def get_trending_products(db: Session, page: int = 1, limit: int = 20) -> Tuple[List[Product], int]:
    """Get trending products based on views and purchases in last 7 days"""
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    
    # Simplified trending: products with most views in last 7 days
    # In production, you'd also factor in purchases
    query = db.query(Product).filter(
        and_(
            Product.status == "active",
            Product.created_at >= seven_days_ago
        )
    ).order_by(Product.views_count.desc(), Product.created_at.desc())
    
    total = query.count()
    offset = (page - 1) * limit
    products = query.offset(offset).limit(limit).all()
    
    return products, total


def get_personalized_feed(db: Session, user_id: str, page: int = 1, limit: int = 20) -> Tuple[List[Product], int]:
    """Get personalized feed for user"""
    # For new users, return trending products
    # For returning users, prioritize categories they've viewed/purchased
    
    # Simplified: return trending for now
    # In production, you'd analyze user's order history and views
    return get_trending_products(db, page, limit)


def get_seller_products(
    db: Session,
    seller_id: str,
    page: int = 1,
    limit: int = 100
) -> Tuple[List[Product], int]:
    """Get all products for a specific seller"""
    query = db.query(Product).filter(Product.seller_id == seller_id)
    
    total = query.count()
    
    # Order by newest first
    query = query.order_by(Product.created_at.desc())
    
    # Pagination
    offset = (page - 1) * limit
    products = query.offset(offset).limit(limit).all()
    
    return products, total


def get_product_rating_stats(db: Session, product_id: str) -> Tuple[float, int, dict]:
    """Get rating statistics for a product"""
    reviews = db.query(Review).filter(Review.product_id == product_id).all()
    
    if not reviews:
        return 0.0, 0, {}
    
    total_reviews = len(reviews)
    average_rating = sum(r.rating for r in reviews) / total_reviews
    
    # Rating distribution
    distribution = {str(i): 0 for i in range(1, 6)}
    for review in reviews:
        distribution[str(review.rating)] += 1
    
    return average_rating, total_reviews, distribution


def get_products_with_ratings(db: Session, products: List[Product]) -> List[dict]:
    """Enrich products with rating information"""
    result = []
    for product in products:
        avg_rating, total_reviews, _ = get_product_rating_stats(db, product.id)
        
        # Get seller info
        seller = db.query(User).filter(User.id == product.seller_id).first()
        seller_info = {
            "id": seller.id,
            "business_name": seller.business_name or seller.full_name
        }
        
        result.append({
            "product": product,
            "seller": seller_info,
            "average_rating": round(avg_rating, 1) if avg_rating > 0 else None,
            "total_reviews": total_reviews
        })
    
    return result
