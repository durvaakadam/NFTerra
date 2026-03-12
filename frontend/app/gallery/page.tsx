'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { EVOLUTION_STAGES } from '@/lib/mock-data';
import Link from 'next/link';
import { Flame, Star, Layers, ArrowRight } from 'lucide-react';

type Rarity = 'common' | 'rare' | 'legendary';
const RARITIES: Rarity[] = ['common', 'rare', 'legendary'];

const STAGE_IMAGES = [
  '/nft-1.jpg',
  '/nft-3.jpg',
  '/nft-5.jpg',
  '/nft-7.jpg',
  '/nft-2.jpg',
];

const RARITY_CONFIG = {
  common:    { tag: 'tag-indigo', accent: '#3730a3', supply: '8,715', pct: '70%', icon: Layers,
    desc: 'Classic evolution designs — perfect for first-time collectors. Makes up the backbone of the NFTerra ecosystem.' },
  rare:      { tag: 'tag-teal',   accent: '#0d9488', supply: '3,113', pct: '25%', icon: Star,
    desc: 'Enhanced visual designs with unique color schemes. Sought-after by dedicated collectors looking to stand out.' },
  legendary: { tag: 'tag-amber',  accent: '#d97706', supply: '622',   pct: '5%',  icon: Flame,
    desc: 'The rarest tier. Exclusive visual treatment at every stage. Commands the highest prices on secondary markets.' },
};

const PLATFORM_STATS = [
  { label: 'Total Minted',   value: '12,450' },
  { label: 'Total Value',    value: '245 ETH' },
  { label: 'Avg Level',      value: '2.8' },
  { label: 'Legendaries',    value: '622' },
  { label: 'Level-Ups',      value: '31,200' },
  { label: 'Active Wallets', value: '3,287' },
];

