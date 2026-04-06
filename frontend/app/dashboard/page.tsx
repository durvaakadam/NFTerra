'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@/lib/context/WalletContext';
import { useNFTStore } from '@/lib/context/NFTStoreContext';
import { useTxToast } from '@/lib/context/TxToastContext';
import { useTxHistory, TxRecord } from '@/lib/context/TxHistoryContext';
import { useContract } from '@/hooks/use-contract';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { NFTGrid } from '@/components/nft/NFTGrid';
import { generateMockNFT, NFT } from '@/lib/mock-data';
import { formatTimeAgo } from '@/lib/marketplace-data';
import { formatAddress } from '@/lib/web3-utils';
import { sendMarketplaceTransaction, getNFTsByOwner } from '@/lib/contract';
import {
  RefreshCw, Wallet, TrendingUp, Layers, Star, Trophy,
  CheckCircle, Clock, XCircle, ArrowUpRight, ShoppingBag,
  Zap, Hammer,
} from 'lucide-react';
import Link from 'next/link';

// ── Tx action config ──────────────────────────────────────────────────────────

const TX_ACTION_CONF: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  Minted:   { icon: <Hammer  className="w-4 h-4" />, color: 'text-[var(--indigo)]', bg: 'bg-[oklch(0.92_0.05_270)]' },
  Bought:   { icon: <ShoppingBag className="w-4 h-4" />, color: 'text-[var(--teal)]',  bg: 'bg-[oklch(0.92_0.05_195)]' },
  Sold:     { icon: <ArrowUpRight className="w-4 h-4" />, color: 'text-emerald-600',   bg: 'bg-emerald-50' },
  'Level Up': { icon: <Zap className="w-4 h-4" />, color: 'text-[var(--amber)]', bg: 'bg-[oklch(0.96_0.06_75)]' },
  Approved: { icon: <CheckCircle className="w-4 h-4" />, color: 'text-[var(--indigo)]', bg: 'bg-[oklch(0.92_0.05_270)]' },
  Listed:   { icon: <Star className="w-4 h-4" />, color: 'text-[var(--rose)]', bg: 'bg-rose-50' },
};

