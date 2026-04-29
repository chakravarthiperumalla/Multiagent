import { useState, useEffect } from 'react';
import api from '../api';
import { Package, TrendingUp, RefreshCcw, LayoutDashboard, ShoppingBag, Users } from 'lucide-react';

const STATUS_STYLES = {
    Processing: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    Shipped: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
    Delivered: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    Cancelled: 'bg-red-500/20 text-red-300 border border-red-500/30',
};

export default function AdminDashboard() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => { fetchOrders(); }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await api.get('/orders');
            setOrders(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = filterStatus === 'all'
        ? orders
        : orders.filter(o => o.status?.toLowerCase() === filterStatus.toLowerCase());

    const totalRevenue = orders.reduce((acc, o) => acc + o.total_amount, 0);
    const avgOrder = orders.length ? totalRevenue / orders.length : 0;

    const STATS = [
        { label: 'Total Orders', value: orders.length, icon: ShoppingBag, from: 'from-violet-600', to: 'to-indigo-600' },
        { label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, icon: TrendingUp, from: 'from-emerald-600', to: 'to-teal-600' },
        { label: 'Avg Order Value', value: `$${avgOrder.toFixed(2)}`, icon: LayoutDashboard, from: 'from-amber-500', to: 'to-orange-500' },
    ];

    return (
        <div className="section-container py-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                <div>
                    <h1 className="font-display text-3xl font-bold gradient-text mb-1">Admin Dashboard</h1>
                    <p className="text-white/40 text-sm">Monitor orders, revenue, and fulfillment</p>
                </div>
                <button
                    onClick={fetchOrders}
                    className="btn-outline text-sm !py-2.5 self-start"
                >
                    <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Sync Data
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
                {STATS.map(({ label, value, icon: Icon, from, to }, i) => (
                    <div key={i} className="glass glass-hover rounded-2xl p-6 flex items-center gap-5 animate-slide-up" style={{ animationDelay: `${i * 80}ms` }}>
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${from} ${to} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                            <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-white/30 text-xs uppercase tracking-wider font-semibold mb-1">{label}</p>
                            <p className="font-display font-bold text-white text-2xl">{value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Orders table */}
            <div className="glass rounded-2xl overflow-hidden animate-slide-up" style={{ animationDelay: '240ms' }}>
                {/* Table header */}
                <div className="px-6 py-5 border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h3 className="font-display font-bold text-white text-lg flex items-center gap-2">
                        <Package className="w-5 h-5 text-violet-400" />
                        Order Management
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                        {['all', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(s => (
                            <button
                                key={s}
                                onClick={() => setFilterStatus(s)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${filterStatus === s
                                        ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/40'
                                        : 'glass-sm text-white/40 hover:text-white hover:border-white/20'
                                    }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/[0.05]">
                                {['Order ID', 'Shipping Address', 'Total', 'Status', 'Date'].map(h => (
                                    <th key={h} className="px-6 py-3.5 text-white/30 text-xs uppercase tracking-widest font-semibold">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan="5" className="px-6 py-4">
                                            <div className="skeleton h-8 rounded-lg" />
                                        </td>
                                    </tr>
                                ))
                            ) : filteredOrders.length > 0 ? (
                                filteredOrders.map((order, idx) => (
                                    <tr key={order.id} className="hover:bg-white/[0.03] transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className="font-mono font-bold text-violet-400 text-sm">#{order.id}</span>
                                        </td>
                                        <td className="px-6 py-4 max-w-xs">
                                            <p className="text-white/60 text-sm truncate">{order.shipping_address}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="gradient-text font-bold">${order.total_amount.toFixed(2)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`badge ${STATUS_STYLES[order.status] || STATUS_STYLES['Processing']}`}>
                                                {order.status || 'Processing'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-white/30 text-sm">
                                            {new Date(order.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-14 text-center text-white/30 font-medium">
                                        No orders match the selected filter.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                {!loading && filteredOrders.length > 0 && (
                    <div className="px-6 py-4 border-t border-white/[0.05] text-white/20 text-xs">
                        Showing {filteredOrders.length} of {orders.length} total orders
                    </div>
                )}
            </div>
        </div>
    );
}
