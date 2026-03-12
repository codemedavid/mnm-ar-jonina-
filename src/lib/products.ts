import { Product, PaymentMethod } from './types';

// Business info - customize these
export const BUSINESS_INFO = {
    name: 'MNM AR Jonina',
    tagline: 'Quality Products, Fast Delivery',
    email: 'your-email@gmail.com', // Admin email for notifications
    phone: '+63 XXX XXX XXXX',
};

// Products - fallback (actual products loaded from data/products.json via API)
export const products: Product[] = [];

// Payment methods - customize with your payment details
// Add your QR code images to public/qr/ folder
export const paymentMethods: PaymentMethod[] = [
    {
        id: 'gcash',
        name: 'GCash',
        details: 'Send to: 09XX XXX XXXX (Juan Dela Cruz)',
        qrCode: '/qr/gcash-qr.png', // Add your GCash QR image here
    },
    {
        id: 'bank',
        name: 'Bank Transfer',
        details: 'BDO / BPI Account: XXXX-XXXX-XXXX (Juan Dela Cruz)',
        qrCode: '/qr/bank-qr.png', // Optional: Add your Bank QR image here
    },
    {
        id: 'cod',
        name: 'Cash on Delivery (COD)',
        details: 'Pay when your order arrives. Additional ₱50 COD fee applies.',
    },
];

// Courier options
export const couriers = [
    'J&T Express',
    'LBC Express',
];
