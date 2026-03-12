import Link from 'next/link';

interface HeaderProps {
    showNav?: boolean;
}

export default function Header({ showNav = true }: HeaderProps) {
    return (
        <header className="header">
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/logo.svg"
                        alt="MNM AR Jonina"
                        style={{ height: '40px', width: 'auto' }}
                    />
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
