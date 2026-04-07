'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/lib/context/WalletContext';
import { useNFTStore } from '@/lib/context/NFTStoreContext';
import { useMyListings } from '@/lib/context/MyListingsContext';
import { useTxToast } from '@/lib/context/TxToastContext';
import { useTxHistory, TxRecord } from '@/lib/context/TxHistoryContext';
import { useContract } from '@/hooks/use-contract';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { NFTGrid } from '@/components/nft/NFTGrid';
import { LevelUpModal } from '@/components/nft/LevelUpModal';
import { generateMockNFT, NFT, EVOLUTION_STAGES } from '@/lib/mock-data';
import { formatTimeAgo } from '@/lib/marketplace-data';
import { formatAddress } from '@/lib/web3-utils';
import { sendMarketplaceTransaction, getNFTsByOwner, CONTRACT_ADDRESS } from '@/lib/contract';
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
  const router = useRouter();
  const { address, connected } = useWallet();
  const { newNFTs, updateNewNFT, removeNewNFT } = useNFTStore();
  const { listings, addListing } = useMyListings();
  const { runTx } = useTxToast();
  const { addTransaction, updateTransaction, transactions } = useTxHistory();
  const { levelUp, levelingUp, levelUpError } = useContract();
  const [blockchainNFTs, setBlockchainNFTs] = useState<NFT[]>([]);
  const [loadingNFTs, setLoadingNFTs] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [nftError, setNftError] = useState<string | null>(null);
  const [levelingNFTId, setLevelingNFTId] = useState<number | null>(null);
  const [levelUpStage, setLevelUpStage] = useState<'idle' | 'initiating' | 'tx-progress' | 'evolution-progress' | 'revealing' | 'complete' | 'error'>('idle');
  const [levelUpModalOpen, setLevelUpModalOpen] = useState(false);
  const [selectedNFTForLevelUp, setSelectedNFTForLevelUp] = useState<NFT | null>(null);

  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const playEvolutionChime = () => {
    try {
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.22);
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {
      // Silent fallback if browser audio context is blocked.
    }
  };

  // Fetch NFTs from blockchain
  useEffect(() => {
    if (!connected || !address) {
      setBlockchainNFTs([]);
      setNftError(null);
      return;
    }

    const fetchNFTs = async () => {
      setLoadingNFTs(true);
      setNftError(null);
      try {
        const nftDataList = await getNFTsByOwner(address);
        // Convert NFTData to NFT format and derive image from evolution stage
        const convertedNFTs: NFT[] = nftDataList.map(nftData => {
          const stageIndex = Math.max(0, Math.min(nftData.level - 1, EVOLUTION_STAGES.length - 1));
          return {
            tokenId: nftData.tokenId,
            name: nftData.name,
            level: nftData.level,
            image: EVOLUTION_STAGES[stageIndex]?.image || '/nft-1.jpg',
            rarity: (nftData.level === 1 ? 'common' : nftData.level === 2 ? 'rare' : 'legendary') as 'common' | 'rare' | 'legendary',
            owner: nftData.owner,
            lastLevelUp: new Date().toISOString(),
            attributes: [],
          };
        });
        setBlockchainNFTs(convertedNFTs);
      } catch (err: any) {
        const errorMsg = err?.message || 'Failed to load NFTs';
        console.error('Error fetching NFTs:', err);
        setNftError(errorMsg);
      } finally {
        setLoadingNFTs(false);
      }
    };

    fetchNFTs();
  }, [connected, address]);

  // Clear stale NFTs when contract is redeployed
  useEffect(() => {
    // Listen for contract address changes (redeployment)
    const checkContractChange = () => {
      const stored = localStorage.getItem('lastContractAddress');
      if (stored && stored !== CONTRACT_ADDRESS) {
        console.log('🔄 Contract redeployed detected - clearing stale NFT cache');
        // Clear newly minted NFTs from old contract
        localStorage.removeItem('nftStore');
        window.location.reload();
      } else if (!stored) {
        localStorage.setItem('lastContractAddress', CONTRACT_ADDRESS);
      }
    };
    
    checkContractChange();
  }, []);

  // Combine blockchain NFTs with newly minted/bought ones from context
  // Show both on-chain NFTs (source of truth) and newly added NFTs (pending blockchain confirmation)
  // Level-up guards will verify they exist on-chain before executing
  const nftsMap = new Map<number, NFT>();
  blockchainNFTs.forEach((nft) => {
    nftsMap.set(nft.tokenId, nft);
  });
  newNFTs.forEach((nft) => {
    const existing = nftsMap.get(nft.tokenId);
    if (existing) {
      // Merge: prefer on-chain data but keep custom metadata from local store
      nftsMap.set(nft.tokenId, {
        ...existing,
        name: nft.name || existing.name,
        image: nft.image && nft.image.startsWith('data:') ? nft.image : existing.image,
      });
    } else {
      // Show recently bought/minted NFTs even if not yet confirmed on-chain
      // Level-up will be blocked if they don't exist
      nftsMap.set(nft.tokenId, nft);
    }
  });
  
  // Filter out listed NFTs
  const activeListed = listings.filter(l => l.status === 'active');
  let nfts = Array.from(nftsMap.values()).filter(nft => 
    !activeListed.some(listing => listing.tokenId === nft.tokenId && listing.seller.toLowerCase() === (address?.toLowerCase() || ''))
  );
  const txHistory = transactions;
  const myListings = connected && address
    ? listings.filter((listing) => listing.seller.toLowerCase() === address.toLowerCase() && listing.status === 'active')
    : [];

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
    if (!address || loadingNFTs || refreshing) return;
    setRefreshing(true);
    try {
      const nftDataList = await getNFTsByOwner(address);
      // Convert NFTData to NFT format and derive image from evolution stage
      const convertedNFTs: NFT[] = nftDataList.map(nftData => {
        const stageIndex = Math.max(0, Math.min(nftData.level - 1, EVOLUTION_STAGES.length - 1));
        return {
          tokenId: nftData.tokenId,
          name: nftData.name,
          level: nftData.level,
          image: EVOLUTION_STAGES[stageIndex]?.image || '/nft-1.jpg',
          rarity: (nftData.level === 1 ? 'common' : nftData.level === 2 ? 'rare' : 'legendary') as 'common' | 'rare' | 'legendary',
          owner: nftData.owner,
          lastLevelUp: new Date().toISOString(),
          attributes: [],
        };
      });
      setBlockchainNFTs(convertedNFTs);
    } catch (err) {
      console.error('Error refreshing NFTs:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // Auto-refresh on-chain NFTs shortly after new mints so level up is fast
  useEffect(() => {
    if (!address || newNFTs.length === 0) return;

    let cancelled = false;

    const syncNewNFTs = async () => {
      try {
        const nftDataList = await getNFTsByOwner(address);
        if (cancelled) return;
        const convertedNFTs: NFT[] = nftDataList.map(nftData => {
          const stageIndex = Math.max(0, Math.min(nftData.level - 1, EVOLUTION_STAGES.length - 1));
          return {
            tokenId: nftData.tokenId,
            name: nftData.name,
            level: nftData.level,
            image: EVOLUTION_STAGES[stageIndex]?.image || '/nft-1.jpg',
            rarity: (nftData.level === 1 ? 'common' : nftData.level === 2 ? 'rare' : 'legendary') as 'common' | 'rare' | 'legendary',
            owner: nftData.owner,
            lastLevelUp: new Date().toISOString(),
            attributes: [],
          };
        });
        setBlockchainNFTs(convertedNFTs);
      } catch (err) {
        console.error('Error auto-syncing new NFTs:', err);
      }
    };

    // Run once immediately and again after a short delay to catch confirmations
    syncNewNFTs();
    const timer = setTimeout(syncNewNFTs, 5000);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [address, newNFTs.length]);

  // ── Level Up NFT ──────────────────────────────────────────────────────────────
  const handleLevelUpClick = (tokenId: number) => {
    const nft = nfts.find(n => n.tokenId === tokenId);
    if (!nft) return;

    setSelectedNFTForLevelUp(nft);
    setLevelUpModalOpen(true);
  };

  const handleLevelUpConfirm = async () => {
    if (!selectedNFTForLevelUp) return;
    await handleLevelUp(selectedNFTForLevelUp.tokenId);
    setLevelUpModalOpen(false);
  };

  const handleLevelUp = async (tokenId: number) => {
    if (!connected) {
      return;
    }

    const nft = nfts.find(n => n.tokenId === tokenId);
    if (!nft || nft.level >= 5) return;

    // Local/off-chain marketplace NFTs can level up without on-chain contract checks.
    if (nft.offChain) {
      setLevelingNFTId(tokenId);
      setLevelUpStage('initiating');
      await wait(450);

      const mockHash = '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
      const txId = addTransaction({
        action: 'Level Up',
        tokenId,
        tokenName: nft.name,
        timestamp: new Date().toISOString(),
        status: 'pending',
        hash: mockHash,
      });

      await runTx(
        `Leveling up ${nft.name}...`,
        async () => {
          setLevelUpStage('tx-progress');
          // Require a wallet signature/transaction for local marketplace NFTs too.
          const txResult = await sendMarketplaceTransaction('0.02');
          await wait(650);

          const newLevel = Math.min(nft.level + 1, 5);
          const stageIndex = Math.max(0, Math.min(newLevel - 1, EVOLUTION_STAGES.length - 1));
          updateNewNFT(tokenId, {
            level: newLevel,
            image: EVOLUTION_STAGES[stageIndex]?.image || '/nft-1.jpg',
            rarity: (newLevel === 1 ? 'common' : newLevel === 2 ? 'rare' : 'legendary') as 'common' | 'rare' | 'legendary',
            lastLevelUp: new Date().toISOString(),
          });

          updateTransaction(txId, {
            status: 'success',
            hash: txResult.txHash,
          });

          setLevelUpStage('evolution-progress');
          await wait(500);
          setLevelUpStage('revealing');
          await wait(600);
          setLevelUpStage('complete');
          playEvolutionChime();
          await wait(650);
        },
        'Level Up successful!',
        'Level Up failed',
      );

      setLevelingNFTId(null);
      setLevelUpStage('idle');
      return;
    }

    // Validate NFT exists on blockchain (check that it's in blockchainNFTs, not just in newNFTs)
    const existsOnChain = blockchainNFTs.some(n => n.tokenId === tokenId);
    if (!existsOnChain) {
      // This NFT is new/pending - wait before trying to level up
      if (newNFTs.some(n => n.tokenId === tokenId)) {
        alert('⏳ This NFT is still being minted on-chain. Once the mint transaction is confirmed, refresh your dashboard and try leveling up again.');
        return;
      }
      // NFT doesn't exist anywhere - might be from old contract
      alert('❌ This NFT no longer exists on the blockchain. The contract may have been reset or redeployed.');
      setBlockchainNFTs(prev => prev.filter(n => n.tokenId !== tokenId));
      removeNewNFT(tokenId);
      return;
    }

    setLevelingNFTId(tokenId);
    setLevelUpStage('initiating');
    await wait(650);

    let levelUpFailed = false;

    // Generate a mock hash for the pending transaction
    const mockHash = '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');

    // Create pending transaction record
    const txId = addTransaction({
      action: 'Level Up',
      tokenId,
      tokenName: nft.name,
      timestamp: new Date().toISOString(),
      status: 'pending',
      hash: mockHash,
    });

    await runTx(
      `Leveling up ${nft.name}…`,
      async () => {
        try {
          setLevelUpStage('tx-progress');

          // Call real contract function (will prompt MetaMask)
          const result = await levelUp(tokenId);
          if (result) {
            setLevelUpStage('evolution-progress');
            await wait(900);

            // Update transaction with success
            updateTransaction(txId, {
              status: 'success',
              hash: result.txHash,
            });

            // Only update this specific NFT in blockchain data
            const newLevel = result.newLevel;
            const stageIndex = Math.max(0, Math.min(newLevel - 1, EVOLUTION_STAGES.length - 1));
            setBlockchainNFTs(prev =>
              prev.map(n =>
                n.tokenId === tokenId
                  ? {
                      ...n,
                      level: newLevel,
                      image: EVOLUTION_STAGES[stageIndex]?.image || '/nft-1.jpg',
                      rarity: (newLevel === 1 ? 'common' : newLevel === 2 ? 'rare' : 'legendary') as 'common' | 'rare' | 'legendary',
                    }
                  : n,
              ),
            );

            setLevelUpStage('revealing');
            await wait(700);
            setLevelUpStage('complete');
            playEvolutionChime();
            await wait(800);
          } else {
            throw new Error('Level up failed');
          }
        } catch (err: any) {
          levelUpFailed = true;
          setLevelUpStage('error');
          updateTransaction(txId, { status: 'failed' });
          
          // If NFT doesn't exist on contract, the contract was redeployed or chain was reset
          if (err?.message?.includes('not found on contract')) {
            console.warn(`NFT #${tokenId} not found - contract was reset or redeployed`);
            
            // Show a notification that contract state changed
            console.warn('⚠️ Contract was redeployed or chain was reset. Reloading NFT list...');
            
            // Remove stale NFT from display
            setBlockchainNFTs(prev => prev.filter(n => n.tokenId !== tokenId));
            removeNewNFT(tokenId);
            
            // Refresh NFT list to get actual on-chain inventory
            if (address) {
              try {
                const nftDataList = await getNFTsByOwner(address);
                const convertedNFTs: NFT[] = nftDataList.map(nftData => {
                  const stageIndex = Math.max(0, Math.min(nftData.level - 1, EVOLUTION_STAGES.length - 1));
                  return {
                    tokenId: nftData.tokenId,
                    name: nftData.name,
                    level: nftData.level,
                    image: EVOLUTION_STAGES[stageIndex]?.image || '/nft-1.jpg',
                    rarity: (nftData.level === 1 ? 'common' : nftData.level === 2 ? 'rare' : 'legendary') as 'common' | 'rare' | 'legendary',
                    owner: nftData.owner,
                    lastLevelUp: new Date().toISOString(),
                    attributes: [],
                  };
                });
                setBlockchainNFTs(convertedNFTs);
              } catch (refreshErr) {
                console.error('Failed to refresh NFT list:', refreshErr);
              }
            }
            // Don't throw—silently skip the error and let modal close
            return;
          }
          
          // Re-throw other errors for runTx to display
          throw new Error(err?.message || 'Level up failed');
        }
      },
      'Level Up successful!',
      'Level Up failed',
    );

    if (levelUpFailed) {
      await wait(900);
    }

    setLevelingNFTId(null);
    setLevelUpStage('idle');
  };

  // ── List NFT ──────────────────────────────────────────────────────────────────
  const handleList = (nft: NFT) => {
    // Navigate to list page with the NFT pre-selected
    router.push(`/list?nftId=${nft.tokenId}`);
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
            
            {nftError && (
              <div className="mb-6 p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-sm">
                <p className="text-rose-500 font-medium mb-2">⚠️ Contract Not Deployed</p>
                <p className="text-rose-400 whitespace-pre-wrap text-xs">{nftError}</p>
              </div>
            )}
            
            <NFTGrid
              nfts={nfts}
              newNFTIds={newNFTs.map(n => n.tokenId)}
              onLevelUp={handleLevelUpClick}
              onList={handleList}
              levelingTokenId={levelingNFTId}
              levelUpStage={levelUpStage}
              emptyMessage="You don't have any NFTs yet. Mint one to get started!"
            />
          </>
        )}

        {/* ── My Listings ── */}
        {connected && myListings.length > 0 && (
          <div className="mt-14">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-black text-xl">My Listings</h2>
              <span className="tag tag-rose">{myListings.length} active</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {myListings.map((listing) => (
                <article key={listing.id} className="nft-grid-card overflow-hidden">
                  <div className="relative aspect-video border-b border-[oklch(0.88_0.01_270)]">
                    <img src={listing.image} alt={listing.tokenName} className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2">
                      <span className="tag tag-rose">Active</span>
                    </div>
                    <div className="absolute bottom-2 right-2">
                      <span className="tag tag-indigo">{listing.price} {listing.currency}</span>
                    </div>
                  </div>

                  <div className="p-3">
                    <p className="font-black text-sm truncate">{listing.tokenName}</p>
                    <p className="text-[11px] font-mono text-[oklch(0.6_0.03_270)]">Token #{listing.tokenId} · Level {listing.level}</p>
                    <div className="flex items-center justify-between mt-3 text-xs">
                      <span className="text-[oklch(0.6_0.03_270)]">Listed {formatTimeAgo(listing.listedAt)}</span>
                      <Link href={`/nft/${listing.tokenId}`} className="font-black text-[var(--indigo)] hover:underline">View NFT</Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
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


      </main>

      {/* Level Up Modal */}
      {selectedNFTForLevelUp && (
        <LevelUpModal
          isOpen={levelUpModalOpen}
          nft={selectedNFTForLevelUp}
          onConfirm={handleLevelUpConfirm}
          onCancel={() => setLevelUpModalOpen(false)}
          isLoading={levelingNFTId === selectedNFTForLevelUp.tokenId}
        />
      )}

      <Footer />
    </div>
  );
}
