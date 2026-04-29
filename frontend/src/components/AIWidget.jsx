import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    MessageSquare, Send, X, Bot, Sparkles, Zap, ChevronDown,
    Search, ShoppingCart, Package, CheckCircle2, Clock,
    ShoppingBag, AlertCircle, RefreshCw, Trash2
} from 'lucide-react';
import api from '../api';
import { useCart } from '../context/CartContext';

// ── Agent metadata ────────────────────────────────────────────────────────────
const AGENTS = {
    ProductSearch: {
        label: 'Product Search',
        icon: Search,
        color: 'from-violet-600 to-purple-600',
        border: 'border-violet-500/40',
        bg: 'bg-violet-500/10',
        text: 'text-violet-300',
        pulse: 'bg-violet-400',
        desc: 'Searching catalog…',
    },
    CartManager: {
        label: 'Cart Manager',
        icon: ShoppingCart,
        color: 'from-blue-600 to-indigo-600',
        border: 'border-blue-500/40',
        bg: 'bg-blue-500/10',
        text: 'text-blue-300',
        pulse: 'bg-blue-400',
        desc: 'Managing cart…',
    },
    OrderTracker: {
        label: 'Order Tracker',
        icon: Package,
        color: 'from-emerald-600 to-teal-600',
        border: 'border-emerald-500/40',
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-300',
        pulse: 'bg-emerald-400',
        desc: 'Fetching orders…',
    },
};

const SUGGESTIONS = [
    'Show me headphones',
    "What's in my cart?",
    'Check my order status',
    'Browse all electronics',
];

