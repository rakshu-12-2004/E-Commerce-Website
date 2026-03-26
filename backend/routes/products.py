from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from database.db import get_db
from models.models import Product, Category
from controllers.auth_utils import get_current_active_user
from models.models import User

router = APIRouter()

@router.get("/")
def get_products(
    category_id: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    query = db.query(Product)
    if category_id:
        query = query.filter(Product.category_id == category_id)
    if search:
        query = query.filter(Product.name.ilike(f"%{search}%"))
    products = query.all()
    return [{"id": p.id, "name": p.name, "sku": p.sku, "price": float(p.price), "stock": p.stock,
             "category_id": p.category_id, "is_active": p.is_active} for p in products]

@router.get("/categories")
def get_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    categories = db.query(Category).all()
    return [{"id": c.id, "name": c.name} for c in categories]
