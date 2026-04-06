import { NFT, generateMockNFT } from './mock-data';

// ── Seeded random number generator for deterministic mock data ──
function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash % 1000) / 1000;
}

// ── Collection categories ─────────────────────────────────────────────────────

export type CollectionCategory = 'pfp' | 'art' | 'gaming' | 'music' | 'sports' | 'anime' | 'cyberpunk' | 'fantasy';

export interface Collection {
  id: string;
  name: string;
  creator: string;
  category: CollectionCategory;
  banner: string;
  avatar: string;
  floorPrice: number;
  totalVolume: number;
  items: number;
  listed: number;
  change24h: number;
  verified: boolean;
  description: string;
  priceHistory: { hour: number; price: number }[];
  accentColor: string;
}

export interface Listing {
  id: string;
  nft: NFT;
  price: string;
  seller: string;
  listedAt: string;
  collectionId: string;
}

export type TxAction = 'Minted' | 'Bought' | 'Sold' | 'Level Up' | 'Approved' | 'Listed';
export type TxStatus = 'success' | 'pending' | 'failed';

export interface TxRecord {
  id: string;
  action: TxAction;
  tokenId: number;
  tokenName: string;
  amount?: string;
  timestamp: string;
  status: TxStatus;
  hash?: string;
}

export const MOCK_SELLERS = [
  '0xA1b2C3d4E5f6A7b8C9d0E1f2A3b4C5d6E7f8A9b0',
  '0xDeAdBeEf0000111122223333444455556666CAFE',
  '0xBaDaBiNg0001002200330044005500660077ABCD',
  '0xC0FFEE001122334455667788990011AABBCCDDEE',
  '0x1337BABE99887766554433221100FFEEDDCCBBAA',
];

// ── NFT image pools per collection ───────────────────────────────────────────

export const COLLECTION_IMAGES: Record<string, string[]> = {
  animesquad:    ['/nft-anime-1.jpg', '/nft-anime-2.jpg'],
  cyberpunkdao:  ['/nft-cyber-1.jpg', '/nft-cyber-2.jpg'],
  fantasylegacy: ['/nft-fantasy-1.jpg', '/nft-fantasy-2.jpg'],
  pixelrealm:    ['/nft-pixel-1.jpg', '/nft-pixel-2.jpg'],
  genesisart:    ['/nft-abstract-1.jpg', '/nft-abstract-2.jpg'],
  terralegends:  ['/nft-sculpt-1.jpg', '/nft-fantasy-1.jpg'],
  meebiterra:    ['/nft-1.jpg', '/nft-3.jpg', '/nft-5.jpg', '/nft-7.jpg', '/nft-2.jpg'],
  voxelwarriors: ['/nft-5.jpg', '/nft-7.jpg'],
};

function makePriceHistory(base: number, volatile = 0.3): { hour: number; price: number }[] {
  return Array.from({ length: 24 }, (_, i) => {
    const noise = (Math.sin(i * 1.3 + base * 5) * volatile + Math.cos(i * 0.8) * volatile * 0.5);
    return { hour: i, price: Math.max(0.001, +(base + noise).toFixed(4)) };
  });
}

export const COLLECTIONS: Collection[] = [
  {
    id: 'animesquad',
    name: 'Anime Squad',
    creator: '0xF1a2B3c4D5e6',
    category: 'anime',
    banner: '/col-anime.jpg',
    avatar: '/nft-anime-1.jpg',
    floorPrice: 0.48,
    totalVolume: 312.7,
    items: 8888,
    listed: 6.2,
    change24h: 14.3,
    verified: true,
    description: '8,888 unique anime-style avatars with 200+ hand-drawn traits. Holders gain access to exclusive manga drops and IRL events.',
    priceHistory: makePriceHistory(0.48, 0.08),
    accentColor: '#7c3aed',
  },
  {
    id: 'cyberpunkdao',
    name: 'CyberPunk DAO',
    creator: '0xDeAdBeEf00001111',
    category: 'cyberpunk',
    banner: '/col-cyber.jpg',
    avatar: '/nft-cyber-1.jpg',
    floorPrice: 1.85,
    totalVolume: 894.2,
    items: 5000,
    listed: 9.1,
    change24h: -2.4,
    verified: true,
    description: 'A DAO governed by 5,000 cyberpunk avatars. Vote on protocol upgrades, treasury spending, and governance proposals.',
    priceHistory: makePriceHistory(1.85, 0.25),
    accentColor: '#0891b2',
  },
  {
    id: 'fantasylegacy',
    name: 'Fantasy Legacy',
    creator: '0xC0FFEE00112233',
    category: 'fantasy',
    banner: '/col-fantasy.jpg',
    avatar: '/nft-fantasy-1.jpg',
    floorPrice: 0.72,
    totalVolume: 445.9,
    items: 6666,
    listed: 11.5,
    change24h: 7.8,
    verified: true,
    description: 'Ancient creatures from the realm of Etheria. Each NFT unlocks a playable character in the upcoming Fantasy Legacy RPG.',
    priceHistory: makePriceHistory(0.72, 0.12),
    accentColor: '#059669',
  },
  {
    id: 'genesisart',
    name: 'Genesis Art',
    creator: '0xBaDaBiNg00010022',
    category: 'art',
    banner: '/col-art.jpg',
    avatar: '/nft-abstract-1.jpg',
    floorPrice: 0.14,
    totalVolume: 89.3,
    items: 1000,
    listed: 3.4,
    change24h: 22.1,
    verified: false,
    description: 'A limited 1,000-piece generative art series produced entirely on-chain. Each piece is mathematically unique.',
    priceHistory: makePriceHistory(0.14, 0.03),
    accentColor: '#dc2626',
  },
  {
    id: 'pixelrealm',
    name: 'Pixel Realm',
    creator: '0x1337BABE99887766',
    category: 'gaming',
    banner: '/col-gaming.jpg',
    avatar: '/nft-pixel-1.jpg',
    floorPrice: 0.09,
    totalVolume: 63.5,
    items: 10000,
    listed: 15.7,
    change24h: -5.6,
    verified: true,
    description: 'Retro pixel heroes usable across 3 partner games. Earn $PIXEL tokens by staking your characters in active battles.',
    priceHistory: makePriceHistory(0.09, 0.02),
    accentColor: '#d97706',
  },
  {
    id: 'terralegends',
    name: 'Terra Legends',
    creator: '0x1337BABE99887766',
    category: 'sports',
    banner: '/col-sports.jpg',
    avatar: '/nft-sculpt-1.jpg',
    floorPrice: 0.55,
    totalVolume: 230.1,
    items: 3000,
    listed: 9.8,
    change24h: -1.2,
    verified: true,
    description: 'Legendary athlete collectibles that unlock exclusive match predictions and fantasy league bonuses.',
    priceHistory: makePriceHistory(0.55, 0.1),
    accentColor: '#0d9488',
  },
  {
    id: 'meebiterra',
    name: 'MeebiTerra',
    creator: '0xA1b2C3d4E5f6A7b8',
    category: 'pfp',
    banner: '/col-pfp.jpg',
    avatar: '/nft-1.jpg',
    floorPrice: 0.35,
    totalVolume: 188.9,
    items: 10000,
    listed: 8.4,
    change24h: 4.2,
    verified: true,
    description: 'The flagship NFTerra PFP collection. 10,000 unique voxel characters with on-chain evolution mechanics.',
    priceHistory: makePriceHistory(0.35, 0.06),
    accentColor: '#3730a3',
  },
  {
    id: 'soundblocks',
    name: 'SoundBlocks',
    creator: '0xC0FFEE0011223344',
    category: 'music',
    banner: '/col-music.jpg',
    avatar: '/nft-abstract-2.jpg',
    floorPrice: 0.22,
    totalVolume: 94.7,
    items: 1500,
    listed: 6.3,
    change24h: 8.0,
    verified: true,
    description: 'Tokenised music NFTs that evolve as songs get played. Holders earn streaming royalties on-chain.',
    priceHistory: makePriceHistory(0.22, 0.05),
    accentColor: '#9333ea',
  },
];

