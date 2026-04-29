from fastapi import FastAPI, Depends, HTTPException, status, Header
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import timedelta
from pydantic import BaseModel as PydanticBaseModel
import models, schemas, crud, auth, database
from database import engine, get_db
from jose import JWTError, jwt
from agents.agent_graph import run_agent

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="E-commerce Multi-Agent API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = crud.get_user_by_email(db, email=email)
    if user is None:
        raise credentials_exception
    return user

async def get_current_user_optional(authorization: str = Header(None), db: Session = Depends(get_db)):
    """Optional authentication - returns user if token is valid, None otherwise"""
    if not authorization:
        return None
    try:
        # Extract token from Authorization header
        token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            return None
        user = crud.get_user_by_email(db, email=email)
        return user
    except (JWTError, Exception):
        return None

def get_admin_user(current_user: models.User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return current_user

# Auth Routes
@app.post("/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)

@app.post("/token", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, email=form_data.username)
    if not user or not auth.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

# Product Routes
@app.get("/products", response_model=list[schemas.ProductResponse])
def read_products(skip: int = 0, limit: int = 100, category: str = None, search: str = None, db: Session = Depends(get_db)):
    return crud.get_products(db, skip=skip, limit=limit, category=category, search=search)

@app.get("/products/{product_id}", response_model=schemas.ProductResponse)
def read_product(product_id: int, db: Session = Depends(get_db)):
    product = crud.get_product(db, product_id=product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@app.post("/products", response_model=schemas.ProductResponse)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db), admin: models.User = Depends(get_admin_user)):
    return crud.create_product(db=db, product=product)

# Cart Routes
@app.get("/cart", response_model=list[schemas.CartItemResponse])
def get_cart(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return crud.get_cart_items(db, user_id=current_user.id)

@app.post("/cart", response_model=schemas.CartItemResponse)
def add_to_cart(item: schemas.CartItemCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    return crud.add_to_cart(db, user_id=current_user.id, item=item)

@app.delete("/cart/{product_id}")
def remove_from_cart(product_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    crud.remove_from_cart(db, user_id=current_user.id, product_id=product_id)
    return {"detail": "Item removed from cart"}

# Order Routes
@app.post("/orders", response_model=schemas.OrderResponse)
def place_order(order_data: schemas.OrderCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    order = crud.create_order(db, user_id=current_user.id, order_data=order_data)
    if not order:
        raise HTTPException(status_code=400, detail="Cart is empty")
    return order

@app.get("/orders", response_model=list[schemas.OrderResponse])
def get_orders(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role == "admin":
        return crud.get_all_orders(db)
    return crud.get_user_orders(db, user_id=current_user.id)

# AI Agent Route
class HistoryMessage(PydanticBaseModel):
    role: str       # "user" or "assistant"
    content: str

class ChatQuery(PydanticBaseModel):
    content: str
    history: list[HistoryMessage] = []  # full conversation history

@app.post("/chat")
async def chat_with_agent(query: ChatQuery, current_user: models.User = Depends(get_current_user_optional)):
    user_id = current_user.id if current_user else 1
    history = [{"role": m.role, "content": m.content} for m in query.history]
    response, agents_used, actions = await run_agent(query.content, user_id, history)
    return {
        "response":    response,
        "agents_used": agents_used,
        "actions":     actions,
    }

