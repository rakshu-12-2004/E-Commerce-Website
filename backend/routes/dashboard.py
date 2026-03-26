from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date
from typing import Optional
from datetime import datetime, date, timedelta
from database.db import get_db
from models.models import Order, OrderItem, Customer, Product, Category
from schemas.schemas import KPIData
from controllers.auth_utils import get_current_active_user
from models.models import User

router = APIRouter()

def parse_date(d: Optional[str], default: date) -> date:
    if d:
        try:
            return datetime.strptime(d, "%Y-%m-%d").date()
        except:
            pass
    return default

@router.get("/kpi")
def get_kpi(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    today = date.today()
    end = parse_date(end_date, today)
    start = parse_date(start_date, today - timedelta(days=29))
    prev_start = start - (end - start + timedelta(days=1))
    prev_end = start - timedelta(days=1)

    def get_period_stats(s, e):
        revenue = db.query(func.coalesce(func.sum(Order.total_amount), 0)).filter(
            cast(Order.created_at, Date) >= s,
            cast(Order.created_at, Date) <= e
        ).scalar()
        orders = db.query(func.count(Order.id)).filter(
            cast(Order.created_at, Date) >= s,
            cast(Order.created_at, Date) <= e
        ).scalar()
        customers = db.query(func.count(func.distinct(Order.customer_id))).filter(
            cast(Order.created_at, Date) >= s,
            cast(Order.created_at, Date) <= e
        ).scalar()
        return float(revenue or 0), int(orders or 0), int(customers or 0)

    rev, orders, custs = get_period_stats(start, end)
    prev_rev, prev_orders, prev_custs = get_period_stats(prev_start, prev_end)
    total_customers = db.query(func.count(Customer.id)).scalar()

    def growth(curr, prev):
        if prev == 0:
            return 100.0 if curr > 0 else 0.0
        return round(((curr - prev) / prev) * 100, 1)

    conversion = round((orders / max(custs, 1)) * 100, 1)

    return {
        "total_revenue": rev,
        "total_orders": orders,
        "total_customers": total_customers,
        "active_customers": custs,
        "conversion_rate": conversion,
        "revenue_growth": growth(rev, prev_rev),
        "orders_growth": growth(orders, prev_orders),
        "customers_growth": growth(custs, prev_custs),
    }

@router.get("/revenue-chart")
def get_revenue_chart(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    today = date.today()
    end = parse_date(end_date, today)
    start = parse_date(start_date, today - timedelta(days=29))

    results = db.query(
        cast(Order.created_at, Date).label("date"),
        func.sum(Order.total_amount).label("revenue"),
        func.count(Order.id).label("orders")
    ).filter(
        cast(Order.created_at, Date) >= start,
        cast(Order.created_at, Date) <= end
    ).group_by(cast(Order.created_at, Date)).order_by(cast(Order.created_at, Date)).all()

    return [{"date": str(r.date), "revenue": float(r.revenue), "orders": int(r.orders)} for r in results]

@router.get("/category-sales")
def get_category_sales(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    today = date.today()
    end = parse_date(end_date, today)
    start = parse_date(start_date, today - timedelta(days=29))

    results = db.query(
        Category.name.label("category"),
        func.sum(OrderItem.total_price).label("revenue"),
        func.sum(OrderItem.quantity).label("orders")
    ).join(Product, OrderItem.product_id == Product.id
    ).join(Category, Product.category_id == Category.id
    ).join(Order, OrderItem.order_id == Order.id
    ).filter(
        cast(Order.created_at, Date) >= start,
        cast(Order.created_at, Date) <= end
    ).group_by(Category.name).all()

    total = sum(float(r.revenue) for r in results)
    return [
        {
            "category": r.category,
            "revenue": float(r.revenue),
            "orders": int(r.orders),
            "percentage": round((float(r.revenue) / total * 100), 1) if total > 0 else 0
        }
        for r in results
    ]

@router.get("/top-products")
def get_top_products(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    limit: int = Query(10),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    today = date.today()
    end = parse_date(end_date, today)
    start = parse_date(start_date, today - timedelta(days=29))

    results = db.query(
        Product.id,
        Product.name,
        Product.sku,
        Category.name.label("category"),
        Product.price,
        func.sum(OrderItem.total_price).label("revenue"),
        func.sum(OrderItem.quantity).label("units_sold")
    ).join(OrderItem, OrderItem.product_id == Product.id
    ).join(Order, OrderItem.order_id == Order.id
    ).join(Category, Product.category_id == Category.id
    ).filter(
        cast(Order.created_at, Date) >= start,
        cast(Order.created_at, Date) <= end
    ).group_by(Product.id, Product.name, Product.sku, Category.name, Product.price
    ).order_by(func.sum(OrderItem.total_price).desc()).limit(limit).all()

    return [
        {
            "id": r.id,
            "name": r.name,
            "sku": r.sku,
            "category": r.category,
            "price": float(r.price),
            "revenue": float(r.revenue),
            "units_sold": int(r.units_sold)
        }
        for r in results
    ]

@router.get("/ai-insights")
def get_ai_insights(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    today = date.today()
    last_7 = today - timedelta(days=6)
    prev_7 = today - timedelta(days=13)

    curr_rev = float(db.query(func.coalesce(func.sum(Order.total_amount), 0)).filter(
        cast(Order.created_at, Date) >= last_7).scalar() or 0)
    prev_rev = float(db.query(func.coalesce(func.sum(Order.total_amount), 0)).filter(
        cast(Order.created_at, Date) >= prev_7,
        cast(Order.created_at, Date) < last_7).scalar() or 0)

    top_cat = db.query(
        Category.name, func.sum(OrderItem.total_price).label("rev")
    ).join(Product, OrderItem.product_id == Product.id
    ).join(Category, Product.category_id == Category.id
    ).join(Order, OrderItem.order_id == Order.id
    ).filter(cast(Order.created_at, Date) >= last_7
    ).group_by(Category.name).order_by(func.sum(OrderItem.total_price).desc()).first()

    growth = ((curr_rev - prev_rev) / prev_rev * 100) if prev_rev > 0 else 0
    trend = "upward" if growth > 0 else "downward"
    insights = []

    if abs(growth) > 5:
        insights.append({
            "type": "trend",
            "icon": "📈" if growth > 0 else "📉",
            "title": f"Revenue {trend.capitalize()} Trend",
            "message": f"Revenue is {trend} by {abs(growth):.1f}% compared to last week. {'Keep up the momentum!' if growth > 0 else 'Consider running promotions to boost sales.'}"
        })

    if top_cat:
        insights.append({
            "type": "category",
            "icon": "🏆",
            "title": "Top Performing Category",
            "message": f"'{top_cat.name}' is your best performing category this week with ${float(top_cat.rev):,.0f} in revenue."
        })

    insights.append({
        "type": "tip",
        "icon": "💡",
        "title": "Sales Optimization Tip",
        "message": "Products with reviews convert 3x better. Consider adding a review reminder email to your post-purchase flow."
    })

    return {"insights": insights, "generated_at": datetime.utcnow().isoformat()}
