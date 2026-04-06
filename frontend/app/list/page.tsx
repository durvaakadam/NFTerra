'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { useWallet } from '@/lib/context/WalletContext';
import { useTxToast } from '@/lib/context/TxToastContext';
import { useNFTStore } from '@/lib/context/NFTStoreContext';
import { EVOLUTION_STAGES, NFT } from '@/lib/mock-data';
import { COLLECTIONS } from '@/lib/marketplace-data';
import { sendMarketplaceTransaction, getNFTsByOwner } from '@/lib/contract';
import {
  Tag, Shield, Wallet, CheckCircle2, ChevronRight, BarChart2,
  AlertTriangle, Clock, Percent, ArrowRight, Info, Loader2,
  TrendingUp, TrendingDown, Eye, XCircle, Zap, DollarSign,
  Calendar, Lock, Globe,
} from 'lucide-react';

// ── Step config ───────────────────────────────────────────────────────────────

const LIST_STEPS = [
  { id: 1, label: 'Select NFT',   icon: Eye,       desc: 'Choose the NFT you want to list' },
  { id: 2, label: 'Set Price',    icon: Tag,        desc: 'Pick a price and listing type' },
  { id: 3, label: 'Duration',     icon: Clock,      desc: 'Set expiry and auction options' },
  { id: 4, label: 'Approve',      icon: Shield,     desc: 'Authorise the marketplace contract' },
  { id: 5, label: 'Confirm',      icon: CheckCircle2, desc: 'Review and sign the listing' },
];

