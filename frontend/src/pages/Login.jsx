import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Mail, Lock, Sparkles, Zap } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.detail || 'Invalid credentials. Try the demo accounts below.');
        } finally {
            setLoading(false);
        }
    };

    const fillDemo = (type) => {
        if (type === 'admin') { setEmail('admin@shop.com'); setPassword('admin123'); }
        else { setEmail('user@shop.com'); setPassword('user123'); }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 relative">
            {/* Blobs */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative w-full max-w-md animate-slide-up">
                {/* Card */}
                <div className="glass border border-white/[0.1] rounded-3xl p-8 shadow-2xl shadow-black/50">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="w-14 h-14 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-900/50">
                            <Sparkles className="w-7 h-7 text-white" />
                        </div>
                        <h1 className="font-display text-3xl font-bold gradient-text mb-2">Welcome back</h1>
                        <p className="text-white/40 text-sm">Sign in to your ShopEasy account</p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm mb-6 animate-slide-up">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                <input
                                    type="email"
                                    required
                                    className="input-dark pl-10"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    required
                                    className="input-dark pl-10 pr-12"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full justify-center py-3.5 text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Signing in…
                                </>
                            ) : (
                                <>
                                    <Zap className="w-4 h-4" />
                                    Sign In
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-6">
                        <div className="flex-1 h-px bg-white/[0.07]" />
                        <span className="text-white/20 text-xs">Quick access</span>
                        <div className="flex-1 h-px bg-white/[0.07]" />
                    </div>

                    {/* Demo credentials */}
                    <div className="space-y-2">
                        <p className="text-white/30 text-xs text-center mb-3">Demo Accounts</p>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => fillDemo('admin')}
                                className="glass-sm hover:border-violet-500/40 px-4 py-2.5 rounded-xl text-xs text-center transition-all duration-200 group"
                            >
                                <p className="text-white/30 group-hover:text-violet-300 font-medium uppercase tracking-wider transition-colors">Admin</p>
                                <p className="text-white/50 mt-0.5 font-medium">admin@shop.com</p>
                            </button>
                            <button
                                onClick={() => fillDemo('user')}
                                className="glass-sm hover:border-violet-500/40 px-4 py-2.5 rounded-xl text-xs text-center transition-all duration-200 group"
                            >
                                <p className="text-white/30 group-hover:text-violet-300 font-medium uppercase tracking-wider transition-colors">User</p>
                                <p className="text-white/50 mt-0.5 font-medium">user@shop.com</p>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer link */}
                <p className="text-center text-sm text-white/35 mt-6">
                    New to ShopEasy?{' '}
                    <Link to="/register" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">
                        Create an account →
                    </Link>
                </p>
            </div>
        </div>
    );
}
