import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Mail, Lock, User, Sparkles, Zap, CheckCircle2, ArrowRight } from 'lucide-react';

const PERKS = [
    { icon: '🛍️', label: 'Personalized catalog' },
    { icon: '🤖', label: 'AI agent assistant' },
    { icon: '📦', label: 'Order tracking' },
    { icon: '🛒', label: 'Your own private cart' },
];

export default function Register() {
    const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm: '' });
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

    const validate = () => {
        if (!form.full_name.trim()) return 'Please enter your full name.';
        if (!form.email.trim()) return 'Please enter your email.';
        if (form.password.length < 6) return 'Password must be at least 6 characters.';
        if (form.password !== form.confirm) return 'Passwords do not match.';
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const validErr = validate();
        if (validErr) { setError(validErr); return; }

        setLoading(true);
        try {
            await register(form.full_name.trim(), form.email.trim(), form.password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.detail || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const passwordStrength = () => {
        const p = form.password;
        if (!p) return null;
        if (p.length < 6) return { label: 'Weak', color: 'bg-red-500', width: 'w-1/4' };
        if (p.length < 10) return { label: 'Fair', color: 'bg-amber-500', width: 'w-2/4' };
        if (p.length < 14) return { label: 'Good', color: 'bg-blue-500', width: 'w-3/4' };
        return { label: 'Strong', color: 'bg-emerald-500', width: 'w-full' };
    };
    const strength = passwordStrength();

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 relative">
            {/* Background blobs */}
            <div className="absolute top-0 left-1/3 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-600/12 rounded-full blur-3xl pointer-events-none" />

            <div className="relative w-full max-w-lg animate-slide-up">
                <div className="glass border border-white/[0.1] rounded-3xl p-8 shadow-2xl shadow-black/50">

                    {/* Header */}
                    <div className="text-center mb-7">
                        <div className="w-14 h-14 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-900/50">
                            <Sparkles className="w-7 h-7 text-white" />
                        </div>
                        <h1 className="font-display text-3xl font-bold gradient-text mb-2">Create account</h1>
                        <p className="text-white/40 text-sm">Join ShopEasy — your personal AI-powered store</p>
                    </div>

                    {/* Perks row */}
                    <div className="grid grid-cols-4 gap-2 mb-7">
                        {PERKS.map(({ icon, label }) => (
                            <div key={label} className="glass-sm rounded-xl p-2 text-center">
                                <span className="text-lg">{icon}</span>
                                <p className="text-[9px] text-white/35 mt-1 leading-tight">{label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm mb-5 animate-slide-up">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Full Name */}
                        <div>
                            <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                <input
                                    type="text"
                                    required
                                    className="input-dark pl-10"
                                    placeholder="John Doe"
                                    value={form.full_name}
                                    onChange={set('full_name')}
                                    autoComplete="name"
                                />
                            </div>
                        </div>

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
                                    value={form.email}
                                    onChange={set('email')}
                                    autoComplete="email"
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
                                    placeholder="Min. 6 characters"
                                    value={form.password}
                                    onChange={set('password')}
                                    autoComplete="new-password"
                                />
                                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {/* Strength bar */}
                            {strength && (
                                <div className="mt-2 flex items-center gap-2">
                                    <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full transition-all duration-500 ${strength.color} ${strength.width}`} />
                                    </div>
                                    <span className={`text-[10px] font-semibold ${strength.color.replace('bg-', 'text-')}`}>{strength.label}</span>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                <input
                                    type={showConfirm ? 'text' : 'password'}
                                    required
                                    className={`input-dark pl-10 pr-12 transition-all ${form.confirm && form.password === form.confirm ? 'border-emerald-500/50' :
                                            form.confirm && form.password !== form.confirm ? 'border-red-500/50' : ''
                                        }`}
                                    placeholder="Re-enter password"
                                    value={form.confirm}
                                    onChange={set('confirm')}
                                    autoComplete="new-password"
                                />
                                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                                {form.confirm && form.password === form.confirm && (
                                    <CheckCircle2 className="absolute right-9 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                                )}
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full justify-center py-3.5 text-base mt-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Creating account…
                                </>
                            ) : (
                                <>
                                    <Zap className="w-4 h-4" />
                                    Create Account
                                    <ArrowRight className="w-4 h-4 ml-auto" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer link */}
                    <p className="text-center text-sm text-white/35 mt-6">
                        Already have an account?{' '}
                        <Link to="/login" className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">
                            Sign in instead
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
