# Hive Architecture Documentation

This document describes the technical architecture of the Hive e-commerce marketplace.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Frontend Architecture](#frontend-architecture)
3. [Backend Architecture](#backend-architecture)
4. [Database Design](#database-design)
5. [Authentication Flow](#authentication-flow)
6. [Key Workflows](#key-workflows)

---

## System Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            CLIENT LAYER                                  │
│                       (Next.js 16 - React 19)                           │
├─────────────────────────────────────────────────────────────────────────┤
│  - App Router (app/)                                                     │
│  - Server Components (default)                                           │
│  - Client Components (interactive elements)                              │
│  - Zustand (global state: cart, user)                                   │
│  - React Hook Form (forms)                                               │
│  - Tailwind CSS (styling)                                                │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │ HTTP/REST (JSON)
                                 │ JWT Bearer Token Auth
                                 │
┌────────────────────────────────▼────────────────────────────────────────┐
│                            API GATEWAY                                   │
│                       (FastAPI - Python 3.11+)                          │
├─────────────────────────────────────────────────────────────────────────┤
│  - APIRouter (modular routing)                                           │
│  - Pydantic (request/response validation)                                │
│  - JWT Auth Middleware                                                   │
│  - CORS Middleware                                                       │
│  - Rate Limiting                                                         │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                  │
     ┌────────▼─────────┐ ┌─────▼──────┐ ┌────────▼────────┐
     │  Business Logic  │ │   Data     │ │    External     │
     │      Layer       │◄│   Access   │◄│    Services     │
     │   (Services)     │ │   Layer    │ │                 │
     └──────────────────┘ └─────┬──────┘ └─────────────────┘
                                │              │
                    ┌───────────┼───────────┐  │
                    │           │           │  │
               ┌────▼────┐ ┌───▼────┐ ┌────▼──▼────┐
               │ SQLite  │ │  File  │ │   Email    │
               │Database │ │ Store  │ │  Service   │
               └─────────┘ └────────┘ └────────────┘
```

### Technology Stack Summary

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | Next.js 16, React 19 | UI & routing |
| State | Zustand | Client-side state |
| Styling | Tailwind CSS 4 | Utility-first CSS |
| Backend | FastAPI | REST API |
| ORM | SQLAlchemy 2 | Database access |
| Database | SQLite | Data persistence |
| Auth | python-jose | JWT tokens |
| Validation | Pydantic 2 | Request/response schemas |
| Container | Docker | Deployment |

---

## Frontend Architecture

### Directory Structure

```
frontend/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── layout.tsx            # Centered card layout
│   │
│   ├── (buyer)/                  # Buyer route group
│   │   ├── page.tsx              # Home (personalized feed)
│   │   ├── trending/page.tsx
│   │   ├── search/page.tsx
│   │   ├── product/[id]/page.tsx
│   │   ├── cart/page.tsx
│   │   ├── checkout/page.tsx
│   │   ├── orders/page.tsx
│   │   ├── orders/[id]/page.tsx
│   │   └── layout.tsx            # Header + main layout
│   │
│   ├── (seller)/                 # Seller route group
│   │   ├── dashboard/page.tsx
│   │   ├── products/page.tsx
│   │   ├── orders/page.tsx
│   │   ├── orders/[id]/page.tsx
│   │   └── layout.tsx            # Sidebar layout
│   │
│   ├── layout.tsx                # Root layout
│   ├── providers.tsx             # Context providers
│   └── globals.css               # Global styles
│
├── components/
│   ├── ui/                       # UI primitives
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   └── Modal.tsx
│   │
│   ├── Header.tsx                # Buyer header
│   ├── SellerSidebar.tsx         # Seller navigation
│   ├── ProductCard.tsx           # Product display card
│   └── ReviewCard.tsx            # Review display
│
├── lib/
│   ├── api.ts                    # API client with auth
│   ├── utils.ts                  # Utility functions
│   └── constants.ts              # App constants
│
├── store/
│   ├── authStore.ts              # Auth state (Zustand)
│   └── cartStore.ts              # Cart state (Zustand)
│
└── middleware.ts                 # Route protection
```

### State Management (Zustand)

**Auth Store:**
```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}
```

**Cart Store:**
```typescript
interface CartState {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  addItem: (productId: string, quantity: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  fetchCart: () => Promise<void>;
}
```

### API Client

```typescript
// lib/api.ts
const api = {
  async fetch(endpoint: string, options?: RequestInit) {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options?.headers,
      },
    });
    
    if (!response.ok) {
      throw new ApiError(response.status, await response.json());
    }
    
    return response.json();
  },
  
  get: (endpoint) => api.fetch(endpoint),
  post: (endpoint, data) => api.fetch(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  put: (endpoint, data) => api.fetch(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (endpoint) => api.fetch(endpoint, { method: 'DELETE' }),
};
```

---

## Backend Architecture

### Directory Structure

```
backend/
├── app/
│   ├── main.py                   # FastAPI entry point
│   ├── config.py                 # Settings (env vars)
│   ├── database.py               # Database connection
│   │
│   ├── models/                   # SQLAlchemy models
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── product.py
│   │   ├── order.py
│   │   ├── cart.py
│   │   └── review.py
│   │
│   ├── schemas/                  # Pydantic schemas
│   │   ├── user.py
│   │   ├── product.py
│   │   ├── order.py
│   │   └── cart.py
│   │
│   ├── routers/                  # API endpoints
│   │   ├── auth.py
│   │   ├── users.py
│   │   ├── products.py
│   │   ├── cart.py
│   │   ├── orders.py
│   │   ├── reviews.py
│   │   ├── uploads.py
│   │   └── seller.py
│   │
│   ├── services/                 # Business logic
│   │   ├── auth_service.py
│   │   ├── product_service.py
│   │   ├── order_service.py
│   │   ├── cart_service.py
│   │   ├── email_service.py
│   │   ├── payment_service.py
│   │   ├── file_service.py
│   │   └── csv_service.py
│   │
│   ├── middleware/
│   │   └── auth.py               # JWT verification
│   │
│   └── utils/
│       └── security.py           # Password hashing, JWT
│
├── alembic/                      # Database migrations
│   ├── versions/
│   └── env.py
│
├── uploads/                      # File storage
│   ├── products/
│   └── profiles/
│
├── data/
│   └── marketplace.db            # SQLite database
│
└── requirements.txt
```

### Layered Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Routers Layer                     │
│           (API endpoints, request handling)          │
└────────────────────────┬────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────┐
│                   Schemas Layer                      │
│        (Pydantic validation, serialization)          │
└────────────────────────┬────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────┐
│                   Services Layer                     │
│               (Business logic)                       │
└────────────────────────┬────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────┐
│                    Models Layer                      │
│           (SQLAlchemy ORM, database)                 │
└─────────────────────────────────────────────────────┘
```

### Dependency Injection

```python
# Database session dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Current user dependency
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials"
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user

# Usage in router
@router.get("/profile")
async def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return current_user
```

---

## Database Design

### Entity Relationship Diagram

```
┌──────────────────┐         ┌──────────────────┐
│      Users       │         │     Products     │
├──────────────────┤         ├──────────────────┤
│ id (PK)          │─┐       │ id (PK)          │
│ email (UNIQUE)   │ │   ┌───│ seller_id (FK)   │
│ password_hash    │ │   │   │ title            │
│ full_name        │ │   │   │ description      │
│ mobile           │ │   │   │ price            │
│ account_type     │ │   │   │ category         │
│ business_name    │ │   │   │ stock_quantity   │
│ business_address │ │   │   │ status           │
│ profile_picture  │ │   │   │ images (JSON)    │
│ created_at       │ │   │   │ views_count      │
│ updated_at       │ │   │   │ created_at       │
└──────────────────┘ │   │   │ updated_at       │
                     │   │   └──────────────────┘
                     │   │            │
                     │   └────────────┘
                     │
         ┌───────────┼───────────────────┐
         │           │                   │
┌────────▼─────┐ ┌───▼──────────┐ ┌─────▼──────────┐
│   Orders     │ │   Carts      │ │    Reviews     │
├──────────────┤ ├──────────────┤ ├────────────────┤
│ id (PK)      │ │ id (PK)      │ │ id (PK)        │
│ buyer_id(FK) │ │ user_id (FK) │ │ product_id(FK) │
│ total_amount │ │ created_at   │ │ user_id (FK)   │
│ status       │ │ updated_at   │ │ rating         │
│ shipping_*   │ └──────────────┘ │ review_text    │
│ payment_*    │         │        │ created_at     │
│ tracking_#   │         │        └────────────────┘
│ created_at   │         │
│ updated_at   │         │
└──────────────┘         │
       │                 │
       │                 │
┌──────▼─────────┐ ┌─────▼──────────┐
│  OrderItems    │ │   CartItems    │
├────────────────┤ ├────────────────┤
│ id (PK)        │ │ id (PK)        │
│ order_id (FK)  │ │ cart_id (FK)   │
│ product_id(FK) │ │ product_id(FK) │
│ quantity       │ │ quantity       │
│ price_at_order │ │ added_at       │
│ seller_id (FK) │ └────────────────┘
└────────────────┘
```

### Key Indexes

```sql
CREATE INDEX idx_products_seller ON products(seller_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_seller ON order_items(seller_id);
CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX idx_reviews_product ON reviews(product_id);
```

---

## Authentication Flow

### JWT Token Flow

```
┌─────────┐          ┌─────────┐          ┌─────────┐
│ Client  │          │   API   │          │   DB    │
└────┬────┘          └────┬────┘          └────┬────┘
     │                    │                    │
     │ POST /auth/login   │                    │
     │ {email, password}  │                    │
     │───────────────────▶│                    │
     │                    │ Find user by email │
     │                    │───────────────────▶│
     │                    │                    │
     │                    │◀───────────────────│
     │                    │                    │
     │                    │ Verify password    │
     │                    │ Generate JWT       │
     │                    │                    │
     │◀───────────────────│                    │
     │ {user, token}      │                    │
     │                    │                    │
     │ Store token        │                    │
     │ (localStorage)     │                    │
     │                    │                    │
     │ GET /products      │                    │
     │ Authorization:     │                    │
     │ Bearer <token>     │                    │
     │───────────────────▶│                    │
     │                    │ Verify JWT         │
     │                    │ Extract user_id    │
     │                    │                    │
     │                    │ Fetch products     │
     │                    │───────────────────▶│
     │                    │                    │
     │◀───────────────────│◀───────────────────│
     │ {products: [...]}  │                    │
```

### Token Structure

```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "user-uuid-here",
    "exp": 1706889600,
    "iat": 1706284800
  },
  "signature": "..."
}
```

---

## Key Workflows

### Checkout Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CHECKOUT WORKFLOW                            │
└─────────────────────────────────────────────────────────────────────┘

1. VIEW CART                2. SHIPPING INFO               3. PAYMENT
┌───────────────┐          ┌───────────────┐          ┌───────────────┐
│ Cart Items    │          │ Full Name     │          │ ○ Card        │
│ ├── Item 1    │───────▶  │ Address       │───────▶  │ ○ UPI         │
│ ├── Item 2    │          │ City/State    │          │ ○ Wallet      │
│ └── Total     │          │ Pincode       │          │               │
└───────────────┘          └───────────────┘          └───────────────┘
                                                              │
                                                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        ORDER PROCESSING                              │
├─────────────────────────────────────────────────────────────────────┤
│ 1. Validate cart items (stock availability)                         │
│ 2. Process payment (simulated - 2 second delay)                     │
│ 3. Create order record                                               │
│ 4. Create order items with price_at_order                           │
│ 5. Decrement product stock                                           │
│ 6. Clear user's cart                                                 │
│ 7. Send confirmation email to buyer                                  │
│ 8. Send notification email to seller(s)                              │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                           4. CONFIRMATION
                          ┌───────────────┐
                          │ Order #123    │
                          │ Total: ₹2,649 │
                          │ Status: Paid  │
                          └───────────────┘
```

### Product Upload Flow

```
              SINGLE UPLOAD                    BULK CSV UPLOAD
┌─────────────────────────────┐    ┌─────────────────────────────┐
│ 1. Fill product form        │    │ 1. Download CSV template    │
│ 2. Upload images (1-4)      │    │ 2. Fill CSV with products  │
│ 3. Set price & stock        │    │ 3. Upload CSV file          │
│ 4. Select category          │    │ 4. Validate all rows        │
│ 5. Submit                   │    │ 5. Show validation report   │
└─────────────┬───────────────┘    │ 6. Confirm import           │
              │                     └─────────────┬───────────────┘
              │                                   │
              └─────────────────┬─────────────────┘
                                │
                                ▼
                    ┌─────────────────────┐
                    │  Product Created    │
                    │  - Active status    │
                    │  - Visible to buyers│
                    │  - Indexed          │
                    └─────────────────────┘
```

---

## Security Measures

| Area | Measure |
|------|---------|
| Passwords | bcrypt hashing (10 rounds) |
| Auth | JWT tokens (7-day expiry) |
| API | Rate limiting (10 req/sec) |
| Data | Pydantic validation |
| SQL | SQLAlchemy ORM (no raw SQL) |
| Files | Type & size validation |
| CORS | Origin whitelist |

---

## Performance Optimizations

1. **Database Indexes** - On foreign keys and frequently queried columns
2. **Pagination** - All list endpoints paginated (default 20 items)
3. **Lazy Loading** - SQLAlchemy relationship lazy loading
4. **Image Optimization** - File size limits (5MB max)
5. **Caching** - (Future) Redis for session/product caching

---

## Scalability Considerations

### Current (MVP)
- SQLite database (single file)
- Local file storage
- Single-instance deployment

### Future Scale
- PostgreSQL for database
- S3/CloudStorage for files
- Redis for caching
- Kubernetes for orchestration
- CDN for static assets