export default function GalleryPage() {
  const [activeRarity, setActiveRarity] = useState<Rarity>('common');
  const [activeStage, setActiveStage] = useState<number | null>(null);
  const cfg = RARITY_CONFIG[activeRarity];
  const RarityIcon = cfg.icon;

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      <Navbar />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-12 pb-20 max-w-7xl mx-auto w-full">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <p className="section-eyebrow mb-2">Evolution Gallery</p>
            <h1 className="section-title text-balance">All 5 Stages. Three Rarities.</h1>
          </div>
          <Link href="/mint">
            <button className="btn-primary">
              Mint Your Own <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>

        {/* Stats bar */}
        <div
          className="grid grid-cols-3 lg:grid-cols-6 mb-10 rounded-2xl overflow-hidden border-2 border-[oklch(0.2_0.02_270)]"
          style={{ background: 'oklch(0.13 0.02 270)' }}
        >
          {PLATFORM_STATS.map(({ label, value }) => (
            <div key={label} className="text-center py-5 px-2 border-r border-white/5 last:border-0">
              <p className="text-xl font-black text-white leading-none mb-1">{value}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/35">{label}</p>
            </div>
          ))}
        </div>

        {/* Rarity selector */}
        <div className="flex gap-3 mb-6 flex-wrap">
          {RARITIES.map((r) => {
            const rc = RARITY_CONFIG[r];
            const active = activeRarity === r;
            return (
              <button
                key={r}
                onClick={() => { setActiveRarity(r); setActiveStage(null); }}
                className="px-5 py-2.5 rounded-xl border-2 font-bold text-sm transition-all duration-150 flex items-center gap-2 capitalize"
                style={active
                  ? { backgroundColor: rc.accent, borderColor: rc.accent, color: 'white', boxShadow: `4px 4px 0 oklch(0.13 0.02 270)` }
                  : { borderColor: 'oklch(0.86 0.01 270)', color: 'oklch(0.4 0.03 270)' }
                }
              >
                {r}
                <span
                  className="text-[9px] font-black px-1.5 py-0.5 rounded-full border"
                  style={active
                    ? { borderColor: 'rgba(255,255,255,0.35)', color: 'rgba(255,255,255,0.8)' }
                    : { borderColor: rc.accent, color: rc.accent }
                  }
                >
                  {rc.pct}
                </span>
              </button>
            );
          })}
        </div>

        {/* Rarity info card */}
        <div className="panel mb-8 flex flex-col md:flex-row gap-5 items-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center border-2 flex-shrink-0"
            style={{ background: cfg.accent + '18', borderColor: cfg.accent + '44' }}
          >
            <RarityIcon className="w-7 h-7" style={{ color: cfg.accent }} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="font-black text-xl capitalize">{activeRarity} Tier</h2>
              <span className={`tag ${cfg.tag}`}>{cfg.pct} of Supply</span>
            </div>
            <p className="text-sm text-[oklch(0.5_0.03_270)] leading-relaxed max-w-xl">{cfg.desc}</p>
          </div>
          <div className="flex gap-8 flex-shrink-0 text-center">
            <div>
              <p className="stat-label mb-1">Supply</p>
              <p className="stat-number" style={{ fontSize: '1.6rem', color: cfg.accent }}>{cfg.supply}</p>
            </div>
            <div>
              <p className="stat-label mb-1">Share</p>
              <p className="stat-number" style={{ fontSize: '1.6rem', color: cfg.accent }}>{cfg.pct}</p>
            </div>
          </div>
        </div>

        {/* Stage cards — real artwork */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {EVOLUTION_STAGES.map((stage, i) => (
            <button
              key={stage.level}
              onClick={() => setActiveStage(activeStage === i ? null : i)}
              className="nft-grid-card text-left w-full group"
              style={activeStage === i ? { borderColor: cfg.accent, boxShadow: `4px 4px 0 ${cfg.accent}` } : {}}
            >
              <div className="relative aspect-square overflow-hidden border-b-2 border-[oklch(0.86_0.01_270)]">
                <Image
                  src={STAGE_IMAGES[i]}
                  alt={stage.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
                <div className="absolute bottom-2.5 left-2.5">
                  <span className={`tag ${cfg.tag}`}>Level {stage.level}</span>
                </div>
                {activeStage === i && (
                  <div
                    className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full"
                    style={{ background: cfg.accent }}
                  />
                )}
              </div>
              <div className="p-3.5">
                <h3 className="font-black text-sm">{stage.name}</h3>
                <p className="text-xs text-[oklch(0.55_0.03_270)] line-clamp-2 leading-relaxed mt-0.5">
                  {stage.description}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Expanded stage detail */}
        {activeStage !== null && (
          <div
            className="panel border-2 overflow-hidden mb-12 animate-slide-in-up"
            style={{ borderColor: cfg.accent, boxShadow: `6px 6px 0 ${cfg.accent}` }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
              <div className="relative min-h-64 overflow-hidden border-b-2 md:border-b-0 md:border-r-2" style={{ borderColor: cfg.accent }}>
                <Image
                  src={STAGE_IMAGES[activeStage]}
                  alt={EVOLUTION_STAGES[activeStage].name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="md:col-span-2 p-7 flex flex-col gap-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="font-black text-2xl">{EVOLUTION_STAGES[activeStage].name}</h3>
                  <span className={`tag ${cfg.tag} capitalize`}>{activeRarity}</span>
                  <span className="tag tag-indigo">Stage {EVOLUTION_STAGES[activeStage].level}/5</span>
                </div>
                <p className="text-[oklch(0.42_0.03_270)] leading-relaxed">
                  {EVOLUTION_STAGES[activeStage].description}
                </p>
                <div className="inset-panel flex items-center gap-3">
                  <span className="stat-label">Requirements</span>
                  <span className="text-sm font-semibold">{EVOLUTION_STAGES[activeStage].requirements}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="stat-label">Progress</span>
                  <div className="level-bar-track flex-1">
                    <div
                      className="level-bar-fill"
                      style={{
                        width: `${(EVOLUTION_STAGES[activeStage].level / 5) * 100}%`,
                        backgroundColor: cfg.accent,
                      }}
                    />
                  </div>
                  <span className="text-xs font-black" style={{ color: cfg.accent }}>
                    {EVOLUTION_STAGES[activeStage].level}/5
                  </span>
                </div>
                <Link href="/mint" className="self-start mt-2">
                  <button className="btn-primary" style={{ backgroundColor: cfg.accent, borderColor: cfg.accent }}>
                    Mint This Stage <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Full evolution timeline */}
        <div className="pt-10 border-t-2 border-[oklch(0.86_0.01_270)]">
          <h2 className="font-black text-xl mb-6">Full Evolution Path</h2>
          <div className="space-y-3">
            {EVOLUTION_STAGES.map((stage, i) => (
              <div
                key={stage.level}
                className="panel flex gap-4 items-center hover:border-[var(--indigo)] transition-colors cursor-pointer group"
                onClick={() => setActiveStage(i === activeStage ? null : i)}
              >
                <div className="relative w-14 h-14 rounded-xl overflow-hidden border-2 border-[oklch(0.86_0.01_270)] flex-shrink-0">
                  <Image
                    src={STAGE_IMAGES[i]}
                    alt={stage.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="56px"
                  />
                </div>
                <div
                  className="w-8 h-8 rounded-lg text-white flex items-center justify-center font-black text-sm flex-shrink-0"
                  style={{ background: cfg.accent }}
                >
                  {stage.level}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="font-black text-sm">{stage.name}</span>
                    <span className={`tag ${cfg.tag}`}>Level {stage.level}</span>
                  </div>
                  <p className="text-xs text-[oklch(0.55_0.03_270)] truncate">{stage.requirements}</p>
                </div>
                {i < EVOLUTION_STAGES.length - 1 && (
                  <span className="hidden lg:block text-xs font-bold text-[oklch(0.6_0.03_270)]">
                    Level up →
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
