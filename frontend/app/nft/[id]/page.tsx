'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@/lib/context/WalletContext';
import { useContract } from '@/hooks/use-contract';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { EVOLUTION_STAGES } from '@/lib/mock-data';
import { formatAddress, getRarity } from '@/lib/web3-utils';
import { getNFTLevel, getNFTOwner, getEvolutionStage, CONTRACT_ADDRESS } from '@/lib/contract';
import { Zap, Share2, ExternalLink, Loader2, ChevronLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

const STAGE_EMOJIS = ['🥚', '👹', '🐉', '🔥', '✨'];
const RARITY_TAG: Record<string, string> = { common: 'tag-indigo', rare: 'tag-teal', legendary: 'tag-amber' };
const RARITY_BG: Record<string, string>  = {
  common:    'bg-[oklch(0.94_0.05_270)]',
  rare:      'bg-[oklch(0.94_0.05_195)]',
  legendary: 'bg-[oklch(0.96_0.06_75)]',
};

interface NFTState {
  tokenId: number;
  name: string;
  level: number;
  owner: string;
  rarity: 'common' | 'rare' | 'legendary';
}

export default function NFTDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { address, connected } = useWallet();
  const { levelUp, levelingUp, levelUpError } = useContract();
  
  const [paramsValue, setParamsValue] = React.useState<{ id: string } | null>(null);
  const [nft, setNft] = useState<NFTState | null>(null);
  const [loading, setLoading] = useState(true);
  const [leveled, setLeveled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => { params.then(setParamsValue); }, [params]);

  // Load NFT data from contract
  const loadNFT = useCallback(async (tokenId: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const [level, owner] = await Promise.all([
        getNFTLevel(tokenId),
        getNFTOwner(tokenId),
      ]);
      
      if (!owner) {
        setError('NFT not found');
        setNft(null);
      } else {
        setNft({
          tokenId,
          name: `NFTerra #${tokenId}`,
          level,
          owner,
          rarity: getRarity(tokenId),
        });
      }
    } catch (err) {
      console.error('Error loading NFT:', err);
      setError('Failed to load NFT data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (paramsValue?.id) {
      const tokenId = parseInt(paramsValue.id);
      if (!isNaN(tokenId)) {
        loadNFT(tokenId);
      }
    }
  }, [paramsValue, loadNFT]);

  const handleLevelUp = async () => {
    if (!nft) return;
    
    const result = await levelUp(nft.tokenId);
    
    if (result) {
      setLeveled(true);
      setNft(prev => prev ? { ...prev, level: result.newLevel } : null);
      setTimeout(() => setLeveled(false), 4000);
    }
  };

  const isOwner = connected && address && nft?.owner?.toLowerCase() === address.toLowerCase();

  if (!paramsValue || loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[var(--indigo)] animate-spin" />
      </div>
    );
  }

  if (error || !nft) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="panel text-center py-12 px-8">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="font-black text-xl mb-2">NFT Not Found</h2>
            <p className="text-[oklch(0.5_0.03_270)] mb-4">{error || 'This NFT does not exist or has not been minted yet.'}</p>
            <Link href="/dashboard">
              <button className="btn-primary">Back to Dashboard</button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const ATTRS = [
    { k: 'Token ID',   v: `#${nft.tokenId}` },
    { k: 'Owner',      v: formatAddress(nft.owner) },
    { k: 'Standard',   v: 'ERC-721' },
    { k: 'Blockchain', v: 'Ethereum' },
    { k: 'Level',      v: `${nft.level} / 5` },
    { k: 'Stage',      v: getEvolutionStage(nft.level).name },
    { k: 'Rarity',     v: nft.rarity.charAt(0).toUpperCase() + nft.rarity.slice(1) },
    { k: 'Contract',   v: formatAddress(CONTRACT_ADDRESS) },
  ];

  const attributes = [
    { trait_type: 'Level', value: nft.level },
    { trait_type: 'Stage', value: getEvolutionStage(nft.level).name },
    { trait_type: 'Rarity', value: nft.rarity },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      <Navbar />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-10 pb-20 max-w-7xl mx-auto w-full">

        {/* Breadcrumb */}
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[oklch(0.5_0.03_270)] hover:text-[var(--indigo)] transition-colors mb-8">
          <ChevronLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* LEFT — Preview panel (2 cols) */}
          <div className="lg:col-span-2 flex flex-col gap-4">

            {/* Main image */}
            <div
              className="panel overflow-hidden p-0"
              style={{ boxShadow: '6px 6px 0 var(--indigo)' }}
            >
              <div className={`${RARITY_BG[nft.rarity]} border-b-2 border-[oklch(0.86_0.01_270)] aspect-square flex flex-col items-center justify-center gap-4`}>
                <span className="text-9xl animate-float">{STAGE_EMOJIS[nft.level - 1]}</span>
                <span className={`tag ${RARITY_TAG[nft.rarity]}`}>
                  {['Egg','Creature','Dragon','Phoenix','Immortal'][nft.level - 1]}
                </span>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-black">{nft.name}</p>
                  <p className="text-xs font-mono text-[oklch(0.6_0.03_270)]">#{nft.tokenId}</p>
                </div>
                <span className={`tag ${RARITY_TAG[nft.rarity]}`}>
                  {nft.rarity.charAt(0).toUpperCase() + nft.rarity.slice(1)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="panel space-y-3">
              <h3 className="font-black text-sm">Actions</h3>

              {leveled && (
                <div className="flex items-center gap-2 text-sm font-bold text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Level up successful! Now at Level {nft.level}
                </div>
              )}

              {levelUpError && (
                <div className="flex items-center gap-2 text-sm font-bold text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  <AlertCircle className="w-4 h-4" />
                  {levelUpError}
                </div>
              )}

              <button
                onClick={handleLevelUp}
                disabled={levelingUp || nft.level >= 5 || !isOwner}
                className={`btn-primary w-full py-3 ${(nft.level >= 5 || !isOwner) ? 'opacity-40 cursor-not-allowed hover:transform-none' : ''}`}
              >
                {levelingUp ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                {levelingUp ? 'Processing...' : nft.level >= 5 ? 'Max Level Reached' : !isOwner ? 'Not Owner' : `Level Up — 0.02 ETH`}
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button className="btn-outline py-2 text-xs gap-1.5">
                  <Share2 className="w-3.5 h-3.5" /> Share
                </button>
                <a 
                  href={`https://etherscan.io/token/${CONTRACT_ADDRESS}?a=${nft.tokenId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline py-2 text-xs gap-1.5 flex items-center justify-center"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Etherscan
                </a>
              </div>
            </div>
          </div>

          {/* RIGHT — Metadata + Timeline (3 cols) */}
          <div className="lg:col-span-3 flex flex-col gap-6">

            {/* Title */}
            <div>
              <p className="section-eyebrow mb-2">NFT Details</p>
              <h1 className="font-black text-4xl tracking-tight">{nft.name}</h1>
            </div>

            {/* Level bar */}
            <div className="panel">
              <div className="flex items-center justify-between mb-3">
                <span className="stat-label">Evolution Progress</span>
                <span className="font-black text-[var(--indigo)]">Level {nft.level} / 5</span>
              </div>
              <div className="level-bar-track">
                <div className="level-bar-fill" style={{ width: `${(nft.level / 5) * 100}%` }} />
              </div>
              <div className="flex justify-between mt-2 text-xs text-[oklch(0.6_0.03_270)]">
                {['Egg','Creature','Dragon','Phoenix','Immortal'].map((s, i) => (
                  <span key={s} className={i === nft.level - 1 ? 'font-black text-[var(--indigo)]' : ''}>{s}</span>
                ))}
              </div>
            </div>

            {/* Metadata grid */}
            <div className="panel">
              <h3 className="font-black text-sm mb-4">Metadata</h3>
              <div className="grid grid-cols-2 gap-3">
                {ATTRS.map(({ k, v }) => (
                  <div key={k} className="panel-flat">
                    <p className="stat-label mb-1">{k}</p>
                    <p className="font-bold text-sm font-mono truncate">{v}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Attributes */}
            <div className="panel">
              <h3 className="font-black text-sm mb-4">Traits</h3>
              <div className="flex flex-wrap gap-2">
                {attributes.map((attr) => (
                  <div key={attr.trait_type} className="panel-flat px-3 py-2">
                    <p className="stat-label" style={{ fontSize: '0.6rem' }}>{attr.trait_type}</p>
                    <p className="font-black text-xs">{attr.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Evolution timeline */}
            <div className="panel">
              <h3 className="font-black text-sm mb-4">Evolution Timeline</h3>
              <div className="space-y-3">
                {EVOLUTION_STAGES.map((stage, i) => {
                  const done = nft.level > i;
                  const current = nft.level === i + 1;
                  return (
                    <div
                      key={stage.level}
                      className={`flex items-center gap-4 px-4 py-3 rounded-lg border-2 transition-colors ${
                        current
                          ? 'border-[var(--indigo)] bg-[oklch(0.95_0.04_270)]'
                          : done
                            ? 'border-[oklch(0.82_0.04_270)] bg-[oklch(0.975_0.01_270)]'
                            : 'border-[oklch(0.9_0.01_270)] bg-transparent'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm flex-shrink-0 ${
                        done || current
                          ? 'border-[var(--indigo)] bg-[var(--indigo)] text-white'
                          : 'border-[oklch(0.82_0.01_270)] text-[oklch(0.7_0.01_270)]'
                      }`}>
                        {done ? '✓' : stage.level}
                      </div>
                      <span className="text-xl">{STAGE_EMOJIS[i]}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`font-black text-sm ${current ? 'text-[var(--indigo)]' : ''}`}>{stage.name}</span>
                          {current && <span className="tag tag-indigo" style={{ fontSize: '0.6rem' }}>Current</span>}
                        </div>
                        <span className="text-xs text-[oklch(0.6_0.03_270)]">{stage.requirements}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
