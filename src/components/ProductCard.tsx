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

    const stock = product.stock ?? 999;
    const isOutOfStock = product.soldOut === true || stock <= 0;
    const isLowStock = !isOutOfStock && stock > 0 && stock <= 5;

    const handleIncrement = () => {
        if (quantity >= stock) return;
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
        <div className="card product-card" style={{ opacity: isOutOfStock ? 0.55 : 1, position: 'relative' }}>
            {isOutOfStock && (
                <div style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: 'white',
                    padding: '0.3rem 1rem',
                    borderRadius: '9999px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    zIndex: 2,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
                }}>
                    Sold Out
                </div>
            )}
            {isLowStock && (
                <div style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    color: 'white',
                    padding: '0.3rem 1rem',
                    borderRadius: '9999px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    zIndex: 2,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)',
                }}>
                    Only {stock} left
                </div>
            )}
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

            {isOutOfStock ? (
                <button className="btn btn-block" disabled style={{
                    background: 'rgba(0,0,0,0.06)',
                    color: '#a8a29e',
                    cursor: 'not-allowed',
                    border: '1.5px solid rgba(0,0,0,0.06)',
                    padding: '0.75rem',
                    borderRadius: '9999px',
                    fontWeight: 600,
                    letterSpacing: '0.05em',
                    fontSize: '0.875rem',
                }}>
                    Sold Out
                </button>
            ) : quantity === 0 ? (
                <button className="btn btn-primary btn-block" onClick={handleIncrement}>
                    Add to Order
                </button>
            ) : (
                <div className="quantity-selector">
                    <button className="quantity-btn" onClick={handleDecrement}>−</button>
                    <span className="quantity-value">{quantity}</span>
                    <button
                        className="quantity-btn"
                        onClick={handleIncrement}
                        disabled={quantity >= stock}
                        style={quantity >= stock ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
                    >+</button>
                </div>
            )}
        </div>
    );
}
