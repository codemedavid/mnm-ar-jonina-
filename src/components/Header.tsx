import Link from 'next/link';
import { BUSINESS_INFO } from '@/lib/products';

interface HeaderProps {
    showNav?: boolean;
}

export default function Header({ showNav = true }: HeaderProps) {
    return (
        <header style={{
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
            padding: '0.75rem 0',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            boxShadow: '0 2px 10px rgba(138, 77, 255, 0.15)',
        }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Link href="/" style={{
                        fontWeight: 800,
                        fontSize: '1.1rem',
                        color: 'white',
                        textDecoration: 'none',
                        textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                    }}>
                        ✨ {BUSINESS_INFO.name}
                    </Link>
                    <span style={{
                        color: 'rgba(255,255,255,0.85)',
                        fontSize: '0.75rem',
                        fontStyle: 'italic',
                    }}>
                        {BUSINESS_INFO.tagline}
                    </span>
                </div>
                {showNav && (
                    <nav style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link href="/" style={{
                            fontSize: '0.75rem',
                            color: 'white',
                            textDecoration: 'none',
                            padding: '0.4rem 0.75rem',
                            background: 'rgba(255,255,255,0.2)',
                            borderRadius: '1rem',
                            fontWeight: 500,
                        }}>
                            🛒 Order
                        </Link>
                        <Link href="/track" style={{
                            fontSize: '0.75rem',
                            color: 'white',
                            textDecoration: 'none',
                            padding: '0.4rem 0.75rem',
                            background: 'rgba(255,255,255,0.2)',
                            borderRadius: '1rem',
                            fontWeight: 500,
                        }}>
                            📦 Track
                        </Link>
                    </nav>
                )}
            </div>
        </header>
    );
}
