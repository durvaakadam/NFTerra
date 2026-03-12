'use client';

import React from 'react';
import Link from 'next/link';
import { Hexagon, Github, Twitter, MessageCircle } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-24 border-t-2 border-[oklch(0.86_0.01_270)] bg-[oklch(0.13_0.02_270)] text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-white/10 border border-white/20 rounded-lg flex items-center justify-center">
                <Hexagon className="w-4 h-4 text-white fill-white/20" />
              </div>
              <span className="font-black text-lg tracking-tight text-white">NFTerra</span>
            </div>
            <p className="text-sm text-white/50 leading-relaxed max-w-[200px]">
              The platform for dynamic, evolving NFT collectibles on the blockchain.
            </p>
            <div className="flex gap-2 mt-1">
              {[Twitter, Github, MessageCircle].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-8 h-8 rounded-lg border border-white/10 hover:border-white/30 flex items-center justify-center transition-colors text-white/50 hover:text-white"
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-bold tracking-widest uppercase text-white/40 mb-1">Platform</p>
            {[
              { href: '/landing',   label: 'Home' },
              { href: '/dashboard', label: 'Dashboard' },
              { href: '/mint',      label: 'Mint NFT' },
              { href: '/gallery',   label: 'Gallery' },
            ].map((l) => (
              <Link key={l.href} href={l.href} className="text-sm text-white/60 hover:text-white transition-colors">
                {l.label}
              </Link>
            ))}
          </div>

          {/* Resources */}
          <div className="flex flex-col gap-3">
            <p className="text-xs font-bold tracking-widest uppercase text-white/40 mb-1">Resources</p>
            {['Documentation', 'Smart Contracts', 'Whitepaper', 'Roadmap'].map((l) => (
              <a key={l} href="#" className="text-sm text-white/60 hover:text-white transition-colors">{l}</a>
            ))}
          </div>

          {/* Stats */}
          <div className="flex flex-col gap-4">
            <p className="text-xs font-bold tracking-widest uppercase text-white/40 mb-1">Live Stats</p>
            {[
              { n: '12,450', label: 'NFTs Minted' },
              { n: '245 ETH', label: 'Total Value' },
              { n: '3,200+', label: 'Holders' },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-xl font-black tracking-tight">{s.n}</p>
                <p className="text-xs text-white/40">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-white/30">
          <p>&copy; 2025 NFTerra Protocol. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Audit</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
