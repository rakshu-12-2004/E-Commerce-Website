from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, cast, Date, or_
from typing import Optional
from datetime import datetime, date, timedelta
import csv
import io
from database.db import get_db
from models.models import Order, OrderItem, Customer, Product, Category
from controllers.auth_utils import get_current_active_user
from models.models import User

router = APIRouter()

@router.get("/orders")
def get_orders(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    category_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    query = db.query(Order).join(Customer, Order.customer_id == Customer.id)

    if start_date:
        try:
            query = query.filter(cast(Order.created_at, Date) >= datetime.strptime(start_date, "%Y-%m-%d").date())
        except: pass
    if end_date:
        try:
            query = query.filter(cast(Order.created_at, Date) <= datetime.strptime(end_date, "%Y-%m-%d").date())
        except: pass
    if status:
        query = query.filter(Order.status == status)
    if search:
        query = query.filter(
            or_(
                Order.order_number.ilike(f"%{search}%"),
                Customer.name.ilike(f"%{search}%"),
                Customer.email.ilike(f"%{search}%")
            )
        )

    total = query.count()
    orders = query.order_by(Order.created_at.desc()).offset((page-1)*page_size).limit(page_size).all()

    data = []
    for o in orders:
        data.append({
            "id": o.id,
            "order_number": o.order_number,
            "customer_name": o.customer.name if o.customer else "N/A",
            "customer_email": o.customer.email if o.customer else "N/A",
            "status": o.status,
            "total_amount": float(o.total_amount),
            "created_at": o.created_at.isoformat()
        })

    return {"orders": data, "total": total, "page": page, "page_size": page_size, "total_pages": (total + page_size - 1) // page_size}

@router.get("/export")
def export_orders(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    category_id: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    today = date.today()
    end = datetime.strptime(end_date, "%Y-%m-%d").date() if end_date else today
    start = datetime.strptime(start_date, "%Y-%m-%d").date() if start_date else today - timedelta(days=29)

    orders = db.query(Order).join(Customer).filter(
        cast(Order.created_at, Date) >= start,
        cast(Order.created_at, Date) <= end
    ).order_by(Order.created_at.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Order Number", "Customer Name", "Customer Email", "Status", "Total Amount", "Date"])
    for o in orders:
        writer.writerow([
            o.order_number,
            o.customer.name if o.customer else "",
            o.customer.email if o.customer else "",
            o.status,
            float(o.total_amount),
            o.created_at.strftime("%Y-%m-%d %H:%M")
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=orders_{start}_{end}.csv"}
    )
