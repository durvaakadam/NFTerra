'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useWallet } from '@/lib/context/WalletContext';
import { ArrowRight, Zap, TrendingUp, Users } from 'lucide-react';

const STAGES = [
  { img: '/nft-1.jpg', label: 'Rookie',   level: 1, desc: 'Origin',    price: '0.05' },
  { img: '/nft-3.jpg', label: 'Explorer', level: 2, desc: 'Awakened',  price: '0.12' },
  { img: '/nft-5.jpg', label: 'Warrior',  level: 3, desc: 'Ascended',  price: '0.28' },
  { img: '/nft-7.jpg', label: 'Champion', level: 4, desc: 'Reborn',    price: '0.55' },
  { img: '/nft-2.jpg', label: 'Legend',   level: 5, desc: 'Legendary', price: '1.20' },
];

export function HeroSection() {
  const { connected } = useWallet();
  const [activeStage, setActiveStage] = useState(2);

  useEffect(() => {
    const t = setInterval(() => setActiveStage(s => (s + 1) % 5), 3800);
    return () => clearInterval(t);
  }, []);

  const featured = STAGES[activeStage];

  return (
    <section className="px-4 sm:px-6 lg:px-8 pt-14 pb-20 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

        {/* LEFT — Copy */}
        <div className="flex flex-col gap-7 animate-slide-in-up">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="section-eyebrow">Dynamic NFT Protocol</span>
            <span className="tag tag-indigo">v2.0 Live</span>
            <span className="tag tag-amber">12,450 Minted</span>
          </div>

          <h1 className="display-title text-balance">
            Your NFTs<br />
            <span className="text-accent-indigo">Evolve.</span><br />
            Level&nbsp;Up.
          </h1>

          <p className="text-[oklch(0.42_0.03_270)] text-lg leading-relaxed max-w-md">
            NFTerra introduces living blockchain collectibles — NFTs that transform from eggs into legendary creatures as they gain experience on-chain.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link href={connected ? '/dashboard' : '/mint'}>
              <button className="btn-primary text-base px-7 py-3">
                {connected ? 'My Collection' : 'Start Minting'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <Link href="/gallery">
              <button className="btn-outline text-base px-7 py-3">Explore Gallery</button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 pt-5 border-t-2 border-[oklch(0.88_0.01_270)]">
            {[
              { icon: Zap,        n: '12,450', label: 'NFTs Minted' },
              { icon: TrendingUp, n: '245 ETH', label: 'Total Value' },
              { icon: Users,      n: '3,287',  label: 'Collectors' },
            ].map(({ icon: Icon, n, label }) => (
              <div key={label} className="text-center panel py-4">
                <Icon className="w-4 h-4 text-[var(--indigo)] mx-auto mb-1.5" />
                <p className="text-base font-black leading-none mb-0.5">{n}</p>
                <p className="text-[10px] text-[oklch(0.55_0.03_270)] font-semibold uppercase tracking-widest">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — Featured NFT + Stage selector */}
        <div className="flex flex-col gap-4 animate-fade-in">
          {/* Big featured card */}
          <div
            className="panel overflow-hidden p-0"
            style={{ boxShadow: '8px 8px 0 oklch(0.13 0.02 270)' }}
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                key={featured.img}
                src={featured.img}
                alt={featured.label}
                fill
                className="object-cover transition-all duration-700"
                priority
                loading="eager"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
                <div>
                  <span className="block text-white/60 text-xs font-bold uppercase tracking-widest mb-1">
                    {featured.desc}
                  </span>
                  <p className="text-white text-2xl font-black tracking-tight">{featured.label}</p>
                </div>
                <span className="tag tag-amber">Stage {featured.level}/5</span>
              </div>
            </div>
            <div className="px-5 py-3.5 flex items-center justify-between border-t-2 border-[oklch(0.86_0.01_270)]">
              <div className="flex items-center gap-3">
                <span className="stat-label">Evolution</span>
                <div className="level-bar-track w-28">
                  <div className="level-bar-fill" style={{ width: `${(featured.level / 5) * 100}%` }} />
                </div>
              </div>
              <span className="text-sm font-black font-mono text-[var(--indigo)]">{featured.price} ETH</span>
            </div>
          </div>

          {/* Stage strip */}
          <div className="grid grid-cols-5 gap-2">
            {STAGES.map((s, i) => (
              <button
                key={s.level}
                onClick={() => setActiveStage(i)}
                className={`relative overflow-hidden rounded-xl border-2 aspect-square transition-all duration-200 ${
                  activeStage === i
                    ? 'border-[var(--indigo)] shadow-[3px_3px_0_var(--indigo)]'
                    : 'border-[oklch(0.86_0.01_270)] hover:border-[oklch(0.7_0.08_270)]'
                }`}
              >
                <Image src={s.img} alt={s.label} fill className="object-cover" sizes="80px" priority loading="eager" />
                <div className="absolute inset-0 bg-black/25" />
                <div className="absolute inset-x-0 bottom-0 bg-black/70 py-1">
                  <p className="text-white text-[8px] font-black text-center uppercase tracking-wide leading-none">
                    {s.label}
                  </p>
                </div>
                {activeStage === i && (
                  <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--amber)]" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
