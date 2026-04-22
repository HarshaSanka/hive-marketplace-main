# Hive API Documentation

This document provides detailed API documentation for the Hive e-commerce marketplace.

**Base URL:** `http://localhost:8000/api`

**Authentication:** Most endpoints require a JWT Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Table of Contents

1. [Authentication](#authentication)
2. [Users](#users)
3. [Products](#products)
4. [Cart](#cart)
5. [Orders](#orders)
6. [Reviews](#reviews)
7. [File Uploads](#file-uploads)
8. [Seller Dashboard](#seller-dashboard)

---

## Authentication

### Register User

Create a new buyer or seller account.

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123",
  "full_name": "John Doe",
  "mobile": "9876543210",
  "account_type": "buyer",
  "business_name": "John's Shop",
  "business_address": "123 Street, City"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | Valid email address |
| password | string | Yes | Min 8 chars, 1 uppercase, 1 number |
| full_name | string | Yes | User's full name |
| mobile | string | Yes | Mobile number |
| account_type | string | Yes | `buyer` or `seller` |
| business_name | string | Seller only | Business name |
| business_address | string | Seller only | Business address |

**Response (201):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "full_name": "John Doe",
  "account_type": "buyer",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Errors:**
- `400` - Email already exists
- `400` - Validation error

---

### Login

Authenticate and receive a JWT token.

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "full_name": "John Doe",
  "account_type": "buyer",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Errors:**
- `401` - Invalid credentials

---

### Get Current User

Get the authenticated user's profile.

**Endpoint:** `GET /auth/me`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
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

## Users

### Get Profile

**Endpoint:** `GET /users/profile`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
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

---

### Update Profile

**Endpoint:** `PUT /users/profile`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "full_name": "John Smith",
  "mobile": "9876543210",
  "business_name": "John's Shop",
  "business_address": "456 New St"
}
```

**Response (200):** Updated user object

---

### Change Password

**Endpoint:** `PUT /users/password`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "current_password": "OldPass123",
  "new_password": "NewPass456"
}
```

**Response (200):**
```json
{
  "message": "Password updated successfully"
}
```

**Errors:**
- `401` - Current password incorrect

---

## Products

### List Products

Get paginated list of products with optional filters.

**Endpoint:** `GET /products`

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | int | 1 | Page number |
| limit | int | 20 | Items per page |
| category | string | - | Filter by category |
| min_price | float | - | Minimum price |
| max_price | float | - | Maximum price |
| rating | int | - | Minimum rating (3 or 4) |
| sort | string | relevance | `relevance`, `price_asc`, `price_desc`, `newest` |
| search | string | - | Search term |

**Response (200):**
```json
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

---

### Get Trending Products

**Endpoint:** `GET /products/trending`

Same response format as List Products.

---

### Get Personalized Feed

**Endpoint:** `GET /products/feed`

**Headers:** `Authorization: Bearer <token>`

Same response format as List Products.

---

### Get Product Details

**Endpoint:** `GET /products/{id}`

**Response (200):**
```json
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
```

---

### Create Product (Seller Only)

**Endpoint:** `POST /products`

**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Form Data:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | Yes | Max 100 chars |
| description | string | No | Max 1000 chars |
| price | float | Yes | Price in INR |
| category | string | Yes | Product category |
| stock_quantity | int | Yes | Initial stock |
| images | File[] | Yes | Up to 4 images |

**Categories:** `Electronics`, `Fashion`, `Home`, `Beauty`, `Food`, `Handmade`, `Other`

**Response (201):** Created product object

---

### Update Product (Seller Only)

**Endpoint:** `PUT /products/{id}`

Same as Create, all fields optional.

**Response (200):** Updated product object

---

### Delete Product (Seller Only)

**Endpoint:** `DELETE /products/{id}`

**Response (204):** No content

---

### Bulk Upload Products (Seller Only)

**Endpoint:** `POST /products/bulk-upload`

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Form Data:**
- `csv_file`: CSV file (max 100 products)

**CSV Format:**
```csv
title,description,price,category,stock_quantity,image_url_1,image_url_2,image_url_3,image_url_4
"Product Name","Description",1299,Electronics,50,https://example.com/img1.jpg,,,
```

**Response (200):**
```json
{
  "total_rows": 50,
  "successful": 48,
  "failed": 2,
  "errors": [
    {
      "row": 12,
      "error": "Invalid price format"
    }
  ],
  "products_created": ["prod-1", "prod-2"]
}
```

---

## Cart

### Get Cart

**Endpoint:** `GET /cart`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
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

---

### Add Item to Cart

**Endpoint:** `POST /cart/items`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "product_id": "prod-123",
  "quantity": 2
}
```

**Response (201):**
```json
{
  "id": "item-1",
  "cart_id": "cart-123",
  "product_id": "prod-123",
  "quantity": 2
}
```

**Errors:**
- `400` - Product out of stock
- `404` - Product not found

---

### Update Cart Item

**Endpoint:** `PUT /cart/items/{id}`

**Request Body:**
```json
{
  "quantity": 3
}
```

**Response (200):** Updated cart item

---

### Remove Cart Item

**Endpoint:** `DELETE /cart/items/{id}`

**Response (204):** No content

---

### Clear Cart

**Endpoint:** `DELETE /cart`

**Response (204):** No content

---

## Orders

### Create Order (Checkout)

**Endpoint:** `POST /orders`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
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
  "payment_method": "card"
}
```

**Payment Methods:** `card`, `upi`, `wallet`

**Response (201):**
```json
{
  "id": "order-789",
  "total_amount": 2649.98,
  "status": "pending",
  "payment_transaction_id": "TXN-order-789-1706889600",
  "items": [...],
  "created_at": "2025-01-13T12:00:00Z"
}
```

---

### List Orders

**Endpoint:** `GET /orders`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | `pending`, `shipped`, `delivered` |
| page | int | Page number |
| limit | int | Items per page |

**Response (200):**
```json
{
  "orders": [
    {
      "id": "order-789",
      "buyer": {
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

---

### Get Order Details

**Endpoint:** `GET /orders/{id}`

**Response (200):**
```json
{
  "id": "order-789",
  "buyer": {...},
  "total_amount": 2649.98,
  "status": "shipped",
  "shipping_address": {...},
  "payment_method": "card",
  "payment_transaction_id": "TXN-order-789-1706889600",
  "tracking_number": "TRACK-order-789-1706889600",
  "items": [...],
  "created_at": "2025-01-13T12:00:00Z"
}
```

---

### Mark Order as Shipped (Seller Only)

**Endpoint:** `PUT /orders/{id}/ship`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "id": "order-789",
  "status": "shipped",
  "tracking_number": "TRACK-order-789-1706889600",
  "updated_at": "2025-01-13T14:30:00Z"
}
```

---

## Reviews

### Create Review

**Endpoint:** `POST /reviews`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "product_id": "prod-123",
  "order_id": "order-789",
  "rating": 5,
  "review_text": "Great product!"
}
```

**Response (201):**
```json
{
  "id": "review-456",
  "product_id": "prod-123",
  "user": {
    "name": "John"
  },
  "rating": 5,
  "review_text": "Great product!",
  "created_at": "2025-01-13T15:00:00Z"
}
```

**Rules:**
- Only for delivered orders
- One review per product per user

---

### Get Product Reviews

**Endpoint:** `GET /reviews/product/{product_id}`

**Response (200):**
```json
{
  "reviews": [
    {
      "id": "review-456",
      "user": {"name": "John"},
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

## File Uploads

### Upload Image

**Endpoint:** `POST /uploads/image`

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Form Data:**
| Field | Type | Description |
|-------|------|-------------|
| file | File | Max 5MB, JPG/PNG |
| type | string | `product` or `profile` |

**Response (200):**
```json
{
  "url": "/uploads/products/abc123.jpg"
}
```

---

## Seller Dashboard

### Get Seller Stats

**Endpoint:** `GET /seller/stats`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "total_products": 45,
  "active_products": 42,
  "total_orders": 128,
  "pending_orders": 8,
  "total_revenue": 156780.50,
  "low_stock_products": 3
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "detail": "Error message",
  "error_code": "VALIDATION_ERROR",
  "field_errors": {
    "email": ["Email already exists"],
    "password": ["Password must be at least 8 characters"]
  }
}
```

### Common HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 422 | Validation Error |
| 500 | Server Error |

---

## Rate Limiting

API endpoints are rate limited to **10 requests per second per IP**.

If you exceed this limit, you'll receive a `429 Too Many Requests` response.

---

## Pagination

Paginated endpoints return:

```json
{
  "data": [...],
  "total": 150,
  "page": 1,
  "limit": 20,
  "total_pages": 8
}
```
