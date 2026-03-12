'use client';

import React from 'react';
import { NFT, EVOLUTION_STAGES } from '@/lib/mock-data';
import { formatAddress } from '@/lib/web3-utils';

interface NFTPreviewProps {
  nft: NFT;
  large?: boolean;
}

export function NFTPreview({ nft, large }: NFTPreviewProps) {
  const stage = EVOLUTION_STAGES[nft.level - 1] || EVOLUTION_STAGES[0];

  return (
    <div
      className="relative w-full aspect-square rounded-2xl flex items-center justify-center overflow-hidden border-2 border-indigo-100"
      style={{ background: 'linear-gradient(135deg, oklch(0.94 0.04 270), oklch(0.97 0.03 75))' }}
    >
      <div className="text-center">
        <div className={`${large ? 'text-9xl' : 'text-7xl'} mb-3 animate-float`} role="img" aria-label={stage.name}>
          {stage.emoji}
        </div>
        <p className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--indigo)' }}>
          {stage.name}
        </p>
        <p className="text-xs mt-1" style={{ color: 'oklch(0.5 0.04 270)' }}>
          #{nft.tokenId}
        </p>
      </div>
      <div className="absolute top-3 right-3">
        <span className={`tag ${nft.rarity === 'legendary' ? 'tag-amber' : nft.rarity === 'rare' ? 'tag-indigo' : 'tag-teal'}`}>
          {nft.rarity}
        </span>
      </div>
    </div>
  );
}

interface NFTMetadataPanelProps {
  nft: NFT;
}

export function NFTMetadataPanel({ nft }: NFTMetadataPanelProps) {
  const rows = [
    { label: 'Token ID',     value: `#${nft.tokenId}`,                           mono: true  },
    { label: 'Owner',        value: formatAddress(nft.owner),                     mono: true  },
    { label: 'Rarity',       value: nft.rarity,                                   mono: false },
    { label: 'Last Evolved', value: new Date(nft.lastLevelUp).toLocaleDateString(), mono: false },
  ];

  return (
    <div className="panel space-y-5">
      <h3 className="text-xs font-black uppercase tracking-widest" style={{ color: 'oklch(0.5 0.04 270)' }}>
        Metadata
      </h3>

      <div className="space-y-1">
        {rows.map(({ label, value, mono }) => (
          <div key={label} className="flex justify-between items-center py-2.5 border-b border-slate-100 last:border-0">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'oklch(0.55 0.04 270)' }}>
              {label}
            </span>
            <span
              className={`text-sm font-semibold ${mono ? 'font-mono' : 'capitalize'}`}
              style={{ color: 'oklch(0.13 0.02 270)' }}
            >
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* Level bar */}
      <div>
        <div className="flex justify-between text-xs mb-2">
          <span className="font-bold uppercase tracking-widest" style={{ color: 'oklch(0.5 0.04 270)' }}>
            Level Progress
          </span>
          <span className="font-black" style={{ color: 'var(--indigo)' }}>{nft.level} / 5</span>
        </div>
        <div className="level-bar-track">
          <div className="level-bar-fill" style={{ width: `${(nft.level / 5) * 100}%` }} />
        </div>
      </div>

      {/* Traits */}
      {nft.attributes && nft.attributes.length > 0 && (
        <div>
          <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: 'oklch(0.5 0.04 270)' }}>
            Traits
          </p>
          <div className="grid grid-cols-2 gap-2">
            {nft.attributes.map((attr, i) => (
              <div key={i} className="inset-panel">
                <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'oklch(0.55 0.04 270)' }}>
                  {attr.trait_type}
                </p>
                <p className="text-sm font-black" style={{ color: 'var(--indigo)' }}>{attr.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* Legacy exports kept for backward compat */
export const NFTMetadata = NFTMetadataPanel;

interface EvolutionTimelineProps {
  currentLevel?: number;
  nft?: NFT;
}

export function EvolutionTimeline({ currentLevel, nft }: EvolutionTimelineProps) {
  const level = currentLevel ?? nft?.level ?? 1;

  return (
    <div className="panel">
      <h3 className="text-xs font-black uppercase tracking-widest mb-5" style={{ color: 'oklch(0.5 0.04 270)' }}>
        Evolution Path
      </h3>
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {EVOLUTION_STAGES.map((stage, index) => {
          const isComplete = index + 1 < level;
          const isCurrent  = index + 1 === level;
          const isLocked   = index + 1 > level;

          return (
            <React.Fragment key={stage.level}>
              <div
                className={`flex flex-col items-center gap-1.5 min-w-[68px] p-2.5 rounded-xl border-2 transition-all
                  ${isCurrent  ? 'border-indigo-400 bg-indigo-50'         : ''}
                  ${isComplete ? 'border-green-300 bg-green-50'            : ''}
                  ${isLocked   ? 'border-slate-200 bg-slate-50 opacity-40' : ''}
                `}
              >
                <span className="text-xl">{stage.emoji}</span>
                <span
                  className="text-xs font-black uppercase tracking-wide text-center leading-none"
                  style={{ color: isCurrent ? 'var(--indigo)' : isComplete ? '#16a34a' : 'oklch(0.6 0.02 270)' }}
                >
                  {stage.name}
                </span>
                <span className="text-xs font-mono" style={{ color: 'oklch(0.6 0.02 270)' }}>
                  Lv.{stage.level}
                </span>
              </div>
              {index < EVOLUTION_STAGES.length - 1 && (
                <div className={`h-0.5 w-4 flex-shrink-0 rounded-full ${isComplete ? 'bg-green-400' : 'bg-slate-200'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
