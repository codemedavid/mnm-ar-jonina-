'use client';

import { Product } from '@/lib/types';
import { useCart } from '@/context/CartContext';
import { useState } from 'react';

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const { getQuantity, updateQuantity, addItem } = useCart();
    const quantity = getQuantity(product.id);
    const [imgError, setImgError] = useState(false);

    const handleIncrement = () => {
        if (quantity === 0) {
            addItem(product, 1);
        } else {
            updateQuantity(product.id, quantity + 1);
        }
    };

    const handleDecrement = () => {
        updateQuantity(product.id, quantity - 1);
    };

    // Use placeholder if image fails or not set
    const imageSrc = imgError ? '/placeholder.svg' : product.image;

    return (
        <div className="card product-card">
            <div className="product-image">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={imageSrc}
                    alt={product.name}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                    }}
                    onError={() => setImgError(true)}
                />
            </div>
            <h3 className="product-name">{product.name}</h3>
            <p className="product-description">{product.description}</p>
            <div className="product-price">₱{product.price.toLocaleString()}</div>

            {quantity === 0 ? (
                <button className="btn btn-primary btn-block" onClick={handleIncrement}>
                    Add to Order
                </button>
            ) : (
                <div className="quantity-selector">
                    <button className="quantity-btn" onClick={handleDecrement}>−</button>
                    <span className="quantity-value">{quantity}</span>
                    <button className="quantity-btn" onClick={handleIncrement}>+</button>
                </div>
            )}
        </div>
    );
}
