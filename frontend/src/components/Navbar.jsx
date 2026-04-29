import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, LogOut, User as UserIcon, LayoutDashboard, Sparkles, Menu, X } from 'lucide-react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { cart } = useCart();
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const handleLogout = () => { logout(); navigate('/'); };

    const isActive = (path) => location.pathname === path;

    const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

    return (
        <nav className={`sticky top-0 z-50 transition-all duration-500 ${scrolled
            ? 'bg-[#0a0a0f]/90 backdrop-blur-2xl border-b border-white/[0.07] shadow-xl shadow-black/30'
            : 'bg-transparent'
            }`}>
            <div className="section-container">
                <div className="flex items-center justify-between h-16 md:h-18">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2.5 group">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-900/50 group-hover:scale-110 transition-transform duration-300">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xl font-bold font-display gradient-text">ShopEasy</span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-2">
                        <Link to="/" className={`btn-ghost text-sm ${isActive('/') ? 'text-white bg-white/10' : ''}`}>
                            Home
                        </Link>

                        {user?.role === 'admin' && (
                            <Link to="/admin" className={`btn-ghost text-sm ${isActive('/admin') ? 'text-white bg-white/10' : ''}`}>
                                <LayoutDashboard className="w-4 h-4" /> Dashboard
                            </Link>
                        )}
                    </div>

                    {/* Right Actions */}
                    <div className="hidden md:flex items-center gap-3">
                        {/* Cart */}
                        <Link to="/cart" className="relative group p-2.5 glass-sm hover:border-violet-500/40 transition-all duration-300 rounded-xl">
                            <ShoppingCart className="w-5 h-5 text-white/70 group-hover:text-violet-400 transition-colors" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-br from-violet-500 to-indigo-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg shadow-violet-900/60 animate-scale-in">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {user ? (
                            <div className="flex items-center gap-2">
                                <Link to="/profile" className="flex items-center gap-2.5 glass-sm hover:border-violet-500/40 px-4 py-2 rounded-xl transition-all duration-300 group">
                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
                                        <UserIcon className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <span className="text-sm font-medium text-white/80 group-hover:text-white">{user.full_name?.split(' ')[0] || 'Profile'}</span>
                                </Link>
                                <button onClick={handleLogout} className="p-2.5 glass-sm hover:border-red-500/40 hover:bg-red-500/10 rounded-xl transition-all duration-300 group">
                                    <LogOut className="w-4 h-4 text-white/50 group-hover:text-red-400 transition-colors" />
                                </button>
                            </div>
                        ) : (
                            <>
                                <Link to="/register" className="btn-outline text-sm !py-2.5 !px-4">
                                    Register
                                </Link>
                                <Link to="/login" className="btn-primary text-sm !py-2.5 !px-5">
                                    Sign In
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile toggle */}
                    <button className="md:hidden p-2 rounded-lg glass-sm" onClick={() => setMobileOpen(!mobileOpen)}>
                        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="md:hidden bg-[#0a0a0f]/95 backdrop-blur-2xl border-t border-white/[0.07] px-4 py-4 space-y-2 animate-slide-up">
                    <Link to="/" className="block btn-ghost w-full text-left" onClick={() => setMobileOpen(false)}>Home</Link>
                    <Link to="/cart" className="block btn-ghost w-full text-left" onClick={() => setMobileOpen(false)}>Cart ({cartCount})</Link>
                    {user ? (
                        <>
                            <Link to="/profile" className="block btn-ghost w-full text-left" onClick={() => setMobileOpen(false)}>Profile</Link>
                            {user.role === 'admin' && (
                                <Link to="/admin" className="block btn-ghost w-full text-left" onClick={() => setMobileOpen(false)}>Dashboard</Link>
                            )}
                            <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="block btn-ghost w-full text-left text-red-400">Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/register" className="block btn-outline w-full justify-center" onClick={() => setMobileOpen(false)}>Register</Link>
                            <Link to="/login" className="block btn-primary w-full justify-center" onClick={() => setMobileOpen(false)}>Sign In</Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
}
