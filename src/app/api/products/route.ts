import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { Product } from '@/lib/types';

const DATA_FILE = path.join(process.cwd(), 'data', 'products.json');

async function getProducts(): Promise<Product[]> {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf-8');
        return JSON.parse(data);
    } catch {
        return [];
    }
}

async function saveProducts(products: Product[]): Promise<void> {
    await fs.writeFile(DATA_FILE, JSON.stringify(products, null, 2));
}

// GET - List all products (public)
export async function GET() {
    const products = await getProducts();
    return NextResponse.json(products);
}

// POST - Add new product (admin only)
export async function POST(request: Request) {
    const { searchParams } = new URL(request.url);
    const adminKey = searchParams.get('adminKey');

    if (adminKey !== process.env.ADMIN_PASSWORD) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { name, description, stock, variations } = body;
        if (!name || !variations || variations.length === 0) {
            return NextResponse.json({ error: 'Name and at least one variation are required' }, { status: 400 });
        }

        const products = await getProducts();
        const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');

        let finalId = id;
        let counter = 1;
        while (products.find(p => p.id === finalId)) {
            finalId = `${id}-${counter}`;
            counter++;
        }

        // Handle stock: accept either { bacoor: N, lucena: N } or a single number (defaults both to that number)
        let stockObj: Record<string, number>;
        if (typeof stock === 'object' && stock !== null) {
            stockObj = { bacoor: Number(stock.bacoor) || 0, lucena: Number(stock.lucena) || 0, laguna: Number(stock.laguna) || 0 };
        } else {
            const stockNum = stock !== undefined ? Number(stock) : 0;
            stockObj = { bacoor: stockNum, lucena: 0, laguna: 0 };
        }

        const newProduct: Product = {
            id: finalId,
            name,
            description: description || '',
            stock: stockObj as Product['stock'],
            variations: variations.map((v: { id?: string; name: string; price: number; image?: string; unitsRequired?: number }) => ({
                id: v.id || `${finalId}-${v.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '')}`,
                name: v.name,
                price: Number(v.price),
                image: v.image || '/placeholder.svg',
                unitsRequired: v.unitsRequired ?? 1,
            })),
        };

        products.push(newProduct);
        await saveProducts(products);

        return NextResponse.json({ success: true, products });
    } catch (error) {
        console.error('Error adding product:', error);
        return NextResponse.json({ error: 'Failed to add product' }, { status: 500 });
    }
}

// PATCH - Update product (admin only)
export async function PATCH(request: Request) {
    const { searchParams } = new URL(request.url);
    const adminKey = searchParams.get('adminKey');

    if (adminKey !== process.env.ADMIN_PASSWORD) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { id, name, description, stock, variations } = body;
        const products = await getProducts();
        const index = products.findIndex(p => p.id === id);

        if (index === -1) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        // Handle stock update: accept object or number
        let stockObj = products[index].stock;
        if (stock !== undefined) {
            if (typeof stock === 'object' && stock !== null) {
                stockObj = {
                    bacoor: stock.bacoor !== undefined ? Number(stock.bacoor) : stockObj.bacoor,
                    lucena: stock.lucena !== undefined ? Number(stock.lucena) : stockObj.lucena,
                    laguna: stock.laguna !== undefined ? Number(stock.laguna) : stockObj.laguna,
                } as Product['stock'];
            } else {
                const stockNum = Number(stock);
                stockObj = { bacoor: stockNum, lucena: stockNum, laguna: stockNum } as Product['stock'];
            }
        }

        products[index] = {
            ...products[index],
            name: name || products[index].name,
            description: description !== undefined ? description : products[index].description,
            stock: stockObj,
            variations: variations || products[index].variations,
        };

        await saveProducts(products);
        return NextResponse.json({ success: true, products });
    } catch (error) {
        console.error('Error updating product:', error);
        return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
    }
}

// DELETE - Remove product (admin only)
export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const adminKey = searchParams.get('adminKey');

    if (adminKey !== process.env.ADMIN_PASSWORD) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await request.json();
        const products = await getProducts();
        const filtered = products.filter(p => p.id !== id);

        if (filtered.length === products.length) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        await saveProducts(filtered);
        return NextResponse.json({ success: true, products: filtered });
    } catch (error) {
        console.error('Error deleting product:', error);
        return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
    }
}
