from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.schemas.order import (
    OrderCreate, OrderResponse, OrderListResponse, OrderShipResponse, BuyNowOrderCreate
)
from app.services.order_service import (
    create_order, get_order_by_id, get_orders_list, 
    get_order_detail, mark_order_shipped, create_buy_now_order
)
from app.middleware.auth import get_current_user
from app.models.user import User

router = APIRouter()


@router.post("", status_code=status.HTTP_201_CREATED)
async def checkout(
    order_data: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create order from cart (checkout)
    - Validates cart items and stock
    - Creates order with shipping address
    - Processes mock payment
    - Deducts stock
    - Clears cart
    - Sends confirmation emails
    """
    order = await create_order(db, current_user.id, order_data)
    order_detail = get_order_detail(db, order, current_user.id, current_user.account_type)
    return order_detail


@router.post("/buy-now", status_code=status.HTTP_201_CREATED)
async def buy_now(
    order_data: BuyNowOrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create order directly from a single product (Buy Now)
    - Bypasses cart
    - Validates product and stock
    - Creates order with shipping address
    - Processes mock payment
    - Deducts stock
    - Sends confirmation emails
    """
    order = await create_buy_now_order(db, current_user.id, order_data)
    order_detail = get_order_detail(db, order, current_user.id, current_user.account_type)
    return order_detail


@router.get("", response_model=OrderListResponse)
async def list_orders(
    status_filter: Optional[str] = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get list of orders
    - Buyers: their own orders
    - Sellers: orders containing their products
    """
    return get_orders_list(
        db, 
        current_user.id, 
        current_user.account_type,
        status_filter,
        page,
        limit
    )


@router.get("/{order_id}")
async def get_order(
    order_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get order details
    - Buyers can view their own orders
    - Sellers can view orders with their products
    """
    order = get_order_by_id(db, order_id, current_user.id, current_user.account_type)
    return get_order_detail(db, order, current_user.id, current_user.account_type)


@router.put("/{order_id}/ship", response_model=OrderShipResponse)
async def ship_order(
    order_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mark order as shipped (seller only)
    - Generates tracking number
    - Updates order status
    - Sends notification to buyer
    """
    if current_user.account_type != "seller":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only sellers can ship orders"
        )
    
    order = await mark_order_shipped(db, order_id, current_user.id)
    
    return OrderShipResponse(
        id=order.id,
        status=order.status,
        tracking_number=order.tracking_number,
        updated_at=order.updated_at
    )
