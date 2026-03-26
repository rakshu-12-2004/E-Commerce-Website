"""
Seed script - run with: python seed.py
Generates realistic e-commerce data for the past 90 days
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from database.db import SessionLocal, engine
from models.models import Base, User, Customer, Category, Product, Order, OrderItem
from controllers.auth_utils import get_password_hash
from faker import Faker
import random
from datetime import datetime, timedelta
from decimal import Decimal

fake = Faker()
Base.metadata.create_all(bind=engine)
db = SessionLocal()

def seed():
    print("🌱 Seeding database...")

    # Admin user
    if not db.query(User).filter(User.email == "admin@demo.com").first():
        db.add(User(
            email="admin@demo.com",
            username="admin",
            hashed_password=get_password_hash("admin123"),
            full_name="Admin User",
            is_admin=True
        ))
        db.commit()
        print("✅ Admin user created: admin@demo.com / admin123")

    # Categories
    categories_data = [
        ("Electronics", "Gadgets and electronic devices"),
        ("Clothing", "Fashion and apparel"),
        ("Home & Garden", "Home improvement and garden products"),
        ("Sports", "Sports equipment and accessories"),
        ("Books", "Books and educational materials"),
        ("Beauty", "Beauty and personal care"),
        ("Toys", "Toys and games"),
        ("Food & Beverage", "Food and drinks"),
    ]
    categories = []
    for name, desc in categories_data:
        cat = db.query(Category).filter(Category.name == name).first()
        if not cat:
            cat = Category(name=name, description=desc)
            db.add(cat)
    db.commit()
    categories = db.query(Category).all()
    print(f"✅ {len(categories)} categories seeded")

    # Products
    product_templates = [
        ("iPhone 15 Pro", "ELEC", 999.99, 50),
        ("Samsung Galaxy S24", "ELEC", 849.99, 40),
        ("MacBook Air M3", "ELEC", 1299.99, 25),
        ("Sony WH-1000XM5", "ELEC", 349.99, 80),
        ("iPad Pro 12.9", "ELEC", 1099.99, 30),
        ("Nike Air Max 270", "CLTH", 149.99, 200),
        ("Adidas Ultraboost 22", "CLTH", 179.99, 150),
        ("Levi's 501 Jeans", "CLTH", 69.99, 300),
        ("North Face Jacket", "CLTH", 249.99, 100),
        ("Under Armour T-Shirt", "CLTH", 39.99, 500),
        ("Instant Pot Duo", "HOME", 99.99, 120),
        ("Dyson V15 Vacuum", "HOME", 649.99, 40),
        ("KitchenAid Mixer", "HOME", 449.99, 35),
        ("Weber Grill", "HOME", 599.99, 20),
        ("Roomba i7+", "HOME", 799.99, 25),
        ("Wilson Tennis Racket", "SPRT", 89.99, 100),
        ("Yeti Cooler 45", "SPRT", 299.99, 60),
        ("Fitbit Charge 6", "SPRT", 149.99, 90),
        ("Trek Mountain Bike", "SPRT", 1199.99, 15),
        ("Callaway Golf Set", "SPRT", 899.99, 10),
        ("Atomic Habits", "BOOK", 16.99, 500),
        ("Python Programming", "BOOK", 49.99, 200),
        ("The 4-Hour Work Week", "BOOK", 14.99, 400),
        ("Clean Code", "BOOK", 44.99, 150),
        ("The Lean Startup", "BOOK", 17.99, 300),
        ("Charlotte Tilbury Palette", "BEAU", 75.00, 120),
        ("Fenty Beauty Foundation", "BEAU", 38.00, 200),
        ("Olaplex No.3", "BEAU", 30.00, 250),
        ("La Mer Moisturizer", "BEAU", 190.00, 60),
        ("LEGO Star Wars Set", "TOYS", 129.99, 80),
    ]

    cat_map = {c.name[:4].upper(): c for c in categories}
    cat_lookup = {
        "ELEC": "Electronics", "CLTH": "Clothing", "HOME": "Home & Garden",
        "SPRT": "Sports", "BOOK": "Books", "BEAU": "Beauty", "TOYS": "Toys"
    }

    products = db.query(Product).all()
    if len(products) < 10:
        for i, (name, cat_key, price, stock) in enumerate(product_templates):
            cat_name = cat_lookup.get(cat_key, "Electronics")
            cat = next((c for c in categories if c.name == cat_name), categories[0])
            p = Product(
                name=name,
                sku=f"{cat_key}-{1000+i}",
                category_id=cat.id,
                price=Decimal(str(price)),
                stock=stock,
                description=f"High quality {name}"
            )
            db.add(p)
        db.commit()
    products = db.query(Product).all()
    print(f"✅ {len(products)} products seeded")

    # Customers
    existing_customers = db.query(Customer).count()
    if existing_customers < 100:
        for _ in range(200):
            c = Customer(
                name=fake.name(),
                email=fake.unique.email(),
                phone=fake.phone_number()[:20],
                city=fake.city(),
                country=fake.country()[:50],
                joined_at=fake.date_time_between(start_date="-1y", end_date="now")
            )
            db.add(c)
        db.commit()
    customers = db.query(Customer).all()
    print(f"✅ {len(customers)} customers seeded")

    # Orders (last 90 days)
    existing_orders = db.query(Order).count()
    if existing_orders < 100:
        order_statuses = ["completed", "completed", "completed", "pending", "shipped", "cancelled"]
        for day_offset in range(90):
            order_date = datetime.utcnow() - timedelta(days=day_offset)
            daily_orders = random.randint(5, 25)
            for _ in range(daily_orders):
                customer = random.choice(customers)
                num_items = random.randint(1, 4)
                order_products = random.sample(products, min(num_items, len(products)))
                total = Decimal("0.00")
                order_number = f"ORD-{fake.unique.numerify(text='########')}"
                order = Order(
                    order_number=order_number,
                    customer_id=customer.id,
                    status=random.choice(order_statuses),
                    total_amount=Decimal("0.00"),
                    created_at=order_date.replace(
                        hour=random.randint(0, 23),
                        minute=random.randint(0, 59)
                    )
                )
                db.add(order)
                db.flush()
                for product in order_products:
                    qty = random.randint(1, 3)
                    unit_price = product.price
                    item_total = unit_price * qty
                    total += item_total
                    db.add(OrderItem(
                        order_id=order.id,
                        product_id=product.id,
                        quantity=qty,
                        unit_price=unit_price,
                        total_price=item_total
                    ))
                order.total_amount = total
                customer.total_orders += 1
                customer.total_spent += total
        db.commit()
    print(f"✅ Orders seeded")
    print("🎉 Database seeding complete!")
    db.close()

if __name__ == "__main__":
    seed()
