from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import Optional, List
import math

from app.models.order import Order, OrderItem
from app.models.cart import Cart, CartItem
from app.models.product import Product
from app.models.user import User
from app.schemas.order import OrderCreate, ShippingAddress, BuyNowOrderCreate
from app.services.payment_service import generate_transaction_id, generate_tracking_number
from app.services.email_service import email_service

# Shipping flat rate
SHIPPING_COST = 50.0


def get_user_cart(db: Session, user_id: str) -> Cart:
    """Get user's cart"""
    cart = db.query(Cart).filter(Cart.user_id == user_id).first()
    if not cart:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cart is empty"
        )
    return cart


def validate_cart_items(db: Session, cart: Cart) -> List[dict]:
    """Validate all cart items have sufficient stock"""
    cart_items = db.query(CartItem).filter(CartItem.cart_id == cart.id).all()
    
    if not cart_items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cart is empty"
        )
    
    validated_items = []
    
    for item in cart_items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        
        if not product:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product not found"
            )
        
        if product.status != "active":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product '{product.title}' is not available"
            )
        
        if product.stock_quantity < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for '{product.title}'. Available: {product.stock_quantity}"
            )
        
        validated_items.append({
            "cart_item": item,
            "product": product
        })
    
    return validated_items


async def create_order(db: Session, user_id: str, order_data: OrderCreate) -> Order:
    """Create order from cart"""
    # Get user
    buyer = db.query(User).filter(User.id == user_id).first()
    if not buyer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Get and validate cart
    cart = get_user_cart(db, user_id)
    validated_items = validate_cart_items(db, cart)
    
    # Calculate totals
    subtotal = sum(
        item["product"].price * item["cart_item"].quantity 
        for item in validated_items
    )
    total_amount = subtotal + SHIPPING_COST
    
    # Generate transaction ID
    import uuid
    order_id = str(uuid.uuid4())
    transaction_id = generate_transaction_id(order_id)
    
    # Create order
    order = Order(
        id=order_id,
        buyer_id=user_id,
        total_amount=total_amount,
        status="pending",
        shipping_name=order_data.shipping_address.name,
        shipping_address_line1=order_data.shipping_address.address_line1,
        shipping_address_line2=order_data.shipping_address.address_line2,
        shipping_city=order_data.shipping_address.city,
        shipping_state=order_data.shipping_address.state,
        shipping_pincode=order_data.shipping_address.pincode,
        shipping_mobile=order_data.shipping_address.mobile,
        payment_method=order_data.payment_method,
        payment_transaction_id=transaction_id
    )
    db.add(order)
    
    # Create order items and deduct stock
    sellers_to_notify = {}
    email_items = []
    
    for item in validated_items:
        product = item["product"]
        cart_item = item["cart_item"]
        
        # Create order item
        order_item = OrderItem(
            order_id=order_id,
            product_id=product.id,
            quantity=cart_item.quantity,
            price_at_order=product.price,
            seller_id=product.seller_id
        )
        db.add(order_item)
        
        # Deduct stock
        product.stock_quantity -= cart_item.quantity
        
        # Track sellers to notify
        if product.seller_id not in sellers_to_notify:
            seller = db.query(User).filter(User.id == product.seller_id).first()
            sellers_to_notify[product.seller_id] = {
                "seller": seller,
                "items": []
            }
        sellers_to_notify[product.seller_id]["items"].append({
            "title": product.title,
            "quantity": cart_item.quantity
        })
        
        # Items for buyer email
        email_items.append({
            "title": product.title,
            "quantity": cart_item.quantity,
            "subtotal": product.price * cart_item.quantity
        })
        
        # Check if product is now out of stock
        if product.stock_quantity == 0:
            seller = db.query(User).filter(User.id == product.seller_id).first()
            if seller:
                await email_service.send_out_of_stock_alert(
                    seller.email,
                    seller.full_name,
                    product.title,
                    product.id
                )
    
    # Clear cart
    db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
    
    db.commit()
    db.refresh(order)
    
    # Send emails
    await email_service.send_order_confirmation(
        buyer.email,
        buyer.full_name,
        order.id,
        total_amount,
        email_items
    )
    
    # Notify sellers
    for seller_data in sellers_to_notify.values():
        seller = seller_data["seller"]
        if seller:
            await email_service.send_new_order_notification(
                seller.email,
                seller.full_name,
                order.id,
                buyer.full_name,
                seller_data["items"]
            )
    
    return order


