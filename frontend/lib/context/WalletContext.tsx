'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BrowserProvider, ethers } from 'ethers';

interface WalletContextType {
  address: string | null;
  connected: boolean;
  chainId: number | null;
  balance: string;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  loading: boolean;
  error: string | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [chainId, setChainId] = useState<number | null>(null);
  const [balance, setBalance] = useState('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if wallet is already connected on mount
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const provider = new BrowserProvider(window.ethereum);
          const accounts = await provider.listAccounts();
          
          if (accounts.length > 0) {
            setAddress(accounts[0].address);
            setConnected(true);
            
            const network = await provider.getNetwork();
            setChainId(Number(network.chainId));
            
            const balanceWei = await provider.getBalance(accounts[0].address);
            const balanceEth = ethers.formatEther(balanceWei);
            setBalance(balanceEth);
          }
        } catch (err) {
          console.error('Error checking wallet connection:', err);
        }
      }
    };

    checkWalletConnection();
  }, []);

  const connectWallet = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      setError('MetaMask is not installed');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      }) as string[];

      if (accounts.length > 0) {
        const resolvedAddress = await provider.resolveName(accounts[0]) || accounts[0];
        setAddress(accounts[0]);
        setConnected(true);

        const network = await provider.getNetwork();
        setChainId(Number(network.chainId));

        const balanceWei = await provider.getBalance(accounts[0]);
        const balanceEth = ethers.formatEther(balanceWei);
        setBalance(balanceEth);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet');
      setConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    setAddress(null);
    setConnected(false);
    setChainId(null);
    setBalance('0');
    setError(null);
  };

  return (
    <WalletContext.Provider
      value={{
        address,
        connected,
        chainId,
        balance,
        connectWallet,
        disconnectWallet,
        loading,
        error,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