const DURATIONS = [
  { label: '1 Day',   value: 1 },
  { label: '3 Days',  value: 3 },
  { label: '7 Days',  value: 7 },
  { label: '30 Days', value: 30 },
  { label: 'No Expiry', value: 0 },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function ListNFTPage() {
  const { connected, connectWallet, address } = useWallet();
  const { runTx } = useTxToast();
  const { newNFTs } = useNFTStore();

  const [step, setStep] = useState(1);
  const [txStatus, setTxStatus] = useState<'idle' | 'approving' | 'signing' | 'success' | 'error'>('idle');
  const [blockchainNFTs, setBlockchainNFTs] = useState<NFT[]>([]);

  // Fetch user's actual blockchain NFTs
  useEffect(() => {
    if (!connected || !address) {
      setBlockchainNFTs([]);
      return;
    }

    const fetchNFTs = async () => {
      try {
        const nftDataList = await getNFTsByOwner(address);
        const convertedNFTs: NFT[] = nftDataList.map(nftData => ({
          tokenId: nftData.tokenId,
          name: nftData.name,
          level: nftData.level,
          image: EVOLUTION_STAGES[Math.max(0, Math.min(nftData.level - 1, EVOLUTION_STAGES.length - 1))]?.image || '/nft-1.jpg',
          rarity: (nftData.level === 1 ? 'common' : nftData.level === 2 ? 'rare' : 'legendary') as 'common' | 'rare' | 'legendary',
          owner: nftData.owner,
          lastLevelUp: new Date().toISOString(),
          attributes: [],
        }));
        setBlockchainNFTs(convertedNFTs);
      } catch (err) {
        console.error('Error fetching NFTs:', err);
      }
    };

    fetchNFTs();
  }, [connected, address]);

  // Combine blockchain NFTs with newly minted ones from context
  const myNFTs = useMemo(() => {
    const nftsMap = new Map<number, NFT>();
    blockchainNFTs.forEach((nft) => {
      nftsMap.set(nft.tokenId, nft);
    });
    newNFTs.forEach((nft) => {
      const existing = nftsMap.get(nft.tokenId);
      nftsMap.set(nft.tokenId, existing ? { ...existing, ...nft } : nft);
    });
    return Array.from(nftsMap.values());
  }, [blockchainNFTs, newNFTs]);

  // Step 1 — Select NFT
  const [selectedNftId, setSelectedNftId] = useState<number | null>(null);

  // Step 2 — Price
  const [listingType, setListingType] = useState<'fixed' | 'auction'>('fixed');
  const [price, setPrice] = useState('');
  const [reservePrice, setReservePrice] = useState('');
  const [currency, setCurrency] = useState<'ETH' | 'USDC'>('ETH');

  // Step 3 — Duration
  const [duration, setDuration] = useState(7);
  const [startTime, setStartTime] = useState<'now' | 'scheduled'>('now');

  const selectedNft = myNFTs.find(n => n.tokenId === selectedNftId) ?? null;

  // Determine which collection this NFT might belong to (by rarity-level heuristic)
  const relatedCollection = COLLECTIONS[selectedNftId ? selectedNftId % COLLECTIONS.length : 0];

  // Price chart for selected collection
  const priceChartData = relatedCollection.priceHistory;
  const floorPrice = relatedCollection.floorPrice;
  const priceNum = parseFloat(price) || 0;
  const priceDiff = floorPrice > 0 ? ((priceNum - floorPrice) / floorPrice) * 100 : 0;
  const platformFee = priceNum * 0.025;
  const creatorRoyalty = priceNum * 0.05;
  const youReceive = priceNum - platformFee - creatorRoyalty;

  // Validation
  const stepValid = useMemo(() => {
    switch (step) {
      case 1: return selectedNftId !== null;
      case 2: return listingType === 'fixed' ? parseFloat(price) > 0 : parseFloat(price) > 0 && parseFloat(reservePrice) >= parseFloat(price);
      case 3: return true;
      case 4: return connected;
      case 5: return connected && parseFloat(price) > 0;
      default: return false;
    }
  }, [step, selectedNftId, listingType, price, reservePrice, connected]);

  // ── Tx flow ───────────────────────────────────────────────────────────────

  const handleList = async () => {
    if (!selectedNft || !price || !address) return;
    
    setTxStatus('approving');
    await new Promise(r => setTimeout(r, 1500)); // UX delay for visual feedback
    setTxStatus('signing');
    
    try {
      // Call real contract to send listing transaction
      const result = await sendMarketplaceTransaction(price);
      
      // Update status to success
      setTxStatus('success');
    } catch (error) {
      console.error('List error:', error);
      setTxStatus('error');
    }
  };

  // ── Tx feedback screens ───────────────────────────────────────────────────

  if (txStatus !== 'idle') {
    return (
      <div className="min-h-screen bg-[var(--background)] flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-20">
          <div className="max-w-lg w-full space-y-4">

            {txStatus === 'approving' && (
              <div className="panel text-center py-14" style={{ boxShadow: '6px 6px 0 var(--indigo)' }}>
                <div className="w-16 h-16 rounded-full bg-[oklch(0.92_0.05_270)] flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-8 h-8 text-[var(--indigo)]" />
                </div>
                <h2 className="font-black text-2xl mb-2">Contract Approval</h2>
                <p className="text-[oklch(0.5_0.03_270)] text-sm mb-6">
                  Confirm approval in MetaMask. This lets the NFTerra Marketplace contract transfer your NFT when it sells.
                  You only need to approve once per collection.
                </p>
                <div className="panel-flat text-left text-xs space-y-2 mb-6">
                  {[
                    ['Contract',    '0xNFTerra...Market'],
                    ['Function',    'setApprovalForAll'],
                    ['Scope',       'All tokens in collection'],
                    ['Gas est.',    '~0.001 ETH'],
                    ['Reversible?', 'Yes — revoke anytime'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-[oklch(0.5_0.03_270)]">{k}</span>
                      <span className="font-mono font-bold">{v}</span>
                    </div>
                  ))}
                </div>
                <Loader2 className="w-8 h-8 text-[var(--indigo)] mx-auto animate-spin" />
              </div>
            )}

            {txStatus === 'signing' && (
              <div className="panel text-center py-14" style={{ boxShadow: '6px 6px 0 var(--indigo)' }}>
                <Loader2 className="w-16 h-16 text-[var(--indigo)] mx-auto mb-6 animate-spin" />
                <h2 className="font-black text-2xl mb-2">Sign the Listing</h2>
                <p className="text-[oklch(0.5_0.03_270)] text-sm mb-6">Sign the off-chain order in MetaMask. No gas required for the listing itself — only when it sells.</p>
                <div className="space-y-3">
                  {[
                    { label: 'Approval confirmed', done: true },
                    { label: 'Order hash generated', done: true },
                    { label: 'Awaiting signature...', done: false },
                  ].map(s => (
                    <div key={s.label} className="flex items-center gap-3 text-sm">
                      {s.done
                        ? <CheckCircle2 className="w-4 h-4 text-[var(--teal)] flex-shrink-0" />
                        : <Loader2 className="w-4 h-4 text-[var(--indigo)] animate-spin flex-shrink-0" />
                      }
                      <span className={s.done ? 'text-[oklch(0.5_0.03_270)]' : 'font-semibold'}>{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {txStatus === 'success' && (
              <div className="panel text-center py-12" style={{ boxShadow: '6px 6px 0 var(--teal)' }}>
                <CheckCircle2 className="w-16 h-16 text-[var(--teal)] mx-auto mb-4" />
                <h2 className="font-black text-3xl mb-2">Listed!</h2>
                <p className="text-[oklch(0.5_0.03_270)] text-sm mb-6">
                  <strong>{selectedNft?.name}</strong> is now live on the NFTerra Marketplace
                </p>
                {selectedNft && (
                  <div className="relative w-36 h-36 rounded-xl overflow-hidden mx-auto mb-6 border-4 border-[var(--teal)]">
                    <Image src={selectedNft.image} alt={selectedNft.name} fill className="object-cover" />
                  </div>
                )}
                <div className="panel-flat text-xs space-y-1 text-left mb-6">
                  {[
                    ['Price',       `${price} ${currency}`],
                    ['Type',        listingType === 'fixed' ? 'Fixed Price' : 'Auction'],
                    ['Duration',    duration === 0 ? 'No expiry' : `${duration} days`],
                    ['You receive', `~${youReceive.toFixed(4)} ETH`],
                    ['Listing ID',  `#${Math.floor(Math.random() * 90000) + 10000}`],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-[oklch(0.5_0.03_270)]">{k}</span>
                      <span className="font-bold">{v}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 justify-center">
                  <Link href="/marketplace"><button className="btn-primary">View in Marketplace <ArrowRight className="w-4 h-4" /></button></Link>
                  <Link href="/dashboard"><button className="btn-outline">My Dashboard</button></Link>
                </div>
              </div>
            )}

            {txStatus === 'error' && (
              <div className="panel text-center py-14" style={{ boxShadow: '6px 6px 0 var(--rose)' }}>
                <XCircle className="w-16 h-16 text-[var(--rose)] mx-auto mb-4" />
                <h2 className="font-black text-2xl mb-2">Listing Failed</h2>
                <p className="text-[oklch(0.5_0.03_270)] text-sm mb-6">The transaction was rejected or the signature was cancelled. No changes were made.</p>
                <button onClick={() => setTxStatus('idle')} className="btn-outline">Try Again</button>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Main wizard ───────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      <Navbar />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-10 pb-20 max-w-7xl mx-auto w-full">

        {/* Header */}
        <div className="mb-8">
          <p className="section-eyebrow mb-2">Sell</p>
          <h1 className="section-title">List an NFT for Sale</h1>
          <p className="text-[oklch(0.5_0.03_270)] mt-2 text-sm max-w-xl">
            Set your price, choose a listing type, and sign — your NFT will appear live in the marketplace in seconds.
          </p>
        </div>

        {/* Step bar */}
        <div className="mb-10">
          <div className="flex items-center gap-0">
            {LIST_STEPS.map((s, idx) => {
              const Icon = s.icon;
              const isActive   = step === s.id;
              const isComplete = step > s.id;
              return (
                <React.Fragment key={s.id}>
                  <button
                    onClick={() => isComplete && setStep(s.id)}
                    className={`flex flex-col items-center gap-1 min-w-0 ${isComplete ? 'cursor-pointer' : 'cursor-default'}`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${
                      isActive   ? 'bg-[oklch(0.38_0.18_270)] border-[oklch(0.38_0.18_270)] text-white' :
                      isComplete ? 'bg-[oklch(0.38_0.18_270)] border-[oklch(0.38_0.18_270)] text-white' :
                                   'bg-white border-[oklch(0.86_0.01_270)] text-[oklch(0.6_0.03_270)]'
                    }`}>
                      {isComplete ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wide whitespace-nowrap hidden sm:block ${
                      isActive || isComplete ? 'text-[oklch(0.38_0.18_270)]' : 'text-[oklch(0.6_0.03_270)]'
                    }`}>{s.label}</span>
                  </button>
                  {idx < LIST_STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 transition-colors duration-300 ${step > s.id ? 'bg-[oklch(0.38_0.18_270)]' : 'bg-[oklch(0.86_0.01_270)]'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
          <p className="text-xs text-[oklch(0.5_0.03_270)] mt-3">{LIST_STEPS[step - 1].desc}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Left: step content ─────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* STEP 1 — Select NFT */}
            {step === 1 && (
              <div className="panel animate-slide-in-up">
                <h2 className="font-black text-xl mb-1">Select an NFT</h2>
                <p className="text-sm text-[oklch(0.5_0.03_270)] mb-6">Choose one NFT from your wallet to list. Only unlisted, unencumbered tokens can be listed.</p>

                {!connected ? (
                  <div className="panel-flat text-center py-10">
                    <Wallet className="w-10 h-10 text-[oklch(0.6_0.03_270)] mx-auto mb-3" />
                    <p className="font-bold mb-1">No wallet connected</p>
                    <p className="text-sm text-[oklch(0.5_0.03_270)] mb-4">Connect to load your NFTs.</p>
                    <button onClick={connectWallet} className="btn-primary">Connect Wallet</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {myNFTs.map(nft => (
                      <button
                        key={nft.tokenId}
                        onClick={() => setSelectedNftId(nft.tokenId)}
                        className={`nft-grid-card text-left transition-all ${
                          selectedNftId === nft.tokenId ? 'border-[var(--indigo)] ring-2 ring-[oklch(0.38_0.18_270)]/30' : ''
                        }`}
                      >
                        <div className="relative aspect-square">
                          <Image src={nft.image} alt={nft.name} fill className="object-cover" sizes="200px" />
                          {selectedNftId === nft.tokenId && (
                            <div className="absolute inset-0 bg-[oklch(0.38_0.18_270)]/20 flex items-center justify-center">
                              <CheckCircle2 className="w-8 h-8 text-white drop-shadow" />
                            </div>
                          )}
                          <div className="absolute top-1.5 right-1.5">
                            <span className={`tag ${nft.rarity === 'legendary' ? 'tag-amber' : nft.rarity === 'rare' ? 'tag-teal' : 'tag-indigo'}`}>
                              {nft.rarity}
                            </span>
                          </div>
                        </div>
                        <div className="p-2">
                          <p className="font-bold text-xs truncate">{nft.name}</p>
                          <p className="text-[10px] text-[oklch(0.5_0.03_270)]">Level {nft.level}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* STEP 2 — Set Price */}
            {step === 2 && (
              <div className="panel animate-slide-in-up space-y-6">
                <div>
                  <h2 className="font-black text-xl mb-1">Set a Price</h2>
                  <p className="text-sm text-[oklch(0.5_0.03_270)]">Price your NFT competitively. We show live floor price data to help you decide.</p>
                </div>

                {/* Listing type */}
                <div className="flex gap-3">
                  {([
                    { v: 'fixed',   label: 'Fixed Price', icon: Tag,        desc: 'Sell immediately at a set price' },
                    { v: 'auction', label: 'Auction',     icon: TrendingUp, desc: 'Let buyers bid over a time period' },
                  ] as const).map(({ v, label, icon: Icon, desc }) => (
                    <button
                      key={v}
                      onClick={() => setListingType(v)}
                      className={`flex-1 flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                        listingType === v ? 'border-[var(--indigo)] bg-[oklch(0.92_0.05_270)]' : 'border-[oklch(0.86_0.01_270)] bg-white'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${listingType === v ? 'text-[var(--indigo)]' : 'text-[oklch(0.6_0.03_270)]'}`} />
                      <div>
                        <p className="font-bold text-sm">{label}</p>
                        <p className="text-xs text-[oklch(0.5_0.03_270)]">{desc}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Price input */}
                <div>
                  <label className="stat-label block mb-2">{listingType === 'fixed' ? 'Listing Price' : 'Starting Bid'} *</label>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <input
                        type="number"
                        step="0.001"
                        min="0"
                        value={price}
                        onChange={e => setPrice(e.target.value)}
                        placeholder="0.000"
                        className="w-full pl-4 pr-20 py-3 rounded-lg border-2 border-[oklch(0.86_0.01_270)] bg-[oklch(0.975_0.005_75)] font-black text-lg focus:outline-none focus:border-[var(--indigo)] transition-colors"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                        {(['ETH', 'USDC'] as const).map(c => (
                          <button
                            key={c}
                            onClick={() => setCurrency(c)}
                            className={`text-xs font-bold px-2 py-1 rounded ${currency === c ? 'bg-[oklch(0.38_0.18_270)] text-white' : 'text-[oklch(0.5_0.03_270)]'}`}
                          >{c}</button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Price context */}
                  {priceNum > 0 && (
                    <div className={`mt-2 flex items-center gap-2 text-xs font-bold ${priceDiff >= 0 ? 'text-[var(--teal)]' : 'text-[var(--rose)]'}`}>
                      {priceDiff >= 0
                        ? <TrendingUp className="w-3 h-3" />
                        : <TrendingDown className="w-3 h-3" />
                      }
                      {Math.abs(priceDiff).toFixed(1)}% {priceDiff >= 0 ? 'above' : 'below'} floor ({floorPrice} ETH)
                    </div>
                  )}
                </div>

                {/* Auction reserve */}
                {listingType === 'auction' && (
                  <div>
                    <label className="stat-label block mb-2">Reserve Price *</label>
                    <p className="text-xs text-[oklch(0.5_0.03_270)] mb-2">The minimum price you will accept. Must be &ge; starting bid.</p>
                    <input
                      type="number" step="0.001" min={price || '0'}
                      value={reservePrice}
                      onChange={e => setReservePrice(e.target.value)}
                      placeholder="0.000"
                      className="w-full px-4 py-3 rounded-lg border-2 border-[oklch(0.86_0.01_270)] bg-[oklch(0.975_0.005_75)] font-black text-lg focus:outline-none focus:border-[var(--indigo)] transition-colors"
                    />
                  </div>
                )}

                {/* Floor chart */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="stat-label">24h Floor Price — {relatedCollection.name}</p>
                    <span className={`text-xs font-bold flex items-center gap-1 ${relatedCollection.change24h >= 0 ? 'text-[var(--teal)]' : 'text-[var(--rose)]'}`}>
                      {relatedCollection.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {relatedCollection.change24h > 0 ? '+' : ''}{relatedCollection.change24h}%
                    </span>
                  </div>
                  <div className="h-36 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={priceChartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="listGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#3730a3" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#3730a3" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="hour" tick={{ fontSize: 10 }} tickFormatter={h => `${h}h`} />
                        <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${v.toFixed(2)}`} />
                        <Tooltip formatter={(v: number) => [`${v.toFixed(4)} ETH`, 'Floor']} labelFormatter={h => `${h}h ago`} />
                        <Area type="monotone" dataKey="price" stroke="#3730a3" strokeWidth={2} fill="url(#listGrad)" />
                        {priceNum > 0 && (
                          <ReferenceLine y={priceNum} stroke={priceDiff >= 0 ? '#0d9488' : '#e11d48'} strokeDasharray="4 2" label={{ value: `Your price`, position: 'right', fontSize: 9 }} />
                        )}
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Fee breakdown */}
                {priceNum > 0 && (
                  <div className="panel-flat space-y-2 text-sm">
                    <p className="stat-label mb-2">Earnings Breakdown</p>
                    {[
                      { l: 'Listing price',      v: `${priceNum.toFixed(4)} ETH`,       subtle: false },
                      { l: 'Platform fee (2.5%)', v: `− ${platformFee.toFixed(4)} ETH`,  subtle: true  },
                      { l: 'Creator royalty (5%)',v: `− ${creatorRoyalty.toFixed(4)} ETH`, subtle: true },
                    ].map(({ l, v, subtle }) => (
                      <div key={l} className="flex justify-between">
                        <span className={subtle ? 'text-[oklch(0.5_0.03_270)]' : ''}>{l}</span>
                        <span className={`font-bold ${subtle ? 'text-[oklch(0.5_0.03_270)]' : ''}`}>{v}</span>
                      </div>
                    ))}
                    <div className="border-t-2 border-[oklch(0.86_0.01_270)] pt-2 flex justify-between font-black">
                      <span>You receive</span>
                      <span className="text-[var(--teal)]">{youReceive > 0 ? youReceive.toFixed(4) : '0.0000'} ETH</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 3 — Duration */}
            {step === 3 && (
              <div className="panel animate-slide-in-up space-y-6">
                <div>
                  <h2 className="font-black text-xl mb-1">Duration & Timing</h2>
                  <p className="text-sm text-[oklch(0.5_0.03_270)]">Choose how long your listing stays active. Expired listings do not execute automatically.</p>
                </div>

                <div>
                  <label className="stat-label block mb-3">Listing Duration</label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {DURATIONS.map(d => (
                      <button
                        key={d.value}
                        onClick={() => setDuration(d.value)}
                        className={`py-3 rounded-xl border-2 font-bold text-sm transition-all ${
                          duration === d.value
                            ? 'border-[var(--indigo)] bg-[oklch(0.92_0.05_270)] text-[var(--indigo)]'
                            : 'border-[oklch(0.86_0.01_270)] text-[oklch(0.5_0.03_270)]'
                        }`}
                      >{d.label}</button>
                    ))}
                  </div>
                  {duration > 0 && (
                    <p className="text-xs text-[oklch(0.5_0.03_270)] mt-2">
                      Expires: {new Date(Date.now() + duration * 86400000).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  )}
                </div>

                <div>
                  <label className="stat-label block mb-3">Start Time</label>
                  <div className="flex gap-3">
                    {([
                      { v: 'now',       label: 'Immediately', icon: Zap,      desc: 'Goes live as soon as signed' },
                      { v: 'scheduled', label: 'Scheduled',   icon: Calendar, desc: 'Set a future start time' },
                    ] as const).map(({ v, label, icon: Icon, desc }) => (
                      <button
                        key={v}
                        onClick={() => setStartTime(v)}
                        className={`flex-1 flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                          startTime === v ? 'border-[var(--indigo)] bg-[oklch(0.92_0.05_270)]' : 'border-[oklch(0.86_0.01_270)] bg-white'
                        }`}
                      >
                        <Icon className={`w-5 h-5 mt-0.5 ${startTime === v ? 'text-[var(--indigo)]' : 'text-[oklch(0.6_0.03_270)]'}`} />
                        <div>
                          <p className="font-bold text-sm">{label}</p>
                          <p className="text-xs text-[oklch(0.5_0.03_270)]">{desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="panel-flat space-y-2 text-sm">
                  <p className="stat-label mb-2">Listing Rules</p>
                  {[
                    'You can cancel a listing at any time for a small gas fee.',
                    'If your NFT is transferred out of your wallet, the listing is automatically invalidated.',
                    'For auctions: the highest bid at expiry wins if it meets the reserve price.',
                    'Listings are off-chain signed orders — no gas until the sale executes.',
                  ].map(r => (
                    <div key={r} className="flex items-start gap-2 text-xs text-[oklch(0.5_0.03_270)]">
                      <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-[var(--indigo)]" />{r}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 4 — Approve */}
            {step === 4 && (
              <div className="panel animate-slide-in-up space-y-5">
                <div>
                  <h2 className="font-black text-xl mb-1">Approve Marketplace</h2>
                  <p className="text-sm text-[oklch(0.5_0.03_270)]">Before listing, you must authorise the NFTerra Marketplace contract to transfer your token on sale.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { icon: Shield,  title: 'Safe to approve', desc: 'The contract only transfers the NFT when a sale completes — not before.' },
                    { icon: Lock,    title: 'One-time per collection', desc: 'Once approved, all tokens in this collection can be listed without re-approving.' },
                    { icon: Eye,     title: 'Audited contract', desc: 'The NFTerra marketplace contract is open source and audited by CertiK.' },
                    { icon: Globe,   title: 'Revocable', desc: 'You can revoke approval at any time via your wallet or Etherscan.io.' },
                  ].map(({ icon: Icon, title, desc }) => (
                    <div key={title} className="panel-flat flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[oklch(0.92_0.05_270)] flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-[var(--indigo)]" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{title}</p>
                        <p className="text-xs text-[oklch(0.5_0.03_270)]">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="panel-flat text-xs space-y-2">
                  <p className="stat-label mb-2">Technical Details</p>
                  {[
                    ['Function',    'ERC-721.setApprovalForAll(operator, true)'],
                    ['Operator',    '0xNFTerra...MarketplaceV2'],
                    ['Gas estimate','~45,000 gas (~0.001 ETH)'],
                    ['Chain',       'Ethereum Mainnet'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-[oklch(0.5_0.03_270)]">{k}</span>
                      <span className="font-mono font-bold">{v}</span>
                    </div>
                  ))}
                </div>

                {!connected && (
                  <button onClick={connectWallet} className="btn-primary w-full">Connect Wallet</button>
                )}
                {connected && (
                  <div className="flex items-center gap-2 text-sm text-[var(--teal)]">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="font-bold">Wallet connected — ready to approve</span>
                  </div>
                )}
              </div>
            )}

            {/* STEP 5 — Confirm */}
            {step === 5 && (
              <div className="panel animate-slide-in-up space-y-5">
                <div>
                  <h2 className="font-black text-xl mb-1">Confirm Listing</h2>
                  <p className="text-sm text-[oklch(0.5_0.03_270)]">Final check before you sign. The listing goes live the moment your signature is broadcast.</p>
                </div>

                {/* NFT + price summary */}
                <div className="flex gap-4 panel-flat">
                  {selectedNft && (
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                      <Image src={selectedNft.image} alt={selectedNft.name} fill className="object-cover" />
                    </div>
                  )}
                  <div className="space-y-1 text-sm">
                    <p className="font-black text-base">{selectedNft?.name ?? '—'}</p>
                    <p className="text-[oklch(0.5_0.03_270)] text-xs">Level {selectedNft?.level} · {selectedNft?.rarity}</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="font-black text-xl text-[var(--indigo)]">{price} {currency}</span>
                      <span className="text-xs text-[oklch(0.5_0.03_270)]">
                        {listingType === 'fixed' ? 'Fixed Price' : 'Auction starting bid'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Full summary */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    ['Type',       listingType === 'fixed' ? 'Fixed Price' : 'Auction'],
                    ['Currency',   currency],
                    ['Duration',   duration === 0 ? 'No expiry' : `${duration} days`],
                    ['Start',      startTime === 'now' ? 'Immediately' : 'Scheduled'],
                    ['Platform fee','2.5%'],
                    ['Royalty',    '5.0%'],
                    ['You receive',`~${youReceive.toFixed(4)} ETH`],
                    ['Signature',  'Off-chain (EIP-712)'],
                  ].map(([k, v]) => (
                    <div key={k} className="panel-flat py-2 px-3">
                      <p className="stat-label text-[9px] mb-0.5">{k}</p>
                      <p className="font-bold">{v}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-start gap-2 text-xs text-[oklch(0.55_0.03_270)]">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 text-[var(--amber)] mt-0.5" />
                  <span>By signing you confirm this listing complies with NFTerra terms of service. The listing is immediately visible once signed. Gas is only charged when the item sells.</span>
                </div>

                {connected ? (
                  <button onClick={handleList} className="btn-primary w-full py-4 text-base">
                    <Zap className="w-5 h-5" />
                    Sign &amp; List — Free
                  </button>
                ) : (
                  <button onClick={connectWallet} className="btn-outline w-full">Connect Wallet to List</button>
                )}
              </div>
            )}

            {/* Nav buttons */}
            <div className="flex justify-between pt-2">
              <button onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1} className="btn-outline disabled:opacity-30 disabled:cursor-not-allowed">Back</button>
              {step < 5 && (
                <button onClick={() => setStep(s => s + 1)} disabled={!stepValid} className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed">
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* ── Right: live summary ─────────────────────────────────────────── */}
          <div className="space-y-4">
            <div className="panel sticky top-24 space-y-4">
              <p className="stat-label">Listing Summary</p>

              {/* NFT preview */}
              <div className={`aspect-square rounded-xl overflow-hidden border-2 border-[oklch(0.86_0.01_270)] relative ${!selectedNft ? 'bg-[oklch(0.975_0.005_75)]' : ''}`}>
                {selectedNft ? (
                  <Image src={selectedNft.image} alt={selectedNft.name} fill className="object-cover" loading="eager" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                    <Eye className="w-10 h-10 text-[oklch(0.7_0.05_270)]" />
                    <p className="text-xs text-[oklch(0.6_0.03_270)] font-semibold">No NFT selected</p>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="space-y-1.5 text-xs">
                {[
                  { k: 'NFT',      v: selectedNft?.name ?? '—' },
                  { k: 'Price',    v: price ? `${price} ${currency}` : '—' },
                  { k: 'Type',     v: listingType === 'fixed' ? 'Fixed Price' : 'Auction' },
                  { k: 'Duration', v: duration === 0 ? 'No expiry' : `${duration} days` },
                  { k: 'Receive',  v: youReceive > 0 ? `~${youReceive.toFixed(4)} ETH` : '—' },
                ].map(({ k, v }) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-[oklch(0.5_0.03_270)]">{k}</span>
                    <span className="font-bold truncate max-w-[120px] text-right">{v}</span>
                  </div>
                ))}
              </div>

              {/* Progress */}
              <div className="pt-2 border-t-2 border-[oklch(0.86_0.01_270)]">
                <div className="level-bar-track"><div className="level-bar-fill" style={{ width: `${(step / 5) * 100}%` }} /></div>
                <p className="text-xs text-[oklch(0.5_0.03_270)] mt-1">Step {step} of 5</p>
              </div>
            </div>

            {/* Related stats */}
            {selectedNft && (
              <div className="panel text-xs space-y-2">
                <p className="font-black text-sm mb-3">Market Context</p>
                {[
                  { k: 'Collection floor', v: `${floorPrice} ETH` },
                  { k: '24h change',       v: `${relatedCollection.change24h > 0 ? '+' : ''}${relatedCollection.change24h}%`, color: relatedCollection.change24h >= 0 ? 'text-[var(--teal)]' : 'text-[var(--rose)]' },
                  { k: 'Total volume',     v: `${relatedCollection.totalVolume} ETH` },
                  { k: 'Items listed',     v: `${relatedCollection.listed}%` },
                ].map(({ k, v, color }) => (
                  <div key={k} className="flex justify-between">
                    <span className="text-[oklch(0.5_0.03_270)]">{k}</span>
                    <span className={`font-bold ${color ?? ''}`}>{v}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
