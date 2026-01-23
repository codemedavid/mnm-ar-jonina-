import { NextResponse } from 'next/server';
import { createOrder, getOrders } from '@/lib/orders';
import { sendAdminNotification, sendCustomerConfirmation } from '@/lib/email';
import { products } from '@/lib/products';
import { CartItem } from '@/lib/types';

// GET /api/orders - List all orders (for admin)
export async function GET(request: Request) {
    // Simple auth check via query param (for demo purposes)
    const { searchParams } = new URL(request.url);
    const adminKey = searchParams.get('adminKey');

    if (adminKey !== process.env.ADMIN_PASSWORD) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const orders = await getOrders();
        // Sort by newest first
        orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return NextResponse.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}

// POST /api/orders - Create new order
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { items, customer, paymentMethod, courier, total } = body;

        // Validate required fields
        if (!items || !items.length) {
            return NextResponse.json({ error: 'No items in order' }, { status: 400 });
        }

        if (!customer?.fullName || !customer?.email || !customer?.contactNumber || !customer?.deliveryAddress) {
            return NextResponse.json({ error: 'Missing customer information' }, { status: 400 });
        }

        // Map items to full product data
        const orderItems: CartItem[] = items.map((item: { productId: string; quantity: number }) => {
            const product = products.find(p => p.id === item.productId);
            if (!product) {
                throw new Error(`Product not found: ${item.productId}`);
            }
            return { product, quantity: item.quantity };
        });

        // Create order
        const order = await createOrder({
            items: orderItems,
            customer,
            paymentMethod,
            courier: courier || '',
            total,
        });

        // Send email notifications (don't block response)
        Promise.all([
            sendAdminNotification(order).catch(err => console.error('Admin email error:', err)),
            sendCustomerConfirmation(order).catch(err => console.error('Customer email error:', err)),
        ]);

        return NextResponse.json({
            success: true,
            orderNumber: order.orderNumber,
            message: 'Order placed successfully'
        });
    } catch (error) {
        console.error('Error creating order:', error);
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }
}
