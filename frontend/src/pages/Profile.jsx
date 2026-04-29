import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Package, User, Mail, ShieldCheck, Calendar, MapPin, TrendingUp, Clock } from 'lucide-react';

const STATUS_STYLES = {
    Processing: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    Shipped: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    Delivered: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    Cancelled: 'bg-red-500/20 text-red-300 border-red-500/30',
};

export default function Profile() {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            api.get('/orders')
                .then(res => setOrders(res.data))
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [user]);

    if (!user) return (
        <div className="section-container py-20 text-center">
            <p className="text-white/50 text-lg">Please log in to view your profile.</p>
        </div>
    );

    const totalSpent = orders.reduce((sum, o) => sum + o.total_amount, 0);
    const initials = user.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

    return (
        <div className="section-container py-12 max-w-4xl">
            {/* Profile card */}
            <div className="glass rounded-3xl overflow-hidden mb-10 flex flex-col md:flex-row animate-slide-up">
                {/* Left - avatar */}
                <div className="relative bg-gradient-to-br from-violet-600/30 to-indigo-600/20 p-10 md:w-64 flex flex-col items-center justify-center text-center border-r border-white/[0.06]">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-3xl font-black font-display mb-4 shadow-xl shadow-violet-900/50">
                        {initials}
                    </div>
                    <h1 className="font-display font-bold text-white text-xl mb-1">{user.full_name}</h1>
                    <span className={`badge mt-1 ${user.role === 'admin' ? 'badge-violet' : 'badge-green'}`}>
                        {user.role}
                    </span>

                    {/* Quick stats */}
                    <div className="mt-6 w-full space-y-3">
                        <div className="glass-sm rounded-xl p-3 text-center">
                            <p className="text-white/30 text-[10px] uppercase tracking-wider">Total Orders</p>
                            <p className="font-display font-bold gradient-text text-xl">{orders.length}</p>
                        </div>
                        <div className="glass-sm rounded-xl p-3 text-center">
                            <p className="text-white/30 text-[10px] uppercase tracking-wider">Total Spent</p>
                            <p className="font-display font-bold gradient-text text-xl">${totalSpent.toFixed(2)}</p>
                        </div>
                    </div>
                </div>

                {/* Right - details */}
                <div className="p-8 flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6 content-start">
                    <h2 className="col-span-full font-display text-white/50 text-xs uppercase tracking-widest font-semibold">Account Details</h2>

                    {[
                        { icon: Mail, label: 'Email Address', val: user.email },
                        { icon: ShieldCheck, label: 'Account Status', val: 'Active & Verified' },
                        { icon: User, label: 'Role', val: user.role?.charAt(0).toUpperCase() + user.role?.slice(1) },
                        { icon: Calendar, label: 'Member Since', val: user.created_at ? new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long' }) : 'January 2025' },
                    ].map(({ icon: Icon, label, val }) => (
                        <div key={label} className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                                <Icon className="w-4 h-4 text-violet-400" />
                            </div>
                            <div>
                                <p className="text-white/30 text-[10px] uppercase tracking-wider font-semibold mb-0.5">{label}</p>
                                <p className="text-white/80 font-medium text-sm">{val}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Orders */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-violet-400" /> Order History
                    </h2>
                    <span className="badge-violet">{orders.length} orders</span>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}
                    </div>
                ) : orders.length === 0 ? (
                    <div className="glass rounded-2xl p-14 text-center">
                        <Package className="w-14 h-14 text-white/15 mx-auto mb-4 animate-float" />
                        <p className="text-white/40 font-medium">No orders yet</p>
                        <p className="text-white/25 text-sm mt-1">Start shopping and your orders will appear here</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order, idx) => (
                            <div
                                key={order.id}
                                className="glass glass-hover rounded-2xl p-6 animate-slide-up"
                                style={{ animationDelay: `${idx * 60}ms` }}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
                                            <Package className="w-5 h-5 text-violet-400" />
                                        </div>
                                        <div>
                                            <p className="font-display font-bold text-white">Order #{order.id}</p>
                                            <div className="flex items-center gap-1.5 text-white/30 text-xs mt-0.5">
                                                <Clock className="w-3 h-3" />
                                                {new Date(order.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="gradient-text font-bold text-xl">${order.total_amount.toFixed(2)}</p>
                                        </div>
                                        <span className={`badge border ${STATUS_STYLES[order.status] || STATUS_STYLES['Processing']}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="border-t border-white/[0.06] pt-3 flex items-center gap-2 text-sm">
                                    <MapPin className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
                                    <span className="text-white/30 text-xs">Ship to:</span>
                                    <span className="text-white/50 text-xs truncate italic">{order.shipping_address}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
