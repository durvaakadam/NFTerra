'use client';

import React from 'react';
import { Zap, Shield, Users, Sparkles, TrendingUp, Lock } from 'lucide-react';

const features = [
  {
    icon: Zap,
    tag: 'Core Mechanic',
    tagStyle: 'tag-indigo',
    title: 'Dynamic Evolution',
    description: 'NFTs evolve through 5 stages on-chain: Egg, Creature, Dragon, Phoenix, and Immortal — each a distinct token state.',
    stat: '5 Stages',
    statColor: '#3730a3',
  },
  {
    icon: Shield,
    tag: 'Blockchain',
    tagStyle: 'tag-teal',
    title: 'Immutable On-Chain',
    description: 'Every evolution event and metadata change is permanently written to the blockchain. Fully decentralised, zero servers.',
    stat: '100% On-Chain',
    statColor: '#0d9488',
  },
  {
    icon: Users,
    tag: 'Community',
    tagStyle: 'tag-amber',
    title: 'Trade & Showcase',
    description: 'Your evolved NFTs are tradeable on any compatible marketplace. Level history and rarity are preserved across transfers.',
    stat: '3,200+ Holders',
    statColor: '#d97706',
  },
  {
    icon: Sparkles,
    tag: 'Rarity',
    tagStyle: 'tag-rose',
    title: 'Three Rarity Tiers',
    description: 'Common (70%), Rare (25%), Legendary (5%) — each with unique visual artwork generated at mint time.',
    stat: '~5% Legendary',
    statColor: '#e11d48',
  },
  {
    icon: TrendingUp,
    tag: 'Value',
    tagStyle: 'tag-indigo',
    title: 'Value Appreciation',
    description: 'Higher-level NFTs command premium prices. Leveling up your NFT directly increases its floor price and desirability.',
    stat: '245 ETH TVL',
    statColor: '#3730a3',
  },
  {
    icon: Lock,
    tag: 'Security',
    tagStyle: 'tag-teal',
    title: 'Audited Contracts',
    description: 'Smart contracts are open-source and independently audited. Your assets are protected by battle-tested code.',
    stat: 'Audited & Verified',
    statColor: '#0d9488',
  },
];

export function FeaturesSection() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 pb-20 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <p className="section-eyebrow mb-3">Platform Features</p>
          <h2 className="section-title max-w-md text-balance">
            Everything you need to evolve your collection
          </h2>
        </div>
        <p className="text-[oklch(0.5_0.03_270)] max-w-xs text-sm leading-relaxed">
          A complete NFT ecosystem built from the ground up for dynamic evolution mechanics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <div
              key={i}
              className="panel flex flex-col gap-4 hover:shadow-[4px_4px_0_oklch(0.38_0.18_270)] transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center border-2"
                  style={{ background: 'oklch(0.94 0.04 270)', borderColor: 'oklch(0.82 0.07 270)' }}
                >
                  <Icon className="w-5 h-5 text-[var(--indigo)]" />
                </div>
                <span className={`tag ${f.tagStyle}`}>{f.tag}</span>
              </div>
              <div>
                <h3 className="font-black text-base mb-1.5">{f.title}</h3>
                <p className="text-sm text-[oklch(0.5_0.03_270)] leading-relaxed">{f.description}</p>
              </div>
              <div className="mt-auto pt-3 border-t border-[oklch(0.9_0.01_270)] flex items-center justify-between">
                <span className="text-xs font-black" style={{ color: f.statColor }}>{f.stat}</span>
                <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center" style={{ borderColor: f.statColor }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: f.statColor }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
