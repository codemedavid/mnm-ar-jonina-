import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

interface PaymentMethod {
    id: string;
    name: string;
    details: string;
    qrCode: string;
}

const DATA_FILE = path.join(process.cwd(), 'data', 'payment-methods.json');

async function getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf-8');
        return JSON.parse(data);
    } catch {
        return [];
    }
}

async function savePaymentMethods(methods: PaymentMethod[]): Promise<void> {
    await fs.writeFile(DATA_FILE, JSON.stringify(methods, null, 2));
}

// GET - List all payment methods (public)
export async function GET() {
    const methods = await getPaymentMethods();
    return NextResponse.json(methods);
}

// POST - Add new payment method (admin only)
export async function POST(request: Request) {
    const { searchParams } = new URL(request.url);
    const adminKey = searchParams.get('adminKey');

    if (adminKey !== process.env.ADMIN_PASSWORD) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { name, details, qrCode } = await request.json();
        if (!name || !details) {
            return NextResponse.json({ error: 'Name and details are required' }, { status: 400 });
        }

        const methods = await getPaymentMethods();
        const id = name.toLowerCase().replace(/\s+/g, '-');

        if (methods.find(m => m.id === id)) {
            return NextResponse.json({ error: 'Payment method already exists' }, { status: 400 });
        }

        const newMethod: PaymentMethod = { id, name, details, qrCode: qrCode || '' };
        methods.push(newMethod);
        await savePaymentMethods(methods);

        return NextResponse.json({ success: true, methods });
    } catch (error) {
        console.error('Error adding payment method:', error);
        return NextResponse.json({ error: 'Failed to add payment method' }, { status: 500 });
    }
}

// PATCH - Update payment method (admin only)
export async function PATCH(request: Request) {
    const { searchParams } = new URL(request.url);
    const adminKey = searchParams.get('adminKey');

    if (adminKey !== process.env.ADMIN_PASSWORD) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id, name, details, qrCode } = await request.json();
        const methods = await getPaymentMethods();
        const index = methods.findIndex(m => m.id === id);

        if (index === -1) {
            return NextResponse.json({ error: 'Payment method not found' }, { status: 404 });
        }

        methods[index] = {
            ...methods[index],
            name: name || methods[index].name,
            details: details || methods[index].details,
            qrCode: qrCode !== undefined ? qrCode : methods[index].qrCode,
        };

        await savePaymentMethods(methods);
        return NextResponse.json({ success: true, methods });
    } catch (error) {
        console.error('Error updating payment method:', error);
        return NextResponse.json({ error: 'Failed to update payment method' }, { status: 500 });
    }
}

// DELETE - Remove payment method (admin only)
export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const adminKey = searchParams.get('adminKey');

    if (adminKey !== process.env.ADMIN_PASSWORD) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await request.json();
        const methods = await getPaymentMethods();
        const filtered = methods.filter(m => m.id !== id);

        if (filtered.length === methods.length) {
            return NextResponse.json({ error: 'Payment method not found' }, { status: 404 });
        }

        await savePaymentMethods(filtered);
        return NextResponse.json({ success: true, methods: filtered });
    } catch (error) {
        console.error('Error deleting payment method:', error);
        return NextResponse.json({ error: 'Failed to delete payment method' }, { status: 500 });
    }
}
