import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - List all couriers (public)
export async function GET() {
    const { data, error } = await supabase
        .from('couriers')
        .select('name')
        .order('name');

    if (error) {
        console.error('Error fetching couriers:', error);
        return NextResponse.json([], { status: 200 });
    }

    return NextResponse.json(data.map(c => c.name));
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

        const { error } = await supabase
            .from('couriers')
            .insert({ name: name.trim() });

        if (error) {
            if (error.code === '23505') {
                return NextResponse.json({ error: 'Courier already exists' }, { status: 400 });
            }
            throw error;
        }

        const { data: couriers } = await supabase
            .from('couriers')
            .select('name')
            .order('name');

        return NextResponse.json({ success: true, couriers: (couriers || []).map(c => c.name) });
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

        const { error, count } = await supabase
            .from('couriers')
            .delete()
            .eq('name', name)
            .select();

        if (error) throw error;

        const { data: couriers } = await supabase
            .from('couriers')
            .select('name')
            .order('name');

        return NextResponse.json({ success: true, couriers: (couriers || []).map(c => c.name) });
    } catch (error) {
        console.error('Error deleting courier:', error);
        return NextResponse.json({ error: 'Failed to delete courier' }, { status: 500 });
    }
}
