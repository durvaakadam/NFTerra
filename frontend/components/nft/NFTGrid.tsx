'use client';

import React from 'react';
import Link from 'next/link';
import { NFT } from '@/lib/mock-data';
import { NFTCard } from './NFTCard';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty';

interface NFTGridProps {
  nfts: NFT[];
  onLevelUp?: (tokenId: number) => void;
  loading?: boolean;
  emptyMessage?: string;
}

export function NFTGrid({ nfts, onLevelUp, loading, emptyMessage }: NFTGridProps) {
  if (nfts.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <div className="text-4xl">🎨</div>
          <EmptyTitle>No NFTs Yet</EmptyTitle>
          <EmptyDescription>{emptyMessage || "You don't have any NFTs. Mint one to get started!"}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Link
            href="/mint"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Mint Now
          </Link>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {nfts.map((nft) => (
        <NFTCard key={nft.tokenId} nft={nft} onLevelUp={onLevelUp} loading={loading} />
      ))}
    </div>
  );
}
