'use client';

import React, {
  createContext, useContext, useState, useCallback, ReactNode, useEffect,
} from 'react';

// ── Types ────────────────────────────────────────────────────────────────────

export type TxAction = 'Minted' | 'Bought' | 'Sold' | 'Level Up' | 'Approved' | 'Listed';
export type TxStatus = 'success' | 'pending' | 'failed';

export interface TxRecord {
  id: string;
  action: TxAction;
  tokenId: number;
  tokenName: string;
  amount?: string; // ETH amount
  timestamp: string; // ISO date string
  status: TxStatus;
  hash?: string; // TX hash
  seller?: string; // For bought/sold txs
  buyer?: string; // For bought/sold txs
}

interface TxHistoryContextType {
  transactions: TxRecord[];
  addTransaction: (tx: Omit<TxRecord, 'id'>) => string;
  updateTransaction: (id: string, update: Partial<TxRecord>) => void;
  clearHistory: () => void;
}

// ── Context ───────────────────────────────────────────────────────────────────

const TxHistoryContext = createContext<TxHistoryContextType | undefined>(undefined);

const STORAGE_KEY = 'nfterra-tx-history';

export function TxHistoryProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<TxRecord[]>([]);
  const [mounted, setMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          setTransactions(JSON.parse(stored));
        }
      } catch (e) {
        console.error('Failed to load transaction history:', e);
      }
      setMounted(true);
    }
  }, []);

  // Persist to localStorage whenever transactions change
  useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
      } catch (e) {
        console.error('Failed to save transaction history:', e);
      }
    }
  }, [transactions, mounted]);

  const addTransaction = useCallback((tx: Omit<TxRecord, 'id'>) => {
    const id = `tx-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const fullTx: TxRecord = { ...tx, id };
    setTransactions(prev => [fullTx, ...prev]);
    return id;
  }, []);

  const updateTransaction = useCallback((id: string, update: Partial<TxRecord>) => {
    setTransactions(prev =>
      prev.map(tx => tx.id === id ? { ...tx, ...update } : tx)
    );
  }, []);

  const clearHistory = useCallback(() => {
    setTransactions([]);
  }, []);

  return (
    <TxHistoryContext.Provider value={{ transactions, addTransaction, updateTransaction, clearHistory }}>
      {children}
    </TxHistoryContext.Provider>
  );
}

export function useTxHistory() {
  const ctx = useContext(TxHistoryContext);
  if (!ctx) throw new Error('useTxHistory must be inside TxHistoryProvider');
  return ctx;
}
