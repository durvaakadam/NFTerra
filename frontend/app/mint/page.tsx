'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useWallet } from '@/lib/context/WalletContext';
import { useContract } from '@/hooks/use-contract';
import { useNFTStore } from '@/lib/context/NFTStoreContext';
import { useTxHistory } from '@/lib/context/TxHistoryContext';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { getRarity } from '@/lib/web3-utils';
import { generateMockNFT } from '@/lib/mock-data';
import {
  Zap, CheckCircle2, XCircle, Loader2, Info, ArrowRight,
  Layers, Palette, FileText, Shield, Eye, ChevronRight, AlertTriangle, Sparkles
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// ── Step config ───────────────────────────────────────────────────────────────

const MINT_STEPS = [
  { id: 1, label: 'Collection',  icon: Layers,   desc: 'Choose or create collection' },
  { id: 2, label: 'Artwork',     icon: Palette,  desc: 'Upload & configure artwork' },
  { id: 3, label: 'Metadata',    icon: FileText, desc: 'Name, traits & description' },
  { id: 4, label: 'Settings',    icon: Shield,   desc: 'Royalties, rights & supply' },
  { id: 5, label: 'Review',      icon: Eye,      desc: 'Confirm & sign transaction' },
];

const CATEGORIES = ['PFP', 'Art', 'Gaming', 'Music', 'Sports', 'Anime', 'Cyberpunk', 'Fantasy', 'Collectible', 'Other'];

const TRAIT_TYPES = ['Background', 'Body', 'Eyes', 'Mouth', 'Headwear', 'Clothing', 'Accessory', 'Special'];

const RARITY_WEIGHTS: Record<string, string> = {
  common:    'Common (70%)',
  rare:      'Rare (25%)',
  legendary: 'Legendary (5%)',
};

export default function MintPage() {
  const { connected, connectWallet, address } = useWallet();
  const { mint, minting, mintError } = useContract();
  const { addNewNFT } = useNFTStore();
  const { addTransaction, updateTransaction } = useTxHistory();

  // Stage definitions
  const stages = ['Rookie', 'Explorer', 'Warrior', 'Champion', 'Legend'];

  // Step state
  const [step, setStep] = useState(1);
  const [txStatus, setTxStatus] = useState<'idle' | 'approving' | 'pending' | 'success' | 'error'>('idle');
  const [newTokenId, setNewTokenId] = useState<number | null>(null);

  // Step 1 — Collection
  const [collection, setCollection] = useState<'new' | 'existing'>('new');
  const [collectionName, setCollectionName] = useState('');
  const [category, setCategory] = useState('');

  // Step 2 — Artwork
  const [artworkPreview, setArtworkPreview] = useState<string | null>(null);
  const [artworkStyle, setArtworkStyle] = useState<'upload' | 'generate'>('upload');
  const [selectedStyle, setSelectedStyle] = useState('');

  // Step 3 — Metadata
  const [nftName, setNftName] = useState('');
  const [description, setDescription] = useState('');
  const [traits, setTraits] = useState<{ type: string; value: string }[]>([
    { type: 'Background', value: '' },
    { type: 'Body', value: '' },
  ]);
  const [externalUrl, setExternalUrl] = useState('');

  // Step 4 — Settings
  const [royalty, setRoyalty] = useState('5');
  const [supply, setSupply] = useState('1');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [transferable, setTransferable] = useState(true);
  const [license, setLicense] = useState('CC0');

  // Preview rarity (randomised once)
  const rarity = useMemo(() => getRarity(Math.floor(Math.random() * 10000)), []);

  const previewImages: Record<string, string> = {
    'Anime':     'https://via.placeholder.com/400?text=Anime',
    'Cyberpunk': 'https://via.placeholder.com/400?text=Cyberpunk',
    'Fantasy':   'https://via.placeholder.com/400?text=Fantasy',
    'Pixel':     'https://via.placeholder.com/400?text=Pixel',
    'Abstract':  'https://via.placeholder.com/400?text=Abstract',
  };

  const activePreviewSrc = artworkPreview ?? (selectedStyle ? previewImages[selectedStyle] : null);

  // ── Validation per step ────────────────────────────────────────────────────

  const stepValid = useMemo(() => {
    switch (step) {
      case 1: return collection === 'existing' || (collectionName.trim().length >= 2 && category !== '');
      case 2: return artworkPreview !== null || selectedStyle !== '';
      case 3: return nftName.trim().length >= 2 && description.trim().length >= 10;
      case 4: return parseInt(royalty) <= 20 && parseInt(supply) >= 1;
      case 5: return true;
      default: return false;
    }
  }, [step, collection, collectionName, category, artworkPreview, selectedStyle, nftName, description, royalty, supply]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Convert to base64 data URL instead of blob URL (persists across page navigation)
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      setArtworkPreview(base64Url);
      setSelectedStyle('');
    };
    reader.readAsDataURL(file);
  }, []);

  const addTrait = () => setTraits(t => [...t, { type: TRAIT_TYPES[t.length % TRAIT_TYPES.length], value: '' }]);
  const removeTrait = (i: number) => setTraits(t => t.filter((_, idx) => idx !== i));
  const updateTrait = (i: number, key: 'type' | 'value', val: string) =>
    setTraits(t => t.map((tr, idx) => idx === i ? { ...tr, [key]: val } : tr));

  const handleMint = async () => {
    if (!nftName.trim() || !address) return;
    setTxStatus('approving');
    await new Promise(r => setTimeout(r, 1500));
    setTxStatus('pending');
    
    // Generate a mock hash for the pending transaction
    const mockHash = '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    
    // Create pending transaction record with placeholder tokenId
    const txId = addTransaction({
      action: 'Minted',
      tokenId: 0, // Will be updated after blockchain confirmation
      tokenName: nftName,
      timestamp: new Date().toISOString(),
      status: 'pending',
      hash: mockHash,
    });
    
    try {
      // Call real mint function from contract
      const result = await mint(nftName);
      
      if (!result) {
        throw new Error('Failed to mint NFT');
      }
      
      // Use real tokenId from blockchain
      const realTokenId = result.tokenId;
      setNewTokenId(realTokenId);
      
      // Create and store the new NFT with real blockchain data
      const newNFT = generateMockNFT(realTokenId, address);
      newNFT.name = nftName;
      newNFT.image = activePreviewSrc || '/nft-1.jpg';
      newNFT.metadata = {
        description: description || `A ${rarity} ${stages[newNFT.level - 1]} NFT in the NFTerra ecosystem.`,
        attributes: traits.filter(t => t.value).map(t => ({ trait_type: t.type, value: t.value }))
      };
      
      // Add to NFT store for persistence
      addNewNFT(newNFT);
      
      // Update transaction with real blockchain data
      updateTransaction(txId, {
        status: 'success',
        tokenId: realTokenId,
        tokenName: newNFT.name,
        hash: result.txHash,
      });
      
      setTxStatus('success');
    } catch (error) {
      console.error('Mint error:', error);
      updateTransaction(txId, { status: 'failed' });
      setTxStatus('error');
    }
  };

  const handleReset = () => {
    setTxStatus('idle');
    setStep(1);
    setNftName('');
    setNewTokenId(null);
    setCollection('new');
    setCollectionName('');
    setCategory('');
    setArtworkPreview(null);
    setArtworkStyle('upload');
    setSelectedStyle('');
    setDescription('');
    setTraits([{ type: 'Background', value: '' }, { type: 'Body', value: '' }]);
    setExternalUrl('');
    setRoyalty('5');
    setSupply('1');
    setVisibility('public');
    setTransferable(true);
    setLicense('CC0');
  };

  // ── RARITY style helpers ──────────────────────────────────────────────────

  const RARITY_STYLE: Record<string, { tag: string; bg: string }> = {
    common:    { tag: 'tag-indigo',  bg: 'bg-[oklch(0.94_0.05_270)]' },
    rare:      { tag: 'tag-teal',    bg: 'bg-[oklch(0.94_0.05_195)]' },
    legendary: { tag: 'tag-amber',   bg: 'bg-[oklch(0.96_0.06_75)]' },
  };
  const rs = RARITY_STYLE[rarity];

  // ── Tx feedback screens ───────────────────────────────────────────────────

  if (txStatus !== 'idle') {
    return (
      <div className="min-h-screen bg-[var(--background)] flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-20">
          <div className="max-w-lg w-full">
            {txStatus === 'approving' && (
              <div className="panel text-center py-16" style={{ boxShadow: '6px 6px 0 var(--indigo)' }}>
                <div className="w-16 h-16 rounded-full bg-[oklch(0.92_0.05_270)] flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-8 h-8 text-[var(--indigo)]" />
                </div>
                <h2 className="font-black text-2xl mb-2">Requesting Approval</h2>
                <p className="text-[oklch(0.5_0.03_270)] text-sm mb-6">
                  Confirm the contract approval in MetaMask. This one-time permission lets the smart contract manage your NFT on your behalf.
                </p>
                <div className="panel-flat text-left text-xs space-y-2 mb-6">
                  <div className="flex justify-between"><span className="text-[oklch(0.5_0.03_270)]">Contract</span><span className="font-mono font-bold">0xNFTerra...0001</span></div>
                  <div className="flex justify-between"><span className="text-[oklch(0.5_0.03_270)]">Permission</span><span className="font-bold">setApprovalForAll</span></div>
                  <div className="flex justify-between"><span className="text-[oklch(0.5_0.03_270)]">Gas estimate</span><span className="font-bold">~0.002 ETH</span></div>
                </div>
                <Loader2 className="w-8 h-8 text-[var(--indigo)] mx-auto animate-spin" />
              </div>
            )}

            {txStatus === 'pending' && (
              <div className="panel text-center py-16" style={{ boxShadow: '6px 6px 0 var(--indigo)' }}>
                <Loader2 className="w-16 h-16 text-[var(--indigo)] mx-auto mb-6 animate-spin" />
                <h2 className="font-black text-2xl mb-2">Minting On-Chain</h2>
                <p className="text-[oklch(0.5_0.03_270)] text-sm mb-6">Your NFT is being written to the Ethereum blockchain. This usually takes 15–30 seconds.</p>
                <div className="space-y-3">
                  {['Approval confirmed', 'Transaction broadcast', 'Awaiting confirmation...'].map((s, i) => (
                    <div key={s} className="flex items-center gap-3 text-sm">
                      {i < 2
                        ? <CheckCircle2 className="w-4 h-4 text-[var(--teal)] flex-shrink-0" />
                        : <Loader2 className="w-4 h-4 text-[var(--indigo)] animate-spin flex-shrink-0" />
                      }
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {txStatus === 'success' && (
              <div className="panel text-center py-12" style={{ boxShadow: '6px 6px 0 var(--teal)' }}>
                <CheckCircle2 className="w-16 h-16 text-[var(--teal)] mx-auto mb-4" />
                <h2 className="font-black text-3xl mb-2">Minted!</h2>
                <p className="text-[oklch(0.5_0.03_270)] text-sm mb-6">
                  <strong>{nftName}</strong> has been minted as Token #{newTokenId}
                </p>
                <div className="relative w-40 h-40 rounded-xl overflow-hidden mx-auto mb-6 border-4 border-[var(--teal)]">
                  {activePreviewSrc
                    ? <Image src={activePreviewSrc} alt={nftName} fill className="object-cover" />
                    : <div className={`w-full h-full ${rs.bg} flex items-center justify-center`}><Sparkles className="w-12 h-12 text-[var(--indigo)]" /></div>
                  }
                </div>
                <div className="panel-flat text-xs space-y-1 mb-6 text-left">
                  <div className="flex justify-between"><span className="text-[oklch(0.5_0.03_270)]">Token ID</span><span className="font-mono font-bold">#{newTokenId}</span></div>
                  <div className="flex justify-between"><span className="text-[oklch(0.5_0.03_270)]">Rarity</span><span className={`tag ${rs.tag}`}>{rarity}</span></div>
                  <div className="flex justify-between"><span className="text-[oklch(0.5_0.03_270)]">Collection</span><span className="font-bold">{collectionName || 'Existing'}</span></div>
                </div>
                <div className="flex gap-3 justify-center">
                  <Link href="/dashboard"><button className="btn-primary">View in Dashboard <ArrowRight className="w-4 h-4" /></button></Link>
                  <button onClick={handleReset} className="btn-outline">Mint Another</button>
                </div>
              </div>
            )}

            {txStatus === 'error' && (
              <div className="panel text-center py-16" style={{ boxShadow: '6px 6px 0 var(--rose)' }}>
                <XCircle className="w-16 h-16 text-[var(--rose)] mx-auto mb-4" />
                <h2 className="font-black text-2xl mb-2">Transaction Failed</h2>
                <p className="text-[oklch(0.5_0.03_270)] text-sm mb-6">{mintError || 'The transaction was rejected or ran out of gas. Your wallet has not been charged.'}</p>
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
          <p className="section-eyebrow mb-2">Create</p>
          <h1 className="section-title">Mint a New NFT</h1>
          <p className="text-[oklch(0.5_0.03_270)] mt-2 text-sm max-w-xl">
            Deploy a fully on-chain ERC-721 token. Set custom metadata, traits, royalties and more — all in one flow.
          </p>
        </div>

        {/* Not connected */}
        {!connected && (
          <div className="panel border-2 border-dashed border-[oklch(0.78_0.1_270)] text-center py-16 mb-8">
            <p className="section-eyebrow mb-4">Wallet Required</p>
            <h2 className="font-black text-2xl mb-3">Connect to mint NFTs</h2>
            <p className="text-[oklch(0.5_0.03_270)] mb-6 text-sm">You need MetaMask connected to sign the minting transaction.</p>
            <button onClick={connectWallet} className="btn-primary">Connect Wallet</button>
          </div>
        )}

        {connected && (
          <>
            {/* Step progress bar */}
            <div className="mb-10">
              <div className="flex items-center gap-0">
                {MINT_STEPS.map((s, idx) => {
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
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-wide whitespace-nowrap hidden sm:block ${
                          isActive ? 'text-[oklch(0.38_0.18_270)]' : isComplete ? 'text-[oklch(0.38_0.18_270)]' : 'text-[oklch(0.6_0.03_270)]'
                        }`}>{s.label}</span>
                      </button>
                      {idx < MINT_STEPS.length - 1 && (
                        <div className={`flex-1 h-0.5 transition-colors duration-300 ${step > s.id ? 'bg-[oklch(0.38_0.18_270)]' : 'bg-[oklch(0.86_0.01_270)]'}`} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
              <p className="text-xs text-[oklch(0.5_0.03_270)] mt-3">{MINT_STEPS[step - 1].desc}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* ── Left: step content ─────────────────────────────────────────── */}
              <div className="lg:col-span-2 space-y-6">

                {/* STEP 1 — Collection */}
                {step === 1 && (
                  <div className="panel animate-slide-in-up">
                    <h2 className="font-black text-xl mb-1">Collection</h2>
                    <p className="text-sm text-[oklch(0.5_0.03_270)] mb-6">Group your NFT into a collection. Collections share a contract address and stats.</p>

                    <div className="flex gap-3 mb-6">
                      {(['new', 'existing'] as const).map(opt => (
                        <button
                          key={opt}
                          onClick={() => setCollection(opt)}
                          className={`flex-1 px-4 py-3 rounded-lg font-bold text-sm transition-all ${
                            collection === opt
                              ? 'bg-[oklch(0.38_0.18_270)] text-white'
                              : 'bg-[oklch(0.975_0.005_75)] text-[oklch(0.6_0.03_270)] border-2 border-[oklch(0.86_0.01_270)]'
                          }`}
                        >
                          {opt === 'new' ? '+ New Collection' : 'Existing Collection'}
                        </button>
                      ))}
                    </div>

                    {collection === 'new' && (
                      <div className="space-y-4">
                        <div>
                          <label className="stat-label block mb-2">Collection Name *</label>
                          <input
                            value={collectionName}
                            onChange={e => setCollectionName(e.target.value)}
                            placeholder="e.g. Shadow Collective"
                            className="w-full px-4 py-3 rounded-lg border-2 border-[oklch(0.86_0.01_270)] bg-[oklch(0.975_0.005_75)] font-semibold text-sm focus:outline-none focus:border-[var(--indigo)] transition-colors"
                          />
                        </div>
                        <div>
                          <label className="stat-label block mb-2">Category *</label>
                          <select
                            value={category}
                            onChange={e => setCategory(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border-2 border-[oklch(0.86_0.01_270)] bg-[oklch(0.975_0.005_75)] font-semibold text-sm focus:outline-none focus:border-[var(--indigo)] transition-colors"
                          >
                            <option value="">Select a category</option>
                            {CATEGORIES.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="stat-label block mb-2">Collection Symbol</label>
                          <input
                            placeholder="e.g. SHDC"
                            maxLength={6}
                            className="w-full px-4 py-3 rounded-lg border-2 border-[oklch(0.86_0.01_270)] bg-[oklch(0.975_0.005_75)] font-semibold text-sm focus:outline-none focus:border-[var(--indigo)] transition-colors"
                          />
                        </div>
                      </div>
                    )}

                    {collection === 'existing' && (
                      <div className="panel-flat text-center py-8">
                        <p className="text-[oklch(0.5_0.03_270)] text-sm">Your wallet collections will appear here.</p>
                        {connected && <p className="text-xs mt-3 font-mono text-[oklch(0.6_0.03_270)]">{address}</p>}
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 2 — Artwork */}
                {step === 2 && (
                  <div className="panel animate-slide-in-up">
                    <h2 className="font-black text-xl mb-1">Artwork</h2>
                    <p className="text-sm text-[oklch(0.5_0.03_270)] mb-6">Upload your original file or choose a style preset to generate artwork.</p>

                    <div className="flex gap-3 mb-6">
                      {(['upload', 'generate'] as const).map(opt => (
                        <button
                          key={opt}
                          onClick={() => setArtworkStyle(opt)}
                          className={`flex-1 px-4 py-3 rounded-lg font-bold text-sm transition-all ${
                            artworkStyle === opt
                              ? 'bg-[oklch(0.38_0.18_270)] text-white'
                              : 'bg-[oklch(0.975_0.005_75)] text-[oklch(0.6_0.03_270)] border-2 border-[oklch(0.86_0.01_270)]'
                          }`}
                        >
                          {opt === 'upload' ? 'Upload File' : 'Generate'}
                        </button>
                      ))}
                    </div>

                    {artworkStyle === 'upload' && (
                      <label className="block cursor-pointer">
                        <div className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors ${
                          artworkPreview ? 'border-[var(--teal)] bg-[oklch(0.96_0.03_195)]' : 'border-[oklch(0.78_0.05_270)] hover:border-[var(--indigo)] bg-[oklch(0.975_0.005_75)]'
                        }`}>
                          <Palette className="w-12 h-12 mx-auto mb-3 text-[oklch(0.6_0.03_270)]" />
                          <p className="font-bold mb-1">Drag & drop or click to upload</p>
                          <p className="text-xs text-[oklch(0.5_0.03_270)]">{artworkPreview ? '✓ File selected' : 'PNG, JPG, GIF, SVG, MP4, WEBM'}</p>
                        </div>
                        <input type="file" accept="image/*,video/*" className="hidden" onChange={handleFileUpload} />
                      </label>
                    )}

                    {artworkStyle === 'generate' && (
                      <div className="space-y-4">
                        <p className="text-sm text-[oklch(0.5_0.03_270)]">Choose an art style and we will generate unique artwork at mint time using on-chain randomness.</p>
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                          {Object.keys(previewImages).map(style => (
                            <button
                              key={style}
                              onClick={() => {
                                setSelectedStyle(style);
                                setArtworkPreview(null);
                              }}
                              className={`p-3 rounded-lg font-bold text-sm transition-all border-2 ${
                                selectedStyle === style
                                  ? 'bg-[oklch(0.38_0.18_270)] text-white border-[oklch(0.38_0.18_270)]'
                                  : 'bg-[oklch(0.975_0.005_75)] text-[oklch(0.6_0.03_270)] border-[oklch(0.86_0.01_270)]'
                              }`}
                            >
                              {style}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* File specs */}
                    <div className="mt-5 panel-flat text-xs text-[oklch(0.5_0.03_270)] grid grid-cols-2 gap-2">
                      {[
                        ['Recommended', '1000×1000px or larger'],
                        ['Max file size', '100 MB'],
                        ['Formats', 'PNG, JPG, GIF, SVG, MP4, WEBM'],
                        ['Stored on', 'IPFS (decentralised)'],
                      ].map(([k, v]) => (
                        <div key={k}><span className="font-bold text-foreground">{k}</span><br />{v}</div>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 3 — Metadata */}
                {step === 3 && (
                  <div className="panel animate-slide-in-up space-y-5">
                    <div>
                      <h2 className="font-black text-xl mb-1">Metadata</h2>
                      <p className="text-sm text-[oklch(0.5_0.03_270)]">All metadata is stored on IPFS and referenced in the on-chain token URI.</p>
                    </div>

                    <div>
                      <label className="stat-label block mb-2">NFT Name *</label>
                      <input
                        value={nftName}
                        onChange={e => setNftName(e.target.value)}
                        placeholder="e.g. Shadow Knight #001"
                        maxLength={50}
                        className="w-full px-4 py-3 rounded-lg border-2 border-[oklch(0.86_0.01_270)] bg-[oklch(0.975_0.005_75)] font-semibold text-sm focus:outline-none focus:border-[var(--indigo)] transition-colors"
                      />
                      <p className="text-xs text-[oklch(0.6_0.03_270)] mt-1">{nftName.length}/50</p>
                    </div>

                    <div>
                      <label className="stat-label block mb-2">Description *</label>
                      <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Describe your NFT. What makes it unique? Any unlockable content or utility?"
                        rows={4}
                        maxLength={500}
                        className="w-full px-4 py-3 rounded-lg border-2 border-[oklch(0.86_0.01_270)] bg-[oklch(0.975_0.005_75)] font-semibold text-sm focus:outline-none focus:border-[var(--indigo)] transition-colors resize-none"
                      />
                      <p className="text-xs text-[oklch(0.6_0.03_270)] mt-1">{description.length}/500</p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="stat-label">Traits (optional)</label>
                        <button onClick={addTrait} className="text-xs font-bold text-[var(--indigo)] hover:underline">+ Add Trait</button>
                      </div>
                      <div className="space-y-2">
                        {traits.map((trait, i) => (
                          <div key={i} className="flex gap-2">
                            <select
                              value={trait.type}
                              onChange={e => updateTrait(i, 'type', e.target.value)}
                              className="flex-1 px-3 py-2 rounded-lg border-2 border-[oklch(0.86_0.01_270)] bg-[oklch(0.975_0.005_75)] text-sm focus:outline-none focus:border-[var(--indigo)]"
                            >
                              {TRAIT_TYPES.map(t => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>
                            <input
                              type="text"
                              value={trait.value}
                              onChange={e => updateTrait(i, 'value', e.target.value)}
                              placeholder="Value"
                              className="flex-1 px-3 py-2 rounded-lg border-2 border-[oklch(0.86_0.01_270)] bg-[oklch(0.975_0.005_75)] text-sm focus:outline-none focus:border-[var(--indigo)]"
                            />
                            <button onClick={() => removeTrait(i)} className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg text-sm font-bold">×</button>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-[oklch(0.6_0.03_270)] mt-2">Traits appear on your NFT detail page and are searchable in the marketplace.</p>
                    </div>

                    <div>
                      <label className="stat-label block mb-2">External URL (optional)</label>
                      <input
                        value={externalUrl}
                        onChange={e => setExternalUrl(e.target.value)}
                        placeholder="https://yourproject.com/nft/001"
                        className="w-full px-4 py-3 rounded-lg border-2 border-[oklch(0.86_0.01_270)] bg-[oklch(0.975_0.005_75)] font-semibold text-sm focus:outline-none focus:border-[var(--indigo)] transition-colors"
                      />
                    </div>
                  </div>
                )}

                {/* STEP 4 — Settings */}
                {step === 4 && (
                  <div className="panel animate-slide-in-up space-y-6">
                    <div>
                      <h2 className="font-black text-xl mb-1">Settings</h2>
                      <p className="text-sm text-[oklch(0.5_0.03_270)]">Configure royalties, supply, visibility and licensing for your NFT.</p>
                    </div>

                    {/* Royalties */}
                    <div>
                      <label className="stat-label block mb-1">Creator Royalty</label>
                      <p className="text-xs text-[oklch(0.5_0.03_270)] mb-3">You earn this % on every secondary sale, automatically enforced by the contract.</p>
                      <div className="flex items-center gap-4">
                        <input
                          type="range" min="0" max="20" step="0.5"
                          value={royalty}
                          onChange={e => setRoyalty(e.target.value)}
                          className="flex-1 accent-[oklch(0.38_0.18_270)]"
                        />
                        <span className="font-black text-lg w-12 text-right">{royalty}%</span>
                      </div>
                      <div className="flex justify-between text-xs text-[oklch(0.6_0.03_270)] mt-1">
                        <span>0%</span>
                        <span>20%</span>
                      </div>
                    </div>

                    {/* Supply */}
                    <div>
                      <label className="stat-label block mb-2">Supply (Editions)</label>
                      <div className="flex gap-3">
                        <button onClick={() => setSupply('1')} className={`flex-1 px-4 py-2 rounded-lg font-bold text-sm ${supply === '1' ? 'bg-[oklch(0.38_0.18_270)] text-white' : 'bg-[oklch(0.975_0.005_75)] border-2 border-[oklch(0.86_0.01_270)]'}`}>1/1 Unique</button>
                        <button onClick={() => setSupply('10')} className={`flex-1 px-4 py-2 rounded-lg font-bold text-sm ${supply === '10' ? 'bg-[oklch(0.38_0.18_270)] text-white' : 'bg-[oklch(0.975_0.005_75)] border-2 border-[oklch(0.86_0.01_270)]'}`}>10 editions</button>
                        <input
                          type="number" min="1" max="10000"
                          value={supply}
                          onChange={e => setSupply(e.target.value)}
                          className="w-24 px-3 py-2 rounded-lg border-2 border-[oklch(0.86_0.01_270)] bg-[oklch(0.975_0.005_75)] font-bold text-sm text-center focus:outline-none focus:border-[var(--indigo)]"
                        />
                      </div>
                      <p className="text-xs text-[oklch(0.5_0.03_270)] mt-2">Supply of 1 = unique 1/1. Higher = editions. Cannot be changed after minting.</p>
                    </div>

                    {/* Visibility */}
                    <div>
                      <label className="stat-label block mb-3">Visibility</label>
                      <div className="flex gap-3">
                        <button onClick={() => setVisibility('public')} className={`flex-1 px-4 py-3 rounded-lg font-bold text-sm transition-all ${visibility === 'public' ? 'bg-[oklch(0.38_0.18_270)] text-white' : 'bg-[oklch(0.975_0.005_75)] text-[oklch(0.6_0.03_270)] border-2 border-[oklch(0.86_0.01_270)]'}`}>Public</button>
                        <button onClick={() => setVisibility('private')} className={`flex-1 px-4 py-3 rounded-lg font-bold text-sm transition-all ${visibility === 'private' ? 'bg-[oklch(0.38_0.18_270)] text-white' : 'bg-[oklch(0.975_0.005_75)] text-[oklch(0.6_0.03_270)] border-2 border-[oklch(0.86_0.01_270)]'}`}>Private</button>
                      </div>
                    </div>

                    {/* License */}
                    <div>
                      <label className="stat-label block mb-2">License</label>
                      <select
                        value={license}
                        onChange={e => setLicense(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border-2 border-[oklch(0.86_0.01_270)] bg-[oklch(0.975_0.005_75)] font-semibold text-sm focus:outline-none focus:border-[var(--indigo)]"
                      >
                        <option>CC0 (Public Domain)</option>
                        <option>CC-BY (Attribution)</option>
                        <option>CC-BY-SA (Share Alike)</option>
                        <option>Proprietary</option>
                      </select>
                    </div>

                    {/* Transferable toggle */}
                    <div className="flex items-start gap-4 panel-flat">
                      <button
                        onClick={() => setTransferable(t => !t)}
                        className={`w-12 h-6 rounded-full border-2 transition-all flex-shrink-0 mt-0.5 ${
                          transferable ? 'bg-[oklch(0.38_0.18_270)] border-[oklch(0.38_0.18_270)]' : 'bg-white border-[oklch(0.78_0.05_270)]'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white mx-auto transition-transform ${transferable ? 'translate-x-3' : '-translate-x-3'}`} />
                      </button>
                      <div>
                        <p className="font-bold text-sm">Transferable</p>
                        <p className="text-xs text-[oklch(0.5_0.03_270)]">{transferable ? 'Can be sold or traded' : 'Soulbound — cannot transfer'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 5 — Review */}
                {step === 5 && (
                  <div className="panel animate-slide-in-up space-y-5">
                    <div>
                      <h2 className="font-black text-xl mb-1">Review & Mint</h2>
                      <p className="text-sm text-[oklch(0.5_0.03_270)]">Review everything before signing. This is permanent and cannot be undone.</p>
                    </div>

                    {/* Summary grid */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {[
                        { label: 'NFT Name',     value: nftName || '—' },
                        { label: 'Collection',   value: collectionName || 'Existing' },
                        { label: 'Category',     value: category || '—' },
                        { label: 'Supply',       value: supply === '1' ? '1/1 Unique' : `${supply} editions` },
                        { label: 'Royalty',      value: `${royalty}%` },
                        { label: 'Visibility',   value: visibility.charAt(0).toUpperCase() + visibility.slice(1) },
                        { label: 'License',      value: license },
                        { label: 'Transferable', value: transferable ? 'Yes' : 'No (Soulbound)' },
                      ].map(({ label, value }) => (
                        <div key={label} className="panel-flat">
                          <p className="text-xs text-[oklch(0.5_0.03_270)]">{label}</p>
                          <p className="font-bold">{value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Traits preview */}
                    {traits.some(t => t.value) && (
                      <div>
                        <p className="stat-label mb-2">Traits</p>
                        <div className="flex flex-wrap gap-2">
                          {traits.filter(t => t.value).map((t, i) => (
                            <span key={i} className="px-3 py-1 rounded-full bg-[oklch(0.38_0.18_270)] text-white text-xs font-bold">
                              {t.type}: {t.value}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Cost breakdown */}
                    <div className="panel-flat space-y-2">
                      <p className="stat-label mb-3">Cost Breakdown</p>
                      {[
                        { l: 'Base mint fee',         v: '0.04 ETH' },
                        { l: `Platform fee (2.5%)`,   v: '0.001 ETH' },
                        { l: 'IPFS storage',           v: '0.005 ETH' },
                        { l: 'Gas estimate',           v: '~0.004 ETH' },
                      ].map(({ l, v }) => (
                        <div key={l} className="flex justify-between text-sm">
                          <span className="text-[oklch(0.5_0.03_270)]">{l}</span>
                          <span className="font-bold">{v}</span>
                        </div>
                      ))}
                      <div className="border-t-2 border-[oklch(0.86_0.01_270)] pt-2 flex justify-between font-black">
                        <span>Total</span>
                        <span className="text-[var(--indigo)]">~0.05 ETH</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 text-xs text-[oklch(0.55_0.03_270)]">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 text-[var(--amber)] mt-0.5" />
                      <span>Minting is permanent. Metadata and traits are immutable once the transaction is confirmed. Rarity is assigned by VRF at the moment of minting.</span>
                    </div>

                    <button onClick={handleMint} disabled={minting} className="btn-primary w-full py-4 text-base">
                      {minting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                      Mint NFT — ~0.05 ETH
                    </button>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between pt-2">
                  <button
                    onClick={() => setStep(s => Math.max(1, s - 1))}
                    disabled={step === 1}
                    className="btn-outline disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Back
                  </button>
                  {step < 5 && (
                    <button
                      onClick={() => setStep(s => s + 1)}
                      disabled={!stepValid}
                      className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Continue <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* ── Right: live preview ────────────────────────────────────────── */}
              <div className="space-y-4">
                <div className="panel sticky top-24">
                  <p className="stat-label mb-3">Live Preview</p>

                  {/* Artwork */}
                  <div className={`${rs.bg} rounded-xl aspect-square overflow-hidden border-2 border-[oklch(0.86_0.01_270)] relative mb-4`}>
                    {activePreviewSrc ? (
                      <Image src={activePreviewSrc} alt="NFT Preview" fill className="object-cover" loading="eager" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                        <Palette className="w-12 h-12 text-[oklch(0.7_0.05_270)]" />
                        <p className="text-sm text-[oklch(0.5_0.03_270)]">No artwork yet</p>
                      </div>
                    )}
                    {rarity && (
                      <div className="absolute top-2 right-2">
                        <span className={`tag ${rs.tag}`}>{rarity}</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="space-y-1.5 text-xs">
                    {[
                      { k: 'Name',       v: nftName || 'Unnamed NFT' },
                      { k: 'Collection', v: collectionName || '—' },
                      { k: 'Supply',     v: supply === '1' ? '1/1' : `${supply} editions` },
                      { k: 'Royalty',    v: `${royalty}%` },
                      { k: 'Standard',   v: 'ERC-721' },
                      { k: 'Chain',      v: 'Ethereum' },
                    ].map(({ k, v }) => (
                      <div key={k} className="flex justify-between">
                        <span className="text-[oklch(0.6_0.03_270)]">{k}</span>
                        <span className="font-bold">{v}</span>
                      </div>
                    ))}
                  </div>

                  {/* Traits */}
                  {traits.some(t => t.value) && (
                    <div className="mt-4 pt-4 border-t-2 border-[oklch(0.86_0.01_270)]">
                      <p className="stat-label mb-2">Traits</p>
                      <div className="flex flex-wrap gap-1.5">
                        {traits.filter(t => t.value).map((t, i) => (
                          <span key={i} className="px-2 py-1 rounded bg-[oklch(0.92_0.05_270)] text-[10px] font-bold text-[var(--indigo)]">
                            {t.type}: {t.value}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step progress */}
                  <div className="mt-4 pt-4 border-t-2 border-[oklch(0.86_0.01_270)]">
                    <p className="stat-label mb-2">Progress</p>
                    <div className="level-bar-track"><div className="level-bar-fill" style={{ width: `${(step / 5) * 100}%` }} /></div>
                    <p className="text-xs text-[oklch(0.5_0.03_270)] mt-1">Step {step} of 5</p>
                  </div>
                </div>

                {/* FAQ */}
                <div className="panel text-xs space-y-3">
                  <p className="font-black text-sm">FAQs</p>
                  {[
                    ['What is IPFS?', 'A decentralised file system that hosts your artwork permanently — no single company can take it down.'],
                    ['Can I edit metadata?', 'Name and traits are immutable once minted. Description can be updated via a separate contract call.'],
                    ['What is a soulbound token?', 'An NFT that cannot be transferred. Useful for certifications, memberships, or identity tokens.'],
                  ].map(([q, a]) => (
                    <details key={q} className="group">
                      <summary className="font-bold cursor-pointer list-none flex items-center justify-between">
                        <span>{q}</span> <ChevronRight className="w-3 h-3 group-open:rotate-90 transition-transform" />
                      </summary>
                      <p className="text-[oklch(0.5_0.03_270)] mt-1 leading-relaxed">{a}</p>
                    </details>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
