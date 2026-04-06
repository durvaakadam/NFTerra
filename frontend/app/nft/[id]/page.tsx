'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@/lib/context/WalletContext';
import { useTxHistory } from '@/lib/context/TxHistoryContext';
import { useNFTStore } from '@/lib/context/NFTStoreContext';
import { useMyListings } from '@/lib/context/MyListingsContext';
import { useContract } from '@/hooks/use-contract';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { formatAddress, getRarity } from '@/lib/web3-utils';
import { getNFTLevel, getNFTOwner, getEvolutionStage, CONTRACT_ADDRESS, getTotalMinted } from '@/lib/contract';
import { EVOLUTION_STAGES } from '@/lib/mock-data';
import { Zap, Share2, ExternalLink, Loader2, ChevronLeft, CheckCircle2, AlertCircle, Copy } from 'lucide-react';
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
  exists: boolean;
  totalMinted?: number;
}

export default function NFTDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { address, connected } = useWallet();
  const { levelUp, levelingUp, levelUpError } = useContract();
  const { transactions } = useTxHistory();
  const { newNFTs } = useNFTStore();
  const { listings } = useMyListings();
  
  const [paramsValue, setParamsValue] = React.useState<{ id: string } | null>(null);
  const [nft, setNft] = useState<NFTState | null>(null);
  const [loading, setLoading] = useState(true);
  const [leveled, setLeveled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [evolving, setEvolving] = useState<'idle' | 'animating' | 'complete'>('idle');
  const [evolutionFromLevel, setEvolutionFromLevel] = useState<number | null>(null);
  const [evolutionToLevel, setEvolutionToLevel] = useState<number | null>(null);

  React.useEffect(() => { params.then(setParamsValue); }, [params]);

  // Load NFT data from contract
  const loadNFT = useCallback(async (tokenId: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const [level, owner, totalMinted] = await Promise.all([
        getNFTLevel(tokenId),
        getNFTOwner(tokenId),
        getTotalMinted(),
      ]);
      
      const nftExists = owner !== null;
      
      setNft({
        tokenId,
        name: `NFTerra #${tokenId}`,
        level: level || 1,
        owner: owner || '0x0000000000000000000000000000000000000000',
        rarity: getRarity(tokenId),
        exists: nftExists,
        totalMinted,
      });
      
      // If NFT doesn't exist on-chain, check if there's a listing for it
      if (!nftExists && tokenId >= totalMinted) {
        const hasListing = listings.some(l => l.tokenId === tokenId && l.status === 'active');
        if (!hasListing) {
          setError(`NFT #${tokenId} has not been minted yet. Total minted: ${totalMinted}`);
        }
        // If there's a listing, we'll continue showing it with fallback data
      }
    } catch (err) {
      console.error('Error loading NFT:', err);
      setError('Failed to load NFT data. Please try again.');
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
    if (!nft || nft.level >= 5) return;

    const fromLevel = nft.level;
    const toLevel = Math.min(5, nft.level + 1);

    setEvolutionFromLevel(fromLevel);
    setEvolutionToLevel(toLevel);
    setEvolving('animating');

    try {
      const result = await levelUp(nft.tokenId);

      if (result) {
        setLeveled(true);
        setNft(prev => (prev ? { ...prev, level: result.newLevel } : null));
        setTimeout(() => setLeveled(false), 4000);
        setEvolving('complete');
      } else {
        setEvolving('idle');
      }
    } catch (err) {
      console.error('Level up failed:', err);
      setEvolving('idle');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading && !paramsValue) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[var(--indigo)] animate-spin" />
      </div>
    );
  }

  // Check if there's a listing even if blockchain lookup failed
  const hasListing = paramsValue && listings.some(l => l.tokenId === parseInt(paramsValue.id, 10) && l.status === 'active');
  
  if (error && !nft && !hasListing) {
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

  // If we have a listing but no on-chain data, create a placeholder NFT from the listing
  let displayNFT = nft;
  if (hasListing && !nft && paramsValue) {
    const tokenId = parseInt(paramsValue.id, 10);
    const listing = listings.find(l => l.tokenId === tokenId && l.status === 'active');
    if (listing) {
      displayNFT = {
        tokenId,
        name: listing.tokenName,
        level: listing.level,
        owner: listing.seller,
        rarity: listing.rarity,
        exists: false,
        totalMinted: 0,
      };
    }
  }

  if (!displayNFT) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="panel text-center py-12 px-8">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="font-black text-xl mb-2">NFT Not Found</h2>
            <p className="text-[oklch(0.5_0.03_270)] mb-4">This NFT does not exist or has not been minted yet.</p>
            <Link href="/dashboard">
              <button className="btn-primary">Back to Dashboard</button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Prefer full metadata (name, image, rarity) from local NFT store when available
  const storeNFT = newNFTs.find(n => n.tokenId === displayNFT.tokenId);
  const displayName = storeNFT?.name || displayNFT.name;
  const displayRarity = (storeNFT?.rarity || displayNFT.rarity) as 'common' | 'rare' | 'legendary';
  const stageIndex = Math.max(0, Math.min(displayNFT.level - 1, EVOLUTION_STAGES.length - 1));
  // Always drive the main artwork from evolution stages so image updates with level
  const displayImage = EVOLUTION_STAGES[stageIndex]?.image || '/nft-1.jpg';
  
  // Get listing info if available
  const listing = listings.find(l => l.tokenId === displayNFT.tokenId && l.status === 'active');

  const isOwner = connected && address && displayNFT?.owner?.toLowerCase() === address.toLowerCase();

  const fromStage = evolutionFromLevel
    ? EVOLUTION_STAGES[Math.max(0, Math.min(evolutionFromLevel - 1, EVOLUTION_STAGES.length - 1))]
    : null;
  const toStage = evolutionToLevel
    ? EVOLUTION_STAGES[Math.max(0, Math.min(evolutionToLevel - 1, EVOLUTION_STAGES.length - 1))]
    : null;

  const ATTRS = [
    { k: 'Token ID',      v: `#${displayNFT.tokenId}` },
    { k: 'Owner',         v: formatAddress(displayNFT.owner) },
    { k: 'Current Level', v: `${displayNFT.level} / 5` },
    { k: 'Stage',         v: getEvolutionStage(displayNFT.level).name },
    { k: 'Rarity',        v: displayRarity.charAt(0).toUpperCase() + displayRarity.slice(1) },
    { k: 'Standard',      v: 'ERC-721' },
    { k: 'Network',       v: 'Ethereum' },
    { k: 'Contract',      v: formatAddress(CONTRACT_ADDRESS) },
    { k: 'Evolution',     v: `${Math.round((displayNFT.level / 5) * 100)}%` },
    { k: 'Mint Price',    v: '0.05 ETH' },
    { k: 'Level Up Cost', v: '0.02 ETH' },
    ...(listing ? [{ k: 'Listed Price', v: `${listing.price} ${listing.currency}` }] : []),
  ];

  const evolution = getEvolutionStage(displayNFT.level);
  const relatedTxs = transactions.filter(tx => 
    String(tx.tokenId) === String(displayNFT.tokenId) || tx.tokenName?.includes(`#${displayNFT.tokenId}`)
  );

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      <Navbar />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-10 pb-20 max-w-7xl mx-auto w-full">

        {/* Breadcrumb */}
        <Link href={listing ? "/marketplace" : "/dashboard"} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[oklch(0.5_0.03_270)] hover:text-[var(--indigo)] transition-colors mb-8">
          <ChevronLeft className="w-4 h-4" />
          Back to {listing ? "Marketplace" : "Dashboard"}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* LEFT — Preview panel (2 cols) */}
          <div className="lg:col-span-2 flex flex-col gap-4">

            {/* Main image */}
            <div
              className="panel overflow-hidden p-0"
              style={{ boxShadow: '6px 6px 0 var(--indigo)' }}
            >
              <img
                src={displayImage}
                alt={displayName}
                className="w-full aspect-square object-cover"
              />
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-black">{displayName}</p>
                  <p className="text-xs font-mono text-[oklch(0.6_0.03_270)]">#{displayNFT.tokenId}</p>
                </div>
                <span className={`tag ${RARITY_TAG[displayRarity]}`}>
                  {displayRarity.charAt(0).toUpperCase() + displayRarity.slice(1)}
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

              {!listing && (
                <button
                  onClick={handleLevelUp}
                  disabled={levelingUp || displayNFT.level >= 5 || !isOwner}
                  className={`btn-primary w-full py-3 flex items-center justify-center gap-2 ${(displayNFT.level >= 5 || !isOwner) ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  <Zap className="w-4 h-4" />
                  {displayNFT.level >= 5 ? 'Max Level Reached' : `Level Up (0.02 ETH)`}
                </button>
              )}

              {listing && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-sm font-bold text-amber-900 mb-2">Listed for Sale</p>
                  <p className="font-black text-lg text-amber-700">{listing.price} {listing.currency}</p>
                </div>
              )}

              {displayNFT.level >= 5 && !listing && (
                <p className="text-xs text-[oklch(0.5_0.03_270)] text-center">This NFT has reached maximum evolution!</p>
              )}

              {!isOwner && displayNFT.exists && !listing && (
                <p className="text-xs text-[oklch(0.5_0.03_270)] text-center">You don't own this NFT</p>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => copyToClipboard(displayNFT.tokenId.toString())}
                  className="btn-secondary flex-1 flex items-center justify-center gap-1 text-sm py-2"
                >
                  <Copy className="w-3 h-3" />
                  {copied ? 'Copied!' : 'Copy ID'}
                </button>
                <a
                  href={`https://etherscan.io/token/${CONTRACT_ADDRESS}?a=${displayNFT.tokenId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary flex-1 flex items-center justify-center gap-1 text-sm py-2"
                >
                  <ExternalLink className="w-3 h-3" />
                  Explorer
                </a>
              </div>
            </div>
          </div>

          {/* RIGHT — Comprehensive Details (3 cols) */}
          <div className="lg:col-span-3 flex flex-col gap-4">

            {/* Evolution Info */}
            <div className="panel space-y-4">
              <div>
                <h3 className="font-black text-lg mb-2">Evolution Status</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">Level {displayNFT.level}</span>
                    <span className="text-sm font-semibold text-[var(--indigo)]">{Math.round((displayNFT.level / 5) * 100)}%</span>
                  </div>
                  <div className="w-full bg-[oklch(0.88_0.02_270)] rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-[var(--indigo)] to-[var(--teal)] h-2 rounded-full transition-all"
                      style={{ width: `${(displayNFT.level / 5) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-[oklch(0.6_0.03_270)]">
                    {displayNFT.level < 5 
                      ? `${5 - displayNFT.level} more level${5 - displayNFT.level === 1 ? '' : 's'} to reach Immortal stage`
                      : 'Maximum evolution reached!'
                    }
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="font-black text-sm mb-2">Evolution Path</h4>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map(level => (
                    <div key={level} className="flex flex-col items-center gap-1">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${
                        level <= displayNFT.level 
                          ? RARITY_BG[displayRarity]
                          : 'bg-[oklch(0.88_0.02_270)]'
                      }`}>
                        {STAGE_EMOJIS[level - 1]}
                      </div>
                      <span className="text-xs font-semibold">{['Egg','Creature','Dragon','Phoenix','Immortal'][level - 1]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Next Evolution Preview */}
            {displayNFT.level < 5 && (
              <div className="panel space-y-3">
                <h3 className="font-black text-lg">Next Evolution</h3>
                <p className="text-sm text-[oklch(0.6_0.03_270)]">
                  Preview how this NFT will look and feel after the next level up.
                </p>
                {EVOLUTION_STAGES[displayNFT.level] && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-[oklch(0.6_0.03_270)] uppercase">Current Stage</p>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-[oklch(0.94_0.05_270)]">
                          {EVOLUTION_STAGES[displayNFT.level - 1]?.emoji}
                        </div>
                        <div>
                          <p className="font-black text-sm">{EVOLUTION_STAGES[displayNFT.level - 1]?.name}</p>
                          <p className="text-xs text-[oklch(0.6_0.03_270)]">Lv {displayNFT.level} / 5</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-[oklch(0.6_0.03_270)] uppercase">Next Stage</p>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-[oklch(0.96_0.05_75)] animate-pulse">
                          {EVOLUTION_STAGES[displayNFT.level]?.emoji}
                        </div>
                        <div>
                          <p className="font-black text-sm">{EVOLUTION_STAGES[displayNFT.level]?.name}</p>
                          <p className="text-xs text-[oklch(0.6_0.03_270)]">Lv {displayNFT.level + 1} / 5</p>
                          <p className="text-[11px] text-[oklch(0.55_0.03_270)] mt-1">
                            {EVOLUTION_STAGES[displayNFT.level]?.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* All Attributes */}
            <div className="panel space-y-3">
              <h3 className="font-black text-lg">All Details</h3>
              <div className="grid grid-cols-2 gap-4">
                {ATTRS.map((attr, i) => (
                  <div key={i} className="space-y-1">
                    <p className="text-xs font-semibold text-[oklch(0.6_0.03_270)] uppercase">{attr.k}</p>
                    <p className="font-bold text-sm break-all">{attr.v}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Evolution Description */}
            <div className="panel space-y-3">
              <h3 className="font-black text-lg">Stage Info</h3>
              <p className="text-sm text-[oklch(0.6_0.03_270)]">{evolution.description}</p>
              <div className="bg-[oklch(0.94_0.05_270)] rounded-lg p-3 border border-[oklch(0.86_0.01_270)] space-y-2">
                <p className="text-xs font-semibold text-[oklch(0.5_0.03_270)] uppercase">Traits</p>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Evolution Stage:</span>
                    <span className="font-bold">{evolution.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Power Level:</span>
                    <span className="font-bold">{displayNFT.level * 20}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Unique ID:</span>
                    <span className="font-mono text-xs font-bold">{displayNFT.tokenId}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction History */}
            {!listing && relatedTxs.length > 0 && (
              <div className="panel space-y-3">
                <h3 className="font-black text-lg">Transaction History</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {relatedTxs.map((tx, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-[oklch(0.94_0.05_270)] rounded">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold">{tx.action}</p>
                        <p className="text-xs text-[oklch(0.6_0.03_270)] font-mono truncate">{tx.hash}</p>
                      </div>
                      <div className="text-right ml-2">
                        <p className="text-sm font-bold">{tx.amount}</p>
                        <span className={`text-xs font-semibold ${
                          tx.status === 'success' ? 'text-green-600' : 
                          tx.status === 'failed' ? 'text-red-600' : 
                          'text-yellow-600'
                        }`}>
                          {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {listing && (
              <div className="panel space-y-3">
                <h3 className="font-black text-lg">Listing Details</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[oklch(0.6_0.03_270)]">Price</span>
                    <span className="font-black">{listing.price} {listing.currency}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[oklch(0.6_0.03_270)]">Type</span>
                    <span className="font-black capitalize">{listing.listingType}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[oklch(0.6_0.03_270)]">Duration</span>
                    <span className="font-black">{listing.durationDays > 0 ? `${listing.durationDays} days` : 'No expiry'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[oklch(0.6_0.03_270)]">Status</span>
                    <span className="font-black text-[var(--rose)]">Listed</span>
                  </div>
                </div>
              </div>
            )}

            {/* Owner Info */}
            {!listing && (
              <div className="panel space-y-3">
                <h3 className="font-black text-lg">Ownership</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-semibold text-[oklch(0.6_0.03_270)] uppercase mb-1">Owner Address</p>
                    <p className="font-mono text-sm break-all font-bold">{displayNFT.owner}</p>
                  </div>
                  {isOwner && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-2 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm font-semibold text-green-700">You own this NFT</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {listing && (
              <div className="panel space-y-3">
                <h3 className="font-black text-lg">Seller Info</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-semibold text-[oklch(0.6_0.03_270)] uppercase mb-1">Seller Address</p>
                    <p className="font-mono text-sm break-all font-bold">{listing.seller}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Evolution overlay */}
      {evolving !== 'idle' && fromStage && toStage && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="relative max-w-xl w-full panel overflow-hidden" style={{ boxShadow: '8px 8px 0 var(--indigo)' }}>
            <button
              onClick={() => {
                setEvolving('idle');
                setEvolutionFromLevel(null);
                setEvolutionToLevel(null);
              }}
              className="absolute top-3 right-3 text-[oklch(0.6_0.03_270)] hover:text-[oklch(0.3_0.03_270)] text-sm font-bold"
            >
              ✕
            </button>

            <div className="flex flex-col gap-4 items-center text-center pt-6 pb-4 px-4">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-5 h-5 text-[var(--indigo)] animate-pulse" />
                <h2 className="font-black text-2xl">
                  {evolving === 'animating' ? 'Evolving NFT...' : 'Evolution Complete!'}
                </h2>
              </div>
              <p className="text-xs uppercase tracking-[0.2em] font-black text-[oklch(0.55_0.03_270)] mb-1">
                Token #{displayNFT.tokenId}
              </p>

              <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center w-full mt-2">
                {/* From stage */}
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[oklch(0.6_0.03_270)]">From</p>
                  <div className="inset-panel flex flex-col items-center gap-2">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl bg-[oklch(0.94_0.05_270)]">
                      {fromStage.emoji}
                    </div>
                    <p className="font-black text-sm">{fromStage.name}</p>
                    <p className="text-[11px] text-[oklch(0.6_0.03_270)]">Lv {fromStage.level} / 5</p>
                  </div>
                </div>

                {/* Arrow / energy column */}
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="w-1 h-12 rounded-full bg-gradient-to-b from-[var(--indigo)] via-[var(--teal)] to-[var(--amber)] animate-pulse" />
                  <span className="text-xs font-black text-[oklch(0.55_0.03_270)]">Lv +1</span>
                </div>

                {/* To stage */}
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[oklch(0.6_0.03_270)]">To</p>
                  <div className="inset-panel flex flex-col items-center gap-2">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl bg-[oklch(0.96_0.06_75)] ${
                      evolving === 'animating' ? 'animate-bounce' : 'animate-none'
                    }`}>
                      {toStage.emoji}
                    </div>
                    <p className="font-black text-sm">{toStage.name}</p>
                    <p className="text-[11px] text-[oklch(0.6_0.03_270)]">Lv {toStage.level} / 5</p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-[oklch(0.6_0.03_270)] mt-2 max-w-sm">
                {evolving === 'animating'
                  ? 'Confirm the transaction in your wallet to complete this evolution.'
                  : 'Your NFT has evolved! Stats and artwork across the app have been updated.'}
              </p>

              {evolving === 'complete' && (
                <button
                  onClick={() => {
                    setEvolving('idle');
                    setEvolutionFromLevel(null);
                    setEvolutionToLevel(null);
                  }}
                  className="btn-primary mt-2"
                >
                  Continue Exploring
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
