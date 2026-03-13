'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useLocation } from '@/context/LocationContext';
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
    const { location, locationName } = useLocation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [couriers, setCouriers] = useState<string[]>([]);
    const [selectedPayment, setSelectedPayment] = useState('');
    const [selectedCourier, setSelectedCourier] = useState('');
    const [proofOfPayment, setProofOfPayment] = useState('');
    const [uploading, setUploading] = useState(false);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        contactNumber: '',
        deliveryAddress: '',
        notes: '',
    });

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

    const handleProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            alert('Only image files are allowed (JPG, PNG, WebP, GIF)');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be under 5MB');
            return;
        }

        setUploading(true);
        const reader = new FileReader();
        reader.onload = () => {
            setProofOfPayment(reader.result as string);
            setUploading(false);
        };
        reader.onerror = () => {
            alert('Failed to read file. Please try again.');
            setUploading(false);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (items.length === 0) {
            alert('Your cart is empty');
            return;
        }

        if (!proofOfPayment) {
            alert('Please upload your proof of payment');
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
                        variationId: item.product.variationId,
                        productName: `${item.product.name} (${item.product.variationName})`,
                        price: item.product.price,
                        quantity: item.quantity,
                    })),
                    customer: formData,
                    location,
                    paymentMethod: selectedPayment,
                    proofOfPayment,
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
                            <div className="empty-icon">✨</div>
                            <h2>Your cart is empty</h2>
                            <p className="text-muted" style={{ marginBottom: '1.5rem' }}>Add some items to your cart before checking out</p>
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
                    <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                        <p style={{
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.2em',
                            color: 'var(--color-primary)',
                            fontWeight: 600,
                            marginBottom: '0.75rem',
                        }}>
                            Almost There
                        </p>
                        <h1>Checkout</h1>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gap: '2rem' }}>
                            <div>
                                <div className="card" style={{ marginBottom: '1.5rem' }}>
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

                                    {selectedCourier.toLowerCase() === 'lalamove' && location === 'bacoor' && (
                                        <div style={{
                                            marginTop: '0.5rem',
                                            padding: '1rem 1.25rem',
                                            background: 'linear-gradient(135deg, rgba(252, 231, 243, 0.5), rgba(233, 213, 255, 0.3))',
                                            borderRadius: 'var(--radius-lg)',
                                            border: '1px solid rgba(243, 209, 231, 0.6)',
                                            fontSize: '0.85rem',
                                            lineHeight: 1.6,
                                        }}>
                                            <p style={{ fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
                                                Lalamove Delivery
                                            </p>
                                            <p style={{ color: 'var(--color-text-muted)' }}>
                                                Hi, please fill out your delivery details with this link for a smooth delivery:{' '}
                                                <a
                                                    href="https://delivery.lalamove.com/forms/PH94e24f258b124b0087a0f3493a8e9bc1"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'underline' }}
                                                >
                                                    Fill out Lalamove delivery form
                                                </a>
                                            </p>
                                        </div>
                                    )}

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

                                    {selectedPaymentMethod && selectedPaymentMethod.qrCode && (
                                        <div style={{
                                            marginTop: '1.5rem',
                                            padding: '1.5rem',
                                            background: 'linear-gradient(135deg, rgba(252, 231, 243, 0.5), rgba(233, 213, 255, 0.3))',
                                            borderRadius: 'var(--radius-lg)',
                                            textAlign: 'center',
                                            border: '1px solid rgba(243, 209, 231, 0.5)',
                                        }}>
                                            <p style={{ marginBottom: '1rem', fontWeight: 700, color: 'var(--color-primary)', fontSize: '0.9rem' }}>
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
                                                    borderRadius: 'var(--radius-md)',
                                                    border: '2px solid var(--color-border)',
                                                    margin: '0 auto',
                                                }}
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                }}
                                            />
                                            <p style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                                Please include your name as payment reference
                                            </p>
                                        </div>
                                    )}

                                    <div style={{
                                        marginTop: '1.5rem',
                                        padding: '1.5rem',
                                        background: 'linear-gradient(135deg, rgba(252, 231, 243, 0.4), rgba(254, 243, 199, 0.3))',
                                        borderRadius: 'var(--radius-lg)',
                                        border: '1px solid rgba(243, 209, 231, 0.6)',
                                    }}>
                                        <p style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-primary)', fontSize: '0.9rem' }}>
                                            Upload Proof of Payment *
                                        </p>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                                            Please upload a screenshot of your payment receipt
                                        </p>

                                        {proofOfPayment ? (
                                            <div style={{ textAlign: 'center' }}>
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={proofOfPayment}
                                                    alt="Proof of payment"
                                                    style={{
                                                        maxWidth: '200px',
                                                        width: '100%',
                                                        height: 'auto',
                                                        borderRadius: 'var(--radius-md)',
                                                        border: '2px solid var(--color-border)',
                                                        marginBottom: '0.75rem',
                                                    }}
                                                />
                                                <div>
                                                    <button
                                                        type="button"
                                                        onClick={() => setProofOfPayment('')}
                                                        style={{
                                                            background: 'rgba(239, 68, 68, 0.08)',
                                                            color: '#ef4444',
                                                            border: '1px solid rgba(239, 68, 68, 0.2)',
                                                            padding: '0.5rem 1.25rem',
                                                            borderRadius: '9999px',
                                                            cursor: 'pointer',
                                                            fontSize: '0.8rem',
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        Remove & Re-upload
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <label style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                padding: '2rem',
                                                border: '2px dashed var(--color-border)',
                                                borderRadius: 'var(--radius-lg)',
                                                cursor: uploading ? 'wait' : 'pointer',
                                                background: 'rgba(255, 255, 255, 0.7)',
                                                transition: 'all 0.2s ease',
                                            }}>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleProofUpload}
                                                    disabled={uploading}
                                                    style={{ display: 'none' }}
                                                />
                                                <span style={{ fontSize: '2.5rem', marginBottom: '0.75rem', opacity: 0.5 }}>
                                                    {uploading ? '...' : '+'}
                                                </span>
                                                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                                                    {uploading ? 'Uploading...' : 'Tap to upload screenshot'}
                                                </span>
                                            </label>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="card" style={{ position: 'sticky', top: '5rem' }}>
                                    <h3 style={{ marginBottom: '1.5rem' }}>Order Summary</h3>

                                    <div style={{
                                        background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.08), rgba(236, 72, 153, 0.03))',
                                        border: '1px solid rgba(236, 72, 153, 0.2)',
                                        borderRadius: '9999px',
                                        padding: '0.5rem 1rem',
                                        marginBottom: '1rem',
                                        textAlign: 'center',
                                        fontSize: '0.8rem',
                                        fontWeight: 600,
                                        color: 'var(--color-primary)',
                                    }}>
                                        Shipping from: {locationName}
                                    </div>

                                    <div className="order-summary">
                                        {items.map(item => (
                                            <div key={item.product.variationId} className="summary-row">
                                                <span>
                                                    {item.product.name}
                                                    <span className="text-muted" style={{ fontSize: '0.8rem', display: 'block' }}>{item.product.variationName} × {item.quantity}</span>
                                                </span>
                                                <span style={{ fontWeight: 600 }}>₱{(item.product.price * item.quantity).toLocaleString()}</span>
                                            </div>
                                        ))}

                                        <div className="summary-row summary-total">
                                            <span>Total</span>
                                            <span>₱{total.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-primary btn-block btn-lg"
                                        disabled={isSubmitting}
                                        style={{ marginTop: '1.5rem' }}
                                    >
                                        {isSubmitting ? 'Placing Order...' : 'Place Order'}
                                    </button>

                                    <p className="text-muted" style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.75rem' }}>
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
