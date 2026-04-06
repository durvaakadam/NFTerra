'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

export type ListingStatus = 'active' | 'sold' | 'cancelled' | 'expired';
export type ListingType = 'fixed' | 'auction';
export type ListingCurrency = 'ETH' | 'USDC';

export interface UserListingRecord {
  id: string;
  tokenId: number;
  tokenName: string;
  image: string;
  level: number;
  rarity: 'common' | 'rare' | 'legendary';
  price: string;
  currency: ListingCurrency;
  listingType: ListingType;
  durationDays: number;
  seller: string;
  listedAt: string;
  status: ListingStatus;
  txHash?: string;
}

interface MyListingsContextType {
  listings: UserListingRecord[];
  addListing: (listing: Omit<UserListingRecord, 'id' | 'listedAt' | 'status'> & Partial<Pick<UserListingRecord, 'listedAt' | 'status'>>) => string;
  updateListing: (id: string, patch: Partial<UserListingRecord>) => void;
  removeListing: (id: string) => void;
  clearListings: () => void;
}

const MyListingsContext = createContext<MyListingsContextType | undefined>(undefined);
const STORAGE_KEY = 'nfterra-my-listings';

export function MyListingsProvider({ children }: { children: React.ReactNode }) {
  const [listings, setListings] = useState<UserListingRecord[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setListings(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load my listings:', error);
    } finally {
      setMounted(true);
    }
  }, []);

  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(listings));
    } catch (error) {
      console.error('Failed to save my listings:', error);
    }
  }, [listings, mounted]);

  const addListing = useCallback((listing: Omit<UserListingRecord, 'id' | 'listedAt' | 'status'> & Partial<Pick<UserListingRecord, 'listedAt' | 'status'>>) => {
    const normalizedSeller = listing.seller.toLowerCase();
    const newRecord: UserListingRecord = {
      ...listing,
      id: `lst-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      listedAt: listing.listedAt ?? new Date().toISOString(),
      status: listing.status ?? 'active',
    };

    setListings((prev) => {
      const existing = prev.find(
        (item) =>
          item.tokenId === listing.tokenId &&
          item.seller.toLowerCase() === normalizedSeller &&
          item.status === 'active',
      );

      if (!existing) {
        return [newRecord, ...prev];
      }

      const updated: UserListingRecord = {
        ...existing,
        ...newRecord,
        id: existing.id,
        listedAt: newRecord.listedAt,
        status: 'active',
      };

      return [updated, ...prev.filter((item) => item.id !== existing.id)];
    });

    return newRecord.id;
  }, []);

  const updateListing = useCallback((id: string, patch: Partial<UserListingRecord>) => {
    setListings((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }, []);

  const removeListing = useCallback((id: string) => {
    setListings((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearListings = useCallback(() => {
    setListings([]);
  }, []);

  return (
    <MyListingsContext.Provider
      value={{
        listings,
        addListing,
        updateListing,
        removeListing,
        clearListings,
      }}
    >
      {children}
    </MyListingsContext.Provider>
  );
}

export function useMyListings() {
  const context = useContext(MyListingsContext);
  if (!context) {
    throw new Error('useMyListings must be used within MyListingsProvider');
  }
  return context;
}
