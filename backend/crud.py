from sqlalchemy.orm import Session
import models, schemas, auth

# User CRUD
def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        password_hash=hashed_password,
        full_name=user.full_name,
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# Product CRUD
def get_products(db: Session, skip: int = 0, limit: int = 100, category: str = None, search: str = None):
    query = db.query(models.Product)
    if category:
        query = query.filter(models.Product.category == category)
    if search:
        query = query.filter(models.Product.name.contains(search) | models.Product.description.contains(search))
    return query.offset(skip).limit(limit).all()

def get_product(db: Session, product_id: int):
    return db.query(models.Product).filter(models.Product.id == product_id).first()

def create_product(db: Session, product: schemas.ProductCreate):
    db_product = models.Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

# Cart CRUD
def get_cart_items(db: Session, user_id: int):
    return db.query(models.CartItem).filter(models.CartItem.user_id == user_id).all()

def add_to_cart(db: Session, user_id: int, item: schemas.CartItemCreate):
    db_item = db.query(models.CartItem).filter(
        models.CartItem.user_id == user_id, 
        models.CartItem.product_id == item.product_id
    ).first()
    if db_item:
        db_item.quantity += item.quantity
    else:
        db_item = models.CartItem(user_id=user_id, **item.dict())
        db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

def remove_from_cart(db: Session, user_id: int, product_id: int):
    db_item = db.query(models.CartItem).filter(
        models.CartItem.user_id == user_id, 
        models.CartItem.product_id == product_id
    ).first()
    if db_item:
        db.delete(db_item)
        db.commit()
    return True

# Order CRUD
def create_order(db: Session, user_id: int, order_data: schemas.OrderCreate):
    cart_items = get_cart_items(db, user_id)
    if not cart_items:
        return None
    
    total_amount = sum(item.product.price * item.quantity for item in cart_items)
    db_order = models.Order(
        user_id=user_id,
        total_amount=total_amount,
        shipping_address=order_data.shipping_address
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)

    for item in cart_items:
        order_item = models.OrderItem(
            order_id=db_order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            price_at_purchase=item.product.price
        )
        db.add(order_item)
        db.delete(item) # Clear cart after order
    
    db.commit()
    db.refresh(db_order)
    return db_order

def get_user_orders(db: Session, user_id: int):
    return db.query(models.Order).filter(models.Order.user_id == user_id).all()

def get_all_orders(db: Session):
    return db.query(models.Order).all()
