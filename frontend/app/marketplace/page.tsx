'use client';

import React, { useState, useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { BuyingPanel } from '@/components/marketplace/BuyingPanel';
import {
  COLLECTIONS, generateCollectionListings, generateMarketplaceListings,
  Listing, Collection, formatTimeAgo,
} from '@/lib/marketplace-data';
import { useWallet } from '@/lib/context/WalletContext';
import { useTxToast } from '@/lib/context/TxToastContext';
import { useTxHistory } from '@/lib/context/TxHistoryContext';
import { useNFTStore } from '@/lib/context/NFTStoreContext';
import { useMyListings } from '@/lib/context/MyListingsContext';
import { sendMarketplaceTransaction } from '@/lib/contract';
import { formatAddress } from '@/lib/web3-utils';
import {
  ShoppingBag, TrendingUp, TrendingDown, Verified, Eye,
  Loader2, ChevronRight, BarChart2, Grid3X3, List,
  Music, Gamepad2, ImageIcon, Users, Trophy, Zap, Star,
  ArrowUpRight, ArrowDownRight, Search, SlidersHorizontal,
  Tag, X, CheckCircle, ChevronDown,
} from 'lucide-react';

// ── Category config ───────────────────────────────────────────────────────────

const CATEGORY_TABS = [
  { id: 'all',     label: 'All',     icon: Grid3X3 },
  { id: 'pfp',     label: 'PFPs',    icon: Users },
  { id: 'gaming',  label: 'Gaming',  icon: Gamepad2 },
  { id: 'art',     label: 'Art',     icon: ImageIcon },
  { id: 'music',   label: 'Music',   icon: Music },
  { id: 'sports',  label: 'Sports',  icon: Trophy },
] as const;

type CategoryId = typeof CATEGORY_TABS[number]['id'];

const RARITY_COLOR: Record<string, string> = {
  common:    '#3730a3',
  rare:      '#0d9488',
  legendary: '#d97706',
};

// ── Main page ─────────────────────────────────────────────────────────────────

export default function MarketplacePage() {
  const { connected, address } = useWallet();
  const { runTx } = useTxToast();
  const { addTransaction, updateTransaction } = useTxHistory();
  const { addNewNFT, newNFTs } = useNFTStore();
  const { listings } = useMyListings();

  const [category, setCategory]       = useState<CategoryId>('all');
  const [activeCol, setActiveCol]     = useState<Collection>(COLLECTIONS[0]);
  const [viewMode, setViewMode]       = useState<'collections' | 'listings' | 'my-listings'>('collections');
  const [search, setSearch]           = useState('');
  const [buyingListing, setBuyingListing] = useState<Listing | null>(null);
  const [isBuyLoading, setIsBuyLoading] = useState(false);
  const [showListModal, setShowListModal] = useState(false);
  const [sortBy, setSortBy]           = useState<'volume' | 'floor' | 'change'>('volume');

  const myActiveListings = useMemo(() => {
    if (!address) return [];
    return listings.filter(
      (listing) =>
        listing.status === 'active' &&
        listing.seller.toLowerCase() === address.toLowerCase(),
    );
  }, [listings, address]);

  const filteredCollections = useMemo(() => {
    let cols = category === 'all' ? COLLECTIONS : COLLECTIONS.filter(c => c.category === category);
    if (search.trim()) cols = cols.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
    return [...cols].sort((a, b) => {
      if (sortBy === 'volume') return b.totalVolume - a.totalVolume;
      if (sortBy === 'floor')  return b.floorPrice - a.floorPrice;
      return Math.abs(b.change24h) - Math.abs(a.change24h);
    });
  }, [category, search, sortBy]);

  const activeListings = useMemo(
    () => generateCollectionListings(activeCol.id, 12),
    [activeCol.id],
  );

  const handleBuy = (listing: Listing) => {
    if (!connected || !address) {
      alert('Connect your wallet first.');
      return;
    }
    setBuyingListing(listing);
  };

  const handleCompletePurchase = async () => {
    if (!buyingListing || !address) return;
    setIsBuyLoading(true);
    
    // The transaction was already made by BuyingPanel, so just update UI/stores
    try {
      // Add the purchased NFT to your collection
      addNewNFT({
        ...buyingListing.nft,
        owner: address,
        lastLevelUp: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error('Error updating purchase:', err?.message || err);
    }
    
    setIsBuyLoading(false);
    setBuyingListing(null);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col animate-fade-slide-up">
      <Navbar />

      {/* ── Category tab strip ── */}
      <div className="border-b-2 border-[oklch(0.86_0.01_270)] bg-white sticky top-0 z-40 backdrop-blur-sm/5">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto">
          {CATEGORY_TABS.map(tab => {
            const Icon = tab.icon;
            const active = category === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCategory(tab.id)}
                className={`flex items-center gap-2 px-4 py-3.5 text-sm font-bold whitespace-nowrap border-b-2 transition-soft ${
                  active
                    ? 'border-[var(--indigo)] text-[var(--indigo)]'
                    : 'border-transparent text-[oklch(0.5_0.03_270)] hover:text-[oklch(0.2_0.03_270)] hover:border-[oklch(0.7_0.03_270)]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
          <div className="ml-auto flex items-center gap-2 py-2 pl-4 border-l-2 border-[oklch(0.9_0.01_270)]">
            <button
              onClick={() => setViewMode('collections')}
              className={`p-1.5 rounded transition-soft ${viewMode === 'collections' ? 'bg-[var(--indigo)] text-white' : 'text-[oklch(0.5_0.03_270)] hover:bg-[oklch(0.94_0.02_270)]'}`}
              title="Collections view"
            >
              <BarChart2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('listings')}
              className={`p-1.5 rounded transition-soft ${viewMode === 'listings' ? 'bg-[var(--indigo)] text-white' : 'text-[oklch(0.5_0.03_270)] hover:bg-[oklch(0.94_0.02_270)]'}`}
              title="Listings view"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('my-listings')}
              className={`p-1.5 rounded transition-soft ${viewMode === 'my-listings' ? 'bg-[var(--indigo)] text-white' : 'text-[oklch(0.5_0.03_270)] hover:bg-[oklch(0.94_0.02_270)]'}`}
              title="My listings"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">

        {viewMode === 'collections' ? (
          /* ====== COLLECTIONS VIEW ====== */
          <div className="flex gap-6 items-start">

            {/* ── Left: Featured collection hero + listings ── */}
            <div className="flex-1 min-w-0 flex flex-col gap-8">

              {/* Featured hero banner */}
              <div className="relative rounded-2xl overflow-hidden border-2 border-[oklch(0.86_0.01_270)] hover-lift transition-soft" style={{ height: 480 }}>
                <Image
                  src={activeCol.banner}
                  alt={activeCol.name}
                  fill
                  className="object-cover"
                  priority
                  loading="eager"
                  sizes="(max-width: 1024px) 100vw, 65vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                {/* Collection meta overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-12">
                  <div className="flex items-end justify-between gap-6 animate-fade-slide-up">
                    <div className="flex items-start gap-5">
                      <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-white/30 flex-shrink-0">
                        <Image src={activeCol.avatar} alt="" fill className="object-cover" sizes="96px" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <h1 className="text-white font-black text-5xl leading-none">{activeCol.name}</h1>
                          {activeCol.verified && (
                            <CheckCircle className="w-7 h-7 text-blue-400 flex-shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-white/60 text-base font-mono mb-1">by {formatAddress(activeCol.creator)}</p>
                        <p className="text-white/80 text-lg mt-1 max-w-2xl line-clamp-2">{activeCol.description}</p>
                      </div>
                    </div>
                    <button
                      className="flex-shrink-0 btn-primary text-lg px-8 py-4 font-black"
                      onClick={() => setViewMode('listings')}
                    >
                      <ShoppingBag className="w-6 h-6" />
                      Browse Items
                    </button>
                  </div>

                  {/* Stats row */}
                  <div className="flex flex-wrap gap-10 mt-8">
                    {[
                      { label: 'FLOOR PRICE', value: `${activeCol.floorPrice} ETH` },
                      { label: 'ITEMS', value: activeCol.items.toLocaleString() },
                      { label: 'TOTAL VOLUME', value: `${activeCol.totalVolume.toFixed(1)} ETH` },
                      { label: 'LISTED', value: `${activeCol.listed}%` },
                    ].map(s => (
                      <div key={s.label} className="transition-soft hover:-translate-y-0.5">
                        <p className="text-white/50 text-sm font-bold tracking-widest uppercase mb-2">{s.label}</p>
                        <p className="text-white font-black text-3xl leading-none">{s.value}</p>
                      </div>
                    ))}
                    <div className="transition-soft hover:-translate-y-0.5">
                      <p className="text-white/50 text-sm font-bold tracking-widest uppercase mb-2">24H CHANGE</p>
                      <p className={`font-black text-3xl leading-none flex items-center gap-2 ${activeCol.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {activeCol.change24h >= 0
                          ? <ArrowUpRight className="w-6 h-6" />
                          : <ArrowDownRight className="w-6 h-6" />}
                        {Math.abs(activeCol.change24h)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floor price chart */}
              <div className="panel animate-subtle-pop">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-black text-base">Floor Price — {activeCol.name}</h2>
                    <p className="text-xs text-[oklch(0.55_0.03_270)] mt-0.5">Last 24 hours</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="tag tag-indigo">
                      <BarChart2 className="w-3 h-3" /> Live
                    </span>
                    <span className={`tag ${activeCol.change24h >= 0 ? 'tag-teal' : 'tag-rose'}`}>
                      {activeCol.change24h >= 0 ? '+' : ''}{activeCol.change24h}%
                    </span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={160}>
                  <AreaChart data={activeCol.priceHistory} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#3730a3" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#3730a3" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="hour"
                      tickFormatter={h => `${h}h`}
                      tick={{ fontSize: 10, fill: 'oklch(0.6 0.03 270)' }}
                      axisLine={false} tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: 'oklch(0.6 0.03 270)' }}
                      axisLine={false} tickLine={false}
                      tickFormatter={v => `${v.toFixed(2)}`}
                      width={42}
                    />
                    <Tooltip
                      contentStyle={{ background: 'white', border: '1.5px solid oklch(0.86 0.01 270)', borderRadius: 8, fontSize: 12 }}
                      formatter={(v: number) => [`${v.toFixed(4)} ETH`, 'Floor']}
                      labelFormatter={(l: number) => `Hour ${l}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke="#3730a3"
                      strokeWidth={2}
                      fill="url(#chartGrad)"
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Recent listings from active collection */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-black text-base">Recent Listings</h2>
                  <button
                    onClick={() => setViewMode('listings')}
                    className="text-xs font-bold text-[var(--indigo)] hover:underline flex items-center gap-1"
                  >
                    View All <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {activeListings.slice(0, 8).map(listing => (
                    <MiniListingCard
                      key={listing.id}
                      listing={listing}
                      buying={buyingListing?.id === listing.id}
                      onBuy={() => handleBuy(listing)}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* ── Right: Trending leaderboard ── */}
            <div className="w-80 flex-shrink-0 flex flex-col gap-4 sticky top-20">
              {/* Search + sort */}
              <div className="panel p-3 flex flex-col gap-2 animate-subtle-pop">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[oklch(0.6_0.03_270)]" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search collections…"
                    className="w-full pl-8 pr-3 py-2 text-xs font-medium border-2 border-[oklch(0.88_0.01_270)] rounded-lg bg-[oklch(0.975_0.005_75)] focus:outline-none focus:border-[var(--indigo)] transition-colors"
                  />
                </div>
                <div className="flex gap-1">
                  {(['volume', 'floor', 'change'] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => setSortBy(s)}
                      className={`flex-1 py-1 text-[10px] font-black uppercase tracking-wider rounded transition-colors ${
                        sortBy === s
                          ? 'bg-[var(--indigo)] text-white'
                          : 'bg-[oklch(0.94_0.02_270)] text-[oklch(0.45_0.03_270)] hover:bg-[oklch(0.88_0.03_270)]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Leaderboard */}
              <div className="panel p-0 overflow-hidden animate-subtle-pop">
                <div className="px-4 py-3 border-b-2 border-[oklch(0.9_0.01_270)] flex items-center justify-between">
                  <span className="font-black text-sm">Collections</span>
                  <div className="flex gap-4">
                    <span className="text-[10px] font-bold text-[oklch(0.55_0.03_270)] uppercase tracking-wider">Floor</span>
                    <span className="text-[10px] font-bold text-[oklch(0.55_0.03_270)] uppercase tracking-wider w-12 text-right">Change</span>
                  </div>
                </div>
                <div className="divide-y divide-[oklch(0.93_0.01_270)]">
                  {filteredCollections.map((col, idx) => (
                    <button
                      key={col.id}
                      onClick={() => setActiveCol(col)}
                      className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-[oklch(0.97_0.01_270)] transition-colors text-left ${
                        activeCol.id === col.id ? 'bg-[oklch(0.95_0.04_270)]' : ''
                      }`}
                    >
                      <span className="text-[11px] font-black text-[oklch(0.65_0.03_270)] w-4 flex-shrink-0">
                        {idx + 1}
                      </span>
                      <div className="relative w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 border border-[oklch(0.88_0.01_270)]">
                        <Image src={col.avatar} alt={col.name} fill className="object-cover" sizes="32px" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <p className="text-xs font-black truncate">{col.name}</p>
                          {col.verified && <CheckCircle className="w-3 h-3 text-blue-500 flex-shrink-0" />}
                        </div>
                        <p className="text-[10px] text-[oklch(0.6_0.03_270)] font-mono mt-0.5">
                          {col.totalVolume.toFixed(1)} ETH vol
                        </p>
                      </div>
                      <div className="flex-shrink-0 flex flex-col items-end gap-0.5">
                        <p className="text-xs font-black tabular-nums">{col.floorPrice} ETH</p>
                        <p className={`text-[10px] font-bold tabular-nums flex items-center gap-0.5 ${
                          col.change24h >= 0 ? 'text-emerald-600' : 'text-red-500'
                        }`}>
                          {col.change24h >= 0
                            ? <ArrowUpRight className="w-3 h-3" />
                            : <ArrowDownRight className="w-3 h-3" />}
                          {Math.abs(col.change24h)}%
                        </p>
                      </div>
                    </button>
                  ))}
                  {filteredCollections.length === 0 && (
                    <div className="px-4 py-8 text-center">
                      <p className="text-xs text-[oklch(0.6_0.03_270)]">No collections found</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Sell your NFT CTA */}
              <div className="panel bg-[oklch(0.13_0.02_270)] text-white border-[oklch(0.25_0.04_270)]">
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="w-4 h-4 text-[oklch(0.72_0.18_55)]" />
                  <span className="font-black text-sm">List Your NFT</span>
                </div>
                <p className="text-[11px] text-white/60 mb-4 leading-relaxed">
                  Turn your collection into earnings. Set your price, approve the contract, and list in minutes.
                </p>
                <button
                  onClick={() => setShowListModal(true)}
                  className="btn-amber w-full text-sm"
                >
                  <Zap className="w-4 h-4" /> Start Listing
                </button>
              </div>

              {connected && (
                <div className="panel">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-black text-sm">My Listings</span>
                    <span className="tag tag-rose">{myActiveListings.length}</span>
                  </div>
                  <p className="text-[11px] text-[oklch(0.55_0.03_270)] mb-3 leading-relaxed">
                    Track your active NFTs, listing prices, and time listed in one place.
                  </p>
                  <button
                    onClick={() => setViewMode('my-listings')}
                    className="btn-outline w-full text-sm"
                  >
                    <List className="w-4 h-4" /> View My Listings
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : viewMode === 'listings' ? (
          /* ====== LISTINGS GRID VIEW ====== */
          <ListingsView
            collection={activeCol}
            listings={activeListings}
            buying={buyingListing?.id ?? null}
            onBuy={handleBuy}
            onBack={() => setViewMode('collections')}
          />
        ) : (
          /* ====== MY LISTINGS VIEW ====== */
          <MyListingsView
            myListings={myActiveListings}
            onStartListing={() => setShowListModal(true)}
            onBack={() => setViewMode('collections')}
          />
        )}
      </main>

      {showListModal && (
        <ListNFTModal onClose={() => setShowListModal(false)} userNFTs={newNFTs} />
      )}

      <BuyingPanel
        listing={buyingListing}
        onClose={() => setBuyingListing(null)}
        onComplete={handleCompletePurchase}
        loading={isBuyLoading}
      />

      <Footer />
    </div>
  );
}

// ── Mini listing card (used in collections view) ──────────────────────────────

function MiniListingCard({ listing, buying, onBuy }: {
  listing: Listing; buying: boolean; onBuy: () => void;
}) {
  const { nft, price } = listing;
  const color = RARITY_COLOR[nft.rarity];
  return (
    <article className="nft-grid-card group flex flex-col animate-subtle-pop">
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={nft.image}
          alt={nft.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="25vw"
        />
        <div className="absolute top-2 left-2">
          <span className="tag" style={{ color, backgroundColor: `${color}18`, borderColor: `${color}44` }}>
            Lv {nft.level}
          </span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-2.5 py-2">
          <p className="text-white font-black text-sm">{price} ETH</p>
        </div>
      </div>
      <div className="p-2.5 flex items-center justify-between gap-2">
        <p className="text-[11px] font-black truncate flex-1">{nft.name}</p>
        <button
          onClick={onBuy}
          disabled={buying}
          className="flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded text-[10px] font-black text-white transition-colors"
          style={{ backgroundColor: color }}
        >
          {buying ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShoppingBag className="w-3 h-3" />}
          Buy
        </button>
      </div>
    </article>
  );
}

// ── Full listings grid view ───────────────────────────────────────────────────

function ListingsView({ collection, listings, buying, onBuy, onBack }: {
  collection: Collection;
  listings: Listing[];
  buying: string | null;
  onBuy: (l: Listing) => void;
  onBack: () => void;
}) {
  const [rarity, setRarity]     = useState('all');
  const [sort, setSort]         = useState('price-asc');
  const [search, setSearch]     = useState('');

  const filtered = useMemo(() => {
    let r = [...listings];
    if (rarity !== 'all') r = r.filter(l => l.nft.rarity === rarity);
    if (search) r = r.filter(l => l.nft.name.toLowerCase().includes(search.toLowerCase()));
    r.sort((a, b) => {
      if (sort === 'price-asc')  return parseFloat(a.price) - parseFloat(b.price);
      if (sort === 'price-desc') return parseFloat(b.price) - parseFloat(a.price);
      return b.nft.level - a.nft.level;
    });
    return r;
  }, [listings, rarity, sort, search]);

  return (
    <div>
      {/* Sub-header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="text-xs font-bold text-[var(--indigo)] hover:underline flex items-center gap-1">
          ← Collections
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-[oklch(0.65_0.03_270)]" />
        <div className="flex items-center gap-2">
          <div className="relative w-6 h-6 rounded overflow-hidden border border-[oklch(0.88_0.01_270)]">
            <Image src={collection.avatar} alt="" fill className="object-cover" sizes="24px" />
          </div>
          <span className="font-black text-sm">{collection.name}</span>
          {collection.verified && <CheckCircle className="w-4 h-4 text-blue-500" />}
        </div>
      </div>

      <div className="flex gap-6 items-start">
        {/* Sidebar filters */}
        <div className="w-52 flex-shrink-0 flex flex-col gap-3 sticky top-20">
          <div className="panel p-3">
            <p className="text-[10px] font-black uppercase tracking-wider text-[oklch(0.5_0.03_270)] mb-2">
              <SlidersHorizontal className="w-3 h-3 inline mr-1" />Filters
            </p>
            <div className="relative mb-3">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[oklch(0.6_0.03_270)]" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search…"
                className="w-full pl-7 pr-2 py-1.5 text-xs border-2 border-[oklch(0.88_0.01_270)] rounded-lg focus:outline-none focus:border-[var(--indigo)] transition-colors bg-[oklch(0.975_0.005_75)]"
              />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[oklch(0.6_0.03_270)] mb-1.5">Rarity</p>
            {['all', 'common', 'rare', 'legendary'].map(r => (
              <button
                key={r}
                onClick={() => setRarity(r)}
                className={`w-full text-left px-2.5 py-1.5 rounded text-xs font-bold capitalize mb-0.5 transition-colors ${
                  rarity === r
                    ? 'bg-[var(--indigo)] text-white'
                    : 'text-[oklch(0.4_0.03_270)] hover:bg-[oklch(0.94_0.02_270)]'
                }`}
              >
                {r === 'all' ? 'All Rarities' : r}
              </button>
            ))}
          </div>
          <div className="panel p-3">
            <p className="text-[10px] font-black uppercase tracking-wider text-[oklch(0.5_0.03_270)] mb-2">Sort By</p>
            {[
              { value: 'price-asc',  label: 'Price: Low to High' },
              { value: 'price-desc', label: 'Price: High to Low' },
              { value: 'level-desc', label: 'Highest Level' },
            ].map(o => (
              <button
                key={o.value}
                onClick={() => setSort(o.value)}
                className={`w-full text-left px-2.5 py-1.5 rounded text-xs font-bold mb-0.5 transition-colors ${
                  sort === o.value
                    ? 'bg-[var(--indigo)] text-white'
                    : 'text-[oklch(0.4_0.03_270)] hover:bg-[oklch(0.94_0.02_270)]'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>

          {/* Collection stats mini */}
          <div className="panel p-3 bg-[oklch(0.975_0.005_75)]">
            <p className="text-[10px] font-black uppercase tracking-wider text-[oklch(0.5_0.03_270)] mb-2">Collection Stats</p>
            {[
              { label: 'Floor',  value: `${collection.floorPrice} ETH` },
              { label: 'Volume', value: `${collection.totalVolume.toFixed(0)} ETH` },
              { label: 'Items',  value: collection.items.toLocaleString() },
              { label: 'Listed', value: `${collection.listed}%` },
            ].map(s => (
              <div key={s.label} className="flex justify-between items-center py-1 border-b border-[oklch(0.9_0.01_270)] last:border-0">
                <span className="text-[11px] text-[oklch(0.55_0.03_270)]">{s.label}</span>
                <span className="text-[11px] font-black">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-black text-[oklch(0.4_0.03_270)]">
              {filtered.length} items
            </p>
            <span className={`tag ${collection.change24h >= 0 ? 'tag-teal' : 'tag-rose'} flex items-center gap-1`}>
              {collection.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(collection.change24h)}% today
            </span>
          </div>
          {filtered.length === 0 ? (
            <div className="panel text-center py-16">
              <Search className="w-8 h-8 text-[oklch(0.75_0.03_270)] mx-auto mb-3" />
              <p className="font-black">No items found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map(listing => (
                <FullListingCard
                  key={listing.id}
                  listing={listing}
                  buying={buying === listing.id}
                  onBuy={() => onBuy(listing)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Full listing card ─────────────────────────────────────────────────────────

function FullListingCard({ listing, buying, onBuy }: {
  listing: Listing; buying: boolean; onBuy: () => void;
}) {
  const { nft, price, seller } = listing;
  const color = RARITY_COLOR[nft.rarity];
  const stageNames = ['Rookie', 'Explorer', 'Warrior', 'Champion', 'Legend'];
  return (
    <article className="nft-grid-card group flex flex-col animate-subtle-pop">
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={nft.image}
          alt={nft.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 50vw, 25vw"
        />
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          <span className="tag" style={{ color, backgroundColor: `${color}18`, borderColor: `${color}44` }}>
            {nft.rarity}
          </span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/75 to-transparent px-3 py-2.5">
          <p className="text-white font-black text-base">{price} ETH</p>
        </div>
      </div>
      <div className="p-3 flex flex-col gap-2 flex-1">
        <div>
          <h3 className="font-black text-sm truncate">{nft.name}</h3>
          <p className="text-[10px] font-mono text-[oklch(0.6_0.03_270)] truncate mt-0.5">
            {stageNames[nft.level - 1]} · {formatAddress(seller)}
          </p>
        </div>
        <div className="level-bar-track">
          <div className="level-bar-fill" style={{ width: `${(nft.level / 5) * 100}%`, backgroundColor: color }} />
        </div>
        <div className="flex gap-2 mt-auto">
          <Link href={`/nft/${nft.tokenId}`} className="contents flex-1">
            <button className="btn-outline w-full py-1.5 text-xs gap-1">
              <Eye className="w-3.5 h-3.5" /> View
            </button>
          </Link>
          <button
            onClick={onBuy}
            disabled={buying}
            className="flex-1 btn-primary py-1.5 text-xs gap-1"
            style={{ backgroundColor: color, borderColor: color }}
          >
            {buying
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <ShoppingBag className="w-3.5 h-3.5" />}
            Buy
          </button>
        </div>
      </div>
    </article>
  );
}

function MyListingsView({
  myListings,
  onStartListing,
  onBack,
}: {
  myListings: Array<{
    id: string;
    tokenId: number;
    tokenName: string;
    image: string;
    level: number;
    rarity: 'common' | 'rare' | 'legendary';
    price: string;
    currency: 'ETH' | 'USDC';
    listingType: 'fixed' | 'auction';
    listedAt: string;
    durationDays: number;
  }>;
  onStartListing: () => void;
  onBack: () => void;
}) {
  const totalListedValue = myListings.reduce((sum, listing) => sum + (parseFloat(listing.price) || 0), 0);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="text-xs font-bold text-[var(--indigo)] hover:underline flex items-center gap-1">
          ← Collections
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-[oklch(0.65_0.03_270)]" />
        <h2 className="font-black text-base">My Listed NFTs</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="panel">
          <p className="stat-label">Active Listings</p>
          <p className="stat-number text-[var(--indigo)]">{myListings.length}</p>
        </div>
        <div className="panel">
          <p className="stat-label">Total Listed Value</p>
          <p className="stat-number text-[var(--teal)]">{totalListedValue.toFixed(3)} ETH</p>
        </div>
        <div className="panel">
          <p className="stat-label">Average List Price</p>
          <p className="stat-number text-[var(--amber)]">
            {myListings.length > 0 ? (totalListedValue / myListings.length).toFixed(3) : '0.000'} ETH
          </p>
        </div>
      </div>

      {myListings.length === 0 ? (
        <div className="panel text-center py-16">
          <Tag className="w-10 h-10 text-[oklch(0.65_0.03_270)] mx-auto mb-3" />
          <p className="font-black text-lg mb-2">No Active Listings</p>
          <p className="text-sm text-[oklch(0.55_0.03_270)] mb-5">List one of your NFTs to see it here with pricing and status.</p>
          <button onClick={onStartListing} className="btn-primary">
            <Zap className="w-4 h-4" /> Start Listing
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {myListings.map((listing) => {
            const color = RARITY_COLOR[listing.rarity];
            return (
              <article key={listing.id} className="nft-grid-card group flex flex-col">
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={listing.image}
                    alt={listing.tokenName}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                  <div className="absolute top-2 left-2">
                    <span className="tag tag-rose">Active</span>
                  </div>
                  <div className="absolute top-2 right-2">
                    <span className="tag" style={{ color, backgroundColor: `${color}18`, borderColor: `${color}44` }}>
                      Lv {listing.level}
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/75 to-transparent px-3 py-2.5">
                    <p className="text-white font-black text-base">{listing.price} {listing.currency}</p>
                  </div>
                </div>
                <div className="p-3 flex flex-col gap-2 flex-1">
                  <div>
                    <h3 className="font-black text-sm truncate">{listing.tokenName}</h3>
                    <p className="text-[10px] font-mono text-[oklch(0.6_0.03_270)] mt-0.5">
                      Listed {formatTimeAgo(listing.listedAt)} · {listing.listingType}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[oklch(0.6_0.03_270)]">
                    <span>Duration</span>
                    <span className="font-black text-[oklch(0.35_0.03_270)]">
                      {listing.durationDays > 0 ? `${listing.durationDays} days` : 'No expiry'}
                    </span>
                  </div>
                  <Link href={`/nft/${listing.tokenId}`} className="contents">
                    <button className="btn-outline w-full py-1.5 text-xs gap-1 mt-auto">
                      <Eye className="w-3.5 h-3.5" /> View NFT
                    </button>
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── List NFT Modal — multi-step ───────────────────────────────────────────────

const LIST_STEPS = [
  { id: 1, title: 'Choose NFT',       desc: 'Select the NFT from your wallet you want to list' },
  { id: 2, title: 'Set Price',        desc: 'Choose your asking price and listing duration' },
  { id: 3, title: 'Approve Contract', desc: 'Grant the marketplace contract permission to transfer your NFT' },
  { id: 4, title: 'Sign & List',      desc: 'Sign the listing transaction to publish on the marketplace' },
  { id: 5, title: 'Listed!',          desc: 'Your NFT is now live and visible to buyers' },
];

interface ListNFTModalProps {
  onClose: () => void;
  userNFTs: any[]; // NFTs user owns (minted + purchased)
}

function ListNFTModal({ onClose, userNFTs }: ListNFTModalProps) {
  const { address } = useWallet();
  const { runTx } = useTxToast();
  const { addTransaction, updateTransaction } = useTxHistory();
  const { addListing } = useMyListings();
  const [step, setStep]         = useState(1);
  const [selectedNFT, setSelectedNFT] = useState<any | null>(null);
  const [price, setPrice]       = useState('');
  const [duration, setDuration] = useState('7');
  const [approving, setApproving] = useState(false);
  const [listing, setListing]   = useState(false);
  const [approved, setApproved] = useState(false);

  const handleApprove = async () => {
    setApproving(true);
    try {
      // In a real scenario, this would call contract.setApprovalForAll()
      // For now, simulate the approval delay
      await runTx(
        'Approving Marketplace Contract…',
        async () => {
          await new Promise(r => setTimeout(r, 1500)); // Simulate approval time
        },
        'Contract Approved',
      );
      setApproving(false);
      setApproved(true);
      setTimeout(() => setStep(4), 400);
    } catch (error) {
      console.error('Approval error:', error);
      setApproving(false);
    }
  };

  const handleList = async () => {
    if (!selectedNFT || !price) return;
    
    // Generate a mock hash for the pending transaction
    const mockHash = '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    
    const txId = addTransaction({
      action: 'Listed',
      tokenId: selectedNFT.tokenId,
      tokenName: selectedNFT.name,
      amount: `${price} ETH`,
      timestamp: new Date().toISOString(),
      status: 'pending',
      hash: mockHash,
    });

    setListing(true);
    try {
      await runTx(
        `Listing ${selectedNFT?.name} for ${price} ETH…`,
        async () => {
          // Call real marketplace transaction
          const result = await sendMarketplaceTransaction(price);
          updateTransaction(txId, {
            status: 'success',
            hash: result.txHash,
          });

          if (address) {
            addListing({
              tokenId: selectedNFT.tokenId,
              tokenName: selectedNFT.name,
              image: selectedNFT.image,
              level: selectedNFT.level,
              rarity: selectedNFT.rarity,
              price,
              currency: 'ETH',
              listingType: 'fixed',
              durationDays: Number(duration),
              seller: address,
              txHash: result.txHash,
            });
          }
        },
        `${selectedNFT?.name} listed successfully!`,
      );
      setListing(false);
      setStep(5);
    } catch (error) {
      updateTransaction(txId, { status: 'failed' });
      console.error('Listing error:', error);
      setListing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'oklch(0.13 0.02 270 / 0.7)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white rounded-2xl w-full border-2 border-[oklch(0.86_0.01_270)] overflow-hidden"
        style={{ maxWidth: 640, maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-[oklch(0.9_0.01_270)]">
          <div>
            <h2 className="font-black text-lg">List NFT for Sale</h2>
            <p className="text-xs text-[oklch(0.55_0.03_270)] mt-0.5">
              Step {step} of {LIST_STEPS.length}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[oklch(0.94_0.02_270)] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step progress */}
        <div className="px-6 py-4 border-b-2 border-[oklch(0.92_0.01_270)]">
          <div className="flex items-center gap-2">
            {LIST_STEPS.map((s, i) => (
              <React.Fragment key={s.id}>
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all duration-300 ${
                    step > s.id
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : step === s.id
                      ? 'bg-[var(--indigo)] border-[var(--indigo)] text-white'
                      : 'bg-white border-[oklch(0.85_0.02_270)] text-[oklch(0.6_0.03_270)]'
                  }`}>
                    {step > s.id ? <CheckCircle className="w-4 h-4" /> : s.id}
                  </div>
                  <span className={`text-[9px] font-bold text-center w-14 leading-tight ${step === s.id ? 'text-[var(--indigo)]' : 'text-[oklch(0.6_0.03_270)]'}`}>
                    {s.title}
                  </span>
                </div>
                {i < LIST_STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mb-4 transition-colors duration-300 ${step > s.id ? 'bg-emerald-400' : 'bg-[oklch(0.88_0.01_270)]'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="px-6 py-6">

          {/* Step 1: Choose NFT */}
          {step === 1 && (
            <div>
              <h3 className="font-black mb-1">{LIST_STEPS[0].title}</h3>
              <p className="text-sm text-[oklch(0.55_0.03_270)] mb-5">{LIST_STEPS[0].desc}</p>
              {userNFTs.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-[oklch(0.55_0.03_270)]">You don't have any NFTs to list yet.</p>
                  <p className="text-xs text-[oklch(0.5_0.03_270)] mt-2">Mint or buy an NFT to get started!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {userNFTs.map(nft => {
                    const color = RARITY_COLOR[nft.rarity];
                    const isSelected = selectedNFT?.tokenId === nft.tokenId;
                    return (
                      <button
                        key={nft.tokenId}
                        onClick={() => setSelectedNFT(nft)}
                        className={`relative rounded-xl overflow-hidden border-2 transition-all duration-150 text-left ${
                          isSelected
                            ? 'border-[var(--indigo)] shadow-lg shadow-[oklch(0.38_0.18_270_/_0.2)]'
                            : 'border-[oklch(0.86_0.01_270)] hover:border-[oklch(0.6_0.05_270)]'
                        }`}
                      >
                        <div className="relative aspect-square">
                          <Image src={nft.image} alt={nft.name} fill className="object-cover" sizes="280px" />
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-6 h-6 bg-[var(--indigo)] rounded-full flex items-center justify-center">
                              <CheckCircle className="w-4 h-4 text-white" />
                            </div>
                          )}
                          <div className="absolute top-2 left-2">
                            <span className="tag" style={{ color, backgroundColor: `${color}25`, borderColor: `${color}55` }}>
                              {nft.rarity}
                            </span>
                          </div>
                        </div>
                        <div className="p-2.5">
                          <p className="font-black text-xs">{nft.name}</p>
                          <p className="text-[10px] text-[oklch(0.6_0.03_270)] mt-0.5">Level {nft.level} / 5</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
              <button
                disabled={!selectedNFT || userNFTs.length === 0}
                onClick={() => setStep(2)}
                className="btn-primary w-full mt-6"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Step 2: Set Price */}
          {step === 2 && (
            <div>
              <h3 className="font-black mb-1">{LIST_STEPS[1].title}</h3>
              <p className="text-sm text-[oklch(0.55_0.03_270)] mb-5">{LIST_STEPS[1].desc}</p>

              {/* Selected NFT preview */}
              {selectedNFT && (
                <div className="inset-panel flex items-center gap-4 mb-6">
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                    <Image src={selectedNFT.image} alt="" fill className="object-cover" sizes="56px" />
                  </div>
                  <div>
                    <p className="font-black text-sm">{selectedNFT.name}</p>
                    <p className="text-xs text-[oklch(0.55_0.03_270)] capitalize mt-0.5">
                      {selectedNFT.rarity} · Level {selectedNFT.level}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-4">
                <div>
                  <label className="stat-label block mb-1.5">Listing Price (ETH)</label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="number"
                        placeholder="0.00"
                        value={price}
                        onChange={e => setPrice(e.target.value)}
                        min="0"
                        step="0.001"
                        className="w-full pl-4 pr-16 py-3 font-black text-lg border-2 border-[oklch(0.86_0.01_270)] rounded-xl focus:outline-none focus:border-[var(--indigo)] transition-colors"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-black text-[oklch(0.5_0.03_270)]">ETH</span>
                    </div>
                  </div>
                  {price && (
                    <p className="text-xs text-[oklch(0.55_0.03_270)] mt-1.5">
                      You receive: <span className="font-black text-emerald-600">{(parseFloat(price) * 0.975).toFixed(4)} ETH</span>
                      <span className="text-[oklch(0.6_0.03_270)]"> (after 2.5% fee)</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="stat-label block mb-1.5">Listing Duration</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { v: '1', l: '1 Day' },
                      { v: '3', l: '3 Days' },
                      { v: '7', l: '1 Week' },
                      { v: '30', l: '1 Month' },
                    ].map(d => (
                      <button
                        key={d.v}
                        onClick={() => setDuration(d.v)}
                        className={`py-2.5 rounded-xl text-xs font-black border-2 transition-all ${
                          duration === d.v
                            ? 'bg-[var(--indigo)] border-[var(--indigo)] text-white'
                            : 'border-[oklch(0.86_0.01_270)] text-[oklch(0.4_0.03_270)] hover:border-[var(--indigo)]'
                        }`}
                      >
                        {d.l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price comparison */}
                <div className="inset-panel">
                  <p className="text-xs font-black mb-2 text-[oklch(0.4_0.03_270)]">Market Comparison</p>
                  <div className="flex justify-between text-xs">
                    <span className="text-[oklch(0.6_0.03_270)]">Collection floor</span>
                    <span className="font-black">0.35 ETH</span>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-[oklch(0.6_0.03_270)]">Last sale</span>
                    <span className="font-black">0.41 ETH</span>
                  </div>
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-[oklch(0.6_0.03_270)]">24h avg</span>
                    <span className="font-black">0.38 ETH</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setStep(1)} className="btn-outline flex-1">Back</button>
                <button
                  disabled={!price || parseFloat(price) <= 0}
                  onClick={() => setStep(3)}
                  className="btn-primary flex-1"
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Approve contract */}
          {step === 3 && (
            <div>
              <h3 className="font-black mb-1">{LIST_STEPS[2].title}</h3>
              <p className="text-sm text-[oklch(0.55_0.03_270)] mb-6">{LIST_STEPS[2].desc}</p>

              <div className="inset-panel mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Zap className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-black text-sm mb-1">One-time approval required</p>
                    <p className="text-xs text-[oklch(0.55_0.03_270)] leading-relaxed">
                      This is a standard ERC-721 approval that allows the NFTerra Marketplace contract to transfer your NFT when it sells. This is a one-time action per collection.
                    </p>
                  </div>
                </div>
              </div>

              <div className="inset-panel mb-6 flex flex-col gap-2">
                {[
                  { label: 'Contract', value: '0xNFTerra...Market' },
                  { label: 'Permission', value: 'Transfer on sale only' },
                  { label: 'Revocable', value: 'Yes, at any time' },
                  { label: 'Gas estimate', value: '~0.002 ETH' },
                ].map(r => (
                  <div key={r.label} className="flex justify-between text-xs">
                    <span className="text-[oklch(0.55_0.03_270)]">{r.label}</span>
                    <span className="font-black font-mono">{r.value}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="btn-outline flex-1">Back</button>
                <button
                  onClick={handleApprove}
                  disabled={approving}
                  className="btn-amber flex-1"
                >
                  {approving
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Approving…</>
                    : <><CheckCircle className="w-4 h-4" /> Approve Contract</>}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Sign & list */}
          {step === 4 && (
            <div>
              <h3 className="font-black mb-1">{LIST_STEPS[3].title}</h3>
              <p className="text-sm text-[oklch(0.55_0.03_270)] mb-6">{LIST_STEPS[3].desc}</p>

              {/* Summary */}
              <div className="panel mb-6">
                <p className="stat-label mb-3">Listing Summary</p>
                {selectedNFT && (
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                      <Image src={selectedNFT.image} alt="" fill className="object-cover" sizes="64px" />
                    </div>
                    <div>
                      <p className="font-black">{selectedNFT.name}</p>
                      <p className="text-xs text-[oklch(0.55_0.03_270)] capitalize mt-0.5">
                        {selectedNFT.rarity} · Level {selectedNFT.level}
                      </p>
                    </div>
                  </div>
                )}
                <div className="divide-y divide-[oklch(0.92_0.01_270)]">
                  {[
                    { label: 'Listing price', value: `${price} ETH` },
                    { label: 'Marketplace fee (2.5%)', value: `${(parseFloat(price) * 0.025).toFixed(4)} ETH` },
                    { label: 'You receive', value: `${(parseFloat(price) * 0.975).toFixed(4)} ETH`, highlight: true },
                    { label: 'Duration', value: `${duration} day${parseInt(duration) > 1 ? 's' : ''}` },
                  ].map(r => (
                    <div key={r.label} className="flex justify-between py-2 text-sm">
                      <span className="text-[oklch(0.55_0.03_270)]">{r.label}</span>
                      <span className={`font-black ${r.highlight ? 'text-emerald-600' : ''}`}>{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(3)} className="btn-outline flex-1">Back</button>
                <button
                  onClick={handleList}
                  disabled={listing}
                  className="btn-primary flex-1"
                >
                  {listing
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Listing…</>
                    : <><Tag className="w-4 h-4" /> Confirm & List</>}
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Success */}
          {step === 5 && (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="font-black text-xl mb-2">Listed Successfully!</h3>
              <p className="text-sm text-[oklch(0.55_0.03_270)] mb-2">
                <span className="font-black text-[oklch(0.2_0.03_270)]">{selectedNFT?.name}</span> is now live on the marketplace for{' '}
                <span className="font-black text-[var(--indigo)]">{price} ETH</span>.
              </p>
              <p className="text-xs text-[oklch(0.6_0.03_270)] mb-8">
                Buyers can now discover and purchase your NFT. You will receive the proceeds automatically when it sells.
              </p>
              {selectedNFT && (
                <div className="relative w-28 h-28 rounded-2xl overflow-hidden mx-auto mb-8 border-2 border-[oklch(0.86_0.01_270)]">
                  <Image src={selectedNFT.image} alt="" fill className="object-cover" sizes="112px" />
                </div>
              )}
              <div className="flex gap-3 justify-center">
                <button onClick={onClose} className="btn-outline px-8">Close</button>
                <button onClick={onClose} className="btn-primary px-8">
                  <ShoppingBag className="w-4 h-4" /> View Marketplace
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
