from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from decimal import Decimal

# Auth Schemas
class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    email: str
    username: str
    full_name: Optional[str]
    is_active: bool
    is_admin: bool
    created_at: datetime
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

# Customer Schemas
class CustomerOut(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str]
    city: Optional[str]
    country: str
    joined_at: datetime
    total_orders: int
    total_spent: Decimal
    class Config:
        from_attributes = True

# Product Schemas
class ProductOut(BaseModel):
    id: int
    name: str
    sku: str
    category_id: Optional[int]
    price: Decimal
    stock: int
    description: Optional[str]
    is_active: bool
    class Config:
        from_attributes = True

# Order Schemas
class OrderItemOut(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: Decimal
    total_price: Decimal
    class Config:
        from_attributes = True

class OrderOut(BaseModel):
    id: int
    order_number: str
    customer_id: int
    status: str
    total_amount: Decimal
    created_at: datetime
    class Config:
        from_attributes = True

# Dashboard Schemas
class KPIData(BaseModel):
    total_revenue: float
    total_orders: int
    total_customers: int
    conversion_rate: float
    revenue_growth: float
    orders_growth: float
    customers_growth: float

class RevenueDataPoint(BaseModel):
    date: str
    revenue: float
    orders: int

class CategorySales(BaseModel):
    category: str
    revenue: float
    orders: int
    percentage: float

class TopProduct(BaseModel):
    id: int
    name: str
    sku: str
    category: str
    revenue: float
    units_sold: int
    price: float

class SalesFilters(BaseModel):
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    category_id: Optional[int] = None
    search: Optional[str] = None
