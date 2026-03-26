from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import auth, sales, products, customers, dashboard
from database.db import engine
from models import models

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="E-Commerce Dashboard API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(sales.router, prefix="/api/sales", tags=["Sales"])
app.include_router(products.router, prefix="/api/products", tags=["Products"])
app.include_router(customers.router, prefix="/api/customers", tags=["Customers"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])

@app.get("/")
def root():
    return {"message": "E-Commerce Dashboard API is running"}

@app.get("/health")
def health():
    return {"status": "healthy"}
