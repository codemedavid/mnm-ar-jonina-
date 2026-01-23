import { BUSINESS_INFO } from '@/lib/products';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="container">
                <p>© {new Date().getFullYear()} {BUSINESS_INFO.name}. All rights reserved.</p>
                <p className="text-muted" style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                    Questions? Contact us at {BUSINESS_INFO.phone}
                </p>
            </div>
        </footer>
    );
}
