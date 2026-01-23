import { Product, PaymentMethod } from './types';

// Business info - customize these
export const BUSINESS_INFO = {
    name: 'MNM AR Jonina',
    tagline: 'Quality Products, Fast Delivery',
    email: 'your-email@gmail.com', // Admin email for notifications
    phone: '+63 XXX XXX XXXX',
};

// Products - Tirzepatide Vials & Complete Sets
export const products: Product[] = [
    {
        id: 'tirz-20mg-vial',
        name: 'Tirzepatide 20mg + BA3 (Vial Only)',
        description: 'Tirzepatide 20mg vial with BA3 bacteriostatic water',
        price: 1700,
        image: '/placeholder.svg',
        category: 'Vials Only',
    },
    {
        id: 'tirz-30mg-vial',
        name: 'Tirzepatide 30mg + BA5 (Vial Only)',
        description: 'Tirzepatide 30mg vial with BA5 bacteriostatic water',
        price: 1900,
        image: '/placeholder.svg',
        category: 'Vials Only',
    },
    {
        id: 'tirz-20mg-set',
        name: 'Tirzepatide 20mg + BA3 (Complete Set)',
        description: 'Complete set includes vial, syringes, and accessories 🧬✨',
        price: 1900,
        image: '/placeholder.svg',
        category: 'Complete Sets',
    },
    {
        id: 'tirz-30mg-set',
        name: 'Tirzepatide 30mg + BA5 (Complete Set)',
        description: 'Complete set includes vial, syringes, and accessories 🧬✨',
        price: 2100,
        image: '/placeholder.svg',
        category: 'Complete Sets',
    },
];

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
    'Flash Express',
    'Ninja Van',
    'Grab Express',
    'Lalamove',
    'Other',
];
