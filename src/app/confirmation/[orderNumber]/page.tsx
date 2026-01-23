import Link from 'next/link';
import { promises as fs } from 'fs';
import path from 'path';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Order } from '@/lib/types';
import { paymentMethods } from '@/lib/products';

async function getOrder(orderNumber: string): Promise<Order | null> {
    try {
        const dataPath = path.join(process.cwd(), 'data', 'orders.json');
        const data = await fs.readFile(dataPath, 'utf-8');
        const orders: Order[] = JSON.parse(data);
        return orders.find(order => order.orderNumber === orderNumber) || null;
    } catch {
        return null;
    }
}

export default async function ConfirmationPage({
    params,
}: {
    params: Promise<{ orderNumber: string }>;
}) {
    const { orderNumber } = await params;
    const order = await getOrder(orderNumber);
    const payment = paymentMethods.find(p => p.id === order?.paymentMethod);

    if (!order) {
        return (
            <>
                <Header />
                <main className="page">
                    <div className="container">
                        <div className="empty-state">
                            <div className="empty-icon">❌</div>
                            <h2>Order Not Found</h2>
                            <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
                                We couldn&apos;t find an order with that number.
                            </p>
                            <Link href="/" className="btn btn-primary">
                                Back to Shop
                            </Link>
                        </div>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <main className="page">
                <div className="container" style={{ maxWidth: '700px' }}>
                    <div className="card">
                        <div className="confirmation-success">
                            <div className="success-icon">✓</div>
                            <h1>Order Placed Successfully!</h1>
                            <p className="text-muted">Thank you for your order. We&apos;ve received it and will process it shortly.</p>

                            <div className="order-number-display">
                                {order.orderNumber}
                            </div>

                            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                                Save this order number to track your order
                            </p>
                        </div>

                        <div className="order-summary" style={{ marginTop: '2rem' }}>
                            <h3 style={{ marginBottom: '1rem' }}>Order Summary</h3>
                            {order.items.map((item, index) => (
                                <div key={index} className="summary-row">
                                    <span>{item.product.name} × {item.quantity}</span>
                                    <span>₱{(item.product.price * item.quantity).toLocaleString()}</span>
                                </div>
                            ))}
                            <div className="summary-row summary-total">
                                <span>Total</span>
                                <span>₱{order.total.toLocaleString()}</span>
                            </div>
                        </div>

                        {payment && (
                            <div className="alert alert-info" style={{ marginTop: '1.5rem' }}>
                                <strong>Payment Instructions ({payment.name}):</strong>
                                <p style={{ marginTop: '0.5rem' }}>{payment.details}</p>
                                {payment.id !== 'cod' && (
                                    <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                                        Please include your order number <strong>{order.orderNumber}</strong> in the payment reference/note.
                                    </p>
                                )}
                            </div>
                        )}

                        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <Link href="/track" className="btn btn-primary">
                                Track Your Order
                            </Link>
                            <Link href="/" className="btn btn-secondary">
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
