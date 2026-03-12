// Core types for the ordering system

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category?: string;
  soldOut?: boolean;
}

export interface CartItem {
  product: Product;
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
