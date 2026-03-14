# NFTerra – Dynamic NFT Evolution Platform

A modern, visually impressive Web3 dApp interface built with Next.js 16, React, Tailwind CSS, ethers.js, and MetaMask integration. NFTerra showcases Dynamic NFTs that evolve across 5 stages: Egg → Creature → Dragon → Phoenix → Immortal.

## Features

### 🎨 Design System
- **Dark-Theme Web3 Aesthetic**: Deep purples, cyans, and electric blues with glassmorphism effects
- **Glowing Gradients**: Neon-inspired gradient overlays and glow effects throughout
- **Smooth Animations**: Page transitions, hover effects, and interactive micro-interactions
- **Responsive Layout**: Mobile-first design that adapts seamlessly to all screen sizes

### 🔗 Web3 Integration
- **MetaMask Connection**: Easy wallet connection via ethers.js BrowserProvider
- **Wallet Context**: React Context API for managing wallet state globally
- **Contract Interactions**: Mock contract ABIs ready for smart contract integration
- **Transaction Feedback**: Real-time status updates during blockchain actions

### 📄 Multi-Page Interface
1. **Landing Page** (`/landing`)
   - Hero section with animated gradient background
   - Feature highlights showcasing platform benefits
   - Evolution journey showcase with all 5 stages
   - Getting started guide for new users

2. **Dashboard** (`/dashboard`)
   - Connected wallet display with formatted address
   - NFT collection grid with statistics (total NFTs, value, average level)
   - NFT cards showing level, rarity, and quick actions
   - Level-up functionality with loading states

3. **NFT Detail** (`/nft/[id]`)
   - Large NFT preview with rarity indicator
   - Comprehensive metadata panel (owner, token ID, level, attributes)
   - Evolution timeline showing all progression stages
   - Action buttons for leveling up, sharing, and viewing on Etherscan

4. **Mint Page** (`/mint`)
   - Interactive mint form with optional naming
   - Live preview card showing NFT appearance
   - Cost breakdown (mint price + gas estimate)
   - Transaction feedback modal with success/error states
   - FAQ section explaining the minting process

5. **Evolution Gallery** (`/gallery`)
   - Rarity-based tabs (Common, Rare, Legendary)
   - All 5 evolution stages displayed with descriptions
   - Evolution timeline showing the complete progression path
   - Platform statistics and rarity information

### 🎯 Shared Components
- **Navbar**: Sticky navigation with wallet button and active route highlighting
- **GlassCard**: Reusable glassmorphic component with hover animations
- **WalletButton**: MetaMask connection/disconnection UI
- **LoadingSpinner**: Animated dual-ring spinner with custom colors
- **NFTCard**: Individual NFT display with level progress and actions
- **NFTGrid**: Responsive grid layout for NFT collections
- **Footer**: Comprehensive footer with links and social media

## Project Structure

```
app/
  ├─ layout.tsx (RootLayout with WalletProvider)
  ├─ globals.css (Web3 theme with custom animations)
  ├─ page.tsx (redirect to /landing)
  ├─ landing/page.tsx
  ├─ dashboard/page.tsx
  ├─ nft/[id]/page.tsx
  ├─ mint/page.tsx
  └─ gallery/page.tsx

components/
  ├─ shared/
  │  ├─ Navbar.tsx
  │  ├─ Footer.tsx
  │  ├─ WalletButton.tsx
  │  ├─ GlassCard.tsx
  │  └─ LoadingSpinner.tsx
  ├─ nft/
  │  ├─ NFTCard.tsx
  │  ├─ NFTGrid.tsx
  │  └─ NFTDetailComponents.tsx
  ├─ landing/
  │  ├─ HeroSection.tsx
  │  ├─ FeaturesSection.tsx
  │  ├─ EvolutionShowcase.tsx
  │  └─ GetStartedGuide.tsx
  └─ mint/
     └─ MintComponents.tsx

lib/
  ├─ context/
  │  └─ WalletContext.tsx (Wallet state management)
  ├─ constants.ts (Network configs, contract ABIs)
  ├─ web3-utils.ts (Address formatting, rarity helpers)
  └─ mock-data.ts (Mock NFTs, evolution stages, data generators)
```

## Color Palette

- **Primary**: Purple/Violet (#A855F7)
- **Secondary**: Cyan/Teal (#06B6D4)
- **Background**: Deep Dark (#0F172A)
- **Accent Glows**: Electric Blue (#00D9FF), Magenta (#FF006E)

## Technologies

- **Framework**: Next.js 16 with React 19.2
- **Styling**: Tailwind CSS v4 with custom theme
- **Web3**: ethers.js v6 with MetaMask integration
- **Components**: shadcn/ui with Radix UI
- **Icons**: Lucide React
- **Animations**: CSS keyframes + Tailwind utilities

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```
   
3. **Open in Browser**
   Navigate to `http://localhost:3000`

4. **Connect Wallet**
   Click "Connect Wallet" and approve MetaMask connection

5. **Local Chain (Ganache)**
   Use Ganache at `http://127.0.0.1:7545` with Chain ID `5777` for local testing.

## Customization

### Update Contract Address
Edit `/lib/constants.ts` and replace `NFTERA_CONTRACT_ADDRESS` with your actual contract address.

### Add Real Contract Integration
- Replace mock data in dashboard/mint with actual contract calls
- Update `useWallet` hook to interact with deployed smart contract
- Implement proper error handling for contract failures

### Modify Color Scheme
Update the color variables in `app/globals.css` `:root` section to match your brand colors.

## Mock Data

The app includes comprehensive mock data generators:
- `generateMockNFT(tokenId, owner)` - Creates individual NFT
- `generateMockCollection(owner, count)` - Creates NFT collection
- Rarity assignment based on token ID hash
- Evolution stages based on NFT level

## Key Features Implemented

✅ Responsive grid layouts (mobile, tablet, desktop)  
✅ Glassmorphism design system with backdrop blur  
✅ Glowing gradient animations and effects  
✅ Smooth page transitions and micro-interactions  
✅ MetaMask wallet integration with error handling  
✅ Mock NFT data with realistic attributes  
✅ Evolution timeline visualizations  
✅ Loading states and transaction feedback  
✅ Accessible components with proper ARIA labels  
✅ Dark theme optimized for Web3 aesthetic  

## Future Enhancements

- Connect to real smart contracts
- Implement actual transaction functionality
- Add marketplace/trading features
- Implement user profiles and collections
- Add leaderboards for top evolvers
- Social features (gifting, trading NFTs)
- IPFS integration for NFT metadata
- Real-time price feeds from DEXs

## License

MIT License - Feel free to use this template for your Web3 projects!


npx hardhat run scripts/deploy.js --network localhost
node deploy-simple.mjs
Stop-Process -Id 4452 -Force