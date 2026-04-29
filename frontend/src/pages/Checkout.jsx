import { useState } from 'react';
import { useCart } from '../context/CartContext';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ShieldCheck, CreditCard, MapPin, Package, Loader2 } from 'lucide-react';

export default function Checkout() {
    const { cart, cartTotal, fetchCart } = useCart();
    const [address, setAddress] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/orders', { shipping_address: address });
            setIsSuccess(true);
            fetchCart();
            setTimeout(() => navigate('/'), 4000);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="section-container py-20 flex items-center justify-center">
                <div className="glass rounded-3xl p-16 max-w-md text-center animate-scale-in">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-900/50">
                        <CheckCircle className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="font-display text-3xl font-bold text-white mb-3">Order Placed! 🎉</h2>
                    <p className="text-white/50 mb-6 leading-relaxed">Your order has been confirmed. Our AI Order Tracker will keep you updated on delivery status.</p>
                    <div className="glass-sm rounded-xl p-4 text-sm text-white/40 flex items-center gap-2 justify-center">
                        <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
                        Redirecting to homepage…
                    </div>
                </div>
            </div>
        );
    }

    if (cart.length === 0) {
        return (
            <div className="section-container py-20 text-center">
                <p className="text-white/50 text-lg mb-4">No items to checkout.</p>
                <button onClick={() => navigate('/')} className="btn-primary inline-flex">Go back to shop</button>
            </div>
        );
    }

    return (
        <div className="section-container py-12">
            <div className="mb-8">
                <h1 className="font-display text-3xl font-bold text-white mb-1">Complete Your Order</h1>
                <p className="text-white/40 text-sm">Secure checkout — your data is encrypted</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Left: form */}
                <form onSubmit={handlePlaceOrder} className="space-y-6">
                    {/* Shipping */}
                    <div className="glass p-7 rounded-2xl">
                        <h3 className="font-display font-bold text-white text-lg mb-5 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-violet-400" /> Shipping Details
                        </h3>
                        <div>
                            <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Full Delivery Address</label>
                            <textarea
                                required
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="House No, Street, City, PIN Code, State"
                                className="input-dark h-28 resize-none"
                            />
                        </div>
                    </div>

                    {/* Payment */}
                    <div className="glass p-7 rounded-2xl">
                        <h3 className="font-display font-bold text-white text-lg mb-5 flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-violet-400" /> Payment Method
                        </h3>
                        <div className="border-2 border-violet-500/40 bg-violet-500/10 rounded-xl p-4 flex items-center gap-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                <CreditCard className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-white text-sm">Demo Credit Card</p>
                                <p className="text-xs text-white/40">•••• •••• •••• 4242 — Secured</p>
                            </div>
                            <CheckCircle className="w-5 h-5 text-violet-400" />
                        </div>
                    </div>

                    {/* Security note */}
                    <div className="flex items-center gap-2 text-white/30 text-xs">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        256-bit SSL encryption. Your data is safe with us.
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full justify-center py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        {loading ? (
                            <><Loader2 className="w-5 h-5 animate-spin" /> Processing…</>
                        ) : (
                            <><CreditCard className="w-5 h-5" /> Pay ${cartTotal.toFixed(2)}</>
                        )}
                    </button>
                </form>

                {/* Right: order review */}
                <div className="glass rounded-2xl p-7 h-fit">
                    <h3 className="font-display font-bold text-white text-lg mb-5 flex items-center gap-2">
                        <Package className="w-5 h-5 text-violet-400" /> Order Review
                    </h3>
                    <div className="space-y-4 max-h-80 overflow-y-auto scrollbar-hide pr-1">
                        {cart.map(item => (
                            <div key={item.id} className="flex items-center gap-4">
                                <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-white/[0.08]">
                                    <img src={item.product.image_url || `https://picsum.photos/seed/${item.product.id}/100/100`} alt={item.product.name} className="w-full h-full object-cover" />
                                    <span className="absolute -top-1 -right-1 bg-violet-600 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{item.quantity}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-white text-sm truncate">{item.product.name}</p>
                                    <p className="text-white/40 text-xs capitalize">{item.product.category}</p>
                                </div>
                                <p className="text-violet-300 font-bold text-sm">${(item.product.price * item.quantity).toFixed(2)}</p>
                            </div>
                        ))}
                    </div>

                    {/* Totals */}
                    <div className="border-t border-white/[0.07] mt-5 pt-5 space-y-3">
                        <div className="flex justify-between text-sm text-white/40">
                            <span>Subtotal</span><span>${cartTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-white/40">Shipping</span>
                            <span className="text-emerald-400 font-medium">Free</span>
                        </div>
                        <div className="flex justify-between text-sm text-white/40">
                            <span>Tax</span><span>$0.00</span>
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t border-white/[0.07]">
                            <span className="font-display font-bold text-white text-lg">Total</span>
                            <span className="gradient-text font-bold text-2xl">${cartTotal.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
