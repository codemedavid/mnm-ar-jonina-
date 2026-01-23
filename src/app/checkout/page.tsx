'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

interface PaymentMethod {
    id: string;
    name: string;
    details: string;
    qrCode: string;
}

export default function CheckoutPage() {
    const router = useRouter();
    const { items, total, clearCart, itemCount } = useCart();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [couriers, setCouriers] = useState<string[]>([]);
    const [selectedPayment, setSelectedPayment] = useState('');
    const [selectedCourier, setSelectedCourier] = useState('');

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        contactNumber: '',
        deliveryAddress: '',
        notes: '',
    });

    // Fetch couriers and payment methods on mount
    useEffect(() => {
        fetch('/api/couriers')
            .then(r => r.json())
            .then(data => setCouriers(data))
            .catch(() => { });
        fetch('/api/payment-methods')
            .then(r => r.json())
            .then(data => {
                setPaymentMethods(data);
                if (data.length > 0) setSelectedPayment(data[0].id);
            })
            .catch(() => { });
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (items.length === 0) {
            alert('Your cart is empty');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: items.map(item => ({
                        productId: item.product.id,
                        productName: item.product.name,
                        price: item.product.price,
                        quantity: item.quantity,
                    })),
                    customer: formData,
                    paymentMethod: selectedPayment,
                    courier: selectedCourier,
                    total,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                clearCart();
                router.push(`/confirmation/${data.orderNumber}`);
            } else {
                alert(data.error || 'Failed to place order. Please try again.');
            }
        } catch {
            alert('Failed to place order. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (itemCount === 0) {
        return (
            <>
                <Header />
                <main className="page">
                    <div className="container">
                        <div className="empty-state">
                            <div className="empty-icon">🛒</div>
                            <h2>Your cart is empty</h2>
                            <p className="text-muted">Add some items to your cart before checking out</p>
                            <Link href="/" className="btn btn-primary">
                                Browse Products
                            </Link>
                        </div>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    const selectedPaymentMethod = paymentMethods.find(p => p.id === selectedPayment);

    return (
        <>
            <Header />
            <main className="page">
                <div className="container">
                    <h1 style={{ marginBottom: '2rem' }}>Checkout</h1>

                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gap: '2rem' }}>
                            {/* Left Column - Forms */}
                            <div>
                                <div className="card">
                                    <h3 style={{ marginBottom: '1.5rem' }}>Customer Details</h3>

                                    <div className="form-group">
                                        <label className="form-label">Full Name *</label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            className="form-input"
                                            placeholder="Juan Dela Cruz"
                                            value={formData.fullName}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Email Address *</label>
                                        <input
                                            type="email"
                                            name="email"
                                            className="form-input"
                                            placeholder="your@email.com"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Contact Number *</label>
                                        <input
                                            type="tel"
                                            name="contactNumber"
                                            className="form-input"
                                            placeholder="09XX XXX XXXX"
                                            value={formData.contactNumber}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Delivery Address *</label>
                                        <textarea
                                            name="deliveryAddress"
                                            className="form-input"
                                            placeholder="House/Unit #, Street, Barangay, City, Province, ZIP"
                                            value={formData.deliveryAddress}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Preferred Courier *</label>
                                        <select
                                            className="form-input"
                                            value={selectedCourier}
                                            onChange={(e) => setSelectedCourier(e.target.value)}
                                            required
                                        >
                                            <option value="">Select courier...</option>
                                            {couriers.map(courier => (
                                                <option key={courier} value={courier}>{courier}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Order Notes (Optional)</label>
                                        <textarea
                                            name="notes"
                                            className="form-input"
                                            placeholder="Any special instructions..."
                                            value={formData.notes}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>

                                <div className="card">
                                    <h3 style={{ marginBottom: '1.5rem' }}>Payment Method</h3>
                                    <div className="payment-options">
                                        {paymentMethods.map(method => (
                                            <label
                                                key={method.id}
                                                className={`payment-option ${selectedPayment === method.id ? 'selected' : ''}`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="paymentMethod"
                                                    value={method.id}
                                                    checked={selectedPayment === method.id}
                                                    onChange={(e) => setSelectedPayment(e.target.value)}
                                                />
                                                <div className="payment-info">
                                                    <span className="payment-name">{method.name}</span>
                                                    <span className="payment-details">{method.details}</span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>

                                    {/* QR Code Display */}
                                    {selectedPaymentMethod && selectedPaymentMethod.qrCode && (
                                        <div style={{
                                            marginTop: '1.5rem',
                                            padding: '1rem',
                                            background: 'var(--color-bg-elevated)',
                                            borderRadius: '0.75rem',
                                            textAlign: 'center'
                                        }}>
                                            <p style={{ marginBottom: '1rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                                                Scan to Pay via {selectedPaymentMethod.name}
                                            </p>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={selectedPaymentMethod.qrCode}
                                                alt={`${selectedPaymentMethod.name} QR Code`}
                                                style={{
                                                    maxWidth: '200px',
                                                    width: '100%',
                                                    height: 'auto',
                                                    borderRadius: '0.5rem',
                                                    border: '2px solid var(--color-border)'
                                                }}
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                }}
                                            />
                                            <p style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                                                Please include your name as payment reference
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Column - Order Summary */}
                            <div>
                                <div className="card order-summary-card">
                                    <h3 style={{ marginBottom: '1.5rem' }}>Order Summary</h3>

                                    <div className="order-summary">
                                        {items.map(item => (
                                            <div key={item.product.id} className="summary-row">
                                                <span>
                                                    {item.product.name}
                                                    <span className="text-muted"> × {item.quantity}</span>
                                                </span>
                                                <span>₱{(item.product.price * item.quantity).toLocaleString()}</span>
                                            </div>
                                        ))}

                                        <div className="summary-row summary-total">
                                            <span>Total</span>
                                            <span>₱{total.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-primary btn-block"
                                        disabled={isSubmitting}
                                        style={{ marginTop: '1.5rem' }}
                                    >
                                        {isSubmitting ? 'Placing Order...' : 'Place Order'}
                                    </button>

                                    <p className="text-muted" style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.875rem' }}>
                                        By placing your order, you agree to our terms and conditions
                                    </p>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </main>
            <Footer />
        </>
    );
}
