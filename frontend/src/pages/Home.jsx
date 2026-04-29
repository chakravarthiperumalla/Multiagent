import { useState, useEffect } from 'react';
import api from '../api';
import ProductCard from '../components/ProductCard';
import { Search, Sparkles, ChevronRight, Bot, Cpu, ShieldCheck, Zap } from 'lucide-react';

const CATEGORIES = ['All', 'Electronics', 'Clothing', 'Footwear', 'Accessories', 'Home', 'Sports'];

const FEATURES = [
    { icon: Bot, title: 'AI-Powered Search', desc: 'Multi-agent AI finds exactly what you need instantly.' },
    { icon: Cpu, title: 'Smart Cart Manager', desc: 'Your personal AI agent handles your entire shopping journey.' },
    { icon: ShieldCheck, title: 'Order Tracking', desc: 'Dedicated agent monitors and reports all your orders in real time.' },
];

export default function Home() {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchProducts(); }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await api.get('/products');
            setProducts(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const filtered = products.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.category?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchCat = activeCategory === 'All' || p.category?.toLowerCase() === activeCategory.toLowerCase();
        return matchSearch && matchCat;
    });

    return (
        <div className="section-container py-8">
            {/* ── Hero ── */}
            <div className="relative overflow-hidden glass border-glow rounded-3xl p-10 md:p-16 mb-14 text-center">
                {/* Gradient blob */}
                <div className="absolute -top-20 -right-20 w-72 h-72 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

                <div className="relative">
                    <div className="inline-flex items-center gap-2 badge-violet mb-6">
                        <Sparkles className="w-3 h-3" />
                        Multi-Agent AI Platform
                    </div>
                    <h1 className="text-5xl md:text-7xl font-display font-extrabold mb-6 leading-tight">
                        Shop Smarter<br />
                        <span className="gradient-text">with AI Agents</span>
                    </h1>
                    <p className="text-white/50 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                        Your personal AI team — searching products, managing your cart, and
                        tracking orders all at the same time, in parallel.
                    </p>

                    {/* Search */}
                    <div className="relative max-w-xl mx-auto group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-violet-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search products, categories…"
                            className="input-dark pl-12 pr-4 py-4 text-base w-full rounded-2xl"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap justify-center gap-8 mt-10 text-white/40 text-sm">
                        <div><span className="text-white/80 font-bold text-2xl">{products.length}+</span><br />Products</div>
                        <div className="w-px bg-white/10" />
                        <div><span className="text-white/80 font-bold text-2xl">3</span><br />AI Agents</div>
                        <div className="w-px bg-white/10" />
                        <div><span className="text-white/80 font-bold text-2xl">∞</span><br />Parallel Tasks</div>
                    </div>
                </div>
            </div>

            {/* ── AI Features strip ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-14">
                {FEATURES.map(({ icon: Icon, title, desc }) => (
                    <div key={title} className="glass glass-hover p-6 flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600/30 to-indigo-600/30 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-5 h-5 text-violet-400" />
                        </div>
                        <div>
                            <h3 className="font-display font-semibold text-white text-sm mb-1">{title}</h3>
                            <p className="text-white/40 text-xs leading-relaxed">{desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Products ── */}
            <div>
                {/* Heading + category filter */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h2 className="font-display text-2xl font-bold text-white">
                            {activeCategory === 'All' ? 'All Products' : activeCategory}
                        </h2>
                        <p className="text-white/40 text-sm mt-1">{filtered.length} items available</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${activeCategory === cat
                                        ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-900/40'
                                        : 'border-white/10 text-white/50 hover:text-white hover:border-white/30 bg-white/[0.03]'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="skeleton h-80" />
                        ))}
                    </div>
                ) : filtered.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {filtered.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="glass rounded-2xl p-16 text-center">
                        <Search className="w-12 h-12 text-white/20 mx-auto mb-4" />
                        <p className="text-white/50 text-lg mb-2">No products found</p>
                        <p className="text-white/30 text-sm mb-6">Try adjusting your search or category filter</p>
                        <button
                            onClick={() => { setSearchTerm(''); setActiveCategory('All'); }}
                            className="btn-outline text-sm"
                        >
                            Clear filters <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
