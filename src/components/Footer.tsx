import { BUSINESS_INFO } from '@/lib/products';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="container">
                <p style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>&#x1F380;</p>
                <p style={{ fontWeight: 600, color: 'var(--color-primary-dark)', marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                    {BUSINESS_INFO.name}
                </p>
                <p style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                    {BUSINESS_INFO.tagline}
                </p>
                <p style={{ fontSize: '0.75rem' }}>
                    {BUSINESS_INFO.phone}
                </p>
                <p style={{ fontSize: '0.7rem', marginTop: '0.75rem', opacity: 0.5 }}>
                    &copy; {new Date().getFullYear()} {BUSINESS_INFO.name}
                </p>
            </div>
        </footer>
    );
}
