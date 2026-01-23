# MNM AR Jonina - Ordering Website

A modern, mobile-friendly ordering website with order tracking and Gmail notifications.

## Features

- ✅ **Product Catalog** - Display products with images, prices, and descriptions
- ✅ **Shopping Cart** - Add items, adjust quantities, persistent cart
- ✅ **Checkout Flow** - Customer details, payment selection, order confirmation
- ✅ **Order Tracking** - Customers can track their order status
- ✅ **Email Notifications** - Gmail alerts for admin and customers
- ✅ **Admin Dashboard** - View orders, update status, add tracking numbers
- ✅ **Mobile Optimized** - Responsive design for all devices

## Quick Start

### 1. Configure Environment

Copy the example environment file and fill in your details:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your credentials:

```env
# Gmail Credentials (get App Password from Google Account settings)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx

# Admin Settings
ADMIN_EMAIL=your-email@gmail.com
ADMIN_PASSWORD=your-admin-password

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Get Gmail App Password

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Step Verification (if not already)
3. Go to **App passwords**
4. Create a new app password for "Mail"
5. Copy the 16-character password to `.env.local`

### 3. Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Pages

| URL | Description |
|-----|-------------|
| `/` | Product catalog & ordering |
| `/checkout` | Customer details & payment |
| `/confirmation/[orderNumber]` | Order confirmation |
| `/track` | Order tracking |
| `/admin` | Admin dashboard |

## Customization

### Products

Edit `src/lib/products.ts` to add your products:

```typescript
export const products: Product[] = [
  {
    id: 'prod-001',
    name: 'Your Product Name',
    description: 'Product description here',
    price: 299,
    image: '/products/your-image.jpg',
  },
  // Add more products...
];
```

### Business Info

Update your business details in `src/lib/products.ts`:

```typescript
export const BUSINESS_INFO = {
  name: 'Your Business Name',
  tagline: 'Your Tagline Here',
  email: 'your-email@gmail.com',
  phone: '+63 XXX XXX XXXX',
};
```

### Payment Methods

Customize payment options in `src/lib/products.ts`:

```typescript
export const paymentMethods: PaymentMethod[] = [
  {
    id: 'gcash',
    name: 'GCash',
    details: 'Send to: 09XX XXX XXXX (Your Name)',
  },
  // Add more...
];
```

### Product Images

Add product images to `public/products/` directory.

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Nodemailer** (Gmail SMTP)
- **JSON File Storage**

## Deployment

For production deployment:

1. Build the app: `npm run build`
2. Set environment variables on your hosting platform
3. Deploy to Vercel, Railway, or any Node.js host

## Support

For issues or questions, contact the developer.
# mnm-ar-jonina-mini-store
# mnm-ar-jonina-mini-store
