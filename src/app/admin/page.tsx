'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Order, OrderStatus } from '@/lib/types';
import { BUSINESS_INFO } from '@/lib/products';
import ImageUpload from '@/components/admin/ImageUpload';

type Tab = 'orders' | 'products' | 'couriers' | 'payments';

interface PaymentMethod {
    id: string;
    name: string;
    details: string;
    qrCode: string;
}

export default function AdminDashboard() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [adminKey, setAdminKey] = useState('');
    const [activeTab, setActiveTab] = useState<Tab>('orders');

    useEffect(() => {
        const savedKey = localStorage.getItem('adminKey');
        if (savedKey) {
            setAdminKey(savedKey);
            setIsAuthenticated(true);
        }
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`/api/orders?adminKey=${encodeURIComponent(password)}`);
            if (res.ok) {
                setAdminKey(password);
                localStorage.setItem('adminKey', password);
                setIsAuthenticated(true);
            } else {
                alert('Invalid password');
            }
        } catch {
            alert('Login failed');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminKey');
        setIsAuthenticated(false);
        setAdminKey('');
    };

    if (!isAuthenticated) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
                padding: '1rem',
            }}>
                <div style={{
                    background: 'white',
                    padding: '2rem',
                    borderRadius: '1rem',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    maxWidth: '360px',
                    width: '100%',
                }}>
                    <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔐</div>
                        <h2 style={{ margin: 0, color: '#1f2937' }}>Admin Login</h2>
                        <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.25rem' }}>{BUSINESS_INFO.name}</p>
                    </div>
                    <form onSubmit={handleLogin}>
                        <input
                            type="password"
                            placeholder="Enter admin password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '0.875rem 1rem',
                                border: '2px solid #e5e7eb',
                                borderRadius: '0.5rem',
                                fontSize: '1rem',
                                marginBottom: '1rem',
                                boxSizing: 'border-box',
                            }}
                        />
                        <button type="submit" style={{
                            width: '100%',
                            padding: '0.875rem',
                            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            fontSize: '1rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                        }}>
                            Login
                        </button>
                    </form>
                    <p style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                        <Link href="/" style={{ color: '#6b7280', fontSize: '0.875rem', textDecoration: 'none' }}>← Back to Store</Link>
                    </p>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: 'orders' as Tab, label: 'Orders', icon: '📦' },
        { id: 'products' as Tab, label: 'Products', icon: '🏷️' },
        { id: 'couriers' as Tab, label: 'Couriers', icon: '🚚' },
        { id: 'payments' as Tab, label: 'Payments', icon: '💳' },
    ];

    return (
        <div style={{ minHeight: '100vh', background: '#f8f7ff' }}>
            {/* Header */}
            <header style={{
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                padding: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}>
                <div style={{ color: 'white' }}>
                    <span style={{ fontWeight: 700 }}>Admin</span>
                    <span style={{ opacity: 0.8, marginLeft: '0.5rem', fontSize: '0.875rem' }}>{BUSINESS_INFO.name}</span>
                </div>
                <button onClick={handleLogout} style={{
                    background: 'rgba(255,255,255,0.15)',
                    border: 'none',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                }}>
                    Logout
                </button>
            </header>

            {/* Tab Navigation */}
            <div style={{
                display: 'flex',
                background: 'white',
                borderBottom: '1px solid #e5e7eb',
            }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            flex: 1,
                            padding: '1rem',
                            border: 'none',
                            background: activeTab === tab.id ? '#f5f3ff' : 'white',
                            borderBottom: activeTab === tab.id ? '3px solid #7c3aed' : '3px solid transparent',
                            color: activeTab === tab.id ? '#7c3aed' : '#6b7280',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div style={{ padding: '1rem', maxWidth: '600px', margin: '0 auto' }}>
                {activeTab === 'orders' && <OrdersTab adminKey={adminKey} />}
                {activeTab === 'products' && <ProductsTab adminKey={adminKey} />}
                {activeTab === 'couriers' && <CouriersTab adminKey={adminKey} />}
                {activeTab === 'payments' && <PaymentsTab adminKey={adminKey} />}
            </div>
        </div>
    );
}

// ==================== ORDERS TAB ====================
function OrdersTab({ adminKey }: { adminKey: string }) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

    useEffect(() => {
        fetchOrders();
    }, [adminKey]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/orders?adminKey=${encodeURIComponent(adminKey)}`);
            if (res.ok) setOrders(await res.json());
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderNumber: string, status: OrderStatus, trackingNumber?: string, courier?: string) => {
        try {
            const res = await fetch(`/api/orders/${orderNumber}?adminKey=${encodeURIComponent(adminKey)}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, trackingNumber, courier }),
            });
            if (res.ok) {
                const updated = await res.json();
                setOrders(orders.map(o => o.orderNumber === orderNumber ? updated : o));
            }
        } catch {
            alert('Failed to update order');
        }
    };

    const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);
    const stats = {
        pending: orders.filter(o => o.status === 'pending').length,
        confirmed: orders.filter(o => o.status === 'confirmed').length,
        shipped: orders.filter(o => o.status === 'shipped').length,
        completed: orders.filter(o => o.status === 'completed').length,
    };

    const filters = [
        { id: 'all', label: `All (${orders.length})` },
        { id: 'pending', label: `Pending (${stats.pending})`, color: '#f59e0b' },
        { id: 'confirmed', label: `Confirmed (${stats.confirmed})`, color: '#3b82f6' },
        { id: 'shipped', label: `Shipped (${stats.shipped})`, color: '#8b5cf6' },
        { id: 'completed', label: `Done (${stats.completed})`, color: '#10b981' },
    ];

    return (
        <>
            {/* Refresh Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.75rem' }}>
                <button onClick={fetchOrders} style={{
                    background: 'white',
                    border: '1px solid #e5e7eb',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    color: '#6b7280',
                }}>
                    {loading ? '...' : '↻ Refresh'}
                </button>
            </div>

            {/* Filter Pills */}
            <div style={{
                display: 'flex',
                gap: '0.5rem',
                overflowX: 'auto',
                paddingBottom: '0.5rem',
                marginBottom: '1rem',
            }}>
                {filters.map(f => (
                    <button
                        key={f.id}
                        onClick={() => setFilter(f.id as OrderStatus | 'all')}
                        style={{
                            padding: '0.5rem 0.75rem',
                            borderRadius: '2rem',
                            border: 'none',
                            background: filter === f.id ? '#7c3aed' : 'white',
                            color: filter === f.id ? 'white' : '#6b7280',
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                        }}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Orders List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>Loading...</div>
                ) : filteredOrders.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '3rem 1rem',
                        background: 'white',
                        borderRadius: '0.75rem',
                        color: '#6b7280',
                    }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📦</div>
                        No orders found
                    </div>
                ) : (
                    filteredOrders.map(order => (
                        <OrderCard
                            key={order.orderNumber}
                            order={order}
                            isExpanded={expandedOrder === order.orderNumber}
                            onToggle={() => setExpandedOrder(expandedOrder === order.orderNumber ? null : order.orderNumber)}
                            onUpdate={updateOrderStatus}
                        />
                    ))
                )}
            </div>
        </>
    );
}

