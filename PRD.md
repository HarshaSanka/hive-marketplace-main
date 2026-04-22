# **PROJECT REQUIREMENT DOCUMENT**
## **Minimal E-Commerce Marketplace MVP**

---

## **1. EXECUTIVE SUMMARY**

### **1.1 Vision**
A sleek, minimalistic e-commerce marketplace targeting GenZ buyers in India, enabling solopreneurs, small businesses, and brands to sell products with an Instagram-clean, Apple-minimalist, Stripe-simple user experience. Shopping should be fast, easy, and non-overwhelming.

### **1.2 Core Value Proposition**
- **For Buyers**: Discover products through personalized feeds and trending items with minimal friction from browse to checkout
- **For Sellers**: List products instantly via bulk upload, manage inventory, and fulfill orders with zero onboarding friction

### **1.3 MVP Scope**
- Dual-sided marketplace (buyers + sellers)
- Email/password authentication
- Product discovery via personalized feed, trending section, and filtered search
- Persistent shopping cart with order history
- Seller dashboard with bulk product upload and order management
- Simulated payment gateway (Stripe/PayPal flow)
- Simulated shipping with flat-rate and tracking
- Product reviews
- Email notifications

---

## **2. SUCCESS CRITERIA & METRICS**

### **2.1 Launch Success Metrics**
| Metric | Target |
|--------|--------|
| Registered Buyers | 50+ |
| Registered Sellers | 10+ |
| Products Listed | 100+ |
| Completed Transactions | 20+ |
| Average Checkout Time | < 2 minutes |
| System Uptime | 99%+ |

### **2.2 User Experience Metrics**
- **Time to First Purchase**: < 5 minutes from registration
- **Seller Onboarding**: < 3 minutes to first product listed
- **Page Load Time**: < 2 seconds (all pages)
- **Mobile Responsiveness**: 100% functional on mobile web

---

## **3. USER PERSONAS & STORIES**

### **3.1 Buyer Persona: "Riya" (GenZ College Student)**
- **Age**: 19-24
- **Tech-Savvy**: High
- **Shopping Behavior**: Impulse buyer, influenced by trends, values aesthetics
- **Pain Points**: 
  - Too many steps to checkout
  - Overwhelming product pages with excessive information
  - Unclear shipping/delivery timeline
  - Difficulty finding unique products from small brands

### **3.2 Seller Persona: "Arjun" (Solopreneur Artisan)**
- **Business**: Handmade jewelry, small batch production
- **Tech-Savvy**: Medium
- **Pain Points**:
  - Complex onboarding processes on existing platforms
  - High commission fees
  - Difficult bulk product uploads
  - Poor visibility for small sellers

### **3.3 User Stories**

#### **Buyer Stories**
1. As a buyer, I want to browse trending products so I can discover what's popular
2. As a buyer, I want to see a personalized feed so I find products relevant to my interests
3. As a buyer, I want to search and filter products so I can find specific items quickly
4. As a buyer, I want to add products to cart so I can purchase multiple items at once
5. As a buyer, I want to checkout quickly so I don't abandon my purchase
6. As a buyer, I want to view my order history so I can track past purchases
7. As a buyer, I want to review products so I can share my experience

#### **Seller Stories**
1. As a seller, I want to register instantly so I can start selling immediately
2. As a seller, I want to bulk upload products via CSV so I can list inventory quickly
3. As a seller, I want to manage inventory so I don't oversell
4. As a seller, I want to view incoming orders so I can fulfill them
5. As a seller, I want to mark orders as shipped so buyers are updated
6. As a seller, I want to see my sales metrics so I can track performance

---

## **4. FUNCTIONAL REQUIREMENTS**

### **4.1 Authentication & User Management**

#### **4.1.1 Registration**
- **Buyer Registration**
  - Fields: Full Name, Email, Password, Confirm Password, Mobile Number
  - Validation: Email format, password strength (min 8 chars, 1 uppercase, 1 number), unique email
  - Account type: "buyer" (default)
  
- **Seller Registration**
  - Fields: Business Name, Owner Name, Email, Password, Confirm Password, Mobile Number, Business Address
  - Validation: Same as buyer + business name required
  - Account type: "seller"
  - Activation: Instant (no approval needed)

#### **4.1.2 Login**
- Email + Password
- JWT token generation (expires in 7 days)
- "Remember Me" checkbox (extends token to 30 days)

#### **4.1.3 Profile Management**
- Buyers: Edit name, email, mobile, password
- Sellers: Edit business details, owner info, contact details
- Profile picture upload (optional, 2MB max, JPG/PNG)

---

### **4.2 Product Management**

#### **4.2.1 Product Schema**
```
- Product ID (auto-generated UUID)
- Title (max 100 chars)
- Description (max 1000 chars)
- Price (float, INR)
- Category (dropdown: Electronics, Fashion, Home, Beauty, Food, Handmade, Other)
- Images (up to 4 images, 5MB each, JPG/PNG)
- Stock Quantity (integer)
- Status (active/inactive)
- Seller ID (foreign key)
- Created At, Updated At
```

#### **4.2.2 Single Product Upload**
- Form-based upload with above fields
- Image drag-and-drop or file picker
- Real-time validation
- Auto-save as draft option

#### **4.2.3 Bulk Product Upload (CSV)**
- CSV Template: `title, description, price, category, stock_quantity, image_url_1, image_url_2, image_url_3, image_url_4`
- Upload flow:
  1. Download template button
  2. Upload CSV (max 100 products per file)
  3. Validation report (shows errors)
  4. Confirm and import
- Error handling: Row-level errors displayed, valid rows imported
- Image URLs: publicly accessible URLs (uploaded to backend first separately or hosted externally)

#### **4.2.4 Inventory Management**
- Stock level display on product listing
- Auto-deduction on order placement
- Low stock alert (< 5 units) on seller dashboard
- Option to mark product as inactive (hides from buyers)

---

### **4.3 Product Discovery (Buyer Side)**

#### **4.3.1 Personalized Feed**
- Algorithm: 
  - New users: Show trending products (most viewed/purchased in last 7 days)
  - Returning users: Show products from categories they've viewed/purchased + trending
- Infinite scroll (20 products per load)
- Product card: Image, title, price, seller name, rating

#### **4.3.2 Trending Section**
- Dedicated "Trending" page
- Sorted by: (views * 0.3) + (purchases * 0.7) in last 7 days
- Updated daily

#### **4.3.3 Search & Filters**
- **Search Bar**: Keyword search (searches title and description)
- **Filters** (sidebar):
  - Category (multi-select)
  - Price Range (slider: ₹0 - ₹50,000)
  - Rating (dropdown: All, 4+, 3+)
  - Sort By (dropdown: Relevance, Price Low-High, Price High-Low, Newest)
- Filter state persists in URL query params
- Clear all filters button

#### **4.3.4 Product Detail Page**
- Image carousel (4 images max)
- Title, price, seller name (clickable to seller profile)
- Description
- Stock availability status
- "Add to Cart" button (disabled if out of stock)
- Reviews section (latest 10 reviews, "View All" link)

---

### **4.4 Shopping Cart & Checkout**

#### **4.4.1 Shopping Cart**
- Persistent cart (stored in database, not session)
- Cart items: Product thumbnail, title, price, quantity selector (1-10), remove button
- Real-time price calculation
- Stock validation (if product out of stock, show warning)
- "Continue Shopping" and "Proceed to Checkout" buttons

#### **4.4.2 Checkout Flow**
**Step 1: Shipping Address**
- Fields: Full Name, Address Line 1, Address Line 2, City, State, Pincode, Mobile
- Option to save address for future
- Pre-filled if user has saved address

**Step 2: Order Summary**
- Line items (product, qty, price)
- Subtotal
- Shipping (flat ₹50)
- Total

**Step 3: Payment (Simulated)**
- Payment method selection: Credit/Debit Card, UPI, Wallet
- Mock payment form:
  - Card: Card number, expiry, CVV, name
  - UPI: UPI ID
  - Wallet: Mock balance display
- "Pay Now" button → simulate 2-second processing → success

**Step 4: Order Confirmation**
- Order ID, total amount, expected delivery (7 days from order date)
- Email confirmation sent
- Redirect to order history

#### **4.4.3 Order History (Buyer)**
- List of all orders (newest first)
- Each order: Order ID, date, total, status (Pending, Shipped, Delivered), view details link
- Order details page:
  - Products ordered (thumbnail, title, qty, price)
  - Shipping address
  - Payment method
  - Tracking number (if shipped)
  - Status timeline

