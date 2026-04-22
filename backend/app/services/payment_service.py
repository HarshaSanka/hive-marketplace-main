import time
import uuid


def generate_transaction_id(order_id: str) -> str:
    """Generate mock transaction ID"""
    timestamp = int(time.time())
    return f"TXN-{order_id[:8]}-{timestamp}"


def process_payment(payment_method: str, amount: float) -> dict:
    """
    Mock payment processing
    In MVP, always returns success
    """
    # Simulate payment processing (2 seconds in frontend)
    # Backend returns immediately for demo
    return {
        "success": True,
        "payment_method": payment_method,
        "amount": amount
    }


def generate_tracking_number(order_id: str) -> str:
    """Generate mock tracking number when order is shipped"""
    timestamp = int(time.time())
    return f"TRACK-{order_id[:8]}-{timestamp}"
