'use client';

import { useState, useCallback } from 'react';
import { useWallet } from '@/lib/context/WalletContext';
import {
  mintNFT as mintNFTContract,
  levelUpNFT as levelUpNFTContract,
  getNFTsByOwner,
  getNFTLevel,
  getTotalMinted,
  NFTData,
} from '@/lib/contract';

export interface UseContractReturn {
  // Minting
  mint: (name: string) => Promise<{ tokenId: number; txHash: string } | null>;
  minting: boolean;
  mintError: string | null;
  
  // Level up
  levelUp: (tokenId: number) => Promise<{ newLevel: number; txHash: string } | null>;
  levelingUp: boolean;
  levelUpError: string | null;
  
  // Fetching NFTs
  fetchUserNFTs: () => Promise<NFTData[]>;
  fetchingNFTs: boolean;
  
  // Utils
  getLevel: (tokenId: number) => Promise<number>;
  getTotalSupply: () => Promise<number>;
}

export function useContract(): UseContractReturn {
  const { connected, address } = useWallet();
  
  const [minting, setMinting] = useState(false);
  const [mintError, setMintError] = useState<string | null>(null);
  
  const [levelingUp, setLevelingUp] = useState(false);
  const [levelUpError, setLevelUpError] = useState<string | null>(null);
  
  const [fetchingNFTs, setFetchingNFTs] = useState(false);

  const mint = useCallback(async (name: string) => {
    if (!connected) {
      setMintError('Wallet not connected');
      return null;
    }
    
    setMinting(true);
    setMintError(null);
    
    try {
      const result = await mintNFTContract(name);
      return result;
    } catch (err: any) {
      const message = err?.reason || err?.message || 'Failed to mint NFT';
      setMintError(message);
      console.error('Mint error:', err);
      return null;
    } finally {
      setMinting(false);
    }
  }, [connected]);

  const levelUp = useCallback(async (tokenId: number) => {
    if (!connected) {
      setLevelUpError('Wallet not connected');
      return null;
    }
    
    setLevelingUp(true);
    setLevelUpError(null);
    
    try {
      const result = await levelUpNFTContract(tokenId);
      return result;
    } catch (err: any) {
      const message = err?.reason || err?.message || 'Failed to level up NFT';
      setLevelUpError(message);
      // Only log unexpected errors; "not found on contract" is expected for unconfirmed purchases
      if (!message.includes('not found on contract')) {
        console.error('Level up error:', err);
      }
      // Re-throw so the caller can see the error
      throw err;
    } finally {
      setLevelingUp(false);
    }
  }, [connected]);

  const fetchUserNFTs = useCallback(async (): Promise<NFTData[]> => {
    if (!connected || !address) {
      return [];
    }
    
    setFetchingNFTs(true);
    
    try {
      const nfts = await getNFTsByOwner(address);
      return nfts;
    } catch (err) {
      console.error('Error fetching NFTs:', err);
      return [];
    } finally {
      setFetchingNFTs(false);
    }
  }, [connected, address]);

  const getLevel = useCallback(async (tokenId: number): Promise<number> => {
    return getNFTLevel(tokenId);
  }, []);

  const getTotalSupply = useCallback(async (): Promise<number> => {
    return getTotalMinted();
  }, []);

  return {
    mint,
    minting,
    mintError,
    levelUp,
    levelingUp,
    levelUpError,
    fetchUserNFTs,
    fetchingNFTs,
    getLevel,
    getTotalSupply,
  };
}
