from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from app.config import settings
from app.database import engine, Base
from app.routers import auth, users, products, uploads, seller, cart, orders, reviews, wishlist

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Hive API",
    description="Minimal e-commerce marketplace API",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(products.router, prefix="/api/products", tags=["products"])
app.include_router(uploads.router, prefix="/api/uploads", tags=["uploads"])
app.include_router(seller.router, prefix="/api/seller", tags=["seller"])
app.include_router(cart.router, prefix="/api/cart", tags=["cart"])
app.include_router(wishlist.router, prefix="/api/wishlist", tags=["wishlist"])
app.include_router(orders.router, prefix="/api/orders", tags=["orders"])
app.include_router(reviews.router, prefix="/api/reviews", tags=["reviews"])


@app.get("/")
async def root():
    return {"message": "Hive API", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
