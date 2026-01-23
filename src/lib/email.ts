import nodemailer from 'nodemailer';
import { Order } from './types';
import { BUSINESS_INFO, paymentMethods } from './products';

// Create transporter with Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// Format order items for email
function formatOrderItems(order: Order): string {
  return order.items
    .map(item => `• ${item.product.name} × ${item.quantity} = ₱${(item.product.price * item.quantity).toLocaleString()}`)
    .join('\n');
}

// Send order notification to admin
export async function sendAdminNotification(order: Order): Promise<void> {
  const payment = paymentMethods.find(p => p.id === order.paymentMethod);

  const mailOptions = {
    from: `"${BUSINESS_INFO.name}" <${process.env.GMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL || process.env.GMAIL_USER,
    subject: `🛒 New Order: ${order.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #7c3aed;">New Order Received!</h1>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin-top: 0;">Order #${order.orderNumber}</h2>
          <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString('en-PH')}</p>
        </div>

        <h3>Customer Details</h3>
        <ul>
          <li><strong>Name:</strong> ${order.customer.fullName}</li>
          <li><strong>Email:</strong> ${order.customer.email}</li>
          <li><strong>Phone:</strong> ${order.customer.contactNumber}</li>
          <li><strong>Address:</strong> ${order.customer.deliveryAddress}</li>
        </ul>

        <h3>Order Items</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #7c3aed; color: white;">
              <th style="padding: 10px; text-align: left;">Item</th>
              <th style="padding: 10px; text-align: center;">Qty</th>
              <th style="padding: 10px; text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(item => `
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 10px;">${item.product.name}</td>
                <td style="padding: 10px; text-align: center;">${item.quantity}</td>
                <td style="padding: 10px; text-align: right;">₱${(item.product.price * item.quantity).toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr style="background: #f3f4f6; font-weight: bold;">
              <td colspan="2" style="padding: 10px;">TOTAL</td>
              <td style="padding: 10px; text-align: right;">₱${order.total.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>

        <p><strong>Payment Method:</strong> ${payment?.name || order.paymentMethod}</p>
        ${order.notes ? `<p><strong>Notes:</strong> ${order.notes}</p>` : ''}

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">
          Log in to your admin dashboard to manage this order.
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

// Send order confirmation to customer
export async function sendCustomerConfirmation(order: Order): Promise<void> {
  const payment = paymentMethods.find(p => p.id === order.paymentMethod);

  const mailOptions = {
    from: `"${BUSINESS_INFO.name}" <${process.env.GMAIL_USER}>`,
    to: order.customer.email,
    subject: `Order Confirmed: ${order.orderNumber} - ${BUSINESS_INFO.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #7c3aed;">Thank You for Your Order!</h1>
        
        <p>Hi ${order.customer.fullName},</p>
        <p>We've received your order and it's being processed. Here are your order details:</p>

        <div style="background: #7c3aed; color: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; font-size: 14px;">Your Order Number</p>
          <h2 style="margin: 10px 0; font-size: 28px; letter-spacing: 2px;">${order.orderNumber}</h2>
          <p style="margin: 0; font-size: 12px;">Save this to track your order</p>
        </div>

        <h3>Order Summary</h3>
        <table style="width: 100%; border-collapse: collapse;">
          ${order.items.map(item => `
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 10px;">${item.product.name} × ${item.quantity}</td>
              <td style="padding: 10px; text-align: right;">₱${(item.product.price * item.quantity).toLocaleString()}</td>
            </tr>
          `).join('')}
          <tr style="font-weight: bold; font-size: 18px;">
            <td style="padding: 15px 10px;">Total</td>
            <td style="padding: 15px 10px; text-align: right; color: #7c3aed;">₱${order.total.toLocaleString()}</td>
          </tr>
        </table>


        <div style="background: #d1fae5; border: 1px solid #10b981; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #047857;">✅ Payment Received</h4>
          <p style="margin-bottom: 0; color: #065f46;">Thank you for your payment via ${payment?.name || order.paymentMethod}. Your order is now being processed.</p>
        </div>
        ${order.courier ? `<p><strong>Preferred Courier:</strong> ${order.courier}</p>` : ''}

        <h3>Delivery Address</h3>
        <p style="background: #f3f4f6; padding: 15px; border-radius: 8px;">${order.customer.deliveryAddress}</p>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        
        <p style="text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/track" 
             style="display: inline-block; background: #7c3aed; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px;">
            Track Your Order
          </a>
        </p>

        <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 30px;">
          Questions? Contact us at ${BUSINESS_INFO.phone}
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

// Send status update email to customer
export async function sendStatusUpdateEmail(order: Order): Promise<void> {
  const statusMessages: Record<string, { subject: string; message: string }> = {
    confirmed: {
      subject: `Order Confirmed: ${order.orderNumber}`,
      message: 'Great news! Your order has been confirmed and is being prepared.',
    },
    shipped: {
      subject: `Order Shipped: ${order.orderNumber}`,
      message: 'Your order is on its way! Track your package with the details below.',
    },
    completed: {
      subject: `Order Completed: ${order.orderNumber}`,
      message: 'Your order has been delivered. Thank you for shopping with us!',
    },
    cancelled: {
      subject: `Order Cancelled: ${order.orderNumber}`,
      message: 'Your order has been cancelled. If you have any questions, please contact us.',
    },
  };

  const statusInfo = statusMessages[order.status];
  if (!statusInfo || order.status === 'pending') return;

  const mailOptions = {
    from: `"${BUSINESS_INFO.name}" <${process.env.GMAIL_USER}>`,
    to: order.customer.email,
    subject: `${statusInfo.subject} - ${BUSINESS_INFO.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #7c3aed;">Order Update</h1>
        
        <p>Hi ${order.customer.fullName},</p>
        <p>${statusInfo.message}</p>

        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Order:</strong> ${order.orderNumber}</p>
          <p style="margin: 10px 0 0;"><strong>Status:</strong> 
            <span style="background: #7c3aed; color: white; padding: 4px 12px; border-radius: 20px; text-transform: capitalize;">
              ${order.status}
            </span>
          </p>
        </div>

        ${order.status === 'shipped' && order.trackingNumber ? `
          <div style="background: #dbeafe; border: 1px solid #3b82f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #1d4ed8;">📦 Shipping Information</h4>
            <p style="margin: 5px 0;"><strong>Courier:</strong> ${order.courier || 'N/A'}</p>
            <p style="margin: 5px 0 0;"><strong>Tracking Number:</strong> ${order.trackingNumber}</p>
          </div>
        ` : ''}

        <p style="text-align: center; margin-top: 30px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/track" 
             style="display: inline-block; background: #7c3aed; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px;">
            Track Your Order
          </a>
        </p>

        <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 30px;">
          Questions? Contact us at ${BUSINESS_INFO.phone}
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}
