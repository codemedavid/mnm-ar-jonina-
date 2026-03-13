'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Order, OrderStatus } from '@/lib/types';

const statusSteps: { status: OrderStatus; label: string; icon: string }[] = [
    { status: 'pending', label: 'Pending', icon: '⏳' },
    { status: 'confirmed', label: 'Confirmed', icon: '✓' },
    { status: 'shipped', label: 'Shipped', icon: '→' },
    { status: 'completed', label: 'Completed', icon: '✓' },
];

function getStatusIndex(status: OrderStatus): number {
    if (status === 'cancelled') return -1;
    return statusSteps.findIndex(s => s.status === status);
}

export default function TrackingPage() {
    const [orderNumber, setOrderNumber] = useState('');
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searched, setSearched] = useState(false);

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!orderNumber.trim()) {
            setError('Please enter an order number');
            return;
        }

        setLoading(true);
        setError('');
        setSearched(true);

        try {
            const response = await fetch(`/api/orders/${orderNumber.trim()}`);
            const data = await response.json();

            if (response.ok) {
                setOrder(data);
            } else {
                setOrder(null);
                setError(data.error || 'Order not found');
            }
        } catch {
            setError('Failed to track order. Please try again.');
            setOrder(null);
        } finally {
            setLoading(false);
        }
    };

    const currentIndex = order ? getStatusIndex(order.status) : -1;

    return (
        <>
            <Header />
            <main className="page">
                <div className="container" style={{ maxWidth: '800px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                        <p style={{
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.2em',
                            color: 'var(--color-primary)',
                            fontWeight: 600,
                            marginBottom: '0.75rem',
                        }}>
                            Order Status
                        </p>
                        <h1>Track Your Order</h1>
                        <p className="text-muted">Enter your order number to see the latest status</p>
                    </div>

                    <div className="card" style={{ marginBottom: '2rem' }}>
                        <form onSubmit={handleTrack} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Enter Order Number (e.g., ORD-20260123-0001)"
                                value={orderNumber}
                                onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                                style={{ flex: 1, minWidth: '200px' }}
                            />
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? 'Tracking...' : 'Track Order'}
                            </button>
                        </form>
                    </div>

                    {error && searched && (
                        <div className="alert alert-warning">
                            {error}
                        </div>
                    )}

                    {order && (
                        <div className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                                <div>
                                    <h2 style={{ marginBottom: '0.25rem' }}>{order.orderNumber}</h2>
                                    <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                                        Ordered on {new Date(order.createdAt).toLocaleDateString('en-PH', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                </div>
                                <span className={`status-badge status-${order.status}`}>
                                    {order.status}
                                </span>
                            </div>

                            {order.status !== 'cancelled' ? (
                                <div className="tracking-timeline">
                                    {statusSteps.map((step, index) => (
                                        <div
                                            key={step.status}
                                            className={`timeline-step ${index < currentIndex ? 'completed' : index === currentIndex ? 'active' : ''
                                                }`}
                                        >
                                            <div className="step-dot">{step.icon}</div>
                                            <div className="step-label">{step.label}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="alert" style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>
                                    This order has been cancelled.
                                </div>
                            )}

                            {order.trackingNumber && (
                                <div className="alert alert-info" style={{ marginTop: '1.5rem' }}>
                                    <strong>Shipping Information:</strong>
                                    <p style={{ marginTop: '0.5rem' }}>
                                        Courier: <strong>{order.courier || 'N/A'}</strong>
                                    </p>
                                    <p>
                                        Tracking Number: <strong>{order.trackingNumber}</strong>
                                    </p>
                                </div>
                            )}

                            <div className="order-summary" style={{ marginTop: '1.5rem' }}>
                                <h3 style={{ marginBottom: '1rem' }}>Order Details</h3>
                                {order.items.map((item, index) => (
                                    <div key={index} className="summary-row">
                                        <span>
                                            {item.product.name}
                                            {item.product.variationName && (
                                                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block' }}>{item.product.variationName} × {item.quantity}</span>
                                            )}
                                        </span>
                                        <span style={{ fontWeight: 600 }}>₱{(item.product.price * item.quantity).toLocaleString()}</span>
                                    </div>
                                ))}
                                <div className="summary-row summary-total">
                                    <span>Total</span>
                                    <span>₱{order.total.toLocaleString()}</span>
                                </div>
                            </div>

                            <div style={{ marginTop: '1.5rem' }}>
                                <h4 style={{ marginBottom: '0.5rem' }}>Shipping From</h4>
                                <p className="text-muted">{order.location === 'lucena' ? 'Lucena' : order.location === 'laguna' ? 'Laguna' : 'Bacoor Molino'}</p>
                            </div>

                            <div style={{ marginTop: '1.5rem' }}>
                                <h4 style={{ marginBottom: '0.5rem' }}>Delivery Address</h4>
                                <p className="text-muted">{order.customer.deliveryAddress}</p>
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
}
