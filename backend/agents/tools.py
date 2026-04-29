from sqlalchemy.orm import Session
from database import SessionLocal
import crud, schemas


def get_order_status(user_id: int) -> str:
    """Get the order history and current status for the user."""
    db = SessionLocal()
    try:
        orders = crud.get_user_orders(db, user_id=user_id)
        if not orders:
            return "You currently have no orders placed."
        lines = [f"Found {len(orders)} order(s):\n"]
        for o in orders:
            try:
                items_list = ", ".join(
                    f"{i.product.name} x{i.quantity} @ ${i.price_at_purchase:.2f}"
                    for i in o.items
                )
            except Exception:
                items_list = "Item details unavailable"
            lines.append(
                f"• Order #{o.id} | Status: {o.status} | Total: ${o.total_amount:.2f} | "
                f"Placed: {o.created_at.strftime('%Y-%m-%d')} | "
                f"Items: {items_list} | Ship to: {o.shipping_address}"
            )
        return "\n".join(lines)
    finally:
        db.close()


def get_product_list(search: str = None, category: str = None) -> str:
    """Search for products in the catalog. Returns a formatted list of matching products."""
    db = SessionLocal()
    try:
        products = crud.get_products(db, search=search, category=category, limit=10)
        if not products:
            # Try a broader search if specific search found nothing
            if search:
                products = crud.get_products(db, limit=10)
                if products:
                    lines = [f"No exact match for '{search}', but here are some products you might like:\n"]
                else:
                    return f"No products found matching '{search}'."
            else:
                return "No products available in the catalog."
        else:
            label = f"Products matching '{search}'" if search else "Available products"
            lines = [f"{label} ({len(products)} found):\n"]

        for p in products:
            stock_info = f"{p.stock_quantity} in stock" if p.stock_quantity > 0 else "Out of stock"
            lines.append(
                f"• [{p.category}] {p.name} — ${p.price:.2f} | {stock_info} | ID: {p.id}"
            )
        return "\n".join(lines)
    finally:
        db.close()


def add_item_to_cart(user_id: int, product_id: int, quantity: int = 1) -> str:
    """Add a specific product to the user's shopping cart."""
    db = SessionLocal()
    try:
        # Verify product exists first
        product = crud.get_product(db, product_id=product_id)
        if not product:
            return f"Product with ID {product_id} not found."
        if product.stock_quantity < quantity:
            return f"Only {product.stock_quantity} units of '{product.name}' are available."
        item = schemas.CartItemCreate(product_id=product_id, quantity=quantity)
        crud.add_to_cart(db, user_id=user_id, item=item)
        return f"✓ Added {quantity}x '{product.name}' (${product.price:.2f} each) to your cart."
    except Exception as e:
        return f"Error adding to cart: {str(e)}"
    finally:
        db.close()


def get_cart_contents(user_id: int) -> str:
    """View all items currently in the user's shopping cart."""
    db = SessionLocal()
    try:
        items = crud.get_cart_items(db, user_id=user_id)
        if not items:
            return "Your cart is empty."
        lines = [f"Your cart ({len(items)} item(s)):\n"]
        total = 0.0
        for i in items:
            subtotal = i.product.price * i.quantity
            total += subtotal
            lines.append(f"• {i.product.name} x{i.quantity} — ${i.product.price:.2f} each = ${subtotal:.2f}")
        lines.append(f"\nCart Total: ${total:.2f}")
        return "\n".join(lines)
    finally:
        db.close()


def perform_checkout(user_id: int, shipping_address: str) -> str:
    """Complete the purchase and place an order."""
    db = SessionLocal()
    try:
        order_data = schemas.OrderCreate(shipping_address=shipping_address)
        order = crud.create_order(db, user_id=user_id, order_data=order_data)
        if order:
            return (
                f"✓ Order placed successfully!\n"
                f"  Order ID: #{order.id}\n"
                f"  Total charged: ${order.total_amount:.2f}\n"
                f"  Shipping to: {shipping_address}\n"
                f"  Status: {order.status}"
            )
        return "Checkout failed — your cart may be empty."
    except Exception as e:
        return f"Error during checkout: {str(e)}"
    finally:
        db.close()
