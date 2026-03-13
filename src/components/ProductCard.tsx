'use client';

import { Product, ProductVariation } from '@/lib/types';
import { useCart } from '@/context/CartContext';
import { useLocation } from '@/context/LocationContext';
import { useState } from 'react';

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const { getQuantity, updateQuantity, addItem, getStockUsedByProduct } = useCart();
    const { location } = useLocation();

    const locationStock = product.stock[location] ?? 0;

    const [selectedIndex, setSelectedIndex] = useState(() => {
        const available = product.variations.findIndex(v => locationStock >= Math.max(1, v.unitsRequired || 1));
        return available >= 0 ? available : 0;
    });
    const [imgError, setImgError] = useState(false);

    const variation = product.variations[selectedIndex];
    const totalStock = locationStock;
    const stockUsed = getStockUsedByProduct(product.id);
    const remainingStock = totalStock - stockUsed;

    const unitsReq = Math.max(1, variation.unitsRequired || 1);
    const isOutOfStock = totalStock <= 0 || remainingStock < unitsReq;
    const currentQty = getQuantity(variation.id);
    const unitsUsedByThis = currentQty * unitsReq;
    const stockAvailableForThis = remainingStock + unitsUsedByThis;
    const maxQty = Math.floor(stockAvailableForThis / unitsReq);

    const isLowStock = !isOutOfStock && totalStock > 0 && totalStock <= 5;

    const cartProduct = {
        id: product.id,
        name: product.name,
        variationId: variation.id,
        variationName: variation.name,
        price: variation.price,
        image: variation.image,
        unitsRequired: unitsReq,
    };

    const handleIncrement = () => {
        if (currentQty >= maxQty) return;
        if (currentQty === 0) {
            addItem(cartProduct, 1);
        } else {
            updateQuantity(variation.id, currentQty + 1);
        }
    };

    const handleDecrement = () => {
        updateQuantity(variation.id, currentQty - 1);
    };

    const handleVariationChange = (index: number) => {
        setSelectedIndex(index);
        setImgError(false);
    };

    const isVariationAvailable = (v: ProductVariation) => {
        const vUnits = Math.max(1, v.unitsRequired || 1);
        const usedByOthers = stockUsed - getQuantity(v.id) * vUnits;
        return (totalStock - usedByOthers) >= vUnits;
    };

    const imageSrc = imgError ? '/placeholder.svg' : variation.image;

    const isProductOutOfStock = totalStock <= 0;

    return (
        <div className="card product-card" style={{ opacity: isProductOutOfStock ? 0.55 : 1, position: 'relative' }}>
            {isProductOutOfStock && (
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
                    Only {totalStock} left
                </div>
            )}
            <div className="product-image">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={imageSrc}
                    alt={`${product.name} - ${variation.name}`}
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

            {/* Variation Selector */}
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.4rem',
                margin: '0.75rem 0',
            }}>
                {product.variations.map((v: ProductVariation, i: number) => {
                    const vAvailable = isVariationAvailable(v);
                    const vNotEnoughStock = totalStock < Math.max(1, v.unitsRequired || 1);
                    const isSelected = i === selectedIndex;
                    return (
                        <button
                            key={v.id}
                            type="button"
                            onClick={() => handleVariationChange(i)}
                            style={{
                                padding: '0.35rem 0.75rem',
                                borderRadius: '9999px',
                                fontSize: '0.72rem',
                                fontWeight: isSelected ? 700 : 500,
                                border: isSelected
                                    ? '2px solid var(--color-primary)'
                                    : '1.5px solid var(--color-border)',
                                background: isSelected
                                    ? 'linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(236, 72, 153, 0.05))'
                                    : 'transparent',
                                color: (vNotEnoughStock || (!vAvailable && !isSelected))
                                    ? '#a8a29e'
                                    : isSelected
                                        ? 'var(--color-primary)'
                                        : 'var(--color-text)',
                                cursor: 'pointer',
                                textDecoration: vNotEnoughStock ? 'line-through' : 'none',
                                opacity: vNotEnoughStock && !isSelected ? 0.6 : 1,
                                transition: 'all 0.15s ease',
                            }}
                        >
                            {v.name}
                        </button>
                    );
                })}
            </div>

            <div className="product-price">&#8369;{variation.price.toLocaleString()}</div>

            {isProductOutOfStock || isOutOfStock ? (
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
                    {isProductOutOfStock ? 'Sold Out' : 'Not Enough Stock'}
                </button>
            ) : currentQty === 0 ? (
                <button className="btn btn-primary btn-block" onClick={handleIncrement}>
                    Add to Order
                </button>
            ) : (
                <div className="quantity-selector">
                    <button className="quantity-btn" onClick={handleDecrement}>&#8722;</button>
                    <span className="quantity-value">{currentQty}</span>
                    <button
                        className="quantity-btn"
                        onClick={handleIncrement}
                        disabled={currentQty >= maxQty}
                        style={currentQty >= maxQty ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
                    >+</button>
                </div>
            )}
        </div>
    );
}
