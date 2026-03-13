'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem } from '@/lib/types';

interface CartContextType {
    items: CartItem[];
    addItem: (cartProduct: CartItem['product'], quantity?: number) => void;
    removeItem: (variationId: string) => void;
    updateQuantity: (variationId: string, quantity: number) => void;
    clearCart: () => void;
    getQuantity: (variationId: string) => number;
    getStockUsedByProduct: (productId: string) => number;
    total: number;
    itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart));
            } catch {
                localStorage.removeItem('cart');
            }
        }
    }, []);

    // Save cart to localStorage on change
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(items));
    }, [items]);

    // Clear cart when location changes
    useEffect(() => {
        const handler = () => setItems([]);
        window.addEventListener('location-changed', handler);
        return () => window.removeEventListener('location-changed', handler);
    }, []);

    const addItem = (cartProduct: CartItem['product'], quantity = 1) => {
        setItems(prev => {
            const existing = prev.find(item => item.product.variationId === cartProduct.variationId);
            if (existing) {
                return prev.map(item =>
                    item.product.variationId === cartProduct.variationId
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prev, { product: cartProduct, quantity }];
        });
    };

    const removeItem = (variationId: string) => {
        setItems(prev => prev.filter(item => item.product.variationId !== variationId));
    };

    const updateQuantity = (variationId: string, quantity: number) => {
        if (quantity <= 0) {
            removeItem(variationId);
            return;
        }
        setItems(prev =>
            prev.map(item =>
                item.product.variationId === variationId ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setItems([]);
    };

    const getQuantity = (variationId: string): number => {
        const item = items.find(item => item.product.variationId === variationId);
        return item?.quantity || 0;
    };

    // Total stock units consumed by all variations of a product in cart
    const getStockUsedByProduct = (productId: string): number => {
        return items
            .filter(item => item.product.id === productId)
            .reduce((sum, item) => sum + item.quantity * item.product.unitsRequired, 0);
    };

    const total = items.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
    );

    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                items,
                addItem,
                removeItem,
                updateQuantity,
                clearCart,
                getQuantity,
                getStockUsedByProduct,
                total,
                itemCount,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