const STATUS_CONF: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  success: { icon: <CheckCircle className="w-3.5 h-3.5" />, label: 'Success', color: 'text-emerald-600' },
  pending: { icon: <Clock       className="w-3.5 h-3.5" />, label: 'Pending', color: 'text-[var(--amber)]' },
  failed:  { icon: <XCircle     className="w-3.5 h-3.5" />, label: 'Failed',  color: 'text-[var(--rose)]' },
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { address, connected } = useWallet();
  const { newNFTs } = useNFTStore();
  const { runTx } = useTxToast();
  const { addTransaction, updateTransaction, transactions } = useTxHistory();
  const { levelUp, levelingUp } = useContract();
  const [blockchainNFTs, setBlockchainNFTs] = useState<NFT[]>([]);
  const [loadingNFTs, setLoadingNFTs] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [listingNFT, setListingNFT] = useState<NFT | null>(null);
  const [listingPrice, setListingPrice] = useState('');
  const [isListing, setIsListing] = useState(false);
  const [levelingNFTId, setLevelingNFTId] = useState<number | null>(null);

  // Fetch NFTs from blockchain
  useEffect(() => {
    if (!connected || !address) {
      setBlockchainNFTs([]);
      return;
    }

    const fetchNFTs = async () => {
      setLoadingNFTs(true);
      try {
        const nftDataList = await getNFTsByOwner(address);
        // Convert NFTData to NFT format
        const convertedNFTs: NFT[] = nftDataList.map(nftData => ({
          tokenId: nftData.tokenId,
          name: nftData.name,
          level: nftData.level,
          image: '/nft-1.jpg', // Default image, can be customized
          rarity: (nftData.level === 1 ? 'common' : nftData.level === 2 ? 'rare' : 'legendary') as 'common' | 'rare' | 'legendary',
          owner: nftData.owner,
          lastLevelUp: new Date().toISOString(),
          attributes: [],
        }));
        setBlockchainNFTs(convertedNFTs);
      } catch (err) {
        console.error('Error fetching NFTs:', err);
      } finally {
        setLoadingNFTs(false);
      }
    };

    fetchNFTs();
  }, [connected, address]);

  // Combine blockchain NFTs with newly minted ones from context
  // Ensure we don't show duplicates when the same token exists in both
  const nftsMap = new Map<number, NFT>();
  blockchainNFTs.forEach((nft) => {
    nftsMap.set(nft.tokenId, nft);
  });
  newNFTs.forEach((nft) => {
    // Prefer richer local metadata (image/name) when available
    const existing = nftsMap.get(nft.tokenId);
    nftsMap.set(nft.tokenId, existing ? { ...existing, ...nft } : nft);
  });
  const nfts = Array.from(nftsMap.values());
  const txHistory = transactions;

  // ── Stats ───────────────────────────────────────────────────────────────────
  const totalValue  = nfts.reduce((s, n) => {
    const price = 0.05 * n.level * (n.rarity === 'legendary' ? 5 : n.rarity === 'rare' ? 2.5 : 1);
    return s + price;
  }, 0);
  const highestLevel = nfts.length > 0 ? Math.max(...nfts.map(n => n.level)) : 0;
  const highestNFT   = nfts.find(n => n.level === highestLevel);
  const legendary    = nfts.filter(n => n.rarity === 'legendary').length;

  // ── Refresh NFTs ─────────────────────────────────────────────────────────────
  const handleRefresh = async () => {
    if (!address || loadingNFTs) return;
    setRefreshing(true);
    try {
      const nftDataList = await getNFTsByOwner(address);
      // Convert NFTData to NFT format
      const convertedNFTs: NFT[] = nftDataList.map(nftData => ({
        tokenId: nftData.tokenId,
        name: nftData.name,
        level: nftData.level,
        image: '/nft-1.jpg', // Default image
        rarity: (nftData.level === 1 ? 'common' : nftData.level === 2 ? 'rare' : 'legendary') as 'common' | 'rare' | 'legendary',
        owner: nftData.owner,
        lastLevelUp: new Date().toISOString(),
        attributes: [],
      }));
      setBlockchainNFTs(convertedNFTs);
    } catch (err) {
      console.error('Error refreshing NFTs:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // ── Level Up NFT ──────────────────────────────────────────────────────────────
  const handleLevelUp = async (tokenId: number) => {
    if (!connected) {
      alert('Please connect your wallet first');
      return;
    }

    const nft = nfts.find(n => n.tokenId === tokenId);
    if (!nft || nft.level >= 5) return;

    setLevelingNFTId(tokenId);

    // Create pending transaction record
    const txId = addTransaction({
      action: 'Level Up',
      tokenId,
      tokenName: nft.name,
      timestamp: new Date().toISOString(),
      status: 'pending',
    });

    await runTx(
      `Leveling up ${nft.name}…`,
      async () => {
        try {
          // Call real contract function (will prompt MetaMask)
          const result = await levelUp(tokenId);
          if (result) {
            // Update transaction with success
            updateTransaction(txId, {
              status: 'success',
              hash: result.txHash,
            });
            // Refresh NFTs to get updated level
            await handleRefresh();
          } else {
            throw new Error('Level up failed');
          }
        } catch (err: any) {
          updateTransaction(txId, { status: 'failed' });
          // Re-throw with detailed error message for runTx to display
          throw new Error(err?.message || 'Level up failed');
        }
      },
      'Level Up successful!',
      'Level Up failed',
    );

    setLevelingNFTId(null);
  };

  // ── List NFT ──────────────────────────────────────────────────────────────────
  const handleList = (nft: NFT) => {
    setListingNFT(nft);
    setListingPrice('');
  };

  const handleConfirmListing = async () => {
    if (!listingNFT || !listingPrice || !address) return;
    setIsListing(true);

    const txId = addTransaction({
      action: 'Listed',
      tokenId: listingNFT.tokenId,
      tokenName: listingNFT.name,
      amount: `${listingPrice} ETH`,
      timestamp: new Date().toISOString(),
      status: 'pending',
    });

    await runTx(
      `Listing ${listingNFT.name} for ${listingPrice} ETH`,
      async () => {
        try {
          // Real MetaMask transaction
          const result = await sendMarketplaceTransaction(listingPrice);
          updateTransaction(txId, {
            status: 'success',
            hash: result.txHash,
          });
        } catch (err: any) {
          updateTransaction(txId, { status: 'failed' });
          throw err;
        }
      },
      `Listed successfully!`,
      'Listing failed',
    );

    setListingNFT(null);
    setListingPrice('');
    setIsListing(false);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      <Navbar />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-12 pb-20 max-w-7xl mx-auto w-full">

        {/* ── Page header ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="section-eyebrow mb-2">My Collection</p>
            <h1 className="section-title">NFT Dashboard</h1>
            {connected && address && (
              <div className="flex items-center gap-2 mt-2">
                <Wallet className="w-4 h-4 text-[var(--indigo)]" />
                <span className="font-mono text-sm text-[oklch(0.5_0.03_270)]">{formatAddress(address)}</span>
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={handleRefresh} disabled={refreshing} className="btn-outline gap-2">
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <Link href="/mint">
              <button className="btn-primary">+ Mint New</button>
            </Link>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            {
              icon: Layers,
              label: 'Total NFTs',
              value: nfts.length.toString(),
              color: 'text-[var(--indigo)]',
              sub: `${legendary} legendary`,
            },
            {
              icon: TrendingUp,
              label: 'Portfolio Value',
              value: `${totalValue.toFixed(2)}`,
              suffix: 'ETH',
              color: 'text-[var(--teal)]',
              sub: `${nfts.length > 0 ? (totalValue / nfts.length).toFixed(3) : '0'} ETH avg`,
            },
            {
              icon: Trophy,
              label: 'Highest Level',
              value: highestLevel > 0 ? `Lv ${highestLevel}` : '—',
              color: 'text-[var(--amber)]',
              sub: highestNFT?.name ?? 'No NFTs yet',
            },
            {
              icon: Star,
              label: 'Legendaries',
              value: legendary.toString(),
              color: 'text-[var(--rose)]',
              sub: `of ${nfts.length} total`,
            },
          ].map(({ icon: Icon, label, value, suffix, color, sub }) => (
            <div key={label} className="panel">
              <div className="flex items-center gap-2 mb-3">
                <Icon className={`w-4 h-4 ${color}`} />
                <span className="stat-label">{label}</span>
              </div>
              <p className={`stat-number ${color} flex items-baseline gap-1`}>
                {value}
                {suffix && <span className="text-lg font-black">{suffix}</span>}
              </p>
              {sub && <p className="text-xs text-[oklch(0.6_0.03_270)] mt-1 font-mono truncate">{sub}</p>}
            </div>
          ))}
        </div>

        {/* ── Connect prompt ── */}
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
            <button className="btn-primary">Connect Wallet</button>
          </div>
        )}

        {/* ── Collection grid ── */}
        {connected && (
          <>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-black text-xl">Your NFTs</h2>
              <span className="tag tag-indigo">{nfts.length} items</span>
            </div>
            <NFTGrid
              nfts={nfts}
              newNFTIds={newNFTs.map(n => n.tokenId)}
              onLevelUp={handleLevelUp}
              onList={handleList}
              levelingTokenId={levelingNFTId}
              emptyMessage="You don't have any NFTs yet. Mint one to get started!"
            />
          </>
        )}

        {/* ── Transaction History ── */}
        {connected && txHistory.length > 0 && (
          <div className="mt-14">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-black text-xl">Transaction History</h2>
              <span className="tag tag-indigo">{txHistory.length} records</span>
            </div>

            <div className="panel p-0 overflow-hidden">
              {/* Table header */}
              <div className="hidden sm:grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-5 py-3 bg-[oklch(0.96_0.01_270)] border-b border-[oklch(0.88_0.01_270)]">
                <span className="stat-label w-8" />
                <span className="stat-label">Action / NFT</span>
                <span className="stat-label text-right">Amount</span>
                <span className="stat-label text-right">Time</span>
                <span className="stat-label text-right">Status</span>
              </div>

              <div className="divide-y divide-[oklch(0.92_0.01_270)]">
                {txHistory.map((tx: TxRecord) => {
                  const ac = TX_ACTION_CONF[tx.action] ?? TX_ACTION_CONF.Minted;
                  const sc = STATUS_CONF[tx.status];
                  return (
                    <div
                      key={tx.id}
                      className="flex flex-col sm:grid sm:grid-cols-[auto_1fr_auto_auto_auto] gap-2 sm:gap-4 items-start sm:items-center px-5 py-4 hover:bg-[oklch(0.975_0.005_270)] transition-colors"
                    >
                      {/* Icon */}
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${ac.bg} ${ac.color}`}>
                        {ac.icon}
                      </div>

                      {/* Action + name */}
                      <div className="min-w-0">
                        <p className="text-sm font-black truncate">{tx.action} · {tx.tokenName}</p>
                        {tx.hash && (
                          <p className="text-[10px] font-mono text-[oklch(0.65_0.03_270)] truncate">
                            {tx.hash.slice(0, 18)}…
                          </p>
                        )}
                      </div>

                      {/* Amount */}
                      <div className="sm:text-right">
                        {tx.amount
                          ? <span className="font-black text-sm font-mono">{tx.amount}</span>
                          : <span className="text-xs text-[oklch(0.7_0.03_270)]">—</span>
                        }
                      </div>

                      {/* Time */}
                      <div className="sm:text-right">
                        <span className="text-xs font-mono text-[oklch(0.6_0.03_270)]">{formatTimeAgo(tx.timestamp)}</span>
                      </div>

                      {/* Status */}
                      <div className={`flex items-center gap-1.5 sm:justify-end ${sc.color}`}>
                        {sc.icon}
                        <span className="text-xs font-black">{sc.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── List NFT Modal ── */}
        {listingNFT && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="panel max-w-sm w-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-black text-lg">List NFT for Sale</h2>
                <button
                  onClick={() => setListingNFT(null)}
                  className="text-[oklch(0.6_0.03_270)] hover:text-[oklch(0.3_0.03_270)]"
                >
                  ✕
                </button>
              </div>

              {/* NFT Info */}
              <div className="bg-[oklch(0.97_0.01_270)] rounded-lg p-4 mb-6 border border-[oklch(0.88_0.01_270)]">
                <p className="text-xs font-black uppercase text-[oklch(0.5_0.03_270)] tracking-widest mb-2">NFT Details</p>
                <p className="font-black text-sm mb-1">{listingNFT.name}</p>
                <p className="font-mono text-xs text-[oklch(0.6_0.03_270)] mb-3">Token ID: #{listingNFT.tokenId}</p>
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded overflow-hidden border border-[oklch(0.88_0.01_270)]">
                    <img src={listingNFT.image} alt={listingNFT.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-[oklch(0.5_0.03_270)] uppercase tracking-wider">Level</p>
                    <p className="font-black text-sm">Lv {listingNFT.level}/5 · {listingNFT.rarity}</p>
                  </div>
                </div>
              </div>

              {/* Price Input */}
              <div className="mb-6">
                <label className="text-xs font-black uppercase text-[oklch(0.5_0.03_270)] tracking-widest block mb-2">
                  Listing Price (ETH)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={listingPrice}
                  onChange={(e) => setListingPrice(e.target.value)}
                  placeholder="0.50"
                  className="w-full px-4 py-2 border-2 border-[oklch(0.88_0.01_270)] rounded-lg focus:outline-none focus:border-[var(--indigo)] font-mono text-sm transition-colors"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setListingNFT(null)}
                  className="btn-outline flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmListing}
                  disabled={!listingPrice || isListing}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  {isListing ? 'Listing...' : 'List Now'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