async def create_buy_now_order(db: Session, user_id: str, order_data: BuyNowOrderCreate) -> Order:
    """Create order directly from a single product (Buy Now)"""
    import uuid
    
    # Get user
    buyer = db.query(User).filter(User.id == user_id).first()
    if not buyer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Get and validate product
    product = db.query(Product).filter(Product.id == order_data.product_id).first()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    if product.status != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Product is not available"
        )
    
    if product.stock_quantity < order_data.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient stock. Available: {product.stock_quantity}"
        )
    
    # Calculate totals
    subtotal = product.price * order_data.quantity
    total_amount = subtotal + SHIPPING_COST
    
    # Generate transaction ID
    order_id = str(uuid.uuid4())
    transaction_id = generate_transaction_id(order_id)
    
    # Create order
    order = Order(
        id=order_id,
        buyer_id=user_id,
        total_amount=total_amount,
        status="pending",
        shipping_name=order_data.shipping_address.name,
        shipping_address_line1=order_data.shipping_address.address_line1,
        shipping_address_line2=order_data.shipping_address.address_line2,
        shipping_city=order_data.shipping_address.city,
        shipping_state=order_data.shipping_address.state,
        shipping_pincode=order_data.shipping_address.pincode,
        shipping_mobile=order_data.shipping_address.mobile,
        payment_method=order_data.payment_method,
        payment_transaction_id=transaction_id
    )
    db.add(order)
    
    # Create order item
    order_item = OrderItem(
        order_id=order_id,
        product_id=product.id,
        quantity=order_data.quantity,
        price_at_order=product.price,
        seller_id=product.seller_id
    )
    db.add(order_item)
    
    # Deduct stock
    product.stock_quantity -= order_data.quantity
    
    db.commit()
    db.refresh(order)
    
    # Send order confirmation email to buyer
    email_items = [{
        "title": product.title,
        "quantity": order_data.quantity,
        "subtotal": subtotal
    }]
    
    await email_service.send_order_confirmation(
        buyer.email,
        buyer.full_name,
        order.id,
        total_amount,
        email_items
    )
    
    # Notify seller
    seller = db.query(User).filter(User.id == product.seller_id).first()
    if seller:
        await email_service.send_new_order_notification(
            seller.email,
            seller.full_name,
            order.id,
            buyer.full_name,
            [{"title": product.title, "quantity": order_data.quantity}]
        )
        
        # Check if product is now out of stock
        if product.stock_quantity == 0:
            await email_service.send_out_of_stock_alert(
                seller.email,
                seller.full_name,
                product.title,
                product.id
            )
    
    return order


def get_order_by_id(db: Session, order_id: str, user_id: str, account_type: str) -> Order:
    """Get order by ID with authorization check"""
    order = db.query(Order).filter(Order.id == order_id).first()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Authorization: buyer can see their orders, seller can see orders with their products
    if account_type == "buyer":
        if order.buyer_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this order"
            )
    elif account_type == "seller":
        # Check if seller has products in this order
        seller_items = db.query(OrderItem).filter(
            OrderItem.order_id == order_id,
            OrderItem.seller_id == user_id
        ).first()
        if not seller_items:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this order"
            )
    
    return order


