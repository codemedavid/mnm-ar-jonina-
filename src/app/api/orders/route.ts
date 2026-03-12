import { NextResponse } from 'next/server';
import { createOrder, getOrders } from '@/lib/orders';
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
        const { items, customer, paymentMethod, proofOfPayment, courier, total } = body;

        // Validate required fields
        if (!items || !items.length) {
            return NextResponse.json({ error: 'No items in order' }, { status: 400 });
        }

        if (!customer?.fullName || !customer?.email || !customer?.contactNumber || !customer?.deliveryAddress) {
            return NextResponse.json({ error: 'Missing customer information' }, { status: 400 });
        }

        // Map items to cart item format using data sent from client
        const orderItems: CartItem[] = items.map((item: { productId: string; productName: string; price: number; quantity: number }) => {
            return {
                product: {
                    id: item.productId,
                    name: item.productName,
                    price: item.price,
                    description: '',
                    image: '',
                },
                quantity: item.quantity,
            };
        });

        // Create order
        const order = await createOrder({
            items: orderItems,
            customer,
            paymentMethod,
            proofOfPayment: proofOfPayment || '',
            courier: courier || '',
            total,
        });

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
