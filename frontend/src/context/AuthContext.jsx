import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const res = await api.get('/users/me');
                    setUser(res.data);
                } catch {
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };
        fetchUser();
    }, []);

    const login = async (email, password) => {
        const formData = new FormData();
        formData.append('username', email);
        formData.append('password', password);
        const res = await api.post('/token', formData);
        localStorage.setItem('token', res.data.access_token);
        const userRes = await api.get('/users/me');
        setUser(userRes.data);
    };

    /**
     * Register a new customer account then auto-login.
     * Each registered user gets their own isolated cart, orders, and AI agent context.
     */
    const register = async (full_name, email, password) => {
        // 1. Create account
        await api.post('/register', { full_name, email, password, role: 'customer' });
        // 2. Immediately log in so the user is authenticated right away
        await login(email, password);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

