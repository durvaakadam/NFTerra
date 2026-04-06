// Generate dynamic NFT images based on token properties
import { getEvolutionStage } from './contract';

const STAGE_COLORS = {
  1: { bg: '#FFE8A3', accent: '#FFD700', glow: '#FFA500' },      // Egg - Gold
  2: { bg: '#E8B4FF', accent: '#D946EF', glow: '#A855F7' },       // Creature - Purple
  3: { bg: '#94D82D', accent: '#51CF66', glow: '#2F9E44' },       // Dragon - Green
  4: { bg: '#FF922B', accent: '#FF7C1F', glow: '#D9480F' },       // Phoenix - Orange
  5: { bg: '#C0CCFF', accent: '#6366F1', glow: '#4F46E5' },       // Immortal - Indigo
};

export function generateNFTImageSVG(tokenId: number, level: number): string {
  const stage = getEvolutionStage(level);
  const colors = STAGE_COLORS[level as keyof typeof STAGE_COLORS];
  const hash = tokenId.toString().padStart(4, '0');
  
  // Generate unique pseudo-random values for each token
  const seed1 = (tokenId * 12345) % 1000;
  const seed2 = (tokenId * 67890) % 1000;
  const seed3 = (tokenId * 13579) % 1000;
  const seed4 = (tokenId * 24680) % 1000;
  const seed5 = (tokenId * 98765) % 1000;
  
  const pos1X = 50 + (seed1 % 200);
  const pos1Y = 50 + (seed2 % 150);
  const pos2X = 250 + (seed3 % 150);
  const pos2Y = 250 + (seed4 % 150);
  const rotAngle = seed5 % 360;
  
  const patterns = [
    // Pattern 1: Vertical stripes
    `<defs><pattern id="stripes-${tokenId}" x="0" y="0" width="20" height="400" patternUnits="userSpaceOnUse">
      <rect x="0" y="0" width="10" height="400" fill="${colors.accent}" opacity="0.1"/>
    </pattern></defs>
    <rect width="400" height="400" fill="url(#stripes-${tokenId})" />`,
    
    // Pattern 2: Dots
    `<defs><pattern id="dots-${tokenId}" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
      <circle cx="15" cy="15" r="5" fill="${colors.accent}" opacity="0.15"/>
    </pattern></defs>
    <rect width="400" height="400" fill="url(#dots-${tokenId})" />`,
    
    // Pattern 3: Diagonal lines
    `<defs><pattern id="diag-${tokenId}" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <line x1="0" y1="0" x2="0" y2="40" stroke="${colors.accent}" stroke-width="2" opacity="0.1"/>
    </pattern></defs>
    <rect width="400" height="400" fill="url(#diag-${tokenId})" />`,
    
    // Pattern 4: Hexagons
    `<defs><pattern id="hex-${tokenId}" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
      <polygon points="25,5 45,15 45,35 25,45 5,35 5,15" fill="none" stroke="${colors.accent}" stroke-width="1" opacity="0.12"/>
    </pattern></defs>
    <rect width="400" height="400" fill="url(#hex-${tokenId})" />`,
  ];
  
  const patternIndex = seed1 % patterns.length;
  const selectedPattern = patterns[patternIndex];
  
  const svg = `
    <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bg-${tokenId}" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style="stop-color:${colors.bg};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${colors.accent};stop-opacity:0.8" />
        </radialGradient>
        <filter id="glow-${tokenId}">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      <!-- Background -->
      <rect width="400" height="400" fill="url(#bg-${tokenId})" />
      
      <!-- Pattern overlay -->
      ${selectedPattern}
      
      <!-- Decorative shapes -->
      <circle cx="${pos1X}" cy="${pos1Y}" r="${30 + (seed2 % 30)}" fill="${colors.glow}" opacity="0.2" />
      <circle cx="${pos2X}" cy="${pos2Y}" r="${20 + (seed3 % 40)}" fill="${colors.glow}" opacity="0.15" />
      <rect x="${80 + (seed4 % 100)}" y="${80 + (seed5 % 100)}" width="${60 + (seed1 % 60)}" height="${60 + (seed1 % 60)}" rx="10" fill="${colors.accent}" opacity="0.08" transform="rotate(${rotAngle} ${110 + (seed4 % 100)} ${110 + (seed5 % 100)})" />
      
      <!-- Main NFT Display -->
      <g filter="url(#glow-${tokenId})">
        <!-- Outer rings -->
        <circle cx="200" cy="200" r="140" fill="none" stroke="${colors.glow}" stroke-width="3" opacity="0.6" />
        <circle cx="200" cy="200" r="125" fill="none" stroke="${colors.accent}" stroke-width="2" opacity="0.4" />
        <circle cx="200" cy="200" r="110" fill="none" stroke="${colors.glow}" stroke-width="1" opacity="0.3" />
        
        <!-- Center display -->
        <circle cx="200" cy="200" r="105" fill="${colors.bg}" stroke="${colors.glow}" stroke-width="2" opacity="0.95" />
        
        <!-- Emoji centered -->
        <text x="200" y="220" font-size="110" text-anchor="middle" dominant-baseline="central" font-family="Arial">
          ${['🥚', '👹', '🐉', '🔥', '✨'][level - 1]}
        </text>
      </g>
      
      <!-- Top label -->
      <text x="200" y="30" font-size="26" font-weight="900" text-anchor="middle" fill="${colors.glow}" letter-spacing="2">
        ${stage.name.toUpperCase()}
      </text>
      
      <!-- Level indicator -->
      <rect x="130" y="330" width="140" height="50" rx="10" fill="${colors.accent}" stroke="${colors.glow}" stroke-width="2" opacity="0.95" />
      <text x="200" y="365" font-size="22" font-weight="900" text-anchor="middle" dominant-baseline="central" fill="white">
        LV ${level}/5
      </text>
      
      <!-- Token ID corner -->
      <text x="20" y="30" font-size="11" font-family="monospace" font-weight="bold" fill="${colors.glow}" opacity="0.7">
        #${hash}
      </text>
      
      <!-- Rarity indicator -->
      <rect x="360" y="15" width="20" height="20" rx="4" fill="${[
        '#6366F1', // common
        '#06B6D4', // rare
        '#F59E0B'  // legendary
      ][tokenId % 3]}" opacity="0.9" />
      
      <!-- Unique identifier based on token -->
      <text x="200" y="385" font-size="9" font-family="monospace" fill="${colors.glow}" opacity="0.5" text-anchor="middle">
        ID: ${tokenId.toString().padStart(4, '0')}
      </text>
    </svg>
  `;
  
  // Properly encode SVG with Unicode characters (emojis)
  const encodedSvg = typeof window !== 'undefined'
    ? btoa(unescape(encodeURIComponent(svg)))
    : Buffer.from(svg).toString('base64');
  
  return `data:image/svg+xml;base64,${encodedSvg}`;
}

export function getNFTImageData(tokenId: number, level: number): string {
  // Return SVG data URI for dynamic generation
  return generateNFTImageSVG(tokenId, level);
}