// ── Listings per collection ───────────────────────────────────────────────────

export function generateCollectionListings(collectionId: string, count = 12): Listing[] {
  const col = COLLECTIONS.find(c => c.id === collectionId);
  const base = col?.floorPrice ?? 0.1;
  const imgs = COLLECTION_IMAGES[collectionId] ?? ['/nft-1.jpg'];
  return Array.from({ length: count }, (_, i) => {
    const tokenId = 100 + i + (collectionId.length * 7);
    const seller = MOCK_SELLERS[i % MOCK_SELLERS.length];
    const nft = generateMockNFT(tokenId, seller);
    nft.image = imgs[i % imgs.length];
    nft.name = `${col?.name ?? 'NFT'} #${String(tokenId).padStart(4, '0')}`;
    const jitter = (Math.sin(tokenId * 2.7) + 1) * base * 0.4;
    const seed = `${collectionId}-${tokenId}-listed`;
    const listingRand = seededRandom(seed);
    return {
      id: `${collectionId}-${tokenId}`,
      nft,
      price: (base + jitter).toFixed(3),
      seller,
      listedAt: new Date(Date.now() - (i * 3.6e6 + listingRand * 7.2e6)).toISOString(),
      collectionId,
    };
  });
}

export function generateMarketplaceListings(count = 20): Listing[] {
  return Array.from({ length: count }, (_, i) => {
    const col = COLLECTIONS[i % COLLECTIONS.length];
    const tokenId = 100 + i;
    const seller = MOCK_SELLERS[i % MOCK_SELLERS.length];
    const nft = generateMockNFT(tokenId, seller);
    const imgs = COLLECTION_IMAGES[col.id] ?? ['/nft-1.jpg'];
    nft.image = imgs[i % imgs.length];
    nft.name = `${col.name} #${String(tokenId).padStart(4, '0')}`;
    const jitter = (Math.sin(tokenId * 2.7) + 1) * col.floorPrice * 0.4;
    const seed = `all-marketplace-${tokenId}-listed`;
    const listingRand = seededRandom(seed);
    return {
      id: `all-${tokenId}`,
      nft,
      price: (col.floorPrice + jitter).toFixed(3),
      seller,
      listedAt: new Date(Date.now() - (i * 3.6e6 + listingRand * 7.2e6)).toISOString(),
      collectionId: col.id,
    };
  });
}

export function generateTxHistory(address: string): TxRecord[] {
  const actions: TxAction[] = ['Minted', 'Level Up', 'Bought', 'Sold', 'Listed', 'Approved'];
  const statuses: TxStatus[] = ['success', 'success', 'success', 'pending', 'failed', 'success'];
  const amounts = ['', '0.05 ETH', '0.18 ETH', '0.32 ETH', '', '0.08 ETH'];
  return Array.from({ length: 10 }, (_, i) => ({
    id: `tx-${address.slice(2, 8)}-${i}`,
    action: actions[i % actions.length],
    tokenId: i + 1,
    tokenName: `Meebita #${String(i + 1).padStart(4, '0')}`,
    amount: amounts[i % amounts.length] || undefined,
    timestamp: new Date(Date.now() - i * 5.4e6).toISOString(),
    status: statuses[i % statuses.length],
    hash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
  }));
}

export function formatTimeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
