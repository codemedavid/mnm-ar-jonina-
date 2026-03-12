'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/lib/types';
import ProductCard from '@/components/ProductCard';
import CartFloat from '@/components/CartFloat';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { BUSINESS_INFO } from '@/lib/products';

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

      {/* Hero Section with Ribbons */}
      <section className="hero">
        {/* Decorative Ribbons */}
        <div className="ribbon ribbon-1" />
        <div className="ribbon ribbon-2" />
        <div className="ribbon ribbon-3" />
        <div className="ribbon ribbon-4" />
        <div className="ribbon ribbon-5" />
        <div className="ribbon ribbon-6" />
        <div className="ribbon ribbon-7" />
        <div className="ribbon ribbon-8" />

        {/* Floating Hearts */}
        <div className="hero-hearts">
          <span className="hero-heart">&#x2764;&#xFE0F;</span>
          <span className="hero-heart">&#x1F49D;</span>
          <span className="hero-heart">&#x2764;&#xFE0F;</span>
          <span className="hero-heart">&#x1F49E;</span>
          <span className="hero-heart">&#x2764;&#xFE0F;</span>
          <span className="hero-heart">&#x1F49D;</span>
          <span className="hero-heart">&#x2764;&#xFE0F;</span>
          <span className="hero-heart">&#x1F49E;</span>
          <span className="hero-heart">&#x2764;&#xFE0F;</span>
          <span className="hero-heart">&#x1F49D;</span>
        </div>

        {/* Hero Content */}
        <div className="hero-content">
          <div className="hero-badge">
            &#x2728; {BUSINESS_INFO.tagline} &#x2728;
          </div>
          <h1>{BUSINESS_INFO.name}</h1>
          <p className="hero-subtitle">
            Browse our curated collection and find something you&apos;ll love. Order easily and we&apos;ll deliver it right to your door!
          </p>
          <div className="hero-bow-divider">
            <span className="bow-line" />
            <span className="bow-icon">&#x1F380;</span>
            <span className="bow-line" />
          </div>
        </div>
      </section>

      <main className="page" style={{ paddingTop: 'var(--space-3xl)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ color: 'var(--color-primary-dark)' }}>Our Products</h2>
            <p className="text-muted" style={{ maxWidth: '480px', margin: '0 auto' }}>
              Select items and quantities, then tap Order Now &#x1F380;
            </p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>
              <div className="spinner" style={{ margin: '0 auto 1rem' }} />
              <p>Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">&#x1F380;</div>
              <h2>No products available</h2>
              <p className="text-muted">Check back soon for new arrivals!</p>
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