---

### **4.5 Seller Dashboard**

#### **4.5.1 Dashboard Home**
- **Metrics Cards**:
  - Total Products
  - Total Orders
  - Total Revenue (lifetime)
  - Pending Orders (requires action)
- **Recent Orders Table** (latest 10): Order ID, buyer name, total, status, action button

#### **4.5.2 Products Management**
- List view: Product thumbnail, title, price, stock, status, edit/delete buttons
- Sorting: Newest, alphabetical, price, stock
- Filter: Active/inactive, category
- Actions: Edit (inline or modal), delete (confirmation modal), bulk actions (activate/deactivate)

#### **4.5.3 Orders Management**
- List view: Order ID, buyer, date, total, status, action
- Filter: All, Pending, Shipped, Delivered
- Order detail modal:
  - Buyer details
  - Shipping address
  - Products ordered
  - "Mark as Shipped" button (for pending orders)
  - Once marked shipped:
    - Generate mock tracking number (format: TRACK-{ORDER_ID}-{TIMESTAMP})
    - Send email to buyer
    - Status updates to "Shipped"

#### **4.5.4 CSV Upload Section**
- Template download
- Upload interface
- Upload history (last 10 uploads with status)

---

### **4.6 Reviews & Ratings**

#### **4.6.1 Review Submission**
- **Where**: Order history → delivered orders → "Write Review" button
- **Form**: 
  - Star rating (1-5, required)
  - Review text (max 500 chars, optional)
  - Submit button
- **Rules**: 
  - One review per product per user
  - Only for delivered orders

#### **4.6.2 Review Display**
- Product detail page: Average rating (x.x/5), total reviews count
- Reviews list: User name (first name only), rating, review text, date
- No seller reviews in MVP

---

### **4.7 Notifications**

#### **4.7.1 Email Notifications**
| Event | Recipient | Content |
|-------|-----------|---------|
| Registration | Buyer/Seller | Welcome email with account details |
| Order Placed | Buyer | Order confirmation with order ID, products, total |
| Order Placed | Seller | New order notification with buyer details |
| Order Shipped | Buyer | Shipping confirmation with tracking number |
| Product Out of Stock | Seller | Alert when product stock reaches 0 |

**Email Template**: Plain HTML, minimal design, transactional (no marketing)

---

### **4.8 Simulated Payment Gateway**

#### **4.8.1 Flow Simulation**
1. User selects payment method
2. Enters payment details (not validated, any input accepted)
3. "Pay Now" → 2-second loading animation
4. Success response (100% success rate for MVP)
5. Generate mock transaction ID: `TXN-{ORDER_ID}-{TIMESTAMP}`

#### **4.8.2 Payment Methods**
- **Credit/Debit Card**: Mock form (no actual validation)
- **UPI**: Mock UPI ID input
- **Wallet**: Show mock balance ₹10,000 (always sufficient)

---

### **4.9 Simulated Shipping**

#### **4.9.1 Flat Rate Shipping**
- All orders: ₹50 flat shipping charge
- Expected delivery: 7 days from order date
- No location-based calculation

#### **4.9.2 Tracking**
- Format: `TRACK-{ORDER_ID}-{UNIX_TIMESTAMP}`
- Example: `TRACK-550e8400-e29b-41d4-a716-446655440000-1706889600`
- Generated when seller marks order as shipped
- Displayed on buyer's order detail page
- No real tracking API integration (static display only)

---

## **5. TECHNICAL ARCHITECTURE**

### **5.1 System Design**

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                         │
│                  (Next.js 16 - React 19)                     │
├─────────────────────────────────────────────────────────────┤
│  - App Router (app/)                                         │
│  - Server Components (default)                               │
│  - Client Components (interactive elements)                  │
│  - Zustand (global state: cart, user)                       │
│  - React Hook Form (forms)                                   │
│  - Tailwind CSS (styling)                                    │
└──────────────────┬──────────────────────────────────────────┘
                   │ HTTP/REST (JSON)
                   │ JWT Bearer Token Auth
                   │
┌──────────────────▼──────────────────────────────────────────┐
│                        API GATEWAY                           │
│                  (FastAPI - Python 3.11+)                    │
├─────────────────────────────────────────────────────────────┤
│  - APIRouter (modular routing)                               │
│  - Pydantic (request/response validation)                    │
│  - JWT Auth Middleware                                       │
│  - CORS Middleware                                           │
│  - Rate Limiting (10 req/sec per IP)                        │
└──────────────────┬──────────────────────────────────────────┘
                   │
    ┌──────────────┼──────────────┐
    │              │              │
┌───▼────┐   ┌────▼─────┐   ┌───▼────────┐
│Business│   │   Data   │   │  External  │
│ Logic  │◄──►  Access  │◄──►  Services  │
│ Layer  │   │   Layer  │   │            │
└────────┘   └────┬─────┘   └────────────┘
                  │              │
         ┌────────┼────────┐     │
         │        │        │     │
    ┌────▼───┐┌──▼───┐┌───▼─────▼────┐
    │SQLite  ││ File ││Email Service  │
    │Database││Store ││(SMTP/Console) │
    └────────┘└──────┘└───────────────┘
