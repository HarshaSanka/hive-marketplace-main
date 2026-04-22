import pandas as pd
import io
from typing import List, Dict, Tuple
from fastapi import UploadFile, HTTPException, status


CATEGORIES = ["Electronics", "Fashion", "Home", "Beauty", "Food", "Handmade", "Other"]


def validate_csv_row(row: Dict, row_num: int) -> Tuple[bool, str]:
    """Validate a single CSV row and return (is_valid, error_message)"""
    errors = []
    
    # Title validation
    if pd.isna(row.get("title")) or not str(row["title"]).strip():
        errors.append("Title is required")
    elif len(str(row["title"])) > 100:
        errors.append("Title must be max 100 characters")
    
    # Description validation
    if not pd.isna(row.get("description")) and len(str(row["description"])) > 1000:
        errors.append("Description must be max 1000 characters")
    
    # Price validation
    try:
        price = float(row.get("price", 0))
        if price <= 0:
            errors.append("Price must be positive")
    except (ValueError, TypeError):
        errors.append("Price must be a valid number")
    
    # Category validation
    category = str(row.get("category", "")).strip()
    if not category:
        errors.append("Category is required")
    elif category not in CATEGORIES:
        errors.append(f"Category must be one of: {', '.join(CATEGORIES)}")
    
    # Stock validation
    try:
        stock = int(row.get("stock_quantity", 0))
        if stock < 0:
            errors.append("Stock quantity must be non-negative")
    except (ValueError, TypeError):
        errors.append("Stock quantity must be a valid integer")
    
    # Image URLs validation (at least one required)
    image_urls = [
        str(row.get(f"image_url_{i}", "")).strip()
        for i in range(1, 5)
        if not pd.isna(row.get(f"image_url_{i}")) and str(row.get(f"image_url_{i}", "")).strip()
    ]
    if not image_urls:
        errors.append("At least one image URL is required")
    
    if errors:
        return False, "; ".join(errors)
    
    return True, ""


def parse_csv_file(file: UploadFile) -> Tuple[List[Dict], List[Dict]]:
    """Parse CSV file and return (valid_rows, errors)"""
    # Read file content
    contents = file.file.read()
    file.file.seek(0)
    
    try:
        # Parse CSV
        df = pd.read_csv(io.BytesIO(contents))
        
        # Validate required columns
        required_columns = ["title", "description", "price", "category", "stock_quantity"]
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Missing required columns: {', '.join(missing_columns)}"
            )
        
        # Validate max 100 products
        if len(df) > 100:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="CSV file can contain maximum 100 products"
            )
        
        valid_rows = []
        errors = []
        
        # Validate each row
        for idx, row in df.iterrows():
            row_num = idx + 2  # +2 because CSV is 1-indexed and has header
            is_valid, error_msg = validate_csv_row(row.to_dict(), row_num)
            
            if is_valid:
                # Prepare row data for product creation
                product_data = {
                    "title": str(row["title"]).strip(),
                    "description": str(row["description"]).strip() if not pd.isna(row.get("description")) else None,
                    "price": float(row["price"]),
                    "category": str(row["category"]).strip(),
                    "stock_quantity": int(row["stock_quantity"]),
                    "images": [
                        str(row.get(f"image_url_{i}", "")).strip()
                        for i in range(1, 5)
                        if not pd.isna(row.get(f"image_url_{i}")) and str(row.get(f"image_url_{i}", "")).strip()
                    ]
                }
                valid_rows.append(product_data)
            else:
                errors.append({
                    "row": row_num,
                    "error": error_msg
                })
        
        return valid_rows, errors
        
    except pd.errors.EmptyDataError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="CSV file is empty"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error parsing CSV: {str(e)}"
        )
