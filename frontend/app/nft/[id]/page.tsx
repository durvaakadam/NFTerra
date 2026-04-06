'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@/lib/context/WalletContext';
import { useTxHistory } from '@/lib/context/TxHistoryContext';
import { useNFTStore } from '@/lib/context/NFTStoreContext';
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
  
  const [paramsValue, setParamsValue] = React.useState<{ id: string } | null>(null);
  const [nft, setNft] = useState<NFTState | null>(null);
  const [loading, setLoading] = useState(true);
  const [leveled, setLeveled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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
      
      if (!nftExists && tokenId >= totalMinted) {
        setError(`NFT #${tokenId} has not been minted yet. Total minted: ${totalMinted}`);
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
    if (!nft) return;
    
    const result = await levelUp(nft.tokenId);
    
    if (result) {
      setLeveled(true);
      setNft(prev => prev ? { ...prev, level: result.newLevel } : null);
      setTimeout(() => setLeveled(false), 4000);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

  // Prefer full metadata (name, image, rarity) from local NFT store when available
  const storeNFT = newNFTs.find(n => n.tokenId === nft.tokenId);
  const displayName = storeNFT?.name || nft.name;
  const displayRarity = (storeNFT?.rarity || nft.rarity) as 'common' | 'rare' | 'legendary';
  const stageIndex = Math.max(0, Math.min(nft.level - 1, EVOLUTION_STAGES.length - 1));
  const fallbackImage = EVOLUTION_STAGES[stageIndex]?.image || '/nft-1.jpg';
  const displayImage = storeNFT?.image || fallbackImage;

  const ATTRS = [
    { k: 'Token ID',      v: `#${nft.tokenId}` },
    { k: 'Owner',         v: formatAddress(nft.owner) },
    { k: 'Current Level', v: `${nft.level} / 5` },
    { k: 'Stage',         v: getEvolutionStage(nft.level).name },
    { k: 'Rarity',        v: displayRarity.charAt(0).toUpperCase() + displayRarity.slice(1) },
    { k: 'Standard',      v: 'ERC-721' },
    { k: 'Network',       v: 'Ethereum' },
    { k: 'Contract',      v: formatAddress(CONTRACT_ADDRESS) },
    { k: 'Evolution',     v: `${Math.round((nft.level / 5) * 100)}%` },
    { k: 'Mint Price',    v: '0.05 ETH' },
    { k: 'Level Up Cost', v: '0.02 ETH' },
  ];

  const evolution = getEvolutionStage(nft.level);
  const relatedTxs = transactions.filter(tx => 
    String(tx.tokenId) === String(nft.tokenId) || tx.tokenName?.includes(`#${nft.tokenId}`)
  );

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
              <img
                src={displayImage}
                alt={displayName}
                className="w-full aspect-square object-cover"
              />
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-black">{displayName}</p>
                  <p className="text-xs font-mono text-[oklch(0.6_0.03_270)]">#{nft.tokenId}</p>
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

              <button
                onClick={handleLevelUp}
                disabled={levelingUp || nft.level >= 5 || !isOwner}
                className={`btn-primary w-full py-3 flex items-center justify-center gap-2 ${(nft.level >= 5 || !isOwner) ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                <Zap className="w-4 h-4" />
                {nft.level >= 5 ? 'Max Level Reached' : `Level Up (0.02 ETH)`}
              </button>

              {nft.level >= 5 && (
                <p className="text-xs text-[oklch(0.5_0.03_270)] text-center">This NFT has reached maximum evolution!</p>
              )}

              {!isOwner && nft.exists && (
                <p className="text-xs text-[oklch(0.5_0.03_270)] text-center">You don't own this NFT</p>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => copyToClipboard(nft.tokenId.toString())}
                  className="btn-secondary flex-1 flex items-center justify-center gap-1 text-sm py-2"
                >
                  <Copy className="w-3 h-3" />
                  {copied ? 'Copied!' : 'Copy ID'}
                </button>
                <a
                  href={`https://etherscan.io/token/${CONTRACT_ADDRESS}?a=${nft.tokenId}`}
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
                    <span className="text-sm font-semibold">Level {nft.level}</span>
                    <span className="text-sm font-semibold text-[var(--indigo)]">{Math.round((nft.level / 5) * 100)}%</span>
                  </div>
                  <div className="w-full bg-[oklch(0.88_0.02_270)] rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-[var(--indigo)] to-[var(--teal)] h-2 rounded-full transition-all"
                      style={{ width: `${(nft.level / 5) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-[oklch(0.6_0.03_270)]">
                    {nft.level < 5 
                      ? `${5 - nft.level} more level${5 - nft.level === 1 ? '' : 's'} to reach Immortal stage`
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
                        level <= nft.level 
                          ? RARITY_BG[nft.rarity]
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
                    <span className="font-bold">{nft.level * 20}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Unique ID:</span>
                    <span className="font-mono text-xs font-bold">{nft.tokenId}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction History */}
            {relatedTxs.length > 0 && (
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

            {/* Owner Info */}
            <div className="panel space-y-3">
              <h3 className="font-black text-lg">Ownership</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-xs font-semibold text-[oklch(0.6_0.03_270)] uppercase mb-1">Owner Address</p>
                  <p className="font-mono text-sm break-all font-bold">{nft.owner}</p>
                </div>
                {isOwner && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm font-semibold text-green-700">You own this NFT</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
