import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const { user } = useAuth();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            fetchCart();
        } else {
            setCart(null);
        }
    }, [user]);

    const fetchCart = async () => {
        setLoading(true);
        try {
            const response = await api.get('/cart');
            setCart(response.data);
        } catch (error) {
                console.error('Error fetching cart:', error);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (bookId, quantity = 1) => {
        try {
            const response = await api.post('/cart/items', { bookId, quantity });
            setCart(response.data);
        } catch (error) {
            console.error('Error adding to cart:', error);
            throw error;
        }
    };

    const updateCartItem = async (bookId, quantity) => {
        try {
            const response = await api.put('/cart/items', { bookId, quantity });
            setCart(response.data);
        } catch (error) {
            console.error('Error updating cart:', error);
            throw error;
        }
    };

    const removeFromCart = async (bookId) => {
        try {
            const response = await api.delete('/cart/items', { data: { bookId } });
            setCart(response.data);
        } catch (error) {
            console.error('Error removing from cart:', error);
            throw error;
        }
    };

    const clearCart = async () => {
        try {
            const response = await api.delete('/cart');
            setCart(response.data);
        } catch (error) {
            console.error('Error clearing cart:', error);
            throw error;
        }
    };

    // derived state
    const totalItems = cart?.totalItems || 0;

    return (
        <CartContext.Provider value={{ cart, addToCart, updateCartItem, removeFromCart, clearCart, totalItems, loading }}>
            {children}
        </CartContext.Provider>
    );
};
