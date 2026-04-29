from sqlalchemy.orm import Session
import models, auth, database
from database import engine

def seed_db():
    from sqlalchemy import text

    with engine.connect() as conn:
        try:
            if "postgresql" in str(engine.url):
                conn.execute(text("DROP SCHEMA public CASCADE;"))
                conn.execute(text("CREATE SCHEMA public;"))
                conn.commit()
                print("Database schema reset with CASCADE.")
            else:
                models.Base.metadata.drop_all(bind=engine)
        except Exception as e:
            print(f"Standard drop failed, trying metadata drop: {e}")
            models.Base.metadata.drop_all(bind=engine)

    models.Base.metadata.create_all(bind=engine)
    db = next(database.get_db())

    # ── Users ─────────────────────────────────────────────────────────────
    admin = models.User(
        email="admin@shop.com",
        password_hash=auth.get_password_hash("admin123"),
        full_name="System Admin",
        role="admin"
    )
    user = models.User(
        email="user@shop.com",
        password_hash=auth.get_password_hash("user123"),
        full_name="John Doe",
        role="customer"
    )
    db.add(admin)
    db.add(user)

    # ── Products (30+) ────────────────────────────────────────────────────
    products = [
        # ── Electronics ──
        models.Product(
            name="Premium Wireless Headphones",
            description="Industry-leading noise cancellation with 40-hour battery life and crystal-clear audio. Foldable design with memory foam ear cups.",
            price=299.99, stock_quantity=50, category="Electronics",
            image_url="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600"
        ),
        models.Product(
            name="Smart Watch Series X",
            description="Track fitness, ECG, blood oxygen, and sleep. Always-on retina display, 18-hour battery, and water-resistant up to 50m.",
            price=349.99, stock_quantity=30, category="Electronics",
            image_url="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600"
        ),
        models.Product(
            name="Mechanical Gaming Keyboard",
            description="Tactile blue switches with per-key RGB lighting. N-key rollover, aircraft-grade aluminum frame, and detachable USB-C cable.",
            price=89.99, stock_quantity=100, category="Electronics",
            image_url="https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=600"
        ),
        models.Product(
            name="4K Webcam Pro",
            description="Ultra-sharp 4K video with AI-powered autofocus and background blur. Dual noise-cancelling microphones for crystal-clear calls.",
            price=129.99, stock_quantity=45, category="Electronics",
            image_url="https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=600"
        ),
        models.Product(
            name="Wireless Charging Pad",
            description="15W fast wireless charging compatible with all Qi-enabled devices. Sleek flat design with LED indicator and over-heat protection.",
            price=39.99, stock_quantity=80, category="Electronics",
            image_url="https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600"
        ),
        models.Product(
            name="Portable Bluetooth Speaker",
            description="360° immersive sound, IPX7 waterproof, 24-hour playtime. Perfect for outdoor adventures. Pairs two units for stereo mode.",
            price=79.99, stock_quantity=60, category="Electronics",
            image_url="https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600"
        ),
        models.Product(
            name="USB-C Hub 7-in-1",
            description="HDMI 4K@60Hz, 2×USB-A, USB-C PD 100W, SD/microSD slots, Gigabit Ethernet. Aluminium build with braided cable.",
            price=54.99, stock_quantity=70, category="Electronics",
            image_url="https://images.unsplash.com/photo-1625895197185-efcec01cffe0?w=600"
        ),
        models.Product(
            name="Noise-Cancelling Earbuds",
            description="Active noise cancellation, transparency mode, and 8-hour playtime per charge. IPX4 splash resistant with wireless charging case.",
            price=149.99, stock_quantity=55, category="Electronics",
            image_url="https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600"
        ),
        models.Product(
            name="Gaming Mouse RGB",
            description="16,000 DPI optical sensor, 11 programmable buttons, 80-hour battery. Ergonomic design fits all grip styles.",
            price=69.99, stock_quantity=90, category="Electronics",
            image_url="https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600"
        ),
        models.Product(
            name="Smart Home Security Camera",
            description="2K resolution with color night vision, motion detection, and two-way audio. Works with Alexa and Google Home.",
            price=59.99, stock_quantity=35, category="Electronics",
            image_url="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600"
        ),

        # ── Clothing ──
        models.Product(
            name="Classic Oxford Shirt",
            description="100% premium cotton with a tailored slim fit. Wrinkle-resistant fabric, button-down collar. Available in multiple colors.",
            price=49.99, stock_quantity=120, category="Clothing",
            image_url="https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600"
        ),
        models.Product(
            name="Premium Denim Jeans",
            description="Stretch denim with 2% elastane for all-day comfort. Mid-rise slim fit with authentic fading details and reinforced stitching.",
            price=79.99, stock_quantity=85, category="Clothing",
            image_url="https://images.unsplash.com/photo-1542272604-787c3835535d?w=600"
        ),
        models.Product(
            name="Merino Wool Crewneck",
            description="Ultra-soft 100% merino wool. Temperature-regulating, naturally odour-resistant, and machine washable. Ribbed cuffs and hem.",
            price=94.99, stock_quantity=40, category="Clothing",
            image_url="https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600"
        ),
        models.Product(
            name="Lightweight Bomber Jacket",
            description="Water-repellent nylon shell with satin lining and ribbed collar. Zipper chest pocket. Perfect for transitional weather.",
            price=119.99, stock_quantity=35, category="Clothing",
            image_url="https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600"
        ),
        models.Product(
            name="Yoga Leggings (Women)",
            description="4-way stretch fabric with hidden pocket and high-rise waistband. Squat-proof, moisture-wicking, and ultra-comfortable.",
            price=54.99, stock_quantity=100, category="Clothing",
            image_url="https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600"
        ),
        models.Product(
            name="Linen Summer Shirt",
            description="100% pure linen, breathable and lightweight. Relaxed fit with a subtle texture. Button-up with short sleeves.",
            price=44.99, stock_quantity=65, category="Clothing",
            image_url="https://images.unsplash.com/photo-1603252109360-909baaf261ae?w=600"
        ),

        # ── Footwear ──
        models.Product(
            name="Running Shoes Pro",
            description="Responsive cushioning with breathable knit upper. Carbon fibre plate for energy return. Suitable for road and trail.",
            price=134.99, stock_quantity=75, category="Footwear",
            image_url="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600"
        ),
        models.Product(
            name="Leather Chelsea Boots",
            description="Full-grain leather upper with elastic side panels. Leather-lined, rubber lug sole for grip and durability.",
            price=189.99, stock_quantity=30, category="Footwear",
            image_url="https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600"
        ),
        models.Product(
            name="Minimalist Sneakers",
            description="Clean low-profile design with EVA foam sole. Canvas upper, vulcanised rubber outsole, and padded ankle collar.",
            price=64.99, stock_quantity=90, category="Footwear",
            image_url="https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=600"
        ),
        models.Product(
            name="Slip-On Loafers",
            description="Genuine suede upper with memory foam insole. Lightweight rubber sole. Perfect for casual or semi-formal occasions.",
            price=84.99, stock_quantity=55, category="Footwear",
            image_url="https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600"
        ),

        # ── Accessories ──
        models.Product(
            name="Leather Bifold Wallet",
            description="Full-grain vegetable-tanned leather. 6 card slots, 2 cash compartments, and ID window. Gets better with age.",
            price=59.99, stock_quantity=110, category="Accessories",
            image_url="https://images.unsplash.com/photo-1627123424574-724758594e93?w=600"
        ),
        models.Product(
            name="Polarised Sunglasses",
            description="TAC polarised lenses with UV400 protection. Stainless steel frame with spring hinges. Includes hard case and cleaning cloth.",
            price=79.99, stock_quantity=65, category="Accessories",
            image_url="https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600"
        ),
        models.Product(
            name="Canvas Backpack 30L",
            description="Weather-resistant waxed canvas with leather accents. Padded 15\" laptop sleeve, multiple pockets, and adjustable straps.",
            price=89.99, stock_quantity=48, category="Accessories",
            image_url="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600"
        ),
        models.Product(
            name="Silk Pocket Square",
            description="100% pure silk, hand-rolled edges. Classic patterns. Elevate any suit or blazer instantly.",
            price=24.99, stock_quantity=150, category="Accessories",
            image_url="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600"
        ),
        models.Product(
            name="Stainless Steel Watch",
            description="Automatic movement with exhibition caseback. Sapphire crystal glass, 100m water resistance, and genuine leather strap.",
            price=279.99, stock_quantity=20, category="Accessories",
            image_url="https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=600"
        ),

        # ── Home ──
        models.Product(
            name="Minimalist Desk Lamp",
            description="Eye-care LED with 5 colour temperatures and 5 brightness levels. USB charging port on base, memory function.",
            price=45.50, stock_quantity=40, category="Home",
            image_url="https://images.unsplash.com/photo-1534073828943-f801091bb18c?w=600"
        ),
        models.Product(
            name="Ergonomic Office Chair",
            description="Breathable mesh back with lumbar support, adjustable armrests and seat height. 5-star base with smooth-roll casters.",
            price=189.99, stock_quantity=20, category="Home",
            image_url="https://images.unsplash.com/photo-1505744386214-51dba16a26fc?w=600"
        ),
        models.Product(
            name="Ceramic Pour-Over Coffee Set",
            description="Hand-crafted ceramic dripper, server, and two cups. Includes stainless steel filter and wooden stand. Brews 400ml.",
            price=64.99, stock_quantity=35, category="Home",
            image_url="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600"
        ),
        models.Product(
            name="Scented Soy Candle Set (3)",
            description="Set of 3 hand-poured soy wax candles: Cedarwood, Vanilla Bourbon, Sea Salt. 40-hour burn time each.",
            price=34.99, stock_quantity=80, category="Home",
            image_url="https://images.unsplash.com/photo-1602607144056-58285e53a5f4?w=600"
        ),
        models.Product(
            name="Bamboo Organiser Set",
            description="6-piece bamboo drawer organiser. Sustainable and eco-friendly. Fits most standard dresser drawers. Easy to assemble.",
            price=29.99, stock_quantity=60, category="Home",
            image_url="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600"
        ),

        # ── Sports ──
        models.Product(
            name="Yoga Mat Premium",
            description="6mm thick non-slip natural rubber mat with alignment lines. Includes carrying strap. 183cm × 61cm.",
            price=49.99, stock_quantity=70, category="Sports",
            image_url="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600"
        ),
        models.Product(
            name="Adjustable Dumbbell Set",
            description="Quick-adjust mechanism from 5kg to 24kg in 1.5kg increments. Replaces 15 individual dumbbells. Compact storage tray included.",
            price=219.99, stock_quantity=15, category="Sports",
            image_url="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600"
        ),
        models.Product(
            name="Resistance Bands Set (5)",
            description="5 bands from 10–50kg resistance. Latex-free, anti-snap design with fabric coating. Includes carry bag and door anchor.",
            price=27.99, stock_quantity=120, category="Sports",
            image_url="https://images.unsplash.com/photo-1598971457999-ca4ef48a9a71?w=600"
        ),
        models.Product(
            name="Insulated Water Bottle 1L",
            description="Triple-wall vacuum insulation keeps drinks cold 36hr, hot 18hr. BPA-free stainless steel, leak-proof lid.",
            price=34.99, stock_quantity=95, category="Sports",
            image_url="https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600"
        ),
    ]

    for p in products:
        db.add(p)

    db.commit()
    print(f"✅ Database seeded! {len(products)} products, 2 users added.")

if __name__ == "__main__":
    seed_db()
