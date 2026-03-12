import { getRarity } from './web3-utils';

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
  const level = Math.min(1 + Math.floor(Math.random() * 5), 5);
  
  const stages = ['Rookie', 'Explorer', 'Warrior', 'Champion', 'Legend'];
  const stageImages = ['/nft-1.jpg', '/nft-3.jpg', '/nft-5.jpg', '/nft-7.jpg', '/nft-2.jpg'];
  const extraImages = ['/nft-4.jpg', '/nft-6.jpg', '/nft-8.jpg'];
  const stage = stages[level - 1];
  // Rotate through variety images for same-level NFTs
  const imgVariant = tokenId % 2 === 0 && level <= 3 ? extraImages[(tokenId % 3)] : stageImages[level - 1];
  const attributes = [
    { trait_type: 'Stage', value: stage },
    { trait_type: 'Level', value: level },
    { trait_type: 'Rarity', value: rarity },
    { trait_type: 'Experience', value: Math.floor(Math.random() * 1000) },
  ];

  return {
    tokenId,
    name: `Meebita #${String(tokenId).padStart(4, '0')}`,
    level,
    image: imgVariant,
    rarity,
    owner,
    lastLevelUp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
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
