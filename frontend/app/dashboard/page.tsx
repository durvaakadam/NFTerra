'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@/lib/context/WalletContext';
import { useContract } from '@/hooks/use-contract';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { NFTGrid } from '@/components/nft/NFTGrid';
import { NFT } from '@/lib/mock-data';
import { formatAddress, getRarity } from '@/lib/web3-utils';
import { getEvolutionStage } from '@/lib/contract';
import { RefreshCw, Wallet, TrendingUp, Layers, Star, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { address, connected, connectWallet } = useWallet();
  const { fetchUserNFTs, fetchingNFTs, levelUp, levelingUp, levelUpError } = useContract();
  
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Transform contract NFT data to UI NFT format
  const transformNFTData = useCallback((contractNFTs: any[]): NFT[] => {
    return contractNFTs.map((nft) => {
      const stage = getEvolutionStage(nft.level);
      const stageImages = ['/nft-1.jpg', '/nft-3.jpg', '/nft-5.jpg', '/nft-7.jpg', '/nft-2.jpg'];
      const attributes = [
        { trait_type: 'Stage', value: stage.name },
        { trait_type: 'Level', value: nft.level },
        { trait_type: 'Rarity', value: getRarity(nft.tokenId) },
      ];
      
      return {
        tokenId: nft.tokenId,
        name: nft.name,
        level: nft.level,
        image: stageImages[Math.min(nft.level - 1, 4)],
        rarity: getRarity(nft.tokenId),
        owner: nft.owner,
        lastLevelUp: new Date().toISOString(),
        attributes,
        metadata: {
          description: `A ${stage.name} NFT in the NFTerra ecosystem. Level ${nft.level}/5.`,
          attributes,
        },
      };
    });
  }, []);

  // Load NFTs when wallet connects
  const loadNFTs = useCallback(async () => {
    if (!connected || !address) {
      setNfts([]);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const contractNFTs = await fetchUserNFTs();
      const transformedNFTs = transformNFTData(contractNFTs);
      setNfts(transformedNFTs);
    } catch (err: any) {
      console.error('Error loading NFTs:', err);
      setError('Failed to load NFTs. Make sure you are connected to the correct network.');
    } finally {
      setLoading(false);
    }
  }, [connected, address, fetchUserNFTs, transformNFTData]);

  useEffect(() => {
    loadNFTs();
  }, [loadNFTs]);

  const handleLevelUp = async (tokenId: number) => {
    const result = await levelUp(tokenId);
    
    if (result) {
      // Refresh NFTs after level up
      await loadNFTs();
    }
  };

  const stats = {
    total: nfts.length,
    value: (nfts.length * 0.5).toFixed(2),
    avgLevel: nfts.length > 0
      ? (nfts.reduce((s, n) => s + n.level, 0) / nfts.length).toFixed(1)
      : '—',
    legendary: nfts.filter(n => n.rarity === 'legendary').length,
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      <Navbar />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-12 pb-20 max-w-7xl mx-auto w-full">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="section-eyebrow mb-2">My Collection</p>
            <h1 className="section-title">NFT Dashboard</h1>
            {connected && address && (
              <div className="flex items-center gap-2 mt-2">
                <Wallet className="w-4 h-4 text-[var(--indigo)]" />
                <span className="font-mono text-sm text-[oklch(0.5_0.03_270)]">
                  {formatAddress(address)}
                </span>
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={loadNFTs}
              disabled={loading || fetchingNFTs}
              className="btn-outline gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading || fetchingNFTs ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <Link href="/mint">
              <button className="btn-primary">+ Mint New</button>
            </Link>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { icon: Layers,     label: 'Total NFTs',    value: stats.total,    color: 'text-[var(--indigo)]' },
            { icon: TrendingUp, label: 'Total Value',   value: `${stats.value} ETH`, color: 'text-[var(--teal)]' },
            { icon: Star,       label: 'Avg Level',     value: stats.avgLevel, color: 'text-[var(--amber)]' },
            { icon: Star,       label: 'Legendary',     value: stats.legendary, color: 'text-[var(--rose)]' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="panel">
              <div className="flex items-center gap-2 mb-3">
                <Icon className={`w-4 h-4 ${color}`} />
                <span className="stat-label">{label}</span>
              </div>
              <p className={`stat-number ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Connect prompt */}
        {!connected && (
          <div
            className="panel border-2 border-dashed border-[oklch(0.78_0.1_270)] text-center py-16 mb-10"
            style={{ background: 'oklch(0.96 0.03 270)' }}
          >
            <Wallet className="w-10 h-10 text-[var(--indigo)] mx-auto mb-4" />
            <h2 className="section-title mb-2" style={{ fontSize: '1.5rem' }}>Connect your wallet</h2>
            <p className="text-[oklch(0.5_0.03_270)] mb-6 text-sm">
              Connect MetaMask to view and manage your NFT collection.
            </p>
            <button onClick={connectWallet} className="btn-primary">Connect Wallet</button>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="panel border-2 border-red-200 bg-red-50 mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Level up error */}
        {levelUpError && (
          <div className="panel border-2 border-red-200 bg-red-50 mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">Level up failed: {levelUpError}</p>
            </div>
          </div>
        )}

        {/* Collection grid */}
        {connected && (
          <>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-black text-xl">Your NFTs</h2>
              <span className="tag tag-indigo">{stats.total} items</span>
            </div>
            <NFTGrid
              nfts={nfts}
              onLevelUp={handleLevelUp}
              loading={levelingUp || fetchingNFTs}
              emptyMessage="You don't have any NFTs yet. Mint one to get started!"
            />
          </>
        )}

        {/* Activity feed */}
        {connected && nfts.length > 0 && (
          <div className="mt-12">
            <h2 className="font-black text-xl mb-5">Recent Activity</h2>
            <div className="panel divide-y divide-[oklch(0.9_0.01_270)]">
              {nfts.slice(0, 5).map((nft, i) => (
                <div key={nft.tokenId} className="flex items-center gap-4 py-3.5">
                  <div className="w-9 h-9 rounded-lg bg-[oklch(0.94_0.04_270)] border border-[oklch(0.82_0.06_270)] flex items-center justify-center text-lg flex-shrink-0">
                    {['🥚','👹','🐉','🔥','✨'][nft.level - 1]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{nft.name}</p>
                    <p className="text-xs text-[oklch(0.6_0.03_270)]">
                      {i === 0 ? 'Minted' : i === 1 ? 'Leveled up' : 'Transferred'} · {i + 1}h ago
                    </p>
                  </div>
                  <span className="tag tag-indigo flex-shrink-0">#{nft.tokenId}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
