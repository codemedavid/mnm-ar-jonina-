import { NextResponse } from 'next/server';
import { getOrderByNumber, updateOrder, deleteOrder } from '@/lib/orders';
import { sendStatusUpdateEmail } from '@/lib/email';

// GET /api/orders/[orderNumber] - Get single order for tracking
export async function GET(
    request: Request,
    { params }: { params: Promise<{ orderNumber: string }> }
) {
    try {
        const { orderNumber } = await params;
        const order = await getOrderByNumber(orderNumber);

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        return NextResponse.json(order);
    } catch (error) {
        console.error('Error fetching order:', error);
        return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
    }
}

// PATCH /api/orders/[orderNumber] - Update order (admin)
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ orderNumber: string }> }
) {
    try {
        // Simple auth check
        const { searchParams } = new URL(request.url);
        const adminKey = searchParams.get('adminKey');

        if (adminKey !== process.env.ADMIN_PASSWORD) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { orderNumber } = await params;
        const body = await request.json();
        const { status, trackingNumber, courier } = body;

        const existingOrder = await getOrderByNumber(orderNumber);
        if (!existingOrder) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        const previousStatus = existingOrder.status;

        const updatedOrder = await updateOrder(orderNumber, {
            ...(status && { status }),
            ...(trackingNumber !== undefined && { trackingNumber }),
            ...(courier !== undefined && { courier }),
        });

        if (!updatedOrder) {
            return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
        }

        // Send status update email if status changed
        if (status && status !== previousStatus) {
            sendStatusUpdateEmail(updatedOrder).catch(err =>
                console.error('Status email error:', err)
            );
        }

        return NextResponse.json(updatedOrder);
    } catch (error) {
        console.error('Error updating order:', error);
        return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }
}

// DELETE /api/orders/[orderNumber] - Delete order (admin)
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ orderNumber: string }> }
) {
    try {
        const { searchParams } = new URL(request.url);
        const adminKey = searchParams.get('adminKey');

        if (adminKey !== process.env.ADMIN_PASSWORD) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { orderNumber } = await params;
        const existingOrder = await getOrderByNumber(orderNumber);
        if (!existingOrder) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        const success = await deleteOrder(orderNumber);
        if (!success) {
            return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Order deleted' });
    } catch (error) {
        console.error('Error deleting order:', error);
        return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
    }
}
