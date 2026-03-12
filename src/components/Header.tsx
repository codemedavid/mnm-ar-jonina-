import Link from 'next/link';
import { BUSINESS_INFO } from '@/lib/products';

interface HeaderProps {
    showNav?: boolean;
}

export default function Header({ showNav = true }: HeaderProps) {
    return (
        <header className="header">
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link href="/" className="logo" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: '1rem' }}>&#x1F380;</span>
                    <span>{BUSINESS_INFO.name}</span>
                </Link>
                {showNav && (
                    <nav style={{ display: 'flex', gap: '0.15rem', flexShrink: 0 }}>
                        <Link href="/" className="nav-link">
                            Shop
                        </Link>
                        <Link href="/track" className="nav-link">
                            Track
                        </Link>
                    </nav>
                )}
            </div>
        </header>
    );
}