```

### **5.2 Tech Stack**

#### **5.2.1 Frontend**
| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Framework | Next.js | 16.x | React framework with App Router |
| UI Library | React | 19.x | Component-based UI |
| Styling | Tailwind CSS | 3.x | Utility-first CSS |
| State Management | Zustand | 5.x | Lightweight global state |
| Forms | React Hook Form | 7.x | Form handling & validation |
| HTTP Client | Fetch API | Native | API requests |
| Icons | Lucide React | Latest | Icon library |
| Image Upload | react-dropzone | 14.x | Drag-drop file upload |

#### **5.2.2 Backend**
| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Framework | FastAPI | 0.115+ | Modern async Python API |
| Database | SQLite | 3.x | Embedded SQL database |
| ORM | SQLAlchemy | 2.x | Database ORM |
| Auth | python-jose | 3.x | JWT token handling |
| Validation | Pydantic | 2.x | Data validation |
| Password Hash | passlib + bcrypt | Latest | Secure password hashing |
| Email | aiosmtplib | 3.x | Async email sending |
| File Upload | python-multipart | Latest | Multipart form data |
| CSV Processing | pandas | 2.x | CSV parsing |

#### **5.2.3 Infrastructure**
| Component | Technology | Purpose |
|-----------|-----------|---------|
| Containerization | Docker + Docker Compose | Orchestration |
| Database | SQLite (file-based) | Data persistence |
| File Storage | Local filesystem | Image/file storage |
| Reverse Proxy | Nginx (in Docker) | Route traffic |
| Environment Config | .env files | Configuration management |

---

### **5.3 Module Breakdown**

#### **5.3.1 Frontend Structure**
```
/app
├── (auth)
│   ├── login/
│   │   └── page.tsx            # Login page
│   ├── register/
│   │   └── page.tsx            # Registration (buyer/seller toggle)
│   └── layout.tsx              # Auth layout (centered card)
├── (buyer)
│   ├── layout.tsx              # Buyer layout (header, footer)
│   ├── page.tsx                # Home - Personalized feed
│   ├── trending/
│   │   └── page.tsx            # Trending products
│   ├── search/
│   │   └── page.tsx            # Search results with filters
│   ├── product/
│   │   └── [id]/
│   │       └── page.tsx        # Product detail page
│   ├── cart/
│   │   └── page.tsx            # Shopping cart
│   ├── checkout/
│   │   └── page.tsx            # Multi-step checkout
│   ├── orders/
│   │   ├── page.tsx            # Order history list
│   │   └── [id]/
│   │       └── page.tsx        # Order detail
│   └── profile/
│       └── page.tsx            # Profile management
├── (seller)
│   ├── layout.tsx              # Seller layout (sidebar nav)
│   ├── dashboard/
│   │   └── page.tsx            # Dashboard home
│   ├── products/
│   │   ├── page.tsx            # Product list
│   │   ├── new/
│   │   │   └── page.tsx        # Single upload form
│   │   ├── bulk/
│   │   │   └── page.tsx        # CSV bulk upload
│   │   └── [id]/
│   │       └── page.tsx        # Edit product
│   ├── orders/
│   │   ├── page.tsx            # Orders list
│   │   └── [id]/
│   │       └── page.tsx        # Order detail
│   └── profile/
│       └── page.tsx            # Seller profile
├── components/
│   ├── ui/                     # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Dropdown.tsx
│   │   └── ...
│   ├── ProductCard.tsx         # Product grid card
│   ├── Header.tsx              # Buyer header
│   ├── SellerSidebar.tsx       # Seller navigation
│   ├── CartItem.tsx            # Cart line item
│   └── ReviewCard.tsx          # Review display
├── lib/
│   ├── api.ts                  # API client wrapper
│   ├── auth.ts                 # Auth helpers
│   ├── utils.ts                # Utility functions
│   └── constants.ts            # App constants
├── store/
│   ├── authStore.ts            # Auth state (Zustand)
│   ├── cartStore.ts            # Cart state (Zustand)
│   └── index.ts                # Store exports
├── types/
│   └── index.ts                # TypeScript types
└── middleware.ts               # Route protection
```

#### **5.3.2 Backend Structure**
```
/backend
├── app/
│   ├── main.py                 # FastAPI app entry
│   ├── config.py               # Configuration (env vars)
│   ├── database.py             # Database connection
│   ├── models/                 # SQLAlchemy models
│   │   ├── __init__.py
│   │   ├── user.py             # User model
│   │   ├── product.py          # Product model
│   │   ├── order.py            # Order, OrderItem models
│   │   ├── cart.py             # Cart, CartItem models
│   │   └── review.py           # Review model
│   ├── schemas/                # Pydantic schemas
│   │   ├── __init__.py
│   │   ├── user.py             # User request/response schemas
│   │   ├── product.py          # Product schemas
│   │   ├── order.py            # Order schemas
│   │   ├── cart.py             # Cart schemas
│   │   └── review.py           # Review schemas
│   ├── routers/                # API routes
│   │   ├── __init__.py
│   │   ├── auth.py             # /auth routes
│   │   ├── users.py            # /users routes
│   │   ├── products.py         # /products routes
│   │   ├── cart.py             # /cart routes
│   │   ├── orders.py           # /orders routes
│   │   ├── reviews.py          # /reviews routes
│   │   └── uploads.py          # /uploads routes
│   ├── services/               # Business logic
│   │   ├── __init__.py
│   │   ├── auth_service.py     # Auth logic
│   │   ├── product_service.py  # Product logic
│   │   ├── order_service.py    # Order logic
│   │   ├── cart_service.py     # Cart logic
│   │   ├── review_service.py   # Review logic
│   │   ├── email_service.py    # Email sending
│   │   ├── payment_service.py  # Mock payment
│   │   └── file_service.py     # File upload handling
│   ├── middleware/
│   │   ├── __init__.py
│   │   ├── auth.py             # JWT verification
│   │   └── rate_limit.py       # Rate limiting
│   └── utils/
│       ├── __init__.py
│       ├── security.py         # Password hashing, JWT
│       └── validators.py       # Custom validators
├── uploads/                    # Local file storage
│   ├── products/               # Product images
│   └── profiles/               # Profile pictures
├── data/
│   └── marketplace.db          # SQLite database file
├── alembic/                    # Database migrations
│   ├── versions/
│   └── env.py
├── requirements.txt            # Python dependencies
└── .env                        # Environment variables
```

---

### **5.4 Database Schema**

#### **5.4.1 ERD (Entity Relationship Diagram)**
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
┌────────▼─────┐ ┌──▼───────────┐ ┌─────▼──────────┐
│   Orders     │ │  Cart        │ │    Reviews     │
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
└────────────────┘ └────────────────┘
```

#### **5.4.2 Table Definitions**

```sql
-- Users Table
CREATE TABLE users (
    id TEXT PRIMARY KEY,  -- UUID
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    mobile TEXT NOT NULL,
    account_type TEXT NOT NULL,  -- 'buyer' or 'seller'
    business_name TEXT,
    business_address TEXT,
    profile_picture TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE products (
    id TEXT PRIMARY KEY,  -- UUID
    seller_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    category TEXT NOT NULL,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active',  -- 'active' or 'inactive'
    images TEXT,  -- JSON array of image URLs
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES users(id)
);

-- Orders Table
CREATE TABLE orders (
    id TEXT PRIMARY KEY,  -- UUID
    buyer_id TEXT NOT NULL,
    total_amount REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',  -- 'pending', 'shipped', 'delivered'
    shipping_name TEXT NOT NULL,
    shipping_address_line1 TEXT NOT NULL,
    shipping_address_line2 TEXT,
    shipping_city TEXT NOT NULL,
    shipping_state TEXT NOT NULL,
    shipping_pincode TEXT NOT NULL,
    shipping_mobile TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    payment_transaction_id TEXT,
    tracking_number TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (buyer_id) REFERENCES users(id)
);

-- OrderItems Table
CREATE TABLE order_items (
    id TEXT PRIMARY KEY,  -- UUID
    order_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price_at_order REAL NOT NULL,
    seller_id TEXT NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (seller_id) REFERENCES users(id)
);

-- Cart Table
CREATE TABLE carts (
    id TEXT PRIMARY KEY,  -- UUID
    user_id TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- CartItems Table
CREATE TABLE cart_items (
    id TEXT PRIMARY KEY,  -- UUID
    cart_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cart_id) REFERENCES carts(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Reviews Table
CREATE TABLE reviews (
    id TEXT PRIMARY KEY,  -- UUID
    product_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(product_id, user_id)  -- One review per user per product
);

-- Indexes for performance
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

### **5.5 API Definitions**

#### **5.5.1 Authentication APIs**

**POST /api/auth/register**
```json
Request:
{
  "email": "user@example.com",
  "password": "Password123",
  "full_name": "John Doe",
  "mobile": "9876543210",
  "account_type": "buyer",  // or "seller"
  "business_name": "John's Shop",  // required if seller
  "business_address": "123 Street, City"  // required if seller
}

Response (201):
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "full_name": "John Doe",
  "account_type": "buyer",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}

Errors:
400 - Email already exists
400 - Validation error
```

**POST /api/auth/login**
```json
Request:
{
  "email": "user@example.com",
  "password": "Password123"
}

Response (200):
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "full_name": "John Doe",
  "account_type": "buyer",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}

Errors:
401 - Invalid credentials
```

**GET /api/auth/me**
```
Headers: Authorization: Bearer {token}

Response (200):
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "full_name": "John Doe",
  "mobile": "9876543210",
  "account_type": "buyer",
  "profile_picture": "/uploads/profiles/abc.jpg",
  "created_at": "2025-01-01T10:00:00Z"
}
```

---

#### **5.5.2 Product APIs**

**GET /api/products**
```
Query Params:
  - page: int (default: 1)
  - limit: int (default: 20)
  - category: str (optional)
  - min_price: float (optional)
  - max_price: float (optional)
  - rating: int (optional, 3 or 4)
  - sort: str (relevance|price_asc|price_desc|newest)
  - search: str (optional)

