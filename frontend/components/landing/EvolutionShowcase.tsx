'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { EVOLUTION_STAGES } from '@/lib/mock-data';
import { ChevronRight, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const STAGE_IMAGES = [
  '/nft-1.jpg',
  '/nft-3.jpg',
  '/nft-5.jpg',
  '/nft-7.jpg',
  '/nft-2.jpg',
];

const STAGE_TAGS = ['tag-indigo', 'tag-teal', 'tag-indigo', 'tag-amber', 'tag-amber'];

const STAGE_PRICES = ['0.05', '0.12', '0.28', '0.55', '1.20'];

export function EvolutionShowcase() {
  const [active, setActive] = useState(0);
  const stage = EVOLUTION_STAGES[active];

  return (
    <section className="px-4 sm:px-6 lg:px-8 pb-24 max-w-7xl mx-auto">
      <div className="mb-10">
        <p className="section-eyebrow mb-3">The Journey</p>
        <h2 className="section-title">5-Stage Evolution Path</h2>
      </div>

      {/* Stage nav */}
      <div className="grid grid-cols-5 gap-3 mb-5">
        {EVOLUTION_STAGES.map((s, i) => (
          <button
            key={s.level}
            onClick={() => setActive(i)}
            className={`relative overflow-hidden rounded-xl border-2 aspect-square transition-all duration-200 ${
              active === i
                ? 'border-[var(--indigo)] shadow-[4px_4px_0_var(--indigo)]'
                : 'border-[oklch(0.86_0.01_270)] hover:border-[oklch(0.7_0.08_270)]'
            }`}
          >
            <Image src={STAGE_IMAGES[i]} alt={s.name} fill className="object-cover" sizes="200px" loading="eager" />
            <div className={`absolute inset-0 transition-opacity ${active === i ? 'bg-black/10' : 'bg-black/35'}`} />
            <div className="absolute inset-x-0 bottom-0 bg-black/75 py-1.5 px-1">
              <p className="text-white text-[10px] font-black text-center uppercase tracking-wide leading-none">
                {s.name}
              </p>
            </div>
            {active === i && (
              <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-[var(--amber)]" />
            )}
          </button>
        ))}
      </div>

      {/* Expanded detail panel */}
      <div
        className="panel border-2 border-[var(--indigo)] overflow-hidden"
        style={{ boxShadow: '6px 6px 0 var(--indigo)' }}
        key={active}
      >
        <div className="grid grid-cols-1 md:grid-cols-5 gap-0">
          {/* Image */}
          <div className="md:col-span-2 relative min-h-64 overflow-hidden border-b-2 md:border-b-0 md:border-r-2 border-[var(--indigo)]">
            <Image
              src={STAGE_IMAGES[active]}
              alt={stage.name}
              fill
              className="object-cover animate-fade-in"
              sizes="(max-width: 768px) 100vw, 40vw"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4">
              <span className={`tag ${STAGE_TAGS[active]}`}>Stage {stage.level}/5</span>
            </div>
          </div>

          {/* Info */}
          <div className="md:col-span-3 p-7 flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <h3 className="text-3xl font-black tracking-tight">{stage.name}</h3>
              <span className={`tag ${STAGE_TAGS[active]}`}>Level {stage.level}</span>
            </div>

            <p className="text-[oklch(0.42_0.03_270)] leading-relaxed text-base">{stage.description}</p>

            <div className="grid grid-cols-2 gap-3">
              <div className="inset-panel">
                <p className="stat-label mb-1">Floor Price</p>
                <p className="text-lg font-black font-mono text-[var(--indigo)]">{STAGE_PRICES[active]} ETH</p>
              </div>
              <div className="inset-panel">
                <p className="stat-label mb-1">Requirements</p>
                <p className="text-sm font-semibold truncate">{stage.requirements}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="stat-label">Progress</span>
              <div className="level-bar-track flex-1">
                <div className="level-bar-fill" style={{ width: `${(stage.level / 5) * 100}%` }} />
              </div>
              <span className="text-xs font-black text-[var(--indigo)]">{stage.level}/5</span>
            </div>

            {/* Stage arrows */}
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              {EVOLUTION_STAGES.map((s, i) => (
                <React.Fragment key={s.level}>
                  <button
                    onClick={() => setActive(i)}
                    className={`text-xs font-black px-2.5 py-1 rounded-lg border-2 transition-colors ${
                      active === i
                        ? 'border-[var(--indigo)] bg-[var(--indigo)] text-white'
                        : 'border-[oklch(0.86_0.01_270)] text-[oklch(0.5_0.03_270)] hover:border-[var(--indigo)]'
                    }`}
                  >
                    {s.name}
                  </button>
                  {i < EVOLUTION_STAGES.length - 1 && (
                    <ChevronRight className="w-3 h-3 text-[oklch(0.7_0.03_270)]" />
                  )}
                </React.Fragment>
              ))}
            </div>

            <Link href="/gallery" className="mt-auto self-start">
              <button className="btn-primary gap-2">
                Explore All Rarities <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
