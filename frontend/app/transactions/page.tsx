'use client';

import React, { useState } from 'react';
import { useWallet } from '@/lib/context/WalletContext';
import { useTxHistory } from '@/lib/context/TxHistoryContext';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { formatTimeAgo } from '@/lib/marketplace-data';
import { formatAddress } from '@/lib/web3-utils';
import {
  RefreshCw, Wallet, Download, Filter, Calendar, DollarSign, Hash,
  CheckCircle, Clock, XCircle, ArrowUpRight, ShoppingBag,
  Zap, Hammer, Search, ChevronRight, TrendingUp,
} from 'lucide-react';
import Link from 'next/link';

// ── Tx action config ──────────────────────────────────────────────────────────

const TX_ACTION_CONF: Record<string, { icon: React.ReactNode; color: string; bg: string; label: string }> = {
  Minted:   { icon: <Hammer className="w-5 h-5" />, color: 'text-[var(--indigo)]', bg: 'bg-[oklch(0.92_0.05_270)]', label: 'Minted' },
  Bought:   { icon: <ShoppingBag className="w-5 h-5" />, color: 'text-[var(--teal)]', bg: 'bg-[oklch(0.92_0.05_195)]', label: 'Purchased' },
  Sold:     { icon: <ArrowUpRight className="w-5 h-5" />, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Sold' },
  'Level Up': { icon: <Zap className="w-5 h-5" />, color: 'text-[var(--amber)]', bg: 'bg-[oklch(0.96_0.06_75)]', label: 'Level Up' },
  Approved: { icon: <CheckCircle className="w-5 h-5" />, color: 'text-[var(--indigo)]', bg: 'bg-[oklch(0.92_0.05_270)]', label: 'Approved' },
  Listed:   { icon: <ShoppingBag className="w-5 h-5" />, color: 'text-[var(--rose)]', bg: 'bg-rose-50', label: 'Listed' },
};

const STATUS_CONF: Record<string, { icon: React.ReactNode; label: string; color: string; bg: string }> = {
  success: { icon: <CheckCircle className="w-5 h-5" />, label: 'Success', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  pending: { icon: <Clock className="w-5 h-5" />, label: 'Pending', color: 'text-[var(--amber)]', bg: 'bg-[oklch(0.96_0.06_75)]' },
  failed: { icon: <XCircle className="w-5 h-5" />, label: 'Failed', color: 'text-[var(--rose)]', bg: 'bg-rose-50' },
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TransactionsPage() {
  const { address, connected } = useWallet();
  const { transactions } = useTxHistory();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'success' | 'pending' | 'failed'>('all');
  const [filterAction, setFilterAction] = useState<string>('all');

  const txHistory = transactions;

  // Filter transactions
  const filteredTxs = txHistory.filter(tx => {
    const matchesSearch = 
      tx.tokenId.toString().includes(searchTerm) ||
      (tx.hash && tx.hash.toLowerCase().includes(searchTerm.toLowerCase())) ||
      tx.action.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || tx.status === filterStatus;
    const matchesAction = filterAction === 'all' || tx.action === filterAction;

    return matchesSearch && matchesStatus && matchesAction;
  });

  // Stats
  const totalTransactions = txHistory.length;
  const successfulTxs = txHistory.filter(tx => tx.status === 'success').length;
  const totalVolume = txHistory
    .filter(tx => tx.status === 'success' && (tx.action === 'Bought' || tx.action === 'Sold') && tx.amount)
    .reduce((sum, tx) => {
      const amount = parseFloat(tx.amount || '0');
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      <Navbar />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 pt-12 pb-20 max-w-7xl mx-auto w-full">

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="section-eyebrow mb-2">Transaction History</p>
            <h1 className="section-title">All Transactions</h1>
            {connected && address && (
              <div className="flex items-center gap-2 mt-2">
                <Wallet className="w-4 h-4 text-[var(--indigo)]" />
                <span className="font-mono text-sm text-[oklch(0.5_0.03_270)]">{formatAddress(address)}</span>
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button className="btn-outline gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* ── Stats Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="panel">
            <div className="flex items-start justify-between">
              <div>
                <p className="stat-label mb-2">Total Transactions</p>
                <p className="stat-number text-[var(--indigo)]">{totalTransactions}</p>
              </div>
              <div className="p-3 rounded-lg bg-[oklch(0.92_0.05_270)]">
                <Hash className="w-6 h-6 text-[var(--indigo)]" />
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="flex items-start justify-between">
              <div>
                <p className="stat-label mb-2">Successful</p>
                <p className="stat-number text-emerald-600">{successfulTxs}</p>
                <p className="text-xs text-[oklch(0.6_0.03_270)] mt-1">{totalTransactions > 0 ? ((successfulTxs / totalTransactions) * 100).toFixed(0) : 0}% success rate</p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="flex items-start justify-between">
              <div>
                <p className="stat-label mb-2">Volume Traded</p>
                <p className="stat-number text-[var(--teal)]">{totalVolume.toFixed(2)} ETH</p>
              </div>
              <div className="p-3 rounded-lg bg-[oklch(0.92_0.05_195)]">
                <TrendingUp className="w-6 h-6 text-[var(--teal)]" />
              </div>
            </div>
          </div>
        </div>

        {/* ── Filters ── */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                placeholder="Search by Token ID, TX Hash, or Action..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-[oklch(0.3_0.01_270)] bg-[oklch(0.95_0.005_270)] text-[oklch(0.15_0.02_270)] placeholder:text-white/40 focus:outline-none focus:border-[var(--indigo)] transition-colors"
              />
            </div>

            {/* Filter buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex gap-2 flex-wrap items-center">
                <span className="text-sm font-black text-white flex items-center gap-2">
                  <Filter className="w-4 h-4 text-orange-400" /> Status:
                </span>
                {(['all', 'success', 'pending', 'failed'] as const).map(status => {
                  return (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all font-black capitalize text-sm ${
                        filterStatus === status
                          ? status === 'all'
                            ? 'border-[var(--indigo)] bg-[var(--indigo)] text-white'
                            : status === 'success'
                            ? 'border-emerald-600 bg-emerald-600 text-white'
                            : status === 'pending'
                            ? 'border-[var(--amber)] bg-[var(--amber)] text-black font-black'
                            : 'border-[var(--rose)] bg-[var(--rose)] text-white'
                          : status === 'all'
                          ? 'border-[oklch(0.88_0.01_270)] bg-[oklch(0.97_0.01_270)] text-[oklch(0.3_0.02_270)] hover:border-[var(--indigo)] hover:text-[var(--indigo)]'
                          : status === 'success'
                          ? 'border-[oklch(0.8_0.05_195)] bg-[oklch(0.97_0.01_195)] text-[oklch(0.4_0.05_195)] hover:border-emerald-500 hover:text-emerald-600'
                          : status === 'pending'
                          ? 'border-[oklch(0.88_0.08_75)] bg-[oklch(0.97_0.01_75)] text-[oklch(0.45_0.08_75)] hover:border-[var(--amber)] hover:text-[var(--amber)]'
                          : 'border-[oklch(0.8_0.08_30)] bg-[oklch(0.97_0.01_30)] text-[oklch(0.45_0.08_30)] hover:border-[var(--rose)] hover:text-[var(--rose)]'
                      }`}
                    >
                      {status}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── Transactions Table ── */}
        <div className="space-y-3">
          {filteredTxs.length === 0 ? (
            <div className="panel text-center p-12">
              <p className="text-[oklch(0.15_0.02_270)] font-black text-lg">📭 No transactions found</p>
              <p className="text-[oklch(0.6_0.03_270)] text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            filteredTxs.map((tx, idx) => {
              const actionCfg = TX_ACTION_CONF[tx.action] || TX_ACTION_CONF['Minted'];
              const statusCfg = STATUS_CONF[tx.status];

              return (
                <div
                  key={idx}
                  className="group rounded-xl border-2 border-[oklch(0.88_0.01_270)] hover:border-[var(--indigo)] p-4 sm:p-6 transition-all bg-[oklch(0.975_0.005_270)] hover:bg-[oklch(0.97_0.01_270)]"
                >
                  <div className="flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
                    {/* Left: Action + NFT Info */}
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className={`p-3 rounded-lg flex-shrink-0 ${actionCfg.bg}`}>
                        {actionCfg.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-black text-white text-base">{actionCfg.label}</p>
                        <p className="text-xs text-white/70 font-mono truncate">
                          Token #{tx.tokenId}
                        </p>
                      </div>
                    </div>

                    {/* Center: Price (if applicable) */}
                    {tx.amount && (
                      <div className="text-right flex-shrink-0">
                        <p className="font-black text-[var(--amber)] text-lg">{tx.amount}</p>
                        <p className="text-xs text-[oklch(0.6_0.03_270)]">Amount</p>
                      </div>
                    )}

                    {/* Center: Status */}
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${statusCfg.bg}`}>
                        {statusCfg.icon}
                      </div>
                      <span className={`font-black text-sm ${statusCfg.color}`}>
                        {statusCfg.label}
                      </span>
                    </div>

                    {/* Right: Timestamp */}
                    <div className="text-right flex-shrink-0">
                      <p className="font-medium text-[oklch(0.15_0.02_270)] text-sm">{formatTimeAgo(tx.timestamp)}</p>
                      <p className="text-xs text-[oklch(0.6_0.03_270)]">
                        {new Date(tx.timestamp).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Right: Link */}
                    <ChevronRight className="w-5 h-5 text-[oklch(0.7_0.02_270)] group-hover:text-[var(--indigo)] transition-colors flex-shrink-0" />
                  </div>

                  {/* Expandable: TX Details */}
                  <div className="mt-4 pt-4 border-t border-[oklch(0.88_0.01_270)] grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-[var(--indigo)] font-black mb-1 uppercase text-xs tracking-widest">TX ID</p>
                      <p className="font-mono text-[oklch(0.4_0.02_270)] truncate text-xs">{tx.id}</p>
                    </div>
                    <div>
                      <p className="text-[var(--teal)] font-black mb-1 uppercase text-xs tracking-widest">Hash</p>
                      <p className="font-mono text-[oklch(0.4_0.02_270)] truncate text-xs">{tx.hash ? formatAddress(tx.hash) : '—'}</p>
                    </div>
                    <div>
                      <p className="text-[var(--amber)] font-black mb-1 uppercase text-xs tracking-widest">Amount</p>
                      <p className="font-mono text-[oklch(0.4_0.02_270)] text-xs">{tx.amount || '—'}</p>
                    </div>
                    <div>
                      <p className="text-[var(--rose)] font-black mb-1 uppercase text-xs tracking-widest">Time</p>
                      <p className="font-mono text-[oklch(0.4_0.02_270)] text-xs">{new Date(tx.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </main>

      <Footer />
    </div>
  );
}
