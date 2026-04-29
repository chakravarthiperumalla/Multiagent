import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import AIWidget from './components/AIWidget';
import Home from './pages/Home';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import ProductDetails from './pages/ProductDetails';
import Profile from './pages/Profile';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return (
        <div className="flex items-center justify-center h-screen">
            <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );
    if (!user) return <Navigate to="/login" />;
    return children;
};

// Blocks non-admin users — redirects them to home even on direct URL access
const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return (
        <div className="flex items-center justify-center h-screen">
            <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );
    if (!user) return <Navigate to="/login" />;
    if (user.role !== 'admin') return <Navigate to="/" />;
    return children;
};

const App = () => {
    return (
        <AuthProvider>
            <CartProvider>
                <BrowserRouter>
                    {/* Background orbs */}
                    <div className="orb orb-1" />
                    <div className="orb orb-2" />
                    <div className="orb orb-3" />

                    <div className="relative min-h-screen flex flex-col z-10">
                        <Navbar />
                        <main className="flex-1">
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                                <Route path="/products/:id" element={<ProductDetails />} />
                                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                                <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/register" element={<Register />} />
                                <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                                <Route path="*" element={<Navigate to="/" />} />
                            </Routes>
                        </main>
                        <AIWidget />

                        {/* Footer */}
                        <footer className="relative border-t border-white/[0.06] py-8 mt-12">
                            <div className="section-container flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                                        <span className="text-[10px] font-bold text-white">S</span>
                                    </div>
                                    <span className="font-display font-semibold gradient-text">ShopEasy</span>
                                </div>
                                <p className="text-white/30 text-sm">© 2025 ShopEasy Multi-Agent. Powered by Gemini & LangGraph.</p>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                    <span className="text-white/40 text-xs">AI Agents Online</span>
                                </div>
                            </div>
                        </footer>
                    </div>
                </BrowserRouter>
            </CartProvider>
        </AuthProvider>
    );
};

export default App;
