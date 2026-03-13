// Core types for the ordering system

export interface ProductVariation {
  id: string;
  name: string;
  price: number;
  image: string;
  unitsRequired: number; // 1 for vial/set, 10 for box/kit
}

export type LocationId = 'bacoor' | 'lucena' | 'laguna';

export const LOCATIONS: { id: LocationId; name: string }[] = [
  { id: 'bacoor', name: 'Bacoor Molino' },
  { id: 'lucena', name: 'Lucena' },
  { id: 'laguna', name: 'Laguna' },
];

export interface Product {
  id: string;
  name: string;
  description: string;
  stock: Record<LocationId, number>; // stock per location
  variations: ProductVariation[];
}

export interface CartItem {
  product: {
    id: string;        // parent product id
    name: string;      // parent product name
    variationId: string;
    variationName: string;
    price: number;
    image: string;
    unitsRequired: number;
  };
  quantity: number;
}

export interface CustomerInfo {
  fullName: string;
  email: string;
  contactNumber: string;
  deliveryAddress: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'completed' | 'cancelled';

export interface Order {
  orderNumber: string;
  items: CartItem[];
  customer: CustomerInfo;
  total: number;
  status: OrderStatus;
  location: LocationId;
  trackingNumber?: string;
  courier?: string;
  paymentMethod: string;
  proofOfPayment?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  details: string;
  qrCode?: string;
}
