import { supabase } from './supabase';
import { Order } from './types';

// Generate unique order number
export function generateOrderNumber(): string {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ORD-${dateStr}-${random}`;
}

// Get all orders
export async function getOrders(): Promise<Order[]> {
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching orders:', error);
        return [];
    }

    return (data || []).map((row: any) => ({
        orderNumber: row.order_number,
        items: row.items,
        customer: row.customer,
        total: row.total,
        status: row.status,
        location: row.location || 'bacoor',
        paymentMethod: row.payment_method,
        proofOfPayment: row.proof_of_payment,
        courier: row.courier,
        trackingNumber: row.tracking_number,
        notes: row.notes,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    })) as Order[];
}

// Get order by order number
export async function getOrderByNumber(orderNumber: string): Promise<Order | null> {
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('order_number', orderNumber)
        .single();

    if (error) {
        if (error.code !== 'PGRST116') { // Ignore "not found" errors
            console.error('Error fetching order:', error);
        }
        return null;
    }

    // Transform DB fields to camelCase if needed, but Supabase usually returns as is if columns match.
    // However, our SQL uses snake_case and types use camelCase.
    // Let's assume we might need mapping or update the SQL to use quoted identifiers if strict mapping is needed.
    // For now, let's map manually to be safe, or just rely on the fact that JS handles it if we adjust types.
    // Actually, to keep it simple and consistent with the types:
    return {
        orderNumber: data.order_number,
        items: data.items,
        customer: data.customer,
        total: data.total,
        status: data.status,
        location: data.location || 'bacoor',
        paymentMethod: data.payment_method,
        proofOfPayment: data.proof_of_payment,
        courier: data.courier,
        trackingNumber: data.tracking_number,
        notes: data.notes,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
    } as Order;
}

// Create new order
export async function createOrder(orderData: Omit<Order, 'orderNumber' | 'status' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    const orderNumber = generateOrderNumber();
    const newOrder = {
        order_number: orderNumber,
        items: orderData.items,
        customer: orderData.customer,
        total: orderData.total,
        status: 'pending',
        location: orderData.location || 'bacoor',
        payment_method: orderData.paymentMethod,
        proof_of_payment: orderData.proofOfPayment || null,
        courier: orderData.courier || null,
        notes: orderData.notes || null,
        // created_at and updated_at are handled by default/DB
    };

    const { data, error } = await supabase
        .from('orders')
        .insert([newOrder])
        .select()
        .single();

    if (error) {
        console.error('Error creating order:', error);
        throw new Error('Failed to create order');
    }

    return {
        orderNumber: data.order_number,
        items: data.items,
        customer: data.customer,
        total: data.total,
        status: data.status,
        location: data.location || 'bacoor',
        paymentMethod: data.payment_method,
        proofOfPayment: data.proof_of_payment,
        courier: data.courier,
        trackingNumber: data.tracking_number,
        notes: data.notes,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
    } as Order;
}

// Update order
export async function updateOrder(orderNumber: string, updates: Partial<Order>): Promise<Order | null> {
    // Map updates to snake_case
    const dbUpdates: any = {};
    if (updates.status) dbUpdates.status = updates.status;
    if (updates.trackingNumber) dbUpdates.tracking_number = updates.trackingNumber;

    // Add other fields as needed, but usually we just update status/tracking

    const { data, error } = await supabase
        .from('orders')
        .update({ ...dbUpdates, updated_at: new Date().toISOString() })
        .eq('order_number', orderNumber)
        .select()
        .single();

    if (error) {
        console.error('Error updating order:', error);
        return null;
    }

    return {
        orderNumber: data.order_number,
        items: data.items,
        customer: data.customer,
        total: data.total,
        status: data.status,
        location: data.location || 'bacoor',
        paymentMethod: data.payment_method,
        proofOfPayment: data.proof_of_payment,
        courier: data.courier,
        trackingNumber: data.tracking_number,
        notes: data.notes,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
    } as Order;
}

// Delete order
export async function deleteOrder(orderNumber: string): Promise<boolean> {
    const { error } = await supabase
        .from('orders')
        .delete()
        .eq('order_number', orderNumber);

    if (error) {
        console.error('Error deleting order:', error);
        return false;
    }

    return true;
}
