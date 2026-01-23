import { promises as fs } from 'fs';
import path from 'path';
import { Order } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

// Ensure data directory and file exist
async function ensureDataFile(): Promise<void> {
    try {
        await fs.access(DATA_DIR);
    } catch {
        await fs.mkdir(DATA_DIR, { recursive: true });
    }

    try {
        await fs.access(ORDERS_FILE);
    } catch {
        await fs.writeFile(ORDERS_FILE, '[]', 'utf-8');
    }
}

// Generate unique order number
export function generateOrderNumber(): string {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ORD-${dateStr}-${random}`;
}

// Get all orders
export async function getOrders(): Promise<Order[]> {
    await ensureDataFile();
    const data = await fs.readFile(ORDERS_FILE, 'utf-8');
    return JSON.parse(data);
}

// Get order by order number
export async function getOrderByNumber(orderNumber: string): Promise<Order | null> {
    const orders = await getOrders();
    return orders.find(order => order.orderNumber === orderNumber) || null;
}

// Create new order
export async function createOrder(orderData: Omit<Order, 'orderNumber' | 'status' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    const orders = await getOrders();

    const newOrder: Order = {
        ...orderData,
        orderNumber: generateOrderNumber(),
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    orders.push(newOrder);
    await fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');

    return newOrder;
}

// Update order
export async function updateOrder(orderNumber: string, updates: Partial<Order>): Promise<Order | null> {
    const orders = await getOrders();
    const index = orders.findIndex(order => order.orderNumber === orderNumber);

    if (index === -1) return null;

    orders[index] = {
        ...orders[index],
        ...updates,
        updatedAt: new Date().toISOString(),
    };

    await fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');

    return orders[index];
}

// Delete order
export async function deleteOrder(orderNumber: string): Promise<boolean> {
    const orders = await getOrders();
    const index = orders.findIndex(order => order.orderNumber === orderNumber);

    if (index === -1) return false;

    orders.splice(index, 1);
    await fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');

    return true;
}
