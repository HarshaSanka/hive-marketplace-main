from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.schemas.product import (
    ProductCreate, ProductUpdate, ProductResponse, ProductListResponse,
    ReviewCreate, ReviewResponse, ReviewListResponse
)
from app.services.product_service import (
    create_product, get_product, update_product, delete_product,
    search_products, get_trending_products, get_personalized_feed,
    get_product_rating_stats, get_products_with_ratings
)
from app.middleware.auth import get_current_user, require_seller
from app.models.user import User
from app.models.product import Product
from app.models.review import Review
from math import ceil

router = APIRouter()


@router.get("", response_model=ProductListResponse)
async def list_products(
    search: Optional[str] = Query(None),
    category: Optional[List[str]] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    rating: Optional[int] = Query(None),
    sort: str = Query("relevance"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """List products with filters and pagination"""
    products, total = search_products(
        db, search, category, min_price, max_price, rating, sort, page, limit
    )
    
    enriched = get_products_with_ratings(db, products)
    
    products_response = [
        ProductResponse(
            **enrich["product"].__dict__,
            seller=enrich["seller"],
            average_rating=enrich["average_rating"],
            total_reviews=enrich["total_reviews"]
        )
        for enrich in enriched
    ]
    
    return ProductListResponse(
        products=products_response,
        total=total,
        page=page,
        limit=limit,
        total_pages=ceil(total / limit)
    )


@router.get("/trending", response_model=ProductListResponse)
async def get_trending(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get trending products"""
    products, total = get_trending_products(db, page, limit)
    enriched = get_products_with_ratings(db, products)
    
    products_response = [
        ProductResponse(
            **enrich["product"].__dict__,
            seller=enrich["seller"],
            average_rating=enrich["average_rating"],
            total_reviews=enrich["total_reviews"]
        )
        for enrich in enriched
    ]
    
    return ProductListResponse(
        products=products_response,
        total=total,
        page=page,
        limit=limit,
        total_pages=ceil(total / limit)
    )


@router.get("/feed", response_model=ProductListResponse)
async def get_feed(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get personalized feed (requires authentication)"""
    products, total = get_personalized_feed(db, current_user.id, page, limit)
    enriched = get_products_with_ratings(db, products)
    
    products_response = [
        ProductResponse(
            **enrich["product"].__dict__,
            seller=enrich["seller"],
            average_rating=enrich["average_rating"],
            total_reviews=enrich["total_reviews"]
        )
        for enrich in enriched
    ]
    
    return ProductListResponse(
        products=products_response,
        total=total,
        page=page,
        limit=limit,
        total_pages=ceil(total / limit)
    )


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product_detail(
    product_id: str,
    db: Session = Depends(get_db)
):
    """Get product details"""
    product = get_product(db, product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    avg_rating, total_reviews, _ = get_product_rating_stats(db, product_id)
    
    seller = db.query(User).filter(User.id == product.seller_id).first()
    seller_info = {
        "id": seller.id,
        "business_name": seller.business_name or seller.full_name
    }
    
    return ProductResponse(
        **product.__dict__,
        seller=seller_info,
        average_rating=round(avg_rating, 1) if avg_rating > 0 else None,
        total_reviews=total_reviews
    )


@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product_endpoint(
    product_data: ProductCreate,
    current_user: User = Depends(require_seller),
    db: Session = Depends(get_db)
):
    """Create a new product (seller only)"""
    product = create_product(db, current_user.id, product_data)
    
    seller_info = {
        "id": current_user.id,
        "business_name": current_user.business_name or current_user.full_name
    }
    
    return ProductResponse(
        **product.__dict__,
        seller=seller_info,
        average_rating=None,
        total_reviews=0
    )


@router.put("/{product_id}", response_model=ProductResponse)
async def update_product_endpoint(
    product_id: str,
    product_data: ProductUpdate,
    current_user: User = Depends(require_seller),
    db: Session = Depends(get_db)
):
    """Update a product (seller only, own products)"""
    product = update_product(db, product_id, current_user.id, product_data)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found or you don't have permission"
        )
    
    avg_rating, total_reviews, _ = get_product_rating_stats(db, product_id)
    
    seller_info = {
        "id": current_user.id,
        "business_name": current_user.business_name or current_user.full_name
    }
    
    return ProductResponse(
        **product.__dict__,
        seller=seller_info,
        average_rating=round(avg_rating, 1) if avg_rating > 0 else None,
        total_reviews=total_reviews
    )


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product_endpoint(
    product_id: str,
    current_user: User = Depends(require_seller),
    db: Session = Depends(get_db)
):
    """Delete a product (seller only, own products)"""
    success = delete_product(db, product_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found or you don't have permission"
        )


@router.post("/bulk-upload")
async def bulk_upload_products(
    file: UploadFile = File(...),
    current_user: User = Depends(require_seller),
    db: Session = Depends(get_db)
):
    """Bulk upload products from CSV (seller only)"""
    from app.services.csv_service import parse_csv_file
    
    if not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be a CSV file"
        )
    
    valid_rows, errors = parse_csv_file(file)
    
    # Create products from valid rows
    products_created = []
    for row_data in valid_rows:
        try:
            product = create_product(db, current_user.id, ProductCreate(**row_data))
            products_created.append(product.id)
        except Exception as e:
            errors.append({
                "row": len(products_created) + len(errors) + 2,
                "error": f"Failed to create product: {str(e)}"
            })
    
    return {
        "total_rows": len(valid_rows) + len(errors),
        "successful": len(products_created),
        "failed": len(errors),
        "errors": errors,
        "products_created": products_created
    }