def get_orders_list(
    db: Session, 
    user_id: str, 
    account_type: str,
    status_filter: Optional[str] = None,
    page: int = 1,
    limit: int = 20
) -> dict:
    """Get paginated list of orders"""
    if account_type == "buyer":
        query = db.query(Order).filter(Order.buyer_id == user_id)
    else:
        # Seller: get orders containing their products
        seller_order_ids = db.query(OrderItem.order_id).filter(
            OrderItem.seller_id == user_id
        ).distinct().subquery()
        query = db.query(Order).filter(Order.id.in_(seller_order_ids))
    
    if status_filter:
        query = query.filter(Order.status == status_filter)
    
    # Count total
    total = query.count()
    total_pages = math.ceil(total / limit)
    
    # Get paginated results
    orders = query.order_by(Order.created_at.desc()).offset((page - 1) * limit).limit(limit).all()
    
    # Build response
    orders_response = []
    for order in orders:
        items_count = db.query(OrderItem).filter(OrderItem.order_id == order.id).count()
        
        order_summary = {
            "id": order.id,
            "total_amount": order.total_amount,
            "status": order.status,
            "items_count": items_count,
            "created_at": order.created_at
        }
        
        # Add buyer info for seller view
        if account_type == "seller":
            buyer = db.query(User).filter(User.id == order.buyer_id).first()
            if buyer:
                order_summary["buyer"] = {
                    "name": buyer.full_name,
                    "email": buyer.email
                }
        
        orders_response.append(order_summary)
    
    return {
        "orders": orders_response,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages
    }


def get_order_detail(db: Session, order: Order, user_id: str, account_type: str) -> dict:
    """Get detailed order information"""
    # Get order items
    order_items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
    
    items_response = []
    for item in order_items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        seller = db.query(User).filter(User.id == item.seller_id).first()
        
        items_response.append({
            "id": item.id,
            "product_id": item.product_id,
            "title": product.title if product else "Product Removed",
            "images": product.images or [] if product else [],
            "quantity": item.quantity,
            "price_at_order": item.price_at_order,
            "subtotal": item.quantity * item.price_at_order,
            "seller": {
                "id": item.seller_id,
                "business_name": seller.business_name or seller.full_name if seller else "Unknown"
            }
        })
    
    # Get buyer info
    buyer = db.query(User).filter(User.id == order.buyer_id).first()
    
    return {
        "id": order.id,
        "buyer": {
            "id": buyer.id,
            "name": buyer.full_name,
            "email": buyer.email
        } if buyer else None,
        "total_amount": order.total_amount,
        "status": order.status,
        "shipping_name": order.shipping_name,
        "shipping_address_line1": order.shipping_address_line1,
        "shipping_address_line2": order.shipping_address_line2,
        "shipping_city": order.shipping_city,
        "shipping_state": order.shipping_state,
        "shipping_pincode": order.shipping_pincode,
        "shipping_mobile": order.shipping_mobile,
        "payment_method": order.payment_method,
        "payment_transaction_id": order.payment_transaction_id,
        "tracking_number": order.tracking_number,
        "items": items_response,
        "created_at": order.created_at,
        "updated_at": order.updated_at
    }


async def mark_order_shipped(db: Session, order_id: str, user_id: str) -> Order:
    """Mark order as shipped (seller only)"""
    # Get order
    order = db.query(Order).filter(Order.id == order_id).first()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Check seller has products in this order
    seller_items = db.query(OrderItem).filter(
        OrderItem.order_id == order_id,
        OrderItem.seller_id == user_id
    ).first()
    
    if not seller_items:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to ship this order"
        )
    
    if order.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Order is already {order.status}"
        )
    
    # Generate tracking number and update status
    order.tracking_number = generate_tracking_number(order.id)
    order.status = "shipped"
    
    db.commit()
    db.refresh(order)
    
    # Send notification to buyer
    buyer = db.query(User).filter(User.id == order.buyer_id).first()
    if buyer:
        await email_service.send_shipping_notification(
            buyer.email,
            buyer.full_name,
            order.id,
            order.tracking_number
        )
    
    return order
