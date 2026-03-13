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
        const { name, description, price, image, category, soldOut, stock } = await request.json();
        if (!name || !price) {
            return NextResponse.json({ error: 'Name and price are required' }, { status: 400 });
        }

        const products = await getProducts();
        const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');

        // Check for duplicate ID
        let finalId = id;
        let counter = 1;
        while (products.find(p => p.id === finalId)) {
            finalId = `${id}-${counter}`;
            counter++;
        }

        const stockValue = stock !== undefined ? Number(stock) : 0;
        const newProduct: Product = {
            id: finalId,
            name,
            description: description || '',
            price: Number(price),
            image: image || '/placeholder.svg',
            category: category || 'General',
            soldOut: stockValue === 0 ? true : (soldOut || false),
            stock: stockValue,
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
        const { id, name, description, price, image, category, soldOut, stock } = await request.json();
        const products = await getProducts();
        const index = products.findIndex(p => p.id === id);

        if (index === -1) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        const updatedStock = stock !== undefined ? Number(stock) : products[index].stock;
        const autoSoldOut = updatedStock !== undefined && updatedStock <= 0;

        products[index] = {
            ...products[index],
            name: name || products[index].name,
            description: description !== undefined ? description : products[index].description,
            price: price !== undefined ? Number(price) : products[index].price,
            image: image || products[index].image,
            category: category || products[index].category,
            soldOut: autoSoldOut ? true : (soldOut !== undefined ? soldOut : products[index].soldOut),
            stock: updatedStock,
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
