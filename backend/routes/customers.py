from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from database.db import get_db
from models.models import Customer
from controllers.auth_utils import get_current_active_user
from models.models import User

router = APIRouter()

@router.get("/")
def get_customers(
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    query = db.query(Customer)
    if search:
        query = query.filter(
            Customer.name.ilike(f"%{search}%") |
            Customer.email.ilike(f"%{search}%")
        )
    total = query.count()
    customers = query.order_by(Customer.total_spent.desc()).offset((page-1)*page_size).limit(page_size).all()
    return {
        "customers": [{"id": c.id, "name": c.name, "email": c.email, "city": c.city,
                        "total_orders": c.total_orders, "total_spent": float(c.total_spent),
                        "joined_at": c.joined_at.isoformat()} for c in customers],
        "total": total
    }