function OrderCard({ order, isExpanded, onToggle, onUpdate }: {
    order: Order;
    isExpanded: boolean;
    onToggle: () => void;
    onUpdate: (orderNumber: string, status: OrderStatus, trackingNumber?: string, courier?: string) => Promise<void>;
}) {
    const [status, setStatus] = useState(order.status);
    const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || '');
    const [courier, setCourier] = useState(order.courier || '');
    const [saving, setSaving] = useState(false);
    const [couriers, setCouriers] = useState<string[]>([]);

    useEffect(() => {
        fetch('/api/couriers').then(r => r.json()).then(setCouriers).catch(() => { });
    }, []);

    const handleSave = async () => {
        setSaving(true);
        await onUpdate(order.orderNumber, status, trackingNumber, courier);
        setSaving(false);
    };

    const statusColors: Record<string, string> = {
        pending: '#f59e0b',
        confirmed: '#3b82f6',
        shipped: '#8b5cf6',
        completed: '#10b981',
        cancelled: '#ef4444',
    };

    return (
        <div style={{
            background: 'white',
            borderRadius: '0.75rem',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        }}>
            {/* Header - Clickable */}
            <div onClick={onToggle} style={{
                padding: '1rem',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: isExpanded ? '#f9fafb' : 'white',
            }}>
                <div>
                    <div style={{ fontWeight: 600, color: '#1f2937', marginBottom: '0.25rem' }}>
                        {order.orderNumber}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        {order.customer.fullName} • ₱{order.total.toLocaleString()}
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{
                        background: statusColors[order.status] || '#6b7280',
                        color: 'white',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '1rem',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        textTransform: 'capitalize',
                    }}>
                        {order.status}
                    </span>
                    <span style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                        {isExpanded ? '▲' : '▼'}
                    </span>
                </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <div style={{ padding: '1rem', borderTop: '1px solid #f3f4f6' }}>
                    {/* Customer Info */}
                    <div style={{
                        background: '#f9fafb',
                        padding: '0.875rem',
                        borderRadius: '0.5rem',
                        marginBottom: '1rem',
                        fontSize: '0.875rem',
                    }}>
                        <div><strong>📧</strong> {order.customer.email}</div>
                        <div><strong>📱</strong> {order.customer.contactNumber}</div>
                        <div><strong>📍</strong> {order.customer.deliveryAddress}</div>
                        {order.courier && <div><strong>🚚</strong> {order.courier}</div>}
                        {order.notes && <div><strong>📝</strong> {order.notes}</div>}
                    </div>

                    {/* Proof of Payment */}
                    {order.proofOfPayment && (
                        <div style={{
                            background: '#f0fdf4',
                            border: '1px solid #bbf7d0',
                            padding: '0.875rem',
                            borderRadius: '0.5rem',
                            marginBottom: '1rem',
                            textAlign: 'center',
                        }}>
                            <div style={{ fontWeight: 600, fontSize: '0.8rem', color: '#166534', marginBottom: '0.5rem' }}>
                                Proof of Payment
                            </div>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={order.proofOfPayment}
                                alt="Proof of payment"
                                style={{
                                    maxWidth: '250px',
                                    width: '100%',
                                    height: 'auto',
                                    borderRadius: '0.5rem',
                                    border: '1px solid #d1d5db',
                                }}
                            />
                        </div>
                    )}

                    {/* Items */}
                    <div style={{ marginBottom: '1rem' }}>
                        {order.items.map((item, i) => (
                            <div key={i} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                padding: '0.5rem 0',
                                borderBottom: i < order.items.length - 1 ? '1px solid #f3f4f6' : 'none',
                                fontSize: '0.875rem',
                            }}>
                                <span>{item.product.name} × {item.quantity}</span>
                                <span style={{ fontWeight: 500 }}>₱{(item.product.price * item.quantity).toLocaleString()}</span>
                            </div>
                        ))}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '0.75rem 0 0',
                            fontWeight: 700,
                            color: '#7c3aed',
                        }}>
                            <span>Total</span>
                            <span>₱{order.total.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Update Form */}
                    <div style={{
                        background: '#f5f3ff',
                        padding: '1rem',
                        borderRadius: '0.5rem',
                    }}>
                        <div style={{ fontWeight: 600, marginBottom: '0.75rem', color: '#7c3aed', fontSize: '0.875rem' }}>
                            Update Order
                        </div>
                        <div style={{ display: 'grid', gap: '0.5rem' }}>
                            <select
                                value={status}
                                onChange={e => setStatus(e.target.value as OrderStatus)}
                                style={{ padding: '0.625rem', borderRadius: '0.375rem', border: '1px solid #e5e7eb', fontSize: '0.875rem' }}
                            >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="shipped">Shipped</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                            <select
                                value={courier}
                                onChange={e => setCourier(e.target.value)}
                                style={{ padding: '0.625rem', borderRadius: '0.375rem', border: '1px solid #e5e7eb', fontSize: '0.875rem' }}
                            >
                                <option value="">Select courier...</option>
                                {couriers.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <input
                                type="text"
                                placeholder="Tracking number"
                                value={trackingNumber}
                                onChange={e => setTrackingNumber(e.target.value)}
                                style={{ padding: '0.625rem', borderRadius: '0.375rem', border: '1px solid #e5e7eb', fontSize: '0.875rem' }}
                            />
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                style={{
                                    padding: '0.75rem',
                                    background: '#7c3aed',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '0.375rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                }}
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ==================== COURIERS TAB ====================
function CouriersTab({ adminKey }: { adminKey: string }) {
    const [couriers, setCouriers] = useState<string[]>([]);
    const [newCourier, setNewCourier] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchCouriers(); }, []);

    const fetchCouriers = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/couriers');
            if (res.ok) setCouriers(await res.json());
        } finally {
            setLoading(false);
        }
    };

    const addCourier = async () => {
        if (!newCourier.trim()) return;
        try {
            const res = await fetch(`/api/couriers?adminKey=${encodeURIComponent(adminKey)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newCourier.trim() }),
            });
            if (res.ok) {
                const data = await res.json();
                setCouriers(data.couriers);
                setNewCourier('');
            } else {
                const err = await res.json();
                alert(err.error);
            }
        } catch { alert('Failed to add courier'); }
    };

    const deleteCourier = async (name: string) => {
        if (!confirm(`Delete "${name}"?`)) return;
        try {
            const res = await fetch(`/api/couriers?adminKey=${encodeURIComponent(adminKey)}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            });
            if (res.ok) setCouriers((await res.json()).couriers);
        } catch { alert('Failed to delete courier'); }
    };

    return (
        <>
            {/* Add Form */}
            <div style={{
                background: 'white',
                padding: '1rem',
                borderRadius: '0.75rem',
                marginBottom: '1rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            }}>
                <div style={{ fontWeight: 600, marginBottom: '0.75rem', color: '#1f2937' }}>Add Courier</div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                        type="text"
                        placeholder="e.g., J&T Express"
                        value={newCourier}
                        onChange={e => setNewCourier(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addCourier()}
                        style={{
                            flex: 1,
                            padding: '0.75rem',
                            border: '1px solid #e5e7eb',
                            borderRadius: '0.5rem',
                        }}
                    />
                    <button onClick={addCourier} style={{
                        padding: '0.75rem 1.25rem',
                        background: '#7c3aed',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                    }}>
                        Add
                    </button>
                </div>
            </div>

            {/* List */}
            <div style={{
                background: 'white',
                borderRadius: '0.75rem',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid #f3f4f6', fontWeight: 600, color: '#1f2937' }}>
                    Couriers ({couriers.length})
                </div>
                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Loading...</div>
                ) : couriers.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>No couriers added</div>
                ) : (
                    couriers.map((courier, i) => (
                        <div key={courier} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.875rem 1rem',
                            borderBottom: i < couriers.length - 1 ? '1px solid #f3f4f6' : 'none',
                        }}>
                            <span style={{ fontSize: '0.9375rem' }}>🚚 {courier}</span>
                            <button onClick={() => deleteCourier(courier)} style={{
                                background: '#fef2f2',
                                border: 'none',
                                color: '#ef4444',
                                padding: '0.375rem 0.625rem',
                                borderRadius: '0.375rem',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                            }}>
                                Delete
                            </button>
                        </div>
                    ))
                )}
            </div>
        </>
    );
}

