import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { useCart } from '../context/CartContext';
import { Star, Minus, Plus, ShoppingCart, ArrowLeft, CheckCircle, Heart, Share2, Truck, RotateCcw, ShieldCheck } from 'lucide-react';

const PERKS = [
    { icon: Truck, label: 'Free Global Shipping', sub: 'Delivered in 3–5 days' },
    { icon: RotateCcw, label: '30-Day Returns', sub: 'Hassle-free returns' },
    { icon: ShieldCheck, label: '2-Year Warranty', sub: 'Fully covered' },
];

export default function ProductDetails() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [qty, setQty] = useState(1);
    const [added, setAdded] = useState(false);
    const [wishlisted, setWishlisted] = useState(false);
    const { addToCart } = useCart();
    const navigate = useNavigate();

    useEffect(() => {
        api.get(`/products/${id}`)
            .then(res => setProduct(res.data))
            .catch(err => console.error(err));
    }, [id]);

    if (!product) return (
        <div className="flex justify-center items-center h-[60vh]">
            <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const rating = ((product.id % 5) * 0.4 + 3.6).toFixed(1);
    const reviews = product.id * 7 % 80 + 20;

    const handleAddToCart = () => {
        addToCart(product.id);
        setAdded(true);
        setTimeout(() => setAdded(false), 2500);
    };

    return (
        <div className="section-container py-10">
            {/* Back */}
            <button
                onClick={() => navigate(-1)}
                className="btn-ghost flex items-center gap-2 mb-8 text-sm"
            >
                <ArrowLeft className="w-4 h-4" /> Back to Products
            </button>

            <div className="glass rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-0 animate-fade-in">
                {/* Image */}
                <div className="relative bg-white/[0.03] border-r border-white/[0.06] p-8 flex items-center justify-center min-h-[420px] group">
                    <img
                        src={product.image_url || `https://picsum.photos/seed/${product.id}/600/600`}
                        alt={product.name}
                        className="max-h-[420px] w-full object-contain group-hover:scale-105 transition-transform duration-700"
                    />
                    {/* Actions overlay */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                        <button
                            onClick={() => setWishlisted(!wishlisted)}
                            className={`p-2.5 glass-sm rounded-xl transition-all duration-300 ${wishlisted ? 'border-red-500/50 bg-red-500/20 text-red-400' : 'hover:border-white/20 text-white/40 hover:text-white'}`}
                        >
                            <Heart className={`w-4 h-4 ${wishlisted ? 'fill-red-400' : ''}`} />
                        </button>
                        <button className="p-2.5 glass-sm rounded-xl text-white/40 hover:text-white transition-all duration-300">
                            <Share2 className="w-4 h-4" />
                        </button>
                    </div>
                    {product.stock_quantity === 0 && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-l-3xl">
                            <span className="badge-red text-sm">Out of Stock</span>
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="p-8 md:p-10 flex flex-col">
                    <div className="mb-3">
                        <span className="badge-violet capitalize">{product.category}</span>
                    </div>

                    <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight">
                        {product.name}
                    </h1>

                    {/* Rating */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-4 h-4 ${i < Math.round(parseFloat(rating)) ? 'text-amber-400 fill-amber-400' : 'text-white/20'}`} />
                            ))}
                        </div>
                        <span className="text-amber-400 font-bold text-sm">{rating}</span>
                        <span className="text-white/30 text-sm">({reviews} reviews)</span>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-4 mb-6">
                        <span className="gradient-text text-4xl font-black">${product.price.toFixed(2)}</span>
                        <span className="text-white/30 line-through text-xl">${(product.price * 1.2).toFixed(2)}</span>
                        <span className="badge-green text-[10px]">20% OFF</span>
                    </div>

                    {/* Description */}
                    <p className="text-white/50 leading-relaxed mb-8 border-l-2 border-violet-500/40 pl-5">
                        {product.description || "Discover the perfect blend of style and performance. Crafted with premium materials for the modern lifestyle."}
                    </p>

                    {/* Stock */}
                    <div className="flex items-center gap-3 mb-6">
                        <span className="text-sm text-white/40 font-medium">Availability:</span>
                        <span className={`badge ${product.stock_quantity > 0 ? 'badge-green' : 'badge-red'}`}>
                            {product.stock_quantity > 0 ? `In Stock (${product.stock_quantity} left)` : 'Out of Stock'}
                        </span>
                    </div>

                    {/* Qty + CTA */}
                    <div className="flex items-center gap-4 mb-8">
                        <div className="flex items-center glass-sm rounded-xl overflow-hidden">
                            <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-4 py-3 text-white/60 hover:text-white hover:bg-white/10 transition-all">
                                <Minus className="w-4 h-4" />
                            </button>
                            <span className="px-5 font-bold text-white text-lg">{qty}</span>
                            <button onClick={() => setQty(q => q + 1)} className="px-4 py-3 text-white/60 hover:text-white hover:bg-white/10 transition-all">
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>

                        <button
                            onClick={handleAddToCart}
                            disabled={product.stock_quantity === 0}
                            className={`btn-primary flex-1 justify-center py-3.5 text-base disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 ${added ? '!from-emerald-600 !to-teal-600' : ''} transition-all duration-500`}
                        >
                            {added ? (
                                <><CheckCircle className="w-5 h-5" /> Added to Cart!</>
                            ) : (
                                <><ShoppingCart className="w-5 h-5" /> Add to Cart</>
                            )}
                        </button>
                    </div>

                    {/* Perks */}
                    <div className="grid grid-cols-3 gap-3 border-t border-white/[0.07] pt-6">
                        {PERKS.map(({ icon: Icon, label, sub }) => (
                            <div key={label} className="glass-sm p-3 rounded-xl text-center">
                                <Icon className="w-5 h-5 text-violet-400 mx-auto mb-1.5" />
                                <p className="text-white/70 text-[11px] font-semibold leading-tight">{label}</p>
                                <p className="text-white/30 text-[10px] mt-0.5">{sub}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
