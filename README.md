# SalesIQ — E-Commerce Sales Dashboard

A full-stack production-ready e-commerce analytics dashboard with real-time data, JWT authentication, interactive charts, and AI insights.

---

## 🏗️ Tech Stack

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Frontend   | React 18, Vite, Tailwind CSS, Recharts, Axios  |
| Backend    | FastAPI (Python 3.11+)                          |
| Database   | PostgreSQL                                      |
| Auth       | JWT (python-jose + passlib/bcrypt)              |
| Deploy FE  | Vercel                                          |
| Deploy BE  | Render                                          |

---

## 📁 Project Structure

```
ecommerce-dashboard/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── charts/         # RevenueChart, OrdersBarChart, CategoryPieChart, TopProductsChart
│   │   │   ├── common/         # KPICard, DateRangeFilter, AIInsightsPanel
│   │   │   └── layout/         # DashboardLayout (sidebar + topbar)
│   │   ├── pages/              # OverviewPage, OrdersPage, ProductsPage, CustomersPage
│   │   ├── services/           # api.js (Axios wrappers for all endpoints)
│   │   ├── hooks/              # useFetch, usePolling, useDebounce
│   │   ├── context/            # AuthContext (JWT state management)
│   │   ├── App.jsx             # Router with protected/public routes
│   │   └── index.css           # Tailwind + custom CSS variables
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── vercel.json
│
└── backend/
    ├── main.py                 # FastAPI app entry point + CORS
    ├── config.py               # Pydantic settings (env vars)
    ├── seed.py                 # Database seeder (200 customers, 90-day orders)
    ├── requirements.txt
    ├── render.yaml
    ├── routes/
    │   ├── auth.py             # POST /register, POST /login, GET /me
    │   ├── dashboard.py        # GET /kpi, /revenue-chart, /category-sales, /top-products, /ai-insights
    │   ├── sales.py            # GET /orders (paginated), GET /export (CSV)
    │   ├── products.py         # GET /products, GET /categories
    │   └── customers.py        # GET /customers (paginated)
    ├── models/
    │   └── models.py           # SQLAlchemy ORM: User, Customer, Category, Product, Order, OrderItem
    ├── schemas/
    │   └── schemas.py          # Pydantic request/response schemas
    ├── controllers/
    │   └── auth_utils.py       # JWT creation/verification, password hashing
    └── database/
        ├── db.py               # SQLAlchemy engine + SessionLocal + get_db()
        └── schema.sql          # Raw SQL schema reference
```

---

## ⚡ Quick Start (Local Development)

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 14+

---

### 1. Clone & navigate

```bash
git clone <your-repo-url>
cd ecommerce-dashboard
```

---

### 2. Backend setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env — set your DATABASE_URL and SECRET_KEY
```

**Create the PostgreSQL database:**
```sql
CREATE DATABASE ecommerce_dashboard;
```

**Run migrations and seed data:**
```bash
python seed.py
```

**Start the API server:**
```bash
uvicorn main:app --reload --port 8000
```

API will be running at: http://localhost:8000  
Swagger docs: http://localhost:8000/docs

---

### 3. Frontend setup

```bash
cd ../frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Set VITE_API_URL=http://localhost:8000

# Start dev server
npm run dev
```

Frontend will be running at: http://localhost:5173

---

### 4. Login

After seeding, use the demo account:
- **Email:** `admin@demo.com`
- **Password:** `admin123`

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint              | Description          |
|--------|-----------------------|----------------------|
| POST   | /api/auth/register    | Register new user    |
| POST   | /api/auth/login       | Login, get JWT token |
| GET    | /api/auth/me          | Get current user     |

### Dashboard (all require Bearer token)
| Method | Endpoint                         | Description                        |
|--------|----------------------------------|------------------------------------|
| GET    | /api/dashboard/kpi               | KPI cards data                     |
| GET    | /api/dashboard/revenue-chart     | Revenue + orders time series       |
| GET    | /api/dashboard/category-sales    | Category breakdown (pie chart)     |
| GET    | /api/dashboard/top-products      | Top products by revenue            |
| GET    | /api/dashboard/ai-insights       | AI-generated trend insights        |

### Sales
| Method | Endpoint           | Description                    |
|--------|--------------------|--------------------------------|
| GET    | /api/sales/orders  | Paginated, filterable orders   |
| GET    | /api/sales/export  | Download orders as CSV         |

### Products & Customers
| Method | Endpoint                  | Description          |
|--------|---------------------------|----------------------|
| GET    | /api/products/            | List all products    |
| GET    | /api/products/categories  | List all categories  |
| GET    | /api/customers/           | Paginated customers  |

**Query Parameters (most endpoints):**
- `start_date` — ISO date string (e.g. 2024-01-01)
- `end_date`   — ISO date string
- `category_id` — integer
- `search`     — text search
- `page`, `page_size` — pagination

---

## ✨ Features

- 🔐 **JWT Authentication** — Register/login with bcrypt-hashed passwords
- 📊 **KPI Cards** — Revenue, Orders, Customers, Conversion Rate with period-over-period growth
- 📈 **Revenue Area Chart** — Daily revenue with gradient fill (Recharts AreaChart)
- 📦 **Orders Bar Chart** — Daily order volume
- 🥧 **Category Pie Chart** — Revenue breakdown by product category
- 🏆 **Top Products** — Horizontal bar chart + detailed table
- 🤖 **AI Insights Panel** — Trend analysis and actionable recommendations
- 🗓️ **Date Range Filter** — Quick presets (7/30/90 days) or custom range
- 🔍 **Search** — Full-text search across orders and customers
- 📥 **CSV Export** — Export filtered orders to CSV
- 🔄 **Real-time Polling** — Auto-refresh every 30 seconds
- 📱 **Responsive** — Works on mobile, tablet, and desktop

---

## 🚀 Deployment

### Backend → Render

1. Push `backend/` to a GitHub repo
2. Go to [Render.com](https://render.com) → New Web Service
3. Connect your repo
4. Set environment variables:
   ```
   DATABASE_URL=postgresql://...    # from Render PostgreSQL
   SECRET_KEY=<random 32+ chars>
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=60
   ```
5. Build command: `pip install -r requirements.txt`
6. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
7. After deploy: run `python seed.py` via Render Shell

### Frontend → Vercel

1. Push `frontend/` to a GitHub repo
2. Go to [Vercel.com](https://vercel.com) → New Project
3. Import your repo
4. Add environment variable:
   ```
   VITE_API_URL=https://your-render-app.onrender.com
   ```
5. Framework preset: **Vite**
6. Deploy!

---

## 🔒 Security Notes

- Change `SECRET_KEY` in production (use `openssl rand -hex 32`)
- Set `CORS allow_origins` to your frontend domain in production (in `main.py`)
- Use environment variables — never commit `.env` files
- Enable HTTPS on both services (Render and Vercel do this automatically)

---

## 🛠️ Development Tips

**Reset & reseed database:**
```bash
# Drop all tables and reseed
python -c "from database.db import engine; from models.models import Base; Base.metadata.drop_all(engine)"
python seed.py
```

**Run with auto-reload:**
```bash
uvicorn main:app --reload --port 8000 --log-level debug
```

**Build frontend for production:**
```bash
npm run build
npm run preview
```

---

## 📊 Sample Data

The seeder creates:
- 1 admin user (admin@demo.com / admin123)
- 8 product categories
- 30 products with realistic SKUs
- 200 customers with names, emails, cities
- ~1000–2000 orders over the past 90 days with order items

---

## 📄 License

MIT — free for personal and commercial use.
