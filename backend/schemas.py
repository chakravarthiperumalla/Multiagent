from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    role: Optional[str] = "customer"

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Product Schemas
class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    stock_quantity: int
    category: Optional[str] = None
    image_url: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductResponse(ProductBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

# Cart Schemas
class CartItemBase(BaseModel):
    product_id: int
    quantity: int

class CartItemCreate(CartItemBase):
    pass

class CartItemResponse(CartItemBase):
    id: int
    product: ProductResponse
    class Config:
        from_attributes = True

# Order Schemas
class OrderItemResponse(BaseModel):
    product_id: int
    quantity: int
    price_at_purchase: float
    product: ProductResponse
    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    shipping_address: str

class OrderResponse(BaseModel):
    id: int
    total_amount: float
    status: str
    shipping_address: str
    created_at: datetime
    items: List[OrderItemResponse]
    class Config:
        from_attributes = True
