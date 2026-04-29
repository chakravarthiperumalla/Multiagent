from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    full_name = Column(String)
    role = Column(String, default="customer") # customer, admin
    created_at = Column(DateTime, default=datetime.utcnow)

    orders = relationship("Order", back_populates="user")
    cart_items = relationship("CartItem", back_populates="user")

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(Text)
    price = Column(Float, nullable=False)
    stock_quantity = Column(Integer, default=0)
    category = Column(String, index=True)
    image_url = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    total_amount = Column(Float, nullable=False)
    status = Column(String, default="Processing") # Processing, Shipped, Delivered, Cancelled
    shipping_address = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order")

class OrderItem(Base):
    __tablename__ = "order_items"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer, nullable=False)
    price_at_purchase = Column(Float, nullable=False)

    order = relationship("Order", back_populates="items")
    product = relationship("Product")

class CartItem(Base):
    __tablename__ = "cart_items"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer, default=1)

    user = relationship("User", back_populates="cart_items")
    product = relationship("Product")
