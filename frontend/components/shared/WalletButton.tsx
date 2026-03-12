'use client';

import React from 'react';
import { useWallet } from '@/lib/context/WalletContext';
import { formatAddress } from '@/lib/web3-utils';
import { Wallet, LogOut, Loader2 } from 'lucide-react';

export function WalletButton() {
  const { address, connected, connectWallet, disconnectWallet, loading } = useWallet();

  if (loading) {
    return (
      <button disabled className="btn-outline opacity-60 cursor-not-allowed">
        <Loader2 className="w-4 h-4 animate-spin" />
        Connecting...
      </button>
    );
  }

  if (connected && address) {
    return (
      <div className="flex items-center gap-2">
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 border-[oklch(0.78_0.1_270)] bg-[oklch(0.93_0.05_270)]"
        >
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <Wallet className="w-3.5 h-3.5 text-[var(--indigo)]" />
          <span className="text-xs font-mono font-bold text-[var(--indigo)]">
            {formatAddress(address)}
          </span>
        </div>
        <button
          onClick={disconnectWallet}
          title="Disconnect wallet"
          className="p-2 rounded-lg border-2 border-[oklch(0.86_0.01_270)] hover:border-red-400 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5 text-[oklch(0.5_0.02_270)] hover:text-red-500" />
        </button>
      </div>
    );
  }

  return (
    <button onClick={connectWallet} className="btn-primary">
      <Wallet className="w-4 h-4" />
      Connect Wallet
    </button>
  );
}
