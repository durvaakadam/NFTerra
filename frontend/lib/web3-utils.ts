// Format wallet address to short form: 0x1234...5678
export function formatAddress(address: string | null): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Parse NFT metadata from tokenURI
export function parseNFTMetadata(jsonString: string) {
  try {
    return JSON.parse(jsonString);
  } catch {
    return null;
  }
}

// Get evolution stage based on level
export function getEvolutionStage(level: number): string {
  const stages = ['Egg', 'Creature', 'Dragon', 'Phoenix', 'Immortal'];
  return stages[Math.min(level - 1, stages.length - 1)];
}

// Get rarity based on token ID hash
export function getRarity(tokenId: number): 'common' | 'rare' | 'legendary' {
  const rarityHash = tokenId % 100;
  if (rarityHash < 70) return 'common';
  if (rarityHash < 95) return 'rare';
  return 'legendary';
}

// Get rarity color
export function getRarityColor(rarity: 'common' | 'rare' | 'legendary'): string {
  const colors = {
    common: 'from-gray-400 to-gray-600',
    rare: 'from-blue-400 to-blue-600',
    legendary: 'from-yellow-400 to-yellow-600',
  };
  return colors[rarity];
}

// Get rarity badge color
export function getRarityBadgeColor(rarity: 'common' | 'rare' | 'legendary'): string {
  const colors = {
    common: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
    rare: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    legendary: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  };
  return colors[rarity];
}

// Check if address is valid
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}