// ==================== PAYMENTS TAB ====================
function PaymentsTab({ adminKey }: { adminKey: string }) {
    const [methods, setMethods] = useState<PaymentMethod[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState({ name: '', details: '', qrCode: '' });

    useEffect(() => { fetchMethods(); }, []);

    const fetchMethods = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/payment-methods');
            if (res.ok) setMethods(await res.json());
        } finally {
            setLoading(false);
        }
    };

    const saveMethod = async () => {
        if (!form.name.trim() || !form.details.trim()) {
            alert('Name and details are required');
            return;
        }
        const url = `/api/payment-methods?adminKey=${encodeURIComponent(adminKey)}`;
        const method = editingId ? 'PATCH' : 'POST';
        const body = editingId ? { id: editingId, ...form } : form;

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (res.ok) {
                setMethods((await res.json()).methods);
                resetForm();
            } else {
                alert((await res.json()).error);
            }
        } catch { alert('Failed to save'); }
    };

    const deleteMethod = async (id: string) => {
        if (!confirm('Delete this payment method?')) return;
        try {
            const res = await fetch(`/api/payment-methods?adminKey=${encodeURIComponent(adminKey)}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });
            if (res.ok) setMethods((await res.json()).methods);
        } catch { alert('Failed to delete'); }
    };

    const startEdit = (m: PaymentMethod) => {
        setEditingId(m.id);
        setForm({ name: m.name, details: m.details, qrCode: m.qrCode });
        setShowForm(true);
    };

    const resetForm = () => {
        setForm({ name: '', details: '', qrCode: '' });
        setEditingId(null);
        setShowForm(false);
    };

    return (
        <>
            {/* Add/Edit Form */}
            {showForm ? (
                <div style={{
                    background: 'white',
                    padding: '1rem',
                    borderRadius: '0.75rem',
                    marginBottom: '1rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                }}>
                    <div style={{ fontWeight: 600, marginBottom: '0.75rem', color: '#1f2937' }}>
                        {editingId ? 'Edit' : 'Add'} Payment Method
                    </div>
                    <div style={{ display: 'grid', gap: '0.625rem' }}>
                        <input
                            type="text"
                            placeholder="Name (e.g., GCash)"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            style={{ padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
                        />
                        <textarea
                            placeholder="Details (e.g., 09XX XXX XXXX)"
                            value={form.details}
                            onChange={e => setForm({ ...form, details: e.target.value })}
                            rows={2}
                            style={{ padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', resize: 'vertical' }}
                        />
                        <input
                            type="text"
                            placeholder="QR Code path (optional)"
                            value={form.qrCode}
                            onChange={e => setForm({ ...form, qrCode: e.target.value })}
                            style={{ padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
                        />
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={saveMethod} style={{
                                flex: 1,
                                padding: '0.75rem',
                                background: '#7c3aed',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.5rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                            }}>
                                Save
                            </button>
                            <button onClick={resetForm} style={{
                                padding: '0.75rem 1rem',
                                background: '#f3f4f6',
                                color: '#6b7280',
                                border: 'none',
                                borderRadius: '0.5rem',
                                cursor: 'pointer',
                            }}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <button onClick={() => setShowForm(true)} style={{
                    width: '100%',
                    padding: '0.875rem',
                    background: '#7c3aed',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontWeight: 600,
                    marginBottom: '1rem',
                    cursor: 'pointer',
                }}>
                    + Add Payment Method
                </button>
            )}

            {/* List */}
            <div style={{
                background: 'white',
                borderRadius: '0.75rem',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid #f3f4f6', fontWeight: 600, color: '#1f2937' }}>
                    Payment Methods ({methods.length})
                </div>
                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Loading...</div>
                ) : methods.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>No payment methods added</div>
                ) : (
                    methods.map((m, i) => (
                        <div key={m.id} style={{
                            padding: '1rem',
                            borderBottom: i < methods.length - 1 ? '1px solid #f3f4f6' : 'none',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>💳 {m.name}</div>
                                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{m.details}</div>
                                    {m.qrCode && <div style={{ fontSize: '0.75rem', color: '#7c3aed', marginTop: '0.25rem' }}>QR: {m.qrCode}</div>}
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button onClick={() => startEdit(m)} style={{
                                        background: '#f3f4f6',
                                        border: 'none',
                                        padding: '0.375rem 0.625rem',
                                        borderRadius: '0.375rem',
                                        cursor: 'pointer',
                                        fontSize: '0.75rem',
                                    }}>
                                        Edit
                                    </button>
                                    <button onClick={() => deleteMethod(m.id)} style={{
                                        background: '#fef2f2',
                                        border: 'none',
                                        color: '#ef4444',
                                        padding: '0.375rem 0.625rem',
                                        borderRadius: '0.375rem',
                                        cursor: 'pointer',
                                        fontSize: '0.75rem',
                                    }}>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </>
    );
}

// ==================== PRODUCTS TAB ====================
interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    soldOut?: boolean;
}

function ProductsTab({ adminKey }: { adminKey: string }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState({ name: '', description: '', price: '', image: '', category: '' });

    useEffect(() => { fetchProducts(); }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/products');
            if (res.ok) setProducts(await res.json());
        } finally {
            setLoading(false);
        }
    };

    const saveProduct = async () => {
        if (!form.name.trim() || !form.price) {
            alert('Name and price are required');
            return;
        }
        const url = `/api/products?adminKey=${encodeURIComponent(adminKey)}`;
        const method = editingId ? 'PATCH' : 'POST';
        const body = editingId
            ? { id: editingId, ...form, price: Number(form.price) }
            : { ...form, price: Number(form.price) };

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (res.ok) {
                setProducts((await res.json()).products);
                resetForm();
            } else {
                alert((await res.json()).error);
            }
        } catch { alert('Failed to save'); }
    };

    const deleteProduct = async (id: string) => {
        if (!confirm('Delete this product?')) return;
        try {
            const res = await fetch(`/api/products?adminKey=${encodeURIComponent(adminKey)}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });
            if (res.ok) setProducts((await res.json()).products);
        } catch { alert('Failed to delete'); }
    };

    const toggleSoldOut = async (p: Product) => {
        try {
            const res = await fetch(`/api/products?adminKey=${encodeURIComponent(adminKey)}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: p.id, soldOut: !p.soldOut }),
            });
            if (res.ok) setProducts((await res.json()).products);
        } catch { alert('Failed to update'); }
    };

    const startEdit = (p: Product) => {
        setEditingId(p.id);
        setForm({
            name: p.name,
            description: p.description,
            price: String(p.price),
            image: p.image,
            category: p.category
        });
        setShowForm(true);
    };

    const resetForm = () => {
        setForm({ name: '', description: '', price: '', image: '', category: '' });
        setEditingId(null);
        setShowForm(false);
    };

    return (
        <>
            {/* Add/Edit Form */}
            {showForm ? (
                <div style={{
                    background: 'white',
                    padding: '1rem',
                    borderRadius: '0.75rem',
                    marginBottom: '1rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                }}>
                    <div style={{ fontWeight: 600, marginBottom: '0.75rem', color: '#1f2937' }}>
                        {editingId ? 'Edit' : 'Add'} Product
                    </div>
                    <div style={{ display: 'grid', gap: '0.625rem' }}>
                        <input
                            type="text"
                            placeholder="Product name *"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            style={{ padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
                        />
                        <textarea
                            placeholder="Description"
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            rows={2}
                            style={{ padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', resize: 'vertical' }}
                        />
                        <input
                            type="number"
                            placeholder="Price (₱) *"
                            value={form.price}
                            onChange={e => setForm({ ...form, price: e.target.value })}
                            style={{ padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
                        />
                        <input
                            type="text"
                            placeholder="Category (e.g., Vials Only)"
                            value={form.category}
                            onChange={e => setForm({ ...form, category: e.target.value })}
                            style={{ padding: '0.75rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
                        />
                        <ImageUpload
                            value={form.image}
                            onChange={(url) => setForm({ ...form, image: url })}
                        />
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={saveProduct} style={{
                                flex: 1,
                                padding: '0.75rem',
                                background: '#7c3aed',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.5rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                            }}>
                                Save
                            </button>
                            <button onClick={resetForm} style={{
                                padding: '0.75rem 1rem',
                                background: '#f3f4f6',
                                color: '#6b7280',
                                border: 'none',
                                borderRadius: '0.5rem',
                                cursor: 'pointer',
                            }}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <button onClick={() => setShowForm(true)} style={{
                    width: '100%',
                    padding: '0.875rem',
                    background: '#7c3aed',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontWeight: 600,
                    marginBottom: '1rem',
                    cursor: 'pointer',
                }}>
                    + Add Product
                </button>
            )}

            {/* List */}
            <div style={{
                background: 'white',
                borderRadius: '0.75rem',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            }}>
                <div style={{ padding: '1rem', borderBottom: '1px solid #f3f4f6', fontWeight: 600, color: '#1f2937' }}>
                    Products ({products.length})
                </div>
                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Loading...</div>
                ) : products.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>No products added</div>
                ) : (
                    products.map((p, i) => (
                        <div key={p.id} style={{
                            padding: '1rem',
                            borderBottom: i < products.length - 1 ? '1px solid #f3f4f6' : 'none',
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        {p.name}
                                        {p.soldOut && (
                                            <span style={{
                                                background: '#ef4444',
                                                color: 'white',
                                                padding: '0.125rem 0.5rem',
                                                borderRadius: '1rem',
                                                fontSize: '0.625rem',
                                                fontWeight: 700,
                                                textTransform: 'uppercase',
                                            }}>
                                                Sold Out
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>{p.description}</div>
                                    <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.875rem' }}>
                                        <span style={{ color: '#7c3aed', fontWeight: 600 }}>₱{p.price.toLocaleString()}</span>
                                        <span style={{ color: '#9ca3af' }}>{p.category}</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                    <button onClick={() => toggleSoldOut(p)} style={{
                                        background: p.soldOut ? '#d1fae5' : '#fef3c7',
                                        border: 'none',
                                        color: p.soldOut ? '#059669' : '#d97706',
                                        padding: '0.375rem 0.625rem',
                                        borderRadius: '0.375rem',
                                        cursor: 'pointer',
                                        fontSize: '0.75rem',
                                    }}>
                                        {p.soldOut ? 'Mark In Stock' : 'Mark Sold Out'}
                                    </button>
                                    <button onClick={() => startEdit(p)} style={{
                                        background: '#f3f4f6',
                                        border: 'none',
                                        padding: '0.375rem 0.625rem',
                                        borderRadius: '0.375rem',
                                        cursor: 'pointer',
                                        fontSize: '0.75rem',
                                    }}>
                                        Edit
                                    </button>
                                    <button onClick={() => deleteProduct(p.id)} style={{
                                        background: '#fef2f2',
                                        border: 'none',
                                        color: '#ef4444',
                                        padding: '0.375rem 0.625rem',
                                        borderRadius: '0.375rem',
                                        cursor: 'pointer',
                                        fontSize: '0.75rem',
                                    }}>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </>
    );
}
