import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'couriers.json');

async function getCouriers(): Promise<string[]> {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf-8');
        return JSON.parse(data);
    } catch {
        return [];
    }
}

async function saveCouriers(couriers: string[]): Promise<void> {
    await fs.writeFile(DATA_FILE, JSON.stringify(couriers, null, 2));
}

// GET - List all couriers (public)
export async function GET() {
    const couriers = await getCouriers();
    return NextResponse.json(couriers);
}

// POST - Add new courier (admin only)
export async function POST(request: Request) {
    const { searchParams } = new URL(request.url);
    const adminKey = searchParams.get('adminKey');

    if (adminKey !== process.env.ADMIN_PASSWORD) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { name } = await request.json();
        if (!name || typeof name !== 'string') {
            return NextResponse.json({ error: 'Courier name is required' }, { status: 400 });
        }

        const couriers = await getCouriers();
        if (couriers.includes(name)) {
            return NextResponse.json({ error: 'Courier already exists' }, { status: 400 });
        }

        couriers.push(name);
        await saveCouriers(couriers);

        return NextResponse.json({ success: true, couriers });
    } catch (error) {
        console.error('Error adding courier:', error);
        return NextResponse.json({ error: 'Failed to add courier' }, { status: 500 });
    }
}

// DELETE - Remove courier (admin only)
export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const adminKey = searchParams.get('adminKey');

    if (adminKey !== process.env.ADMIN_PASSWORD) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { name } = await request.json();
        const couriers = await getCouriers();
        const filtered = couriers.filter(c => c !== name);

        if (filtered.length === couriers.length) {
            return NextResponse.json({ error: 'Courier not found' }, { status: 404 });
        }

        await saveCouriers(filtered);
        return NextResponse.json({ success: true, couriers: filtered });
    } catch (error) {
        console.error('Error deleting courier:', error);
        return NextResponse.json({ error: 'Failed to delete courier' }, { status: 500 });
    }
}
