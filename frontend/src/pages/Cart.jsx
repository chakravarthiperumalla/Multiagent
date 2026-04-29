import { useCart } from '../context/CartContext';
import { Trash2, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Cart() {
    const { cart, removeFromCart, cartTotal } = useCart();

    if (cart.length === 0) {
        return (
            <div className="section-container py-20 text-center">
                <div className="glass rounded-3xl p-16 max-w-lg mx-auto animate-slide-up">
                    <ShoppingBag className="w-16 h-16 text-white/20 mx-auto mb-6 animate-float" />
                    <h2 className="font-display text-3xl font-bold gradient-text mb-3">Your cart is empty</h2>
                    <p className="text-white/40 mb-8 leading-relaxed">You haven't added anything yet. Explore our collection and find something you love!</p>
                    <Link to="/" className="btn-primary inline-flex">
                        <ShoppingBag className="w-4 h-4" /> Start Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="section-container py-10">
            <div className="mb-8">
                <h1 className="font-display text-3xl font-bold text-white mb-1">Shopping Cart</h1>
                <p className="text-white/40 text-sm">{cart.length} item{cart.length !== 1 ? 's' : ''} in your cart</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart items */}
                <div className="lg:col-span-2 space-y-4">
                    {cart.map((item, idx) => (
                        <div
                            key={item.id}
                            className="glass glass-hover flex items-center gap-5 p-5 animate-slide-up"
                            style={{ animationDelay: `${idx * 60}ms` }}
                        >
                            <Link to={`/products/${item.product.id}`} className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-white/[0.08]">
                                <img
                                    src={item.product.image_url || `https://picsum.photos/seed/${item.product.id}/200/200`}
                                    alt={item.product.name}
                                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                                />
                            </Link>

                            <div className="flex-1 min-w-0">
                                <Link to={`/products/${item.product.id}`}>
                                    <h3 className="font-display font-semibold text-white hover:text-violet-300 transition-colors truncate">{item.product.name}</h3>
                                </Link>
                                <span className="badge-violet text-[10px] capitalize mt-1 inline-block">{item.product.category}</span>
                                <div className="mt-2 gradient-text font-bold text-lg">${item.product.price.toFixed(2)}</div>
                            </div>

                            <div className="flex items-center gap-4 flex-shrink-0">
                                <div className="glass-sm px-4 py-2 rounded-xl text-center">
                                    <p className="text-[10px] text-white/30 uppercase tracking-wider">Qty</p>
                                    <p className="font-bold text-white">{item.quantity}</p>
                                </div>

                                <div className="text-right hidden sm:block">
                                    <p className="text-[10px] text-white/30 uppercase tracking-wider">Subtotal</p>
                                    <p className="font-bold text-violet-300">${(item.product.price * item.quantity).toFixed(2)}</p>
                                </div>

                                <button
                                    onClick={() => removeFromCart(item.product.id)}
                                    className="btn-danger"
                                    title="Remove item"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Order Summary */}
                <div className="glass rounded-2xl p-7 h-fit sticky top-24 animate-slide-up">
                    <h3 className="font-display text-xl font-bold text-white mb-6">Order Summary</h3>

                    <div className="space-y-4 mb-6">
                        {cart.map(item => (
                            <div key={item.id} className="flex justify-between text-sm">
                                <span className="text-white/50 truncate mr-2">{item.product.name} ×{item.quantity}</span>
                                <span className="text-white/70 flex-shrink-0">${(item.product.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-white/[0.07] pt-4 space-y-3 mb-6">
                        <div className="flex justify-between text-sm text-white/50">
                            <span>Subtotal</span>
                            <span>${cartTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-white/50">Shipping</span>
                            <span className="text-emerald-400 font-medium">Free</span>
                        </div>
                        <div className="flex justify-between text-sm text-white/50">
                            <span>Tax</span>
                            <span>$0.00</span>
                        </div>
                    </div>

                    <div className="border-t border-white/[0.07] pt-4 mb-7">
                        <div className="flex justify-between items-center">
                            <span className="font-display font-bold text-lg text-white">Total</span>
                            <span className="gradient-text font-bold text-2xl">${cartTotal.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Promo code */}
                    <div className="flex gap-2 mb-6">
                        <div className="relative flex-1">
                            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                            <input type="text" placeholder="Promo code" className="input-dark pl-9 py-2.5 text-sm" />
                        </div>
                        <button className="btn-outline !px-4 !py-2.5 text-sm">Apply</button>
                    </div>

                    <Link
                        to="/checkout"
                        className="btn-primary w-full justify-center py-4 text-base"
                    >
                        Checkout <ArrowRight className="w-5 h-5 group-hover:translate-x-1" />
                    </Link>
                    <Link to="/" className="block text-center text-white/30 hover:text-white/60 text-sm mt-4 transition-colors">
                        ← Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
}