// ── AgentStatusCard ──────────────────────────────────────────────────────────
function AgentStatusCard({ agentKey, status }) {
    const meta = AGENTS[agentKey];
    if (!meta) return null;
    const Icon = meta.icon;
    return (
        <div className={`flex items-center gap-2 px-2.5 py-2 rounded-xl border transition-all duration-500 ${status === 'idle' ? 'border-white/[0.07] bg-white/[0.03] opacity-35' :
                status === 'working' ? `${meta.border} ${meta.bg}` :
                    'border-white/10 bg-white/[0.03]'
            }`}>
            <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${meta.color} flex items-center justify-center flex-shrink-0 ${status === 'idle' ? 'grayscale opacity-40' : ''}`}>
                <Icon className="w-3 h-3 text-white" />
            </div>
            <div className="flex-1 min-w-0">
                <p className={`text-[10px] font-bold leading-none mb-0.5 ${status === 'idle' ? 'text-white/25' : meta.text}`}>
                    {meta.label}
                </p>
                <p className="text-[9px] text-white/25 leading-none truncate">
                    {status === 'working' ? meta.desc : status === 'done' ? 'Done ✓' : 'Standby'}
                </p>
            </div>
            <div className="flex-shrink-0">
                {status === 'working' && (
                    <span className="relative flex h-2 w-2">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${meta.pulse} opacity-75`} />
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${meta.pulse}`} />
                    </span>
                )}
                {status === 'done' && <CheckCircle2 className={`w-3.5 h-3.5 ${meta.text}`} />}
                {status === 'idle' && <Clock className="w-3 h-3 text-white/15" />}
            </div>
        </div>
    );
}

// ── Action Card ──────────────────────────────────────────────────────────────
function ActionCard({ action, onDismiss }) {
    const isCart = action.type === 'cart_updated';
    const isOrder = action.type === 'order_placed';

    return (
        <div className={`rounded-xl border p-3 flex items-start gap-3 animate-slide-up ${isCart ? 'bg-blue-500/10 border-blue-500/30' :
                isOrder ? 'bg-emerald-500/10 border-emerald-500/30' :
                    'bg-white/5 border-white/10'
            }`}>
            <span className="text-lg flex-shrink-0">{action.icon}</span>
            <div className="flex-1 min-w-0">
                <p className={`text-xs font-bold mb-0.5 ${isCart ? 'text-blue-300' : isOrder ? 'text-emerald-300' : 'text-white/60'
                    }`}>
                    {isCart ? 'Cart Updated' : isOrder ? 'Order Placed!' : 'Action'}
                </p>
                <p className="text-[11px] text-white/50 leading-relaxed">{action.message}</p>
            </div>
            <button onClick={onDismiss} className="text-white/20 hover:text-white/50 transition-colors flex-shrink-0">
                <X className="w-3 h-3" />
            </button>
        </div>
    );
}

// ── Rich message renderer ────────────────────────────────────────────────────
function MessageText({ content }) {
    // Render **bold**, bullet lists, and section headers nicely
    const lines = content.split('\n');
    return (
        <div className="space-y-0.5">
            {lines.map((line, i) => {
                if (!line.trim()) return <div key={i} className="h-1.5" />;

                // Section header like "🛍️ **Product Search**"
                if (/^[🛍️🛒📦]\s?\*\*/.test(line)) {
                    const text = line.replace(/\*\*(.*?)\*\*/g, '$1');
                    return <p key={i} className="font-bold text-violet-300 text-xs uppercase tracking-wider mb-1 mt-2 first:mt-0">{text}</p>;
                }
                // Horizontal divider
                if (line.trim() === '---') return <hr key={i} className="border-white/10 my-2" />;
                // Bullet points
                if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
                    const text = line.replace(/^[•\-\*]\s*/, '').replace(/\*\*(.*?)\*\*/g, '$1');
                    return (
                        <div key={i} className="flex gap-1.5">
                            <span className="text-violet-400 mt-0.5 flex-shrink-0 text-xs">•</span>
                            <p className="text-xs leading-relaxed">{text}</p>
                        </div>
                    );
                }
                // Inline bold
                const parts = line.split(/\*\*(.*?)\*\*/g);
                return (
                    <p key={i} className="text-sm leading-relaxed">
                        {parts.map((part, j) =>
                            j % 2 === 1
                                ? <strong key={j} className="text-white font-semibold">{part}</strong>
                                : part
                        )}
                    </p>
                );
            })}
        </div>
    );
}

// ── Main Widget ──────────────────────────────────────────────────────────────
const AIWidget = () => {
    const { fetchCart } = useCart();
    const navigate = useNavigate();

    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [agentStatus, setAgentStatus] = useState({});
    const [showAgentPanel, setShowAgentPanel] = useState(false);
    const panelTimerRef = useRef(null);

    // Full conversation history persisted for the entire session
    const [history, setHistory] = useState([]);
    // Messages for display (includes system action cards)
    const [messages, setMessages] = useState([{
        role: 'assistant',
        content: "Hi! 👋 I'm your AI Shopping Assistant powered by **3 parallel AI agents**.\n\nI can search products, manage your cart, and track orders — all at the same time!\n\nTry saying:",
        agents_used: [],
        actions: [],
        isWelcome: true,
    }]);

    const chatEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    useEffect(() => {
        if (isOpen) setTimeout(() => inputRef.current?.focus(), 200);
    }, [isOpen]);

    const resetAgents = useCallback(() => {
        setAgentStatus(Object.keys(AGENTS).reduce((a, k) => ({ ...a, [k]: 'idle' }), {}));
    }, []);

    const handleSend = useCallback(async (text) => {
        const content = (text || query).trim();
        if (!content || loading) return;

        // Add user message to display + history
        const userMsg = { role: 'user', content, agents_used: [], actions: [] };
        setMessages(prev => [...prev, userMsg]);
        setHistory(prev => [...prev, { role: 'user', content }]);
        setQuery('');
        setLoading(true);
        setShowAgentPanel(true);

        // Mark all agents as "working" in parallel
        setAgentStatus(Object.keys(AGENTS).reduce((a, k) => ({ ...a, [k]: 'working' }), {}));
        if (panelTimerRef.current) clearTimeout(panelTimerRef.current);

        try {
            const res = await api.post('/chat', {
                content,
                history: history.map(m => ({ role: m.role, content: m.content })),
            });

            const { response, agents_used = [], actions = [] } = res.data;

            // Update agent statuses based on who actually ran
            setAgentStatus(Object.keys(AGENTS).reduce((a, k) => ({
                ...a,
                [k]: agents_used.includes(k) ? 'done' : 'idle',
            }), {}));

            // Add assistant message to display
            const assistantMsg = { role: 'assistant', content: response, agents_used, actions };
            setMessages(prev => [...prev, assistantMsg]);

            // Add to conversation history (plain text only)
            setHistory(prev => [...prev, { role: 'assistant', content: response }]);

            // Trigger side effects for actions
            const hasCartAction = actions.some(a => a.type === 'cart_updated');
            const hasOrderAction = actions.some(a => a.type === 'order_placed');
            if (hasCartAction || hasOrderAction) {
                fetchCart(); // refresh cart context so navbar badge updates
            }

            // Auto-fade agent panel after 3.5 seconds
            panelTimerRef.current = setTimeout(() => setShowAgentPanel(false), 3500);
        } catch (err) {
            resetAgents();
            setShowAgentPanel(false);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "⚠️ Connection issue. Please make sure you're logged in and the backend server is running.",
                agents_used: [],
                actions: [],
            }]);
        } finally {
            setLoading(false);
        }
    }, [query, loading, history, fetchCart, resetAgents]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };

    const dismissAction = (msgIdx, actionIdx) => {
        setMessages(prev => prev.map((m, i) =>
            i === msgIdx
                ? { ...m, actions: m.actions.filter((_, ai) => ai !== actionIdx) }
                : m
        ));
    };

    const clearHistory = () => {
        setHistory([]);
        setMessages([{
            role: 'assistant',
            content: "Chat cleared! 🧹 How can I help you today?",
            agents_used: [],
            actions: [],
        }]);
    };

    const height = isExpanded ? 'h-[660px]' : 'h-[520px]';

    return (
        <div className="fixed bottom-6 right-6 z-[100]">
            {/* FAB */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="group relative w-14 h-14 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-full shadow-2xl shadow-violet-900/60 flex items-center justify-center hover:scale-110 transition-all duration-300 animate-bounce-subtle"
                >
                    <MessageSquare className="w-6 h-6 text-white" />
                    <span className="absolute inset-0 rounded-full bg-violet-500/30 animate-ping" />
                    <span className="absolute right-16 bg-[#1a1035] text-white text-xs px-3 py-1.5 rounded-lg border border-white/10 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-xl">
                        AI Shopping Assistant
                    </span>
                </button>
            )}

            {/* Chat panel */}
            {isOpen && (
                <div className={`w-[360px] md:w-[440px] ${height} glass border border-white/[0.1] shadow-2xl shadow-black/60 flex flex-col overflow-hidden animate-scale-in transition-all duration-300`}>

                    {/* Header */}
                    <div className="relative bg-gradient-to-r from-violet-700/90 to-indigo-700/90 px-4 py-3 flex items-center justify-between backdrop-blur-xl border-b border-white/10 flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-display font-bold text-white text-sm leading-none">AI Assistant</h3>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <Zap className="w-2.5 h-2.5 text-amber-300" />
                                    <p className="text-[10px] text-white/60">Multi-Agent · Gemini · {history.length > 0 ? `${Math.floor(history.length / 2)} turns` : 'New chat'}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            {history.length > 0 && (
                                <button onClick={clearHistory} title="Clear conversation" className="p-1.5 rounded-lg hover:bg-white/20 text-white/50 hover:text-white transition-all">
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            )}
                            <button onClick={() => setIsExpanded(!isExpanded)} className="p-1.5 rounded-lg hover:bg-white/20 text-white/60 hover:text-white transition-all">
                                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                            </button>
                            <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg hover:bg-white/20 text-white/60 hover:text-white transition-all">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Agent Activity Panel */}
                    <div className={`flex-shrink-0 transition-all duration-500 ease-in-out overflow-hidden ${(loading || showAgentPanel) ? 'max-h-28 opacity-100' : 'max-h-0 opacity-0'
                        }`}>
                        <div className="px-3 pt-2.5 pb-2 border-b border-white/[0.06] bg-black/10">
                            <div className="flex items-center gap-2 mb-2">
                                {loading && (
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500" />
                                    </span>
                                )}
                                <span className="text-[10px] font-semibold text-white/35 uppercase tracking-widest">
                                    {loading ? '⚡ Parallel Agents Running' : '✓ Completed'}
                                </span>
                            </div>
                            <div className="grid grid-cols-3 gap-1.5">
                                {Object.keys(AGENTS).map(key => (
                                    <AgentStatusCard key={key} agentKey={key} status={agentStatus[key] || 'idle'} />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                        {messages.map((msg, msgIdx) => (
                            <div key={msgIdx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}>
                                {msg.role === 'assistant' && (
                                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                                        <Sparkles className="w-3.5 h-3.5 text-white" />
                                    </div>
                                )}
                                <div className="max-w-[80%] flex flex-col gap-2">
                                    {/* Bubble */}
                                    <div className={`${msg.role === 'user'
                                            ? 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-lg shadow-violet-900/30 text-sm leading-relaxed'
                                            : 'glass-sm text-white/85 rounded-2xl rounded-tl-sm px-4 py-3'
                                        }`}>
                                        {msg.role === 'user'
                                            ? <p className="text-sm">{msg.content}</p>
                                            : <MessageText content={msg.content} />
                                        }

                                        {/* Quick suggestion chips on welcome */}
                                        {msg.isWelcome && (
                                            <div className="mt-3 flex flex-wrap gap-1.5">
                                                {SUGGESTIONS.map(s => (
                                                    <button key={s} onClick={() => handleSend(s)}
                                                        className="text-[11px] px-2.5 py-1 glass border border-violet-500/30 text-violet-300 hover:bg-violet-500/20 rounded-lg transition-all duration-200">
                                                        {s}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Agent attribution chips */}
                                    {msg.role === 'assistant' && msg.agents_used?.length > 0 && (
                                        <div className="flex flex-wrap gap-1 pl-1">
                                            {msg.agents_used.map(key => {
                                                const meta = AGENTS[key];
                                                if (!meta) return null;
                                                const Icon = meta.icon;
                                                return (
                                                    <span key={key} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${meta.bg} ${meta.border} ${meta.text}`}>
                                                        <Icon className="w-2.5 h-2.5" /> {meta.label}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Action cards */}
                                    {msg.role === 'assistant' && msg.actions?.length > 0 && (
                                        <div className="space-y-2 pl-1">
                                            {msg.actions.map((action, ai) => (
                                                <ActionCard
                                                    key={ai}
                                                    action={action}
                                                    onDismiss={() => dismissAction(msgIdx, ai)}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {loading && (
                            <div className="flex justify-start animate-fade-in">
                                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                                    <Sparkles className="w-3.5 h-3.5 text-white" />
                                </div>
                                <div className="glass-sm px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-2">
                                    <div className="flex gap-1">
                                        {[0, 150, 300].map(d => (
                                            <span key={d} className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                                        ))}
                                    </div>
                                    <span className="text-xs text-white/35 italic">Agents thinking…</span>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-3 border-t border-white/[0.07] bg-black/20 flex-shrink-0">
                        <div className="flex gap-2 items-end">
                            <textarea
                                ref={inputRef}
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Search products, manage cart, check orders…"
                                rows={1}
                                disabled={loading}
                                className="flex-1 input-dark text-sm resize-none max-h-24 overflow-y-auto scrollbar-hide"
                            />
                            <button
                                onClick={() => handleSend()}
                                disabled={loading || !query.trim()}
                                className="p-3 bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-xl disabled:opacity-40 hover:from-violet-500 hover:to-indigo-500 transition-all duration-200 hover:scale-105 active:scale-95 disabled:hover:scale-100 shadow-lg shadow-violet-900/40 flex-shrink-0"
                            >
                                {loading
                                    ? <RefreshCw className="w-4 h-4 animate-spin" />
                                    : <Send className="w-4 h-4" />
                                }
                            </button>
                        </div>
                        <div className="flex items-center justify-between mt-2 px-0.5">
                            <p className="text-[10px] text-white/20">Gemini · LangGraph Multi-Agent</p>
                            <p className="text-[10px] text-white/20">Enter to send · Shift+Enter for newline</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIWidget;
