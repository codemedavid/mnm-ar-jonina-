'use client';

import Link from 'next/link';
import { useLocation } from '@/context/LocationContext';
import { LOCATIONS } from '@/lib/types';

interface HeaderProps {
    showNav?: boolean;
}

export default function Header({ showNav = true }: HeaderProps) {
    const { location, setLocation } = useLocation();

    return (
        <header className="header">
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/logo.png"
                        alt="MNM AR Jonina"
                        style={{ height: '40px', width: 'auto' }}
                    />
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <select
                        value={location}
                        onChange={(e) => setLocation(e.target.value as typeof location)}
                        style={{
                            padding: '0.4rem 0.6rem',
                            borderRadius: '9999px',
                            border: '1.5px solid var(--color-primary)',
                            background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.08), rgba(236, 72, 153, 0.03))',
                            color: 'var(--color-primary)',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            outline: 'none',
                        }}
                    >
                        {LOCATIONS.map(loc => (
                            <option key={loc.id} value={loc.id}>{loc.name}</option>
                        ))}
                    </select>
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
            </div>
        </header>
    );
}
