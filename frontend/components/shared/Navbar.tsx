'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { WalletButton } from './WalletButton';
import { Menu, X, Hexagon } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { href: '/landing',   label: 'Home' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/mint',      label: 'Mint' },
    { href: '/gallery',   label: 'Gallery' },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      <nav
        className={`sticky top-0 z-50 bg-[var(--background)] transition-all duration-200 ${
          scrolled ? 'border-b-2 border-[oklch(0.86_0.01_270)] shadow-sm' : 'border-b border-[oklch(0.88_0.01_270)]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/landing" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 bg-[var(--indigo)] rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
                <Hexagon className="w-4 h-4 text-white fill-white/30" />
              </div>
              <span className="font-black text-lg tracking-tight text-[var(--indigo)]">
                NFTerra
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                    isActive(item.href)
                      ? 'bg-[var(--indigo)] text-white'
                      : 'text-[oklch(0.4_0.03_270)] hover:bg-[oklch(0.93_0.02_270)] hover:text-[var(--indigo)]'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Right side */}
            <div className="hidden md:flex items-center gap-3">
              <WalletButton />
            </div>

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-[oklch(0.93_0.02_270)] transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-[oklch(0.88_0.01_270)] bg-white px-4 py-4 space-y-1 animate-slide-in-up">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  isActive(item.href)
                    ? 'bg-[var(--indigo)] text-white'
                    : 'text-[oklch(0.4_0.03_270)] hover:bg-[oklch(0.93_0.02_270)]'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-2">
              <WalletButton />
            </div>
          </div>
        )}
      </nav>

      {/* Ticker stripe */}
      <div className="ticker-stripe">
        <div
          className="inline-flex gap-16 animate-marquee"
          style={{ width: 'max-content' }}
          aria-hidden="true"
        >
          {Array.from({ length: 2 }).map((_, i) => (
            <span key={i} className="inline-flex gap-16">
              <span>Dynamic NFTs</span>
              <span className="text-[var(--amber)]">&#x2605;</span>
              <span>Evolve Your Collection</span>
              <span className="text-[var(--amber)]">&#x2605;</span>
              <span>Egg → Dragon → Immortal</span>
              <span className="text-[var(--amber)]">&#x2605;</span>
              <span>Mint On-Chain</span>
              <span className="text-[var(--amber)]">&#x2605;</span>
              <span>Level Up Your NFTs</span>
              <span className="text-[var(--amber)]">&#x2605;</span>
              <span>12,450 NFTs Minted</span>
              <span className="text-[var(--amber)]">&#x2605;</span>
              <span>Community Driven Evolution</span>
              <span className="text-[var(--amber)]">&#x2605;</span>
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
