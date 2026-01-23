'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/lib/types';
import ProductCard from '@/components/ProductCard';
import CartFloat from '@/components/CartFloat';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function OrderPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(data => setProducts(data))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Header />
      <main className="page">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1>Our Products</h1>
            <p className="text-muted">Select items and quantities below, then click Order Now</p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
              Loading products...
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
              No products available
            </div>
          ) : (
            <div className="products-grid">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
      <CartFloat />
    </>
  );
}
