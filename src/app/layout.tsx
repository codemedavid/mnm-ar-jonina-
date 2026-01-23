import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { BUSINESS_INFO } from "@/lib/products";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: `${BUSINESS_INFO.name} - Order Now`,
  description: BUSINESS_INFO.tagline,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
