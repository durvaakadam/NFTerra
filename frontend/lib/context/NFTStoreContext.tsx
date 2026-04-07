'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { NFT } from '@/lib/mock-data';

interface NFTStoreContextType {
  newNFTs: NFT[];
  addNewNFT: (nft: NFT) => void;
  updateNewNFT: (tokenId: number, updates: Partial<NFT>) => void;
  removeNewNFT: (tokenId: number) => void;
  clearNewNFTs: () => void;
}

const NFTStoreContext = createContext<NFTStoreContextType | undefined>(undefined);

export function NFTStoreProvider({ children }: { children: React.ReactNode }) {
  const [newNFTs, setNewNFTs] = useState<NFT[]>([]);

  const addNewNFT = useCallback((nft: NFT) => {
    setNewNFTs(prev => {
      // Avoid duplicates
      if (prev.some(n => n.tokenId === nft.tokenId)) {
        return prev;
      }
      return [nft, ...prev];
    });
  }, []);

  const updateNewNFT = useCallback((tokenId: number, updates: Partial<NFT>) => {
    setNewNFTs(prev => prev.map(n => (n.tokenId === tokenId ? { ...n, ...updates } : n)));
  }, []);

  const removeNewNFT = useCallback((tokenId: number) => {
    setNewNFTs(prev => prev.filter(n => n.tokenId !== tokenId));
  }, []);

  const clearNewNFTs = useCallback(() => {
    setNewNFTs([]);
  }, []);

  const value: NFTStoreContextType = {
    newNFTs,
    addNewNFT,
    updateNewNFT,
    removeNewNFT,
    clearNewNFTs,
  };

  return (
    <NFTStoreContext.Provider value={value}>
      {children}
    </NFTStoreContext.Provider>
  );
}

export function useNFTStore() {
  const context = useContext(NFTStoreContext);
  if (!context) {
    throw new Error('useNFTStore must be used within NFTStoreProvider');
  }
  return context;
}
