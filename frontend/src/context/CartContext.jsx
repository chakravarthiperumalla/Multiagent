import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            fetchCart();
        } else {
            setCart([]);
        }
    }, [user]);

    const fetchCart = async () => {
        const res = await api.get('/cart');
        setCart(res.data);
    };

    const addToCart = async (productId, quantity = 1) => {
        await api.post('/cart', { product_id: productId, quantity });
        fetchCart();
    };

    const removeFromCart = async (productId) => {
        await api.delete(`/cart/${productId}`);
        fetchCart();
    };

    const cartTotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, cartTotal, fetchCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
