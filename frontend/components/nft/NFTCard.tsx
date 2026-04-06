'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { NFT } from '@/lib/mock-data';
import { Zap, Eye, Loader2, Heart, TrendingUp, Tag } from 'lucide-react';

const STAGE_IMAGES = [
  '/nft-1.jpg',
  '/nft-3.jpg',
  '/nft-5.jpg',
  '/nft-7.jpg',
  '/nft-2.jpg',
];
const STAGE_NAMES = ['Rookie', 'Explorer', 'Warrior', 'Champion', 'Legend'];

const RARITY_CONF: Record<string, { tag: string; accent: string }> = {
  common:    { tag: 'tag-indigo', accent: '#3730a3' },
  rare:      { tag: 'tag-teal',   accent: '#0d9488' },
  legendary: { tag: 'tag-amber',  accent: '#d97706' },
};

interface NFTCardProps {
  nft: NFT;
  onLevelUp?: (tokenId: number) => void;
  onList?: (nft: NFT) => void;
  loading?: boolean;
  isNew?: boolean;
}

export function NFTCard({ nft, onLevelUp, onList, loading, isNew }: NFTCardProps) {
  const [liked, setLiked] = useState(false);
  const likeBase = (nft.tokenId % 47) + 8;
  const stage = STAGE_NAMES[nft.level - 1];
  const imgSrc = nft.image || STAGE_IMAGES[nft.level - 1];
  const rc = RARITY_CONF[nft.rarity];
  const floorPrice = (0.05 * nft.level * (nft.rarity === 'legendary' ? 5 : nft.rarity === 'rare' ? 2.5 : 1)).toFixed(2);

  return (
    <article
      className="nft-grid-card group relative flex flex-col"
      style={{ boxShadow: '4px 4px 0 oklch(0.86 0.01 270)' }}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden border-b-2 border-[oklch(0.86_0.01_270)] flex-shrink-0">
        <Image
          src={imgSrc}
          alt={`${nft.name} — ${stage}`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        {/* Stage badge */}
        <div className="absolute top-2.5 left-2.5">
          <span className={`tag ${rc.tag}`}>{stage}</span>
        </div>
        {/* NEW indicator */}
        {isNew && (
          <div className="absolute top-2.5 left-20">
            <span className="tag bg-emerald-500 text-white border-emerald-500">🆕 NEW</span>
          </div>
        )}
        {/* Rarity badge */}
        <div className="absolute top-2.5 right-2.5">
          <span className={`tag ${rc.tag} capitalize`}>{nft.rarity}</span>
        </div>
        {/* Level pill */}
        <div className="absolute bottom-2.5 left-2.5 bg-black/75 backdrop-blur-sm text-white text-[9px] font-black px-2 py-1 rounded tracking-widest uppercase">
          Lv {nft.level}/5
        </div>
        {/* Like button */}
        <button
          onClick={(e) => { e.preventDefault(); setLiked(v => !v); }}
          className="absolute bottom-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border-2 border-white flex items-center justify-center shadow hover:scale-110 transition-transform"
          aria-label={liked ? 'Unlike' : 'Like'}
        >
          <Heart
            className="w-3.5 h-3.5 transition-colors duration-150"
            fill={liked ? '#e11d48' : 'none'}
            stroke={liked ? '#e11d48' : 'currentColor'}
          />
        </button>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Name + likes */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-black text-sm leading-snug truncate">{nft.name}</h3>
            <p className="text-[11px] font-mono text-[oklch(0.6_0.03_270)]">Token #{nft.tokenId}</p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0 text-[oklch(0.6_0.03_270)]">
            <Heart className="w-3 h-3" fill={liked ? '#e11d48' : 'none'} stroke={liked ? '#e11d48' : 'currentColor'} />
            <span className="text-xs font-bold">{likeBase + (liked ? 1 : 0)}</span>
          </div>
        </div>

        {/* Floor price */}
        <div
          className="flex items-center justify-between rounded-lg px-3 py-2 border-2"
          style={{ background: 'oklch(0.975 0.005 75)', borderColor: 'oklch(0.88 0.01 270)' }}
        >
          <span className="text-[10px] font-black uppercase tracking-widest text-[oklch(0.55_0.03_270)]">Floor</span>
          <span className="text-sm font-black font-mono" style={{ color: rc.accent }}>{floorPrice} ETH</span>
        </div>

        {/* Level progress */}
        <div className="flex items-center gap-2">
          <TrendingUp className="w-3 h-3 flex-shrink-0" style={{ color: rc.accent }} />
          <div className="level-bar-track flex-1">
            <div className="level-bar-fill" style={{ width: `${(nft.level / 5) * 100}%`, backgroundColor: rc.accent }} />
          </div>
          <span className="text-xs font-black tabular-nums" style={{ color: rc.accent }}>{nft.level}/5</span>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2 mt-auto">
          <Link href={`/nft/${nft.tokenId}`} className="contents">
            <button className="btn-outline w-full py-2 text-xs gap-1.5">
              <Eye className="w-3.5 h-3.5" /> View
            </button>
          </Link>
          <button
            onClick={() => onList?.(nft)}
            className="btn-outline w-full py-2 text-xs gap-1.5"
          >
            <Tag className="w-3.5 h-3.5" /> List
          </button>
          <button
            onClick={() => onLevelUp?.(nft.tokenId)}
            disabled={loading || nft.level >= 5}
            className={`btn-primary w-full py-2 text-xs gap-1.5 col-span-2 ${nft.level >= 5 ? 'opacity-40 cursor-not-allowed' : ''}`}
            style={nft.level < 5 ? { backgroundColor: rc.accent, borderColor: rc.accent } : {}}
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
            {nft.level >= 5 ? 'Max Level' : 'Level Up'}
          </button>
        </div>
      </div>
    </article>
  );
}
