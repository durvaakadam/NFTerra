'use client';

import React from 'react';
import { Wallet, Sparkles, TrendingUp, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const steps = [
  {
    icon: Wallet,
    number: '01',
    title: 'Connect Wallet',
    description: 'Link your MetaMask or Web3 wallet. No account creation needed — your wallet is your identity.',
    accent: '#3730a3',
  },
  {
    icon: Sparkles,
    number: '02',
    title: 'Mint Your NFT',
    description: 'Create your first NFT starting as an Egg. Rarity is assigned on-chain at mint with verifiable randomness.',
    accent: '#0d9488',
  },
  {
    icon: TrendingUp,
    number: '03',
    title: 'Level Up & Evolve',
    description: 'Invest ETH to level up and watch your NFT transform through 5 spectacular stages.',
    accent: '#d97706',
  },
  {
    icon: Users,
    number: '04',
    title: 'Trade & Collect',
    description: 'Sell evolved NFTs on any marketplace. Floor prices rise with each level — your effort has real value.',
    accent: '#e11d48',
  },
];

export function GetStartedGuide() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 pb-24 max-w-7xl mx-auto">
      {/* Dark banner */}
      <div
        className="rounded-2xl overflow-hidden border-2 border-[oklch(0.2_0.02_270)]"
        style={{ background: 'oklch(0.13 0.02 270)', boxShadow: '8px 8px 0 oklch(0.13 0.02 270)' }}
      >
        <div className="px-8 pt-12 pb-8 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-3">How It Works</p>
          <h2 className="text-3xl font-black tracking-tight text-white text-balance mb-3">
            Get Started in Minutes
          </h2>
          <p className="text-white/50 text-sm max-w-md mx-auto leading-relaxed">
            Four simple steps to join the dynamic NFT revolution
          </p>
        </div>

        <div className="px-8 pb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="relative rounded-xl p-5 flex flex-col gap-4"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.08)' }}
              >
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 -right-2.5 z-10">
                    <ArrowRight className="w-5 h-5 text-white/20" />
                  </div>
                )}
                {/* Number */}
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-black border-2"
                  style={{ background: step.accent + '22', borderColor: step.accent + '55', color: step.accent }}
                >
                  {step.number}
                </div>
                {/* Icon */}
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ background: step.accent + '18' }}
                >
                  <Icon className="w-5 h-5" style={{ color: step.accent }} />
                </div>
                <div>
                  <h3 className="font-black text-white text-sm mb-1.5">{step.title}</h3>
                  <p className="text-white/45 text-xs leading-relaxed">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="px-8 pb-12 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/mint">
            <button className="btn-amber">
              Mint Your First NFT <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
          <Link href="/gallery">
            <button
              className="btn-outline"
              style={{ borderColor: 'rgba(255,255,255,0.2)', color: 'white' }}
            >
              Explore Gallery
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
