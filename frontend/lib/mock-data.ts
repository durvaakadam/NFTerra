import { getRarity } from './web3-utils';

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

export interface NFTAttribute {
  trait_type: string;
  value: string | number;
}

export interface NFT {
  tokenId: number;
  name: string;
  level: number;
  image: string;
  rarity: 'common' | 'rare' | 'legendary';
  owner: string;
  lastLevelUp: string;
  attributes?: NFTAttribute[];
  metadata?: {
    description: string;
    attributes: NFTAttribute[];
  };
}

export interface EvolutionStage {
  level: number;
  name: string;
  description: string;
  image: string;
  requirements: string;
  emoji: string;
}

export const EVOLUTION_STAGES: EvolutionStage[] = [
  {
    level: 1,
    name: 'Rookie',
    description: 'A fresh voxel character just entering the NFTerra world. Brimming with untapped potential.',
    image: '/nft-1.jpg',
    requirements: 'Starting stage',
    emoji: '🥚',
  },
  {
    level: 2,
    name: 'Explorer',
    description: 'Gaining experience and style. Your character has developed a distinct personality and look.',
    image: '/nft-3.jpg',
    requirements: 'Level 1 + 100 XP',
    emoji: '👹',
  },
  {
    level: 3,
    name: 'Warrior',
    description: 'Battle-hardened and street-ready. A formidable presence in any collection.',
    image: '/nft-5.jpg',
    requirements: 'Level 2 + 250 XP',
    emoji: '🐉',
  },
  {
    level: 4,
    name: 'Champion',
    description: 'Elite status achieved. Only the most dedicated collectors reach this stage.',
    image: '/nft-7.jpg',
    requirements: 'Level 3 + 500 XP',
    emoji: '🔥',
  },
  {
    level: 5,
    name: 'Legend',
    description: 'The pinnacle of NFTerra evolution. Iconic, rare, and eternally valuable.',
    image: '/nft-2.jpg',
    requirements: 'Level 4 + 1000 XP',
    emoji: '✨',
  },
];

// Mock NFT data generator
export function generateMockNFT(tokenId: number, owner: string): NFT {
  const rarity = getRarity(tokenId);
  
  // Use seeded random based on tokenId + owner for deterministic generation
  const seed = `${tokenId}-${owner}`;
  const levelRand = seededRandom(seed);
  const level = Math.min(1 + Math.floor(levelRand * 5), 5);
  
  const stages = ['Rookie', 'Explorer', 'Warrior', 'Champion', 'Legend'];
  const stageImages = ['/nft-1.jpg', '/nft-3.jpg', '/nft-5.jpg', '/nft-7.jpg', '/nft-2.jpg'];
  const extraImages = ['/nft-4.jpg', '/nft-6.jpg', '/nft-8.jpg'];
  const stage = stages[level - 1];
  // Rotate through variety images for same-level NFTs
  const imgVariant = tokenId % 2 === 0 && level <= 3 ? extraImages[(tokenId % 3)] : stageImages[level - 1];
  
  // Use seeded random for experience
  const expSeed = `${tokenId}-${owner}-exp`;
  const experience = Math.floor(seededRandom(expSeed) * 1000);
  
  // Use seeded random for lastLevelUp date
  const dateSeed = `${tokenId}-${owner}-date`;
  const daysAgo = Math.floor(seededRandom(dateSeed) * 30);
  const lastLevelUp = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
  
  const attributes = [
    { trait_type: 'Stage', value: stage },
    { trait_type: 'Level', value: level },
    { trait_type: 'Rarity', value: rarity },
    { trait_type: 'Experience', value: experience },
  ];

  return {
    tokenId,
    name: `Meebita #${String(tokenId).padStart(4, '0')}`,
    level,
    image: imgVariant,
    rarity,
    owner,
    lastLevelUp,
    attributes,
    metadata: {
      description: `A ${rarity} ${stage} NFT in the NFTerra ecosystem. Level ${level}/5.`,
      attributes,
    },
  };
}

// Generate mock collection for user
export function generateMockCollection(owner: string, count: number = 5): NFT[] {
  return Array.from({ length: count }, (_, i) => generateMockNFT(i + 1, owner));
}
