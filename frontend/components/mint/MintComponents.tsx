'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LoadingDots } from '@/components/shared/LoadingSpinner';
import { getRarityBadgeColor } from '@/lib/web3-utils';

interface MintFormProps {
  onMint: (name: string) => void;
  loading: boolean;
}

export function MintForm({ onMint, loading }: MintFormProps) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onMint(name || `NFTerra ${Math.floor(Math.random() * 10000)}`);
  };

  return (
    <div className="panel">
      <h3 className="text-xl font-black tracking-tight mb-6" style={{ color: 'oklch(0.13 0.02 270)' }}>
        Configure Mint
      </h3>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-widest" style={{ color: 'oklch(0.5 0.04 270)' }}>
            NFT Name (Optional)
          </label>
          <Input
            type="text"
            placeholder="e.g., My Dragon #1"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            className="bg-white border-2 border-slate-200 focus:border-indigo-500"
          />
          <p className="text-xs" style={{ color: 'oklch(0.6 0.03 270)' }}>
            Leave empty for auto-generated name
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-widest" style={{ color: 'oklch(0.5 0.04 270)' }}>
            Starting Stage
          </label>
          <div className="inset-panel">
            <p className="text-sm font-semibold" style={{ color: 'oklch(0.4 0.03 270)' }}>
              Egg &mdash; Always starts as Egg
            </p>
          </div>
        </div>

        <div className="inset-panel space-y-3">
          <div className="flex justify-between text-sm">
            <span style={{ color: 'oklch(0.5 0.04 270)' }}>Mint Price</span>
            <span className="font-black font-mono" style={{ color: 'var(--indigo)' }}>0.05 ETH</span>
          </div>
          <div className="flex justify-between text-sm pt-2 border-t border-slate-200">
            <span style={{ color: 'oklch(0.5 0.04 270)' }}>Gas Estimate</span>
            <span className="font-mono" style={{ color: 'oklch(0.5 0.04 270)' }}>~0.01 ETH</span>
          </div>
          <div className="flex justify-between text-sm pt-2 border-t border-slate-200">
            <span className="font-black" style={{ color: 'oklch(0.13 0.02 270)' }}>Total</span>
            <span className="font-black font-mono" style={{ color: 'var(--amber)' }}>0.06 ETH</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full justify-center text-base"
        >
          {loading ? <><LoadingDots /> Minting...</> : 'Mint Now'}
        </button>

        <p className="text-xs text-center" style={{ color: 'oklch(0.6 0.03 270)' }}>
          By minting, you agree to our terms of service
        </p>
      </form>
    </div>
  );
}

interface MintPreviewProps {
  name: string;
  rarity: 'common' | 'rare' | 'legendary';
}

export function MintPreview({ name, rarity }: MintPreviewProps) {
  return (
    <div className="panel text-center">
      <h3 className="text-xl font-black tracking-tight mb-5" style={{ color: 'oklch(0.13 0.02 270)' }}>
        Preview
      </h3>

      <div className="relative w-full aspect-square rounded-xl mb-5 flex items-center justify-center overflow-hidden border-2 border-dashed border-indigo-200"
        style={{ background: 'oklch(0.96 0.02 270)' }}>
        <div className="text-center">
          <div className="text-8xl mb-3 animate-float" role="img" aria-label="Egg">
            &#x1F95A;
          </div>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--indigo)' }}>
            Egg &mdash; Starting Stage
          </p>
        </div>
      </div>

      <div className="space-y-3 text-left">
        <div className="inset-panel">
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'oklch(0.5 0.04 270)' }}>
            NFT Name
          </p>
          <p className="font-black text-lg tracking-tight truncate" style={{ color: 'oklch(0.13 0.02 270)' }}>
            {name || 'Your NFTerra'}
          </p>
        </div>

        <div className="flex items-center justify-between inset-panel">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'oklch(0.5 0.04 270)' }}>Rarity</span>
          <span className={`tag ${rarity === 'legendary' ? 'tag-amber' : rarity === 'rare' ? 'tag-indigo' : 'tag-teal'}`}>
            {rarity}
          </span>
        </div>

        <div className="inset-panel">
          <div className="flex justify-between text-xs mb-2">
            <span className="font-bold uppercase tracking-widest" style={{ color: 'oklch(0.5 0.04 270)' }}>Level</span>
            <span className="font-black" style={{ color: 'var(--indigo)' }}>1 / 5</span>
          </div>
          <div className="level-bar-track">
            <div className="level-bar-fill" style={{ width: '20%' }} />
          </div>
        </div>
      </div>
    </div>
  );
}

interface TransactionFeedbackProps {
  status: 'pending' | 'success' | 'error' | null;
  txHash?: string;
  tokenId?: number;
}

export function TransactionFeedback({ status, txHash, tokenId }: TransactionFeedbackProps) {
  if (status === null) return null;

  return (
    <div className="panel text-center">
      <div className="py-8 space-y-4">
        {status === 'pending' && (
          <>
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
            </div>
            <h3 className="text-lg font-black" style={{ color: 'oklch(0.13 0.02 270)' }}>Minting NFT...</h3>
            <p className="text-sm" style={{ color: 'oklch(0.5 0.04 270)' }}>
              Confirm the transaction in your wallet
            </p>
            {txHash && (
              <p className="text-xs font-mono break-all inset-panel" style={{ color: 'oklch(0.5 0.04 270)' }}>
                {txHash}
              </p>
            )}
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 rounded-full bg-green-100 border-2 border-green-400 flex items-center justify-center mx-auto text-2xl">
              &#x2713;
            </div>
            <h3 className="text-lg font-black text-green-700">Minted Successfully!</h3>
            <p className="text-sm" style={{ color: 'oklch(0.5 0.04 270)' }}>Your new NFT is live on-chain</p>
            {tokenId && (
              <div className="inset-panel border-2 border-green-200">
                <p className="text-sm font-black text-green-700">Token ID #{tokenId}</p>
              </div>
            )}
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-100 border-2 border-red-400 flex items-center justify-center mx-auto text-2xl text-red-600">
              &#x2715;
            </div>
            <h3 className="text-lg font-black text-red-700">Minting Failed</h3>
            <p className="text-sm" style={{ color: 'oklch(0.5 0.04 270)' }}>
              Something went wrong. Please try again.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
