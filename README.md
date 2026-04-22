# 🐝 Hive - Minimal E-Commerce Marketplace

<div align="center">

**Shop smart. Support small.**

A sleek, minimalistic e-commerce marketplace targeting GenZ buyers in India, enabling solopreneurs, small businesses, and brands to sell products with an Instagram-clean, Apple-minimalist user experience.

![Next.js](https://img.shields.io/badge/Next.js-16.1-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)
![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)

</div>

---

## ✨ Features

### For Buyers
- 🛍️ **Personalized Feed** - Discover products tailored to your interests
- 🔥 **Trending Products** - See what's popular in the community
- 🔍 **Smart Search & Filters** - Find products by category, price, rating
- 🛒 **Persistent Cart** - Cart saved across sessions
- 💳 **Seamless Checkout** - Multi-step checkout with simulated payments
- 📦 **Order Tracking** - Track order status from pending to delivered
- ⭐ **Product Reviews** - Rate and review purchased products

### For Sellers
- 🏪 **Instant Store Setup** - Start selling in minutes
- 📤 **Bulk Product Upload** - Upload products via CSV
- 📊 **Dashboard Analytics** - Track sales, orders, and revenue
- 📋 **Order Management** - View and fulfill orders
- 🏷️ **Inventory Control** - Manage stock levels with low-stock alerts

---

## 🏗️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.x | React framework with App Router |
| React | 19.x | Component-based UI |
| Tailwind CSS | 4.x | Utility-first CSS |
| Zustand | 5.x | Lightweight state management |
| React Hook Form | 7.x | Form handling & validation |
| Lucide React | Latest | Icon library |
| TypeScript | 5.x | Type safety |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| FastAPI | 0.115+ | Modern async Python API |
| SQLAlchemy | 2.x | Database ORM |
| SQLite | 3.x | Embedded SQL database |
| Pydantic | 2.x | Data validation |
| python-jose | 3.x | JWT token handling |
| passlib + bcrypt | Latest | Secure password hashing |
| Alembic | 1.13+ | Database migrations |
| pandas | 2.x | CSV processing |

### Infrastructure
| Component | Technology |
|-----------|------------|
| Containerization | Docker + Docker Compose |
| Reverse Proxy | Nginx |
| Database | SQLite (file-based) |
| File Storage | Local filesystem |

---

## 📁 Project Structure

```
hive/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── main.py         # FastAPI entry point
│   │   ├── config.py       # Configuration settings
│   │   ├── database.py     # Database connection
│   │   ├── models/         # SQLAlchemy models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── routers/        # API routes
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Auth middleware
│   │   └── utils/          # Utility functions
│   ├── alembic/            # Database migrations
│   ├── requirements.txt    # Python dependencies
│   └── Dockerfile
│
├── frontend/               # Next.js frontend
│   ├── app/
│   │   ├── (auth)/        # Auth pages (login, register)
│   │   ├── (buyer)/       # Buyer pages (home, cart, orders)
│   │   ├── (seller)/      # Seller pages (dashboard, products)
│   │   ├── layout.tsx     # Root layout
│   │   └── providers.tsx  # Context providers
│   ├── components/        # Reusable components
│   │   ├── ui/           # UI primitives (Button, Input, etc.)
│   │   └── ...           # Feature components
│   ├── lib/              # Utilities & API client
│   ├── store/            # Zustand stores
│   ├── package.json
│   └── Dockerfile
│
├── docker-compose.yml     # Docker orchestration
├── nginx.conf            # Nginx configuration
├── alembic.ini           # Alembic configuration
├── PRD.md                # Product Requirements Document
└── brand-guidelines.md   # Brand & design guidelines
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ (for frontend)
- **Python** 3.11+ (for backend)
- **Docker & Docker Compose** (for containerized deployment)

### Option 1: Docker Deployment (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hive
   ```

2. **Create environment files**
   ```bash
   # Backend environment
   cp backend/.env.example backend/.env
   
   # Frontend environment
   cp frontend/.env.local.example frontend/.env.local
   ```

3. **Configure environment variables** (see [Environment Variables](#-environment-variables))

4. **Build and start services**
   ```bash
   docker-compose up --build -d
   ```

5. **Run database migrations**
   ```bash
   docker-compose exec backend alembic upgrade head
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs
   - Nginx Proxy: http://localhost

### Option 2: Local Development

#### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Create `.env` file** with required variables

5. **Run database migrations**
   ```bash
   alembic upgrade head
   ```

6. **Start the server**
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

#### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env.local` file**
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

```env
# Database
DATABASE_URL=sqlite:///./data/marketplace.db

# JWT Configuration
JWT_SECRET_KEY=your-secret-key-change-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_DAYS=7

# File Uploads
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880  # 5MB

# Email (SMTP) - Required for production email notifications
# Leave SMTP_USER and SMTP_PASSWORD empty for development (emails logged to console)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@hive.com

# CORS
CORS_ORIGINS=http://localhost:3000
```

### Email Configuration Guide

Hive sends transactional emails for the following events:

| Event | Recipient | Description |
|-------|-----------|-------------|
| Registration | Buyer/Seller | Welcome email with account setup tips |
| Order Placed | Buyer | Order confirmation with order summary |
| Order Placed | Seller | New order notification requiring action |
| Order Shipped | Buyer | Shipping confirmation with tracking number |
| Out of Stock | Seller | Alert when product stock reaches zero |

**Development Mode**: If `SMTP_USER` and `SMTP_PASSWORD` are empty, emails are logged to the console instead of being sent. This is useful for local development.

**Production Mode**: Configure your SMTP provider:

- **Gmail**: Use an App Password (not your regular password). Enable 2FA and create an app password at https://myaccount.google.com/apppasswords
- **SendGrid/Mailgun**: Use their SMTP credentials
- **Custom SMTP**: Configure your mail server credentials

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 📡 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user (buyer/seller) |
| POST | `/api/auth/login` | Login and get JWT token |
| GET | `/api/auth/me` | Get current user info |

### Product Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List products with filters |
| GET | `/api/products/trending` | Get trending products |
| GET | `/api/products/feed` | Personalized product feed |
| GET | `/api/products/{id}` | Get product details |
| POST | `/api/products` | Create product (seller) |
| PUT | `/api/products/{id}` | Update product (seller) |
| DELETE | `/api/products/{id}` | Delete product (seller) |
| POST | `/api/products/bulk-upload` | Bulk upload via CSV |

### Cart Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cart` | Get user's cart |
| POST | `/api/cart/items` | Add item to cart |
| PUT | `/api/cart/items/{id}` | Update cart item quantity |
| DELETE | `/api/cart/items/{id}` | Remove item from cart |
| DELETE | `/api/cart` | Clear entire cart |

### Order Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Create order (checkout) |
| GET | `/api/orders` | List orders |
| GET | `/api/orders/{id}` | Get order details |
| PUT | `/api/orders/{id}/ship` | Mark order as shipped (seller) |

### Review Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/reviews` | Create review |
| GET | `/api/reviews/product/{id}` | Get product reviews |

### Seller Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/seller/stats` | Get seller dashboard stats |

For detailed API documentation with request/response examples, visit `/docs` when the backend is running.

---

## 🗄️ Database Schema

### Core Tables

- **users** - Buyer and seller accounts
- **products** - Product listings
- **orders** - Order records
- **order_items** - Items within orders
- **carts** - Shopping carts
- **cart_items** - Items in carts
- **reviews** - Product reviews

### Entity Relationships

```
Users ──┬── Products (seller_id)
        ├── Orders (buyer_id)
        ├── Carts (user_id)
        └── Reviews (user_id)

Products ──┬── CartItems (product_id)
           ├── OrderItems (product_id)
           └── Reviews (product_id)

Orders ── OrderItems (order_id)
Carts ── CartItems (cart_id)
```

---

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild containers
docker-compose up --build -d

# Run backend migrations
docker-compose exec backend alembic upgrade head

# Access backend shell
docker-compose exec backend bash

# Access frontend shell
docker-compose exec frontend sh
```

