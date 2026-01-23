'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function CartFloat() {
    const { itemCount, total } = useCart();

    if (itemCount === 0) return null;

    return (
        <div className="cart-float">
            <Link href="/checkout" className="cart-button">
                <span>🛒</span>
                <span>Order Now</span>
                <span className="cart-count">{itemCount}</span>
                <span>₱{total.toLocaleString()}</span>
            </Link>
        </div>
    );
}
