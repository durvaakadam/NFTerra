'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useWallet } from '@/lib/context/WalletContext';
import { useContract } from '@/hooks/use-contract';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { getRarity } from '@/lib/web3-utils';
import { Zap, CheckCircle2, XCircle, Loader2, Info, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function MintPage() {
  const { connected, connectWallet } = useWallet();
  const { mint, minting, mintError } = useContract();
  const [nftName, setNftName] = useState('');
  const [txStatus, setTxStatus] = useState<'pending' | 'success' | 'error' | null>(null);
  const [newTokenId, setNewTokenId] = useState<number | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [rarity, setRarity] = useState('common');

  // Set rarity on client side only to prevent hydration mismatch
  useEffect(() => {
    setRarity(getRarity(Math.floor(Math.random() * 10000)));
  }, []);

  const handleMint = async () => {
    if (!nftName.trim()) return;
    setTxStatus('pending');
    
    try {
      const result = await mint(nftName.trim());
      
      if (result) {
        setNewTokenId(result.tokenId);
        setTxHash(result.txHash);
        setTxStatus('success');
      } else {
        setTxStatus('error');
      }
    } catch {
      setTxStatus('error');
    }
  };

  const handleReset = () => {
    setTxStatus(null);
    setNftName('');
    setNewTokenId(null);
    setTxHash(null);
  };

  const RARITY_TAG: Record<string, string> = {
    common: 'tag-indigo',
    rare: 'tag-teal',
    legendary: 'tag-amber',
  };
  const RARITY_BG: Record<string, string> = {
    common:    'bg-[oklch(0.94_0.05_270)]',
    rare:      'bg-[oklch(0.94_0.05_195)]',
    legendary: 'bg-[oklch(0.96_0.06_75)]',
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      <Navbar />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-12 pb-20 max-w-7xl mx-auto w-full">

        {/* Page header */}
        <div className="mb-10">
          <p className="section-eyebrow mb-2">Create</p>
          <h1 className="section-title">Mint a New NFT</h1>
          <p className="text-[oklch(0.5_0.03_270)] mt-2 max-w-lg text-sm">
            Every NFT begins its life as an Egg at Level 1. Name it, pay 0.05 ETH, and your evolution journey starts immediately.
          </p>
        </div>

        {/* Info strip */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Mint Price',      value: '0.05 ETH' },
            { label: 'Starting Stage',  value: '🥚  Egg — Level 1' },
            { label: 'Your Rarity',     value: rarity.charAt(0).toUpperCase() + rarity.slice(1), tag: rarity },
          ].map(({ label, value, tag }) => (
            <div key={label} className="panel">
              <p className="stat-label mb-2">{label}</p>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg leading-tight">{value}</span>
                {tag && <span className={`tag ${RARITY_TAG[tag]}`}>{tag}</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Not connected */}
        {!connected && (
          <div className="panel border-2 border-dashed border-[oklch(0.78_0.1_270)] text-center py-16">
            <p className="section-eyebrow mb-4">Wallet Required</p>
            <h2 className="font-black text-2xl mb-3">Connect to mint NFTs</h2>
            <p className="text-[oklch(0.5_0.03_270)] mb-6 text-sm">You need MetaMask connected to sign the minting transaction.</p>
            <button onClick={connectWallet} className="btn-primary">Connect Wallet</button>
          </div>
        )}

        {/* Main mint UI */}
        {connected && txStatus === null && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Form */}
            <div className="panel space-y-6">
              <h2 className="font-black text-xl">NFT Details</h2>

              {/* Name input */}
              <div>
                <label className="stat-label block mb-2">NFT Name *</label>
                <input
                  type="text"
                  value={nftName}
                  onChange={(e) => setNftName(e.target.value)}
                  placeholder="e.g. Shadow Serpent, Flame Drake..."
                  maxLength={30}
                  className="w-full px-4 py-3 rounded-lg border-2 border-[oklch(0.86_0.01_270)] bg-[oklch(0.975_0.005_75)] font-semibold text-sm focus:outline-none focus:border-[var(--indigo)] transition-colors"
                />
                <p className="text-xs text-[oklch(0.6_0.03_270)] mt-1">{nftName.length}/30 characters</p>
              </div>

              {/* Cost breakdown */}
              <div className="panel-flat space-y-2">
                <p className="stat-label mb-3">Cost Breakdown</p>
                {[
                  { l: 'Base mint fee',    v: '0.04 ETH' },
                  { l: 'Network gas est.', v: '~0.005 ETH' },
                  { l: 'Platform fee',     v: '0.005 ETH' },
                ].map(({ l, v }) => (
                  <div key={l} className="flex justify-between text-sm">
                    <span className="text-[oklch(0.5_0.03_270)]">{l}</span>
                    <span className="font-bold">{v}</span>
                  </div>
                ))}
                <div className="border-t-2 border-[oklch(0.86_0.01_270)] pt-2 flex justify-between">
                  <span className="font-bold">Total</span>
                  <span className="font-black text-[var(--indigo)]">0.05 ETH</span>
                </div>
              </div>

              {/* Info note */}
              <div className="flex gap-2 text-xs text-[oklch(0.55_0.03_270)]">
                <Info className="w-4 h-4 flex-shrink-0 text-[var(--indigo)] mt-0.5" />
                <span>Rarity is determined at the time of minting using a VRF. You cannot influence it beforehand.</span>
              </div>

              <button
                onClick={handleMint}
                disabled={minting || !nftName.trim()}
                className={`btn-primary w-full py-3 text-base ${
                  !nftName.trim() ? 'opacity-50 cursor-not-allowed hover:transform-none' : ''
                }`}
              >
                {minting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                Mint NFT — 0.05 ETH
              </button>
            </div>

            {/* Live preview */}
            <div className="flex flex-col gap-4">
              <div
                className="panel overflow-hidden"
                style={{ boxShadow: '6px 6px 0 var(--indigo)' }}
              >
                <p className="stat-label mb-3">Live Preview</p>
                <div className={`${RARITY_BG[rarity]} rounded-xl aspect-square flex flex-col items-center justify-center gap-3 border-2 border-[oklch(0.86_0.01_270)]`}>
                  <span className="text-8xl animate-float">🥚</span>
                  <div className="text-center">
                    <p className="font-black text-lg">{nftName || 'Your NFT Name'}</p>
                    <p className="text-sm text-[oklch(0.5_0.03_270)]">Egg — Level 1</p>
                  </div>
                  <span className={`tag ${RARITY_TAG[rarity]}`}>
                    {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                  </span>
                </div>
                <div className="mt-4 pt-4 border-t-2 border-[oklch(0.86_0.01_270)] space-y-2 text-xs">
                  {[
                    { k: 'Token Standard', v: 'ERC-721' },
                    { k: 'Blockchain',     v: 'Ethereum' },
                    { k: 'Evolution Stages', v: '5 (Egg → Immortal)' },
                  ].map(({ k, v }) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-[oklch(0.6_0.03_270)]">{k}</span>
                      <span className="font-bold">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="panel-flat text-sm text-[oklch(0.5_0.03_270)] leading-relaxed">
                <p className="font-bold text-foreground mb-1">What happens after minting?</p>
                Your NFT will appear instantly in your Dashboard. Use the Level Up button to begin its evolution journey from Egg through to Immortal.
              </div>
            </div>
          </div>
        )}

        {/* Transaction feedback */}
        {connected && txStatus !== null && (
          <div className="max-w-md mx-auto">
            <div
              className="panel text-center py-12"
              style={{
                boxShadow: txStatus === 'success'
                  ? '6px 6px 0 var(--teal)'
                  : txStatus === 'pending'
                    ? '6px 6px 0 var(--indigo)'
                    : '6px 6px 0 var(--rose)',
              }}
            >
              {txStatus === 'pending' && (
                <>
                  <Loader2 className="w-14 h-14 text-[var(--indigo)] mx-auto mb-4 animate-spin" />
                  <h2 className="font-black text-2xl mb-2">Minting in Progress</h2>
                  <p className="text-[oklch(0.5_0.03_270)] text-sm">Confirm the transaction in MetaMask and wait for on-chain confirmation...</p>
                </>
              )}
              {txStatus === 'success' && (
                <>
                  <CheckCircle2 className="w-14 h-14 text-[var(--teal)] mx-auto mb-4" />
                  <h2 className="font-black text-2xl mb-2">Mint Successful!</h2>
                  <p className="text-[oklch(0.5_0.03_270)] text-sm mb-4">
                    <strong>{nftName}</strong> has been minted as Token #{newTokenId}. Your Egg is ready to evolve.
                  </p>
                  <Link href="/dashboard">
                    <button className="btn-primary">
                      View in Dashboard <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                </>
              )}
              {txStatus === 'error' && (
                <>
                  <XCircle className="w-14 h-14 text-[var(--rose)] mx-auto mb-4" />
                  <h2 className="font-black text-2xl mb-2">Transaction Failed</h2>
                  <p className="text-[oklch(0.5_0.03_270)] text-sm mb-4">
                    {mintError || 'Something went wrong. Please check your wallet and try again.'}
                  </p>
                  <button onClick={handleReset} className="btn-outline">Try Again</button>
                </>
              )}
            </div>
          </div>
        )}

        {/* FAQ */}
        <div className="mt-16 pt-10 border-t-2 border-[oklch(0.86_0.01_270)]">
          <h2 className="font-black text-xl mb-6">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { q: 'What happens after I mint?', a: 'Your NFT starts as an Egg at Level 1. You can immediately begin leveling it up to unlock new evolution stages.' },
              { q: 'Can I trade my NFTs?', a: 'Yes — all NFTs are ERC-721 tokens, fully tradeable on any compatible marketplace. Level and rarity metadata transfer with it.' },
              { q: 'What is the maximum level?', a: 'Level 5 (Immortal). Each level-up requires a small ETH transaction and produces a permanent on-chain state change.' },
              { q: 'How does rarity work?', a: 'Rarity is assigned at mint using Chainlink VRF. Common (70%), Rare (25%), Legendary (5%). It cannot be altered post-mint.' },
            ].map(({ q, a }) => (
              <div key={q} className="panel">
                <p className="font-black text-sm mb-2">{q}</p>
                <p className="text-sm text-[oklch(0.5_0.03_270)] leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