Response (200):
{
  "products": [
    {
      "id": "prod-123",
      "title": "Product Name",
      "description": "Product description",
      "price": 1299.99,
      "category": "Electronics",
      "images": ["/uploads/products/img1.jpg"],
      "stock_quantity": 10,
      "seller": {
        "id": "seller-456",
        "business_name": "Shop Name"
      },
      "average_rating": 4.5,
      "total_reviews": 23
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 20,
  "total_pages": 8
}
```

**GET /api/products/trending**
```
Query Params: page, limit

Response: Same as GET /api/products
```

**GET /api/products/feed**
```
Headers: Authorization: Bearer {token}
Query Params: page, limit

Response: Same as GET /api/products (personalized)
```

**GET /api/products/{id}**
```
Response (200):
{
  "id": "prod-123",
  "title": "Product Name",
  "description": "Long description here...",
  "price": 1299.99,
  "category": "Electronics",
  "images": [
    "/uploads/products/img1.jpg",
    "/uploads/products/img2.jpg"
  ],
  "stock_quantity": 10,
  "status": "active",
  "seller": {
    "id": "seller-456",
    "business_name": "Shop Name"
  },
  "average_rating": 4.5,
  "total_reviews": 23,
  "created_at": "2025-01-01T10:00:00Z"
}

Errors:
404 - Product not found
```

**POST /api/products** (Seller only)
```
Headers: 
  - Authorization: Bearer {token}
  - Content-Type: multipart/form-data

Form Data:
  - title: str
  - description: str
  - price: float
  - category: str
  - stock_quantity: int
  - images: File[] (up to 4 files)

Response (201):
{
  "id": "prod-789",
  "title": "New Product",
  "price": 999.99,
  ...
}

Errors:
401 - Unauthorized
403 - Not a seller account
400 - Validation error
```

**PUT /api/products/{id}** (Seller only - own products)
```
Same as POST, all fields optional

Response (200): Updated product object

Errors:
404 - Product not found
403 - Not authorized (not product owner)
```

**DELETE /api/products/{id}** (Seller only - own products)
```
Response (204): No content

Errors:
404 - Product not found
403 - Not authorized
```

**POST /api/products/bulk-upload** (Seller only)
```
Headers: 
  - Authorization: Bearer {token}
  - Content-Type: multipart/form-data

Form Data:
  - csv_file: File

Response (200):
{
  "total_rows": 50,
  "successful": 48,
  "failed": 2,
  "errors": [
    {
      "row": 12,
      "error": "Invalid price format"
    },
    {
      "row": 35,
      "error": "Missing required field: title"
    }
  ],
  "products_created": ["prod-1", "prod-2", ...]
}

Errors:
400 - Invalid CSV format
401 - Unauthorized
```

---

#### **5.5.3 Cart APIs**

**GET /api/cart**
```
Headers: Authorization: Bearer {token}

Response (200):
{
  "id": "cart-123",
  "items": [
    {
      "id": "item-1",
      "product": {
        "id": "prod-123",
        "title": "Product Name",
        "price": 1299.99,
        "images": ["/uploads/products/img1.jpg"],
        "stock_quantity": 10
      },
      "quantity": 2,
      "subtotal": 2599.98
    }
  ],
  "total_items": 2,
  "total_amount": 2599.98
}
```

**POST /api/cart/items**
```
Headers: Authorization: Bearer {token}

Request:
{
  "product_id": "prod-123",
  "quantity": 2
}

Response (201):
{
  "id": "item-1",
  "cart_id": "cart-123",
  "product_id": "prod-123",
  "quantity": 2
}

Errors:
400 - Product out of stock
404 - Product not found
```

**PUT /api/cart/items/{id}**
```
Request:
{
  "quantity": 3
}

Response (200): Updated cart item

Errors:
400 - Insufficient stock
404 - Cart item not found
```

**DELETE /api/cart/items/{id}**
```
Response (204): No content
```

**DELETE /api/cart**
```
Response (204): Clears entire cart
```

---

#### **5.5.4 Order APIs**

**POST /api/orders**
```
Headers: Authorization: Bearer {token}

Request:
{
  "shipping_address": {
    "name": "John Doe",
    "address_line1": "123 Main St",
    "address_line2": "Apt 4B",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001",
    "mobile": "9876543210"
  },
  "payment_method": "card"  // or "upi", "wallet"
}

Response (201):
{
  "id": "order-789",
  "total_amount": 2649.98,  // includes ₹50 shipping
  "status": "pending",
  "payment_transaction_id": "TXN-order-789-1706889600",
  "items": [
    {
      "product_id": "prod-123",
      "title": "Product Name",
      "quantity": 2,
      "price_at_order": 1299.99
    }
  ],
  "created_at": "2025-01-13T12:00:00Z"
}

Errors:
400 - Cart is empty
400 - Product out of stock
```

**GET /api/orders** (Buyer: own orders, Seller: orders with their products)
```
Headers: Authorization: Bearer {token}

Query Params:
  - status: str (optional: pending|shipped|delivered)
  - page: int
  - limit: int

Response (200):
{
  "orders": [
    {
      "id": "order-789",
      "buyer": {  // Only for sellers
        "name": "John Doe",
        "email": "john@example.com"
      },
      "total_amount": 2649.98,
      "status": "pending",
      "created_at": "2025-01-13T12:00:00Z",
      "items_count": 2
    }
  ],
  "total": 15,
  "page": 1
}
```

**GET /api/orders/{id}**
```
Response (200):
{
  "id": "order-789",
  "buyer": {
    "id": "buyer-123",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "total_amount": 2649.98,
  "status": "shipped",
  "shipping_address": {...},
  "payment_method": "card",
  "payment_transaction_id": "TXN-order-789-1706889600",
  "tracking_number": "TRACK-order-789-1706889600",
  "items": [
    {
      "id": "item-1",
      "product": {
        "id": "prod-123",
        "title": "Product Name",
        "images": ["/uploads/products/img1.jpg"]
      },
      "quantity": 2,
      "price_at_order": 1299.99,
      "subtotal": 2599.98,
      "seller": {
        "id": "seller-456",
        "business_name": "Shop Name"
      }
    }
  ],
  "created_at": "2025-01-13T12:00:00Z",
  "updated_at": "2025-01-13T14:30:00Z"
}

Errors:
404 - Order not found
403 - Not authorized
```

**PUT /api/orders/{id}/ship** (Seller only)
```
Headers: Authorization: Bearer {token}

Response (200):
{
  "id": "order-789",
  "status": "shipped",
  "tracking_number": "TRACK-order-789-1706889600",
  "updated_at": "2025-01-13T14:30:00Z"
}

Errors:
404 - Order not found
403 - Not authorized (not seller of products in order)
400 - Order already shipped
```

---

#### **5.5.5 Review APIs**

**POST /api/reviews**
```
Headers: Authorization: Bearer {token}

Request:
{
  "product_id": "prod-123",
  "order_id": "order-789",
  "rating": 5,
  "review_text": "Great product!"
}

Response (201):
{
  "id": "review-456",
  "product_id": "prod-123",
  "user": {
    "name": "John"  // First name only
  },
  "rating": 5,
  "review_text": "Great product!",
  "created_at": "2025-01-13T15:00:00Z"
}

Errors:
400 - Already reviewed this product
403 - Order not delivered yet
404 - Product/Order not found
```

**GET /api/reviews/product/{product_id}**
```
Query Params: page, limit

Response (200):
{
  "reviews": [
    {
      "id": "review-456",
      "user": {
        "name": "John"
      },
      "rating": 5,
      "review_text": "Great product!",
      "created_at": "2025-01-13T15:00:00Z"
    }
  ],
  "average_rating": 4.5,
  "total_reviews": 23,
  "rating_distribution": {
    "5": 15,
    "4": 5,
    "3": 2,
    "2": 1,
    "1": 0
  }
}
```

---

#### **5.5.6 File Upload APIs**

**POST /api/uploads/image**
```
Headers: 
  - Authorization: Bearer {token}
  - Content-Type: multipart/form-data

Form Data:
  - file: File (max 5MB, JPG/PNG)
  - type: str (product|profile)

Response (200):
{
  "url": "/uploads/products/abc123.jpg"
}

Errors:
400 - Invalid file type
400 - File too large
```

---

#### **5.5.7 User APIs**

**GET /api/users/profile**
```
Headers: Authorization: Bearer {token}

Response (200):
{
  "id": "user-123",
  "email": "user@example.com",
  "full_name": "John Doe",
  "mobile": "9876543210",
  "account_type": "seller",
  "business_name": "John's Shop",
  "business_address": "123 Street, City",
  "profile_picture": "/uploads/profiles/abc.jpg",
  "created_at": "2025-01-01T10:00:00Z"
}
```

**PUT /api/users/profile**
```
Request:
{
  "full_name": "John Smith",
  "mobile": "9876543210",
  "business_name": "John's Shop",  // if seller
  "business_address": "456 New St"  // if seller
}

Response (200): Updated user object
```

**PUT /api/users/password**
```
Request:
{
  "current_password": "OldPass123",
  "new_password": "NewPass456"
}

Response (200):
{
  "message": "Password updated successfully"
}

Errors:
401 - Current password incorrect
```

---

#### **5.5.8 Seller Dashboard APIs**

**GET /api/seller/stats**
```
Headers: Authorization: Bearer {token}

Response (200):
{
  "total_products": 45,
  "active_products": 42,
  "total_orders": 128,
  "pending_orders": 8,
  "total_revenue": 156780.50,
  "low_stock_products": 3  // stock < 5
}

Errors:
403 - Not a seller account
```

---

## **6. UI/UX SPECIFICATIONS**

### **6.1 Design System**

#### **6.1.1 Color Palette**
```css
/* Primary */
--primary: #000000;          /* Black - primary actions */
--primary-hover: #1a1a1a;    /* Dark gray - hover state */

/* Secondary */
--secondary: #6B7280;        /* Gray - secondary text */
--secondary-hover: #4B5563;  /* Darker gray */

/* Background */
--bg-primary: #FFFFFF;       /* White - main background */
--bg-secondary: #F9FAFB;     /* Light gray - cards, sections */
--bg-tertiary: #F3F4F6;      /* Lighter gray - hover states */

/* Borders */
--border: #E5E7EB;           /* Light gray - borders */
--border-focus: #000000;     /* Black - focused inputs */

/* Status Colors */
--success: #10B981;          /* Green */
--error: #EF4444;            /* Red */
--warning: #F59E0B;          /* Orange */
--info: #3B82F6;             /* Blue */

/* Text */
--text-primary: #111827;     /* Almost black */
--text-secondary: #6B7280;   /* Gray */
--text-tertiary: #9CA3AF;    /* Light gray */
```

#### **6.1.2 Typography**
```css
/* Font Family */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

/* Font Sizes */
--text-xs: 12px;    /* Small labels */
--text-sm: 14px;    /* Body small */
--text-base: 16px;  /* Body text */
--text-lg: 18px;    /* Subtitles */
--text-xl: 20px;    /* Section headers */
--text-2xl: 24px;   /* Page headers */
--text-3xl: 30px;   /* Hero text */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

/* Line Heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

#### **6.1.3 Spacing System**
```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
```

#### **6.1.4 Component Specs**

**Button**
```css
/* Primary Button */
height: 44px;
padding: 0 24px;
background: var(--primary);
color: white;
border-radius: 8px;
font-weight: 500;
font-size: 16px;
transition: background 0.2s;

hover: background: var(--primary-hover);
disabled: opacity: 0.5, cursor: not-allowed;

/* Secondary Button */
background: transparent;
border: 1px solid var(--border);
color: var(--text-primary);

hover: background: var(--bg-tertiary);
```

**Input Field**
```css
height: 44px;
padding: 0 16px;
background: white;
border: 1px solid var(--border);
border-radius: 8px;
font-size: 16px;

focus: border-color: var(--border-focus), outline: none;
error: border-color: var(--error);
```

**Card**
```css
background: white;
border: 1px solid var(--border);
border-radius: 12px;
padding: 24px;
box-shadow: 0 1px 3px rgba(0,0,0,0.1);
```

---

### **6.2 Page Wireframes**

#### **6.2.1 Login/Register Page**

**Layout**: Centered card (max-width 400px)

```
┌─────────────────────────────────────────┐
│                                         │
│           [LOGO]                        │
│                                         │
│     Welcome Back / Create Account       │
│                                         │
│   [Email Input]                         │
│   [Password Input]                      │
│   [Confirm Password Input] (register)   │
│   [Full Name Input] (register)          │
│   [Mobile Input] (register)             │
│                                         │
│   [Account Type Toggle] (register)      │
│   ┌─────────┐ ┌─────────┐              │
│   │ Buyer   │ │ Seller  │              │
│   └─────────┘ └─────────┘              │
│                                         │
│   [Business Name] (if seller)           │
│   [Business Address] (if seller)        │
│                                         │
│   □ Remember Me                         │
│                                         │
│   [Login / Register Button - Full Width]│
│                                         │
│   Don't have account? Register          │
│   (or "Already have account? Login")    │
│                                         │
└─────────────────────────────────────────┘
```

**Components:**
- Logo: 48px height, centered
- Title: text-2xl, font-semibold
- Inputs: Full width, 44px height, 12px margin between
- Toggle: Two buttons, active state with black background
- Link: text-sm, underline on hover

---

#### **6.2.2 Buyer Home (Personalized Feed)**

**Layout**: Full-width header + product grid

```
┌─────────────────────────────────────────────────────────────────┐
│ [Logo]  [Search Bar]          [Cart Icon] [Profile Icon]       │ Header
└─────────────────────────────────────────────────────────────────┘
│                                                                 │
│  Home  |  Trending  |  Orders  |  Profile                      │ Nav Tabs
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│  For You                                                        │
│  ───────────────────────────────────────────────────────       │
│                                                                 │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐          │
│  │  Image  │  │  Image  │  │  Image  │  │  Image  │          │
│  │         │  │         │  │         │  │         │          │
│  │  Title  │  │  Title  │  │  Title  │  │  Title  │          │
│  │ ₹1,299  │  │ ₹2,499  │  │ ₹999    │  │ ₹3,599  │          │
│  │ ⭐ 4.5  │  │ ⭐ 4.8  │  │ ⭐ 4.2  │  │ ⭐ 4.9  │          │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘          │
│                                                                 │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐          │
│  │  Image  │  │  Image  │  │  Image  │  │  Image  │          │
│  │         │  │         │  │         │  │         │          │
│  │  ...    │  │  ...    │  │  ...    │  │  ...    │          │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘          │
│                                                                 │
│                    [Load More]                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Components:**
- Header: Fixed, height 64px, white background, shadow
- Search bar: 400px width, placeholder "Search products..."
- Icons: 24px, gray, hover black
- Product card: 
  - Width: 280px
  - Image: 280x280px, object-cover, rounded-lg
  - Title: text-base, max 2 lines, ellipsis
  - Price: text-lg, font-semibold
  - Rating: text-sm, star icon + number
  - Spacing: 16px between cards, 24px between rows
- Grid: 4 columns on desktop, 2 on tablet, 1 on mobile

---

#### **6.2.3 Search Results Page**

**Layout**: Sidebar filters + product grid

```
┌─────────────────────────────────────────────────────────────────┐
│ [Header - same as above]                                        │
└─────────────────────────────────────────────────────────────────┘
│                                                                 │
│ Search: "laptop"                    Sort: [Dropdown]  [Clear]   │
│                                                                 │
├──────────────┬──────────────────────────────────────────────────┤
│ Filters      │  124 Results                                     │
│              │                                                  │
│ Category     │  ┌─────────┐  ┌─────────┐  ┌─────────┐         │
│ □ Electronics│  │  Image  │  │  Image  │  │  Image  │         │
│ □ Fashion    │  │         │  │         │  │         │         │
│ □ Home       │  │  Title  │  │  Title  │  │  Title  │         │
│ □ Beauty     │  │ ₹1,299  │  │ ₹2,499  │  │ ₹999    │         │
│              │  │ ⭐ 4.5  │  │ ⭐ 4.8  │  │ ⭐ 4.2  │         │
│ Price Range  │  └─────────┘  └─────────┘  └─────────┘         │
│ ₹0 ━━●━━━━ ₹50k│                                                │
│              │  ┌─────────┐  ┌─────────┐  ┌─────────┐         │
│ Rating       │  │  ...    │  │  ...    │  │  ...    │         │
│ ○ All        │  └─────────┘  └─────────┘  └─────────┘         │
│ ○ 4+ stars   │                                                  │
│ ○ 3+ stars   │                [Load More]                       │
│              │                                                  │
└──────────────┴──────────────────────────────────────────────────┘
```

**Components:**
- Sidebar: Width 240px, fixed position, white background
- Category checkboxes: text-sm, 8px padding
- Price slider: Custom range input, black handle
- Results grid: Same as home page, 3 columns (sidebar reduces space)
- Sort dropdown: Options: Relevance, Price Low-High, Price High-Low, Newest

---

#### **6.2.4 Product Detail Page**

```
┌─────────────────────────────────────────────────────────────────┐
│ [Header]                                                         │
└─────────────────────────────────────────────────────────────────┘
│                                                                 │
│  ┌───────────────────────┐  Product Title                      │
│  │                       │  ₹1,299.00                           │
│  │   Main Product        │  ⭐ 4.5 (23 reviews)                │
│  │   Image               │                                      │
│  │   (500x500px)         │  By: Shop Name                       │
│  │                       │  Category: Electronics               │
│  └───────────────────────┘                                      │
│                                                                 │
│  [Thumb] [Thumb] [Thumb] [Thumb]                                │
│                                                                 │
│                           Description                           │
│                           ────────────                          │
│                           Lorem ipsum dolor sit amet...         │
│                                                                 │
│                           Stock: 10 available                   │
│                                                                 │
│                           [Add to Cart Button - Full Width]     │
│                                                                 │
│  ───────────────────────────────────────────────────────────── │
│                                                                 │
│  Reviews (23)                                    [Write Review]  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  ⭐⭐⭐⭐⭐ 5.0                                                  │
│  John • 2 days ago                                              │
│  Great product! Highly recommended.                             │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  ⭐⭐⭐⭐☆ 4.0                                                  │
│  Sarah • 1 week ago                                             │
│  Good quality but delivery was slow.                            │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│                      [View All Reviews]                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Components:**
- Image gallery: Main image 500x500px, thumbnails 80x80px, clickable
- Product info: Right column, text-2xl title, text-3xl price
- Rating: Star icons + review count link
- Seller name: Clickable link (future: seller profile)
- Stock badge: Green if > 5, orange if 1-5, red if 0
- Add to Cart: Full width, 48px height, primary button
- Reviews: Card layout, user first name, rating stars, text, date

---

#### **6.2.5 Shopping Cart Page**

```
┌─────────────────────────────────────────────────────────────────┐
│ [Header]                                                         │
└─────────────────────────────────────────────────────────────────┘
│                                                                 │
│  Shopping Cart (2 items)                                        │
│  ───────────────────────────────────────────────────────────   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ [Img] Product Name                             ₹1,299   │  │
│  │       By: Shop Name                                      │  │
│  │       Qty: [-] [2] [+]                        [Remove]   │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ [Img] Another Product                          ₹2,499   │  │
│  │       By: Another Shop                                   │  │
│  │       Qty: [-] [1] [+]                        [Remove]   │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ───────────────────────────────────────────────────────────   │
│                                                                 │
│                                     Subtotal:    ₹3,798.00     │
│                                     Shipping:       ₹50.00     │
│                                     ──────────────────────     │
│                                     Total:       ₹3,848.00     │
│                                                                 │
│            [Continue Shopping]  [Proceed to Checkout]          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Components:**
- Cart item: Card with 80x80px thumbnail, title, seller, quantity selector
- Quantity selector: - button, number input, + button (inline)
- Remove button: Text link, red color
- Price summary: Right-aligned, text-lg
- Buttons: Secondary (continue) and primary (checkout)

---

#### **6.2.6 Checkout Page**

```
┌─────────────────────────────────────────────────────────────────┐
│ [Header]                                                         │
└─────────────────────────────────────────────────────────────────┘
│                                                                 │
│  Checkout                                                       │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Step 1 of 3: Shipping Address                                 │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Full Name:      [___________________________]           │  │
│  │ Address Line 1: [___________________________]           │  │
│  │ Address Line 2: [___________________________]           │  │
│  │ City:           [___________] State: [_______]          │  │
│  │ Pincode:        [_______] Mobile: [__________]          │  │
│  │                                                          │  │
│  │ □ Save this address for future orders                   │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│                                         [Continue to Summary]   │
│                                                                 │
│  ───────────────────────────────────────────────────────────   │
│                                                                 │
│  Order Summary                                                  │
│  2 items                                       Subtotal: ₹3,798 │
│                                                Shipping: ₹50    │
│                                                ───────────────   │
│                                                Total: ₹3,848    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

/* Step 2: Order Summary (review items) */
/* Step 3: Payment (mock card/UPI/wallet form) */
```

**Components:**
- Progress indicator: 1/3, 2/3, 3/3 at top
- Form: Two-column layout for city/state, pincode/mobile
- Order summary: Sticky sidebar (desktop) or bottom section (mobile)
- Payment form (Step 3):
  - Payment method tabs: Card | UPI | Wallet
  - Card: Number, Expiry, CVV, Name fields
  - UPI: Single input for UPI ID
  - Wallet: Show mock balance, no input needed
  - Pay button: Large, primary, shows loading on click

---

#### **6.2.7 Seller Dashboard**

```
┌─────────────────────────────────────────────────────────────────┐
│ [Logo]                                      [Profile Dropdown]   │
└─────────────────────────────────────────────────────────────────┘
┌──────────────┬──────────────────────────────────────────────────┤
│ Dashboard    │  Dashboard                                        │
│ Products     │                                                   │
│ Orders       │  ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│ Profile      │  │  Total   │ │  Total   │ │  Total   │         │
│              │  │ Products │ │  Orders  │ │ Revenue  │         │
│              │  │    45    │ │   128    │ │ ₹156,780 │         │
│              │  └──────────┘ └──────────┘ └──────────┘         │
│              │                                                   │
│              │  ┌──────────┐                                    │
│              │  │ Pending  │  [View All]                        │
│              │  │  Orders  │                                    │
│              │  │    8     │                                    │
│              │  └──────────┘                                    │
│              │                                                   │
│              │  Recent Orders                                    │
│              │  ──────────────────────────────────────────────  │
│              │                                                   │
│              │  ┌───────────────────────────────────────────┐  │
│              │  │ #ORDER-123    John Doe    ₹2,649  Pending│  │
│              │  │ [View Details] [Mark as Shipped]         │  │
│              │  └───────────────────────────────────────────┘  │
│              │                                                   │
│              │  ┌───────────────────────────────────────────┐  │
│              │  │ #ORDER-124    Sarah K     ₹1,299  Pending│  │
│              │  │ [View Details] [Mark as Shipped]         │  │
│              │  └───────────────────────────────────────────┘  │
│              │                                                   │
└──────────────┴──────────────────────────────────────────────────┘
```

**Components:**
- Sidebar: Fixed, 240px width, white background, black text
- Active link: Black background, white text
- Metric cards: 200x120px, centered text, large number (text-3xl)
- Orders table: Card layout, order ID, buyer, total, status, actions
- Action buttons: Small, secondary style

---

#### **6.2.8 Seller Products Page**

```
┌─────────────────────────────────────────────────────────────────┐
│ [Seller Header]                                                  │
└─────────────────────────────────────────────────────────────────┘
┌──────────────┬──────────────────────────────────────────────────┤
│ [Sidebar]    │  Products                [+ Add Product ▼]       │
│              │                          [Single] [Bulk CSV]      │
│              │  ──────────────────────────────────────────────  │
│              │                                                   │
│              │  Filter: [All ▼] [Electronics ▼]  Sort: [Newest ▼]│
│              │                                                   │
│              │  ┌───────────────────────────────────────────┐  │
│              │  │[Img] Product Title            ₹1,299      │  │
│              │  │     Stock: 10  Status: Active             │  │
│              │  │                    [Edit] [Delete]        │  │
│              │  └───────────────────────────────────────────┘  │
│              │                                                   │
│              │  ┌───────────────────────────────────────────┐  │
│              │  │[Img] Another Product          ₹2,499      │  │
│              │  │     Stock: 2   Status: Active             │  │
│              │  │     ⚠️ Low Stock                          │  │
│              │  │                    [Edit] [Delete]        │  │
│              │  └───────────────────────────────────────────┘  │
│              │                                                   │
│              │  ┌───────────────────────────────────────────┐  │
│              │  │[Img] Out of Stock Product     ₹999        │  │
│              │  │     Stock: 0   Status: Inactive           │  │
│              │  │                    [Edit] [Delete]        │  │
│              │  └───────────────────────────────────────────┘  │
│              │                                                   │
└──────────────┴──────────────────────────────────────────────────┘
```

**Components:**
- Add Product dropdown: Single upload vs Bulk CSV options
- Product card: Horizontal layout, 80x80px image, title, price, stock, status badge
- Status badge: Green (Active), Gray (Inactive)
- Low stock warning: Orange badge, appears when stock < 5
- Actions: Text links, edit (black), delete (red with confirmation)

---

#### **6.2.9 Add/Edit Product Form**

```
┌─────────────────────────────────────────────────────────────────┐
│ [Seller Header]                                                  │
└─────────────────────────────────────────────────────────────────┘
┌──────────────┬──────────────────────────────────────────────────┤
│ [Sidebar]    │  Add New Product                      [Cancel]    │
│              │  ──────────────────────────────────────────────  │
│              │                                                   │
│              │  Product Details                                  │
│              │                                                   │
│              │  Title *                                          │
│              │  [_________________________________]              │
│              │                                                   │
│              │  Description                                      │
│              │  [_________________________________]              │
│              │  [_________________________________]              │
│              │  [_________________________________]              │
│              │                                                   │
│              │  Price (₹) *        Category *                   │
│              │  [_______]          [Electronics ▼]              │
│              │                                                   │
│              │  Stock Quantity *                                 │
│              │  [_______]                                        │
│              │                                                   │
│              │  Product Images (up to 4) *                       │
│              │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐               │
│              │  │ [+] │ │     │ │     │ │     │               │
│              │  └─────┘ └─────┘ └─────┘ └─────┘               │
│              │  Drag & drop or click to upload                   │
│              │                                                   │
│              │                      [Save Product]               │
│              │                                                   │
└──────────────┴──────────────────────────────────────────────────┘
```

**Components:**
- Form: Max-width 600px, centered in content area
- Image upload: 120x120px dropzone for each slot
- First image shows [+] icon, uploaded images show preview with remove icon
- Save button: Primary, disabled until required fields filled
- Validation: Real-time, show error below each field

---

#### **6.2.10 Bulk CSV Upload Page**

```
┌─────────────────────────────────────────────────────────────────┐
│ [Seller Header]                                                  │
└─────────────────────────────────────────────────────────────────┘
┌──────────────┬──────────────────────────────────────────────────┤
│ [Sidebar]    │  Bulk Product Upload                              │
│              │  ──────────────────────────────────────────────  │
│              │                                                   │
│              │  Step 1: Download Template                        │
│              │  [Download CSV Template]                          │
│              │                                                   │
│              │  Step 2: Upload CSV File                          │
│              │  ┌─────────────────────────────────────────┐    │
│              │  │                                          │    │
│              │  │    Drag & drop CSV file here             │    │
│              │  │    or click to browse                    │    │
│              │  │                                          │    │
│              │  └─────────────────────────────────────────┘    │
│              │                                                   │
│              │  ✓ products_bulk.csv (50 rows)                   │
│              │                                                   │
│              │                      [Upload & Validate]          │
│              │                                                   │
│              │  ──────────────────────────────────────────────  │
│              │                                                   │
│              │  Upload History                                   │
│              │  • Jan 13, 2025 - 48/50 success                  │
│              │  • Jan 10, 2025 - 30/30 success                  │
│              │                                                   │
└──────────────┴──────────────────────────────────────────────────┘

/* After validation: Show errors table with row numbers */
```

**Components:**
- Template download: Large button with CSV icon
- Upload area: 400x200px dashed border dropzone
- File preview: Shows filename, row count after selection
- Validation results: Table showing row-level errors
- Error states: Red text, row number, error message
- Success message: Green banner "48 products imported successfully, 2 failed"

---

## **7. ENGINEERING TASKS BY PHASE**

### **Phase 1: Foundation & Authentication (Week 1-2)**

#### **Backend Tasks**
1. **Project Setup** (4 hours)
   - Initialize FastAPI project structure
   - Configure SQLAlchemy with SQLite
   - Set up Alembic for migrations
   - Create Docker Compose file (backend, nginx)
   - Configure CORS, rate limiting middleware

2. **Database Models** (6 hours)
   - Create User model (buyer/seller)
   - Create database migration scripts
   - Test database connection and migrations

3. **Authentication System** (8 hours)
   - Implement JWT token generation/verification
   - Create password hashing utility (bcrypt)
   - Build /auth/register endpoint with validation
   - Build /auth/login endpoint
   - Build /auth/me endpoint
   - Create auth middleware decorator

4. **User Profile APIs** (4 hours)
   - Build GET /users/profile endpoint
   - Build PUT /users/profile endpoint
   - Build PUT /users/password endpoint

#### **Frontend Tasks**
5. **Project Setup** (4 hours)
   - Initialize Next.js 16 project with App Router
   - Configure Tailwind CSS
   - Set up Zustand stores
   - Create API client wrapper with JWT handling
   - Set up environment variables

6. **Design System** (6 hours)
   - Create reusable UI components (Button, Input, Card, Modal)
   - Implement color palette and typography
   - Build responsive layout components

7. **Authentication Pages** (8 hours)
   - Build login page with form validation
   - Build register page with buyer/seller toggle
   - Implement auth state management (Zustand)
   - Create route protection middleware
   - Handle token storage/refresh

#### **Testing & Integration** (4 hours)
8. End-to-end test: User registration → login → profile view

---

### **Phase 2: Product Management (Week 3-4)**

#### **Backend Tasks**
9. **Product Models & APIs** (10 hours)
   - Create Product model with migrations
   - Build POST /products (single upload)
   - Build GET /products (with filters, pagination)
   - Build GET /products/{id}
   - Build PUT /products/{id}
   - Build DELETE /products/{id}
   - Implement search and filter logic
   - Create trending algorithm

10. **File Upload System** (6 hours)
    - Build POST /uploads/image endpoint
    - Implement file validation (type, size)
    - Set up local file storage
    - Create image URL generation logic

11. **Bulk CSV Upload** (8 hours)
    - Build POST /products/bulk-upload endpoint
    - Implement CSV parsing with pandas
    - Create validation logic (row-level errors)
    - Build error reporting structure

12. **Seller Stats API** (3 hours)
    - Build GET /seller/stats endpoint
    - Calculate metrics (products, orders, revenue)

#### **Frontend Tasks**
13. **Product Discovery (Buyer)** (12 hours)
    - Build home page with personalized feed
    - Build trending page
    - Build search results page with filters
    - Implement filter state management
    - Build product card component
    - Implement infinite scroll

14. **Product Detail Page** (6 hours)
    - Build product detail layout
    - Create image carousel component
    - Implement "Add to Cart" functionality

15. **Seller Product Management** (12 hours)
    - Build seller dashboard layout with sidebar
    - Build products list page
    - Build add product form with image upload
    - Build edit product form
    - Implement delete confirmation modal
    - Build bulk CSV upload page with drag-drop
    - Display validation errors table

#### **Testing & Integration** (6 hours)
16. E2E test: Seller uploads product → Buyer searches → Views product detail

---

### **Phase 3: Cart & Orders (Week 5-6)**

#### **Backend Tasks**
17. **Cart System** (8 hours)
    - Create Cart and CartItem models
    - Build GET /cart endpoint
    - Build POST /cart/items endpoint
    - Build PUT /cart/items/{id} endpoint
    - Build DELETE /cart/items/{id} endpoint
    - Implement stock validation

18. **Order System** (10 hours)
    - Create Order and OrderItem models
    - Build POST /orders endpoint (checkout)
    - Implement mock payment service
    - Generate transaction IDs
    - Build GET /orders (buyer + seller views)
    - Build GET /orders/{id}
    - Build PUT /orders/{id}/ship
    - Generate tracking numbers

19. **Email Notifications** (6 hours)
    - Set up SMTP configuration
    - Create email templates (HTML)
    - Build email service wrapper
    - Implement order confirmation email
    - Implement shipping notification email

#### **Frontend Tasks**
20. **Shopping Cart** (8 hours)
    - Build cart page with item list
    - Create cart item component
    - Implement quantity selector
    - Build cart state management (Zustand)
    - Add "Add to Cart" across all product views
    - Show cart count in header

21. **Checkout Flow** (12 hours)
    - Build checkout page with stepper
    - Create shipping address form
    - Build order summary component
    - Create payment method selection
    - Build mock payment forms (card/UPI/wallet)
    - Implement 2-second loading animation
    - Build order confirmation page

22. **Order Management** (10 hours)
    - Build buyer order history page
    - Build order detail page for buyers
    - Build seller orders page
    - Implement "Mark as Shipped" functionality
    - Create order status badges

#### **Testing & Integration** (6 hours)
23. E2E test: Add to cart → Checkout → Payment → Order confirmation → Seller ships

---

### **Phase 4: Reviews & Polish (Week 7-8)**

#### **Backend Tasks**
24. **Review System** (6 hours)
    - Create Review model
    - Build POST /reviews endpoint
    - Build GET /reviews/product/{id}
    - Calculate average rating
    - Validate "delivered order" requirement

#### **Frontend Tasks**
25. **Reviews Feature** (8 hours)
    - Build review submission form
    - Create review card component
    - Display reviews on product detail page
    - Show "Write Review" button on delivered orders
    - Implement rating distribution visualization

26. **UI/UX Polish** (12 hours)
    - Add loading states to all buttons/pages
    - Implement error handling and toast notifications
    - Add empty states (empty cart, no orders, no products)
    - Optimize images (lazy loading, compression)
    - Ensure mobile responsiveness across all pages
    - Add hover effects and transitions
    - Implement form validation feedback

27. **Performance Optimization** (6 hours)
    - Implement React Server Components where applicable
    - Add caching for product listings
    - Optimize database queries (indexes)
    - Compress API responses
    - Add rate limiting on frontend

#### **Testing & Deployment** (8 hours)
28. **Final Testing**
    - Full regression test of all features
    - Cross-browser testing (Chrome, Safari, Firefox)
    - Mobile testing (iOS, Android)
    - Load testing (simulate 50 concurrent users)

29. **Deployment**
    - Build Docker images
    - Deploy to local Docker environment
    - Set up environment variables
    - Create deployment documentation

---

## **8. TESTING STRATEGY**

### **8.1 Backend Testing**

#### **Unit Tests**
- Test auth utilities (JWT generation, password hashing)
- Test search/filter logic
- Test payment mock service
- Test email service

#### **Integration Tests**
- Test each API endpoint with valid/invalid inputs
- Test authentication flow
- Test order placement flow
- Test file upload

#### **Test Coverage Target**: 70%+

### **8.2 Frontend Testing**

#### **Component Tests**
- Test form validation (login, register, product upload)
- Test cart operations (add, update quantity, remove)
- Test checkout flow

#### **E2E Tests (Playwright)**
1. Buyer registration → Browse → Add to cart → Checkout → Order placed
2. Seller registration → Upload product → Receive order → Mark shipped
3. Buyer leaves review → Review appears on product page

### **8.3 Manual Testing Checklist**

**Authentication**
- [ ] Register as buyer
- [ ] Register as seller
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Token expiration handling
- [ ] Profile update

**Product Management**
- [ ] Upload single product
- [ ] Upload bulk CSV (valid)
- [ ] Upload bulk CSV (with errors)
- [ ] Edit product
- [ ] Delete product
- [ ] Product appears in buyer feed

**Shopping Flow**
- [ ] Search products
- [ ] Filter by category, price, rating
- [ ] View product details
- [ ] Add to cart
- [ ] Update cart quantity
- [ ] Remove from cart
- [ ] Checkout with all payment methods
- [ ] Order confirmation

**Seller Flow**
- [ ] View dashboard stats
- [ ] View pending orders
- [ ] Mark order as shipped
- [ ] Receive email notification

**Reviews**
- [ ] Write review on delivered order
- [ ] Review appears on product page
- [ ] Cannot review twice

**Edge Cases**
- [ ] Out of stock handling
- [ ] Empty cart checkout
- [ ] Invalid CSV format
- [ ] Large image upload (>5MB)
- [ ] Network failure handling

---

## **9. SECURITY CONSIDERATIONS**

### **9.1 Authentication & Authorization**
- JWT tokens with 7-day expiry
- Secure password hashing with bcrypt (10 rounds)
- Role-based access control (buyer vs seller endpoints)
- Token validation on every protected route

### **9.2 Input Validation**
- Pydantic schemas for all API requests
- SQL injection prevention via SQLAlchemy ORM
- File upload validation (type, size)
- Email format validation
- Password strength requirements

### **9.3 API Security**
- CORS configured for frontend domain only
- Rate limiting: 10 requests/second per IP
- Request size limits (10MB max)
- No sensitive data in URL parameters

### **9.4 Data Protection**
- Passwords never stored in plain text
- No credit card data stored (mock payment only)
- User email not exposed in public APIs
- Profile pictures sanitized filenames

### **9.5 Environment Security**
- All secrets in .env files (not committed)
- Database file not web-accessible
- Upload directory permissions restricted

---

## **10. DEPLOYMENT GUIDE**

### **10.1 Prerequisites**
- Docker & Docker Compose installed
- 4GB RAM minimum
- 10GB disk space

### **10.2 Environment Variables**

**Backend (.env)**
```
DATABASE_URL=sqlite:///./data/marketplace.db
JWT_SECRET_KEY=your-secret-key-here-change-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_DAYS=7

UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880  # 5MB

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@marketplace.com

CORS_ORIGINS=http://localhost:3000
```

**Frontend (.env.local)**
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### **10.3 Docker Compose**

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    volumes:
      - ./backend/uploads:/app/uploads
      - ./backend/data:/app/data
    env_file:
      - ./backend/.env
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    env_file:
      - ./frontend/.env.local
    depends_on:
      - backend
    command: npm run dev

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./backend/uploads:/usr/share/nginx/html/uploads
    depends_on:
      - frontend
      - backend
```

### **10.4 Deployment Steps**

1. **Clone Repository**
```bash
git clone <repo-url>
cd marketplace-mvp
```

2. **Configure Environment**
```bash
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
# Edit files with your values
```

3. **Build & Start Services**
```bash
docker-compose up --build -d
```

4. **Run Database Migrations**
```bash
docker-compose exec backend alembic upgrade head
```

5. **Create Initial Data (Optional)**
```bash
docker-compose exec backend python scripts/seed_data.py
```

6. **Verify Deployment**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/docs
- Nginx: http://localhost

### **10.5 Monitoring**

```bash
# View logs
docker-compose logs -f

# Check service status
docker-compose ps

# Restart service
docker-compose restart backend
```

---

## **11. SUCCESS CRITERIA**

### **11.1 Functional Completeness**
- ✅ Buyer can register, browse, search, add to cart, checkout
- ✅ Seller can register, upload products (single + bulk), manage orders
- ✅ Payment simulation works end-to-end
- ✅ Email notifications sent for key events
- ✅ Product reviews functional
- ✅ Order status tracking (pending → shipped)

### **11.2 User Experience**
- ✅ Page load time < 2 seconds
- ✅ Checkout completion in < 2 minutes
- ✅ Zero-confusion UI (user testing with 5 people)
- ✅ Mobile responsive (all core flows work on mobile)

### **11.3 Technical Quality**
- ✅ No critical bugs in production
- ✅ API response time < 500ms (95th percentile)
- ✅ All automated tests passing
- ✅ Security checklist completed
- ✅ Code documented (comments + README)

### **11.4 Business Metrics**
- ✅ 50+ registered buyers
- ✅ 10+ active sellers
- ✅ 100+ products listed
- ✅ 20+ completed transactions
- ✅ System handles 50 concurrent users

---

## **12. FUTURE ENHANCEMENTS (Post-MVP)**

### **Phase 2 Features**
- Wishlist functionality
- Product recommendations (ML-based)
- Advanced seller analytics
- Bulk order management
- Coupons and discounts
- Multi-currency support

### **Phase 3 Features**
- Real payment gateway (Razorpay/Stripe)
- Real shipping integration (Delhivery/Shiprocket)
- Buyer-seller messaging
- Dispute resolution system
- Admin panel for marketplace moderation
- Seller verification badges

### **Platform Enhancements**
- Native mobile apps (React Native)
- PWA for offline support
- Advanced search (Elasticsearch)
- Real-time notifications (WebSockets)
- Multi-language support
- Social login (Google, Facebook)

---

## **APPENDIX**

### **A. Tech Stack Justification**

| Choice | Justification |
|--------|---------------|
| Next.js 16 | Best-in-class React framework, App Router for performance, Server Components reduce JS bundle |
| FastAPI | Fastest Python framework, automatic OpenAPI docs, async support, Pydantic validation |
| SQLite | Zero-config, file-based, perfect for MVP scale, easy migration to PostgreSQL later |
| Tailwind CSS | Rapid development, consistent design, minimal CSS, highly customizable |
| Zustand | Lightweight state management, simpler than Redux, perfect for cart/auth state |
| Docker | Consistent environments, easy deployment, scales to production |

### **B. API Response Standards**

**Success Response**
```json
{
  "data": {...},
  "message": "Success message (optional)"
}
```

**Error Response**
```json
{
  "detail": "Error message",
  "error_code": "VALIDATION_ERROR",
  "field_errors": {  // Optional, for validation errors
    "email": ["Email already exists"],
    "password": ["Password must be at least 8 characters"]
  }
}
```

**Pagination Response**
```json
{
  "data": [...],
  "total": 150,
  "page": 1,
  "limit": 20,
  "total_pages": 8
}
```

### **C. CSV Template Format**

**products_bulk_upload.csv**
```csv
title,description,price,category,stock_quantity,image_url_1,image_url_2,image_url_3,image_url_4
"Wireless Earbuds","High-quality sound...",1299,Electronics,50,https://example.com/img1.jpg,,,
"Cotton T-Shirt","Comfortable fabric...",499,Fashion,100,https://example.com/img2.jpg,https://example.com/img3.
jpg,,
"Home Decor Item","Modern design...",799,Home,25,https://example.com/img4.jpg,,,
```

**Validation Rules:**
- All fields required except image_url_2, image_url_3, image_url_4
- title: max 100 chars
- description: max 1000 chars
- price: positive number
- category: must be one of predefined categories
- stock_quantity: positive integer
- image URLs: must be valid URLs or uploaded file paths

---

#
---

**END OF DOCUMENT**