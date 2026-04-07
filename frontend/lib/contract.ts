import { ethers, BrowserProvider, Contract, id, toBigInt } from 'ethers';

// Extend Window interface for ethereum
declare global {
  interface Window {
    ethereum?: any;
  }
}

// Contract address - configurable via environment variable
export const CONTRACT_ADDRESS = 
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || 
  "0xdf422bcC7C112bc1bf3aC8fC8346D0bC0a70fbc9";

// Full ABI for DynamicNFT contract
export const CONTRACT_ABI = [
  // Read functions
  "function tokenCounter() public view returns (uint256)",
  "function levels(uint256 tokenId) public view returns (uint256)",
  "function ownerOf(uint256 tokenId) public view returns (address)",
  "function balanceOf(address owner) public view returns (uint256)",
  "function tokenURI(uint256 tokenId) public view returns (string)",
  "function name() public view returns (string)",
  "function symbol() public view returns (string)",
  "function mintPrice() public view returns (uint256)",
  "function levelUpPrice() public view returns (uint256)",
  
  // Write functions
  "function mintNFT(string memory tokenURI) public payable",
  "function levelUp(uint256 tokenId) public payable",
  
  // Events
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
];

// Evolution stages mapping
export const EVOLUTION_STAGES = [
  { level: 1, name: 'Egg', emoji: '🥚', description: 'A mysterious egg with untapped potential' },
  { level: 2, name: 'Creature', emoji: '👹', description: 'Hatched! A young creature emerges' },
  { level: 3, name: 'Dragon', emoji: '🐉', description: 'Growing stronger, scales hardening' },
  { level: 4, name: 'Phoenix', emoji: '🔥', description: 'Reborn in flames, nearly immortal' },
  { level: 5, name: 'Immortal', emoji: '✨', description: 'Maximum evolution achieved' },
];

export function getEvolutionStage(level: number) {
  const stageIndex = Math.min(level - 1, EVOLUTION_STAGES.length - 1);
  return EVOLUTION_STAGES[Math.max(0, stageIndex)];
}

// Get provider from window.ethereum
export function getProvider(): BrowserProvider | null {
  if (typeof window === 'undefined' || !window.ethereum) {
    return null;
  }
  try {
    return new BrowserProvider(window.ethereum);
  } catch (error) {
    console.error('Failed to create provider:', error);
    return null;
  }
}

// Get signer for write operations
export async function getSigner() {
  const provider = getProvider();
  if (!provider) {
    throw new Error('MetaMask is not installed');
  }
  
  try {
    console.log('🔐 Requesting signer from MetaMask...');
    const signer = await provider.getSigner();
    console.log('✅ Signer obtained:', await signer.getAddress());
    return signer;
  } catch (error: any) {
    console.error('❌ getSigner error:', error);
    
    if (error.code === 'NETWORK_ERROR') {
      throw new Error('Cannot connect to blockchain network. Make sure Hardhat node is running or switch to the correct network in MetaMask.');
    }
    
    if (error.message?.includes('window.ethereum') || error.message?.includes('not available')) {
      throw new Error('MetaMask is not connected. Please open MetaMask and try again.');
    }
    
    throw error;
  }
}

// Get contract instance for read operations
export async function getReadOnlyContract(): Promise<Contract | null> {
  const provider = getProvider();
  if (!provider) {
    return null;
  }
  return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
}

// Get contract instance for write operations
export async function getWriteContract(): Promise<Contract> {
  const signer = await getSigner();
  return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
}

// Generate token URI metadata
export function generateTokenURI(name: string, level: number = 1): string {
  const stage = getEvolutionStage(level);
  const metadata = {
    name: name,
    description: `A Dynamic NFT from NFTerra. Currently at ${stage.name} stage (Level ${level}).`,
    image: `https://api.nfterra.io/images/${stage.name.toLowerCase()}.png`,
    attributes: [
      { trait_type: 'Level', value: level },
      { trait_type: 'Stage', value: stage.name },
      { trait_type: 'Evolution', value: `${level}/5` },
    ],
  };
  
  // Encode as base64 data URI
  const jsonStr = JSON.stringify(metadata);
  const base64 = typeof window !== 'undefined' 
    ? window.btoa(unescape(encodeURIComponent(jsonStr)))
    : Buffer.from(jsonStr).toString('base64');
  
  return `data:application/json;base64,${base64}`;
}

// Contract interaction functions

export interface NFTData {
  tokenId: number;
  name: string;
  level: number;
  stage: string;
  owner: string;
  tokenURI: string;
}

// Mint a new NFT
export async function mintNFT(name: string): Promise<{ tokenId: number; txHash: string }> {
  try {
    const contract = await getWriteContract();
    const tokenURI = generateTokenURI(name);
    
    const tx = await contract.mintNFT(tokenURI, {
      value: ethers.parseEther("0.05")
    });
    const receipt = await tx.wait();
  
  // Get token ID from event
  const transferEvent = receipt.logs.find(
    (log: any) => log.topics[0] === id("Transfer(address,address,uint256)")
  );
  
  let tokenId = 0;
  if (transferEvent) {
    tokenId = Number(toBigInt(transferEvent.topics[3]));
  } else {
    // Fallback: read tokenCounter
    const counter = await contract.tokenCounter();
    tokenId = Number(counter) - 1;
  }
  
    return { tokenId, txHash: receipt.hash };
  } catch (error: any) {
    console.error('Mint error:', error);
    
    // Network connection errors
    if (error.code === 'NETWORK_ERROR' || error.message?.includes('Failed to fetch')) {
      throw new Error('Cannot connect to blockchain. Please ensure:\n1. Hardhat node is running (npx hardhat node)\n2. MetaMask is connected to localhost:8545\n3. Chain ID is 31337');
    }
    
    // User rejection
    if (error.code === 'ACTION_REJECTED') {
      throw new Error('Transaction rejected by user');
    }
    
    // Insufficient funds
    if (error.code === 'INSUFFICIENT_FUNDS') {
      throw new Error('Insufficient funds to complete transaction');
    }
    
    throw error;
  }
}

// Level up an NFT
export async function levelUpNFT(tokenId: number): Promise<{ newLevel: number; txHash: string }> {
  try {
    const contract = await getWriteContract();
    const signer = await getSigner();
    const userAddress = await signer.getAddress();
    
    // Pre-flight check: Verify NFT exists on the contract
    let owner: string;
    try {
      owner = await contract.ownerOf(tokenId);
    } catch (err: any) {
      // Token doesn't exist - likely contract was redeployed or state was reset
      throw new Error(
        `not found on contract: NFT #${tokenId} doesn't exist on blockchain. ` +
        `This happens when the contract is redeployed or the chain is reset.`
      );
    }
    
    // Verify user owns the NFT
    if (owner.toLowerCase() !== userAddress.toLowerCase()) {
      throw new Error(`You do not own NFT #${tokenId}. Current owner: ${owner}`);
    }
    
    // Pre-flight check: Verify user has enough balance
    const balance = await signer.provider?.getBalance(userAddress);
    const currentLevel = await contract.levels(tokenId);
    const levelUpPrice = await contract.levelUpPrice();
    
    if (balance && balance < (levelUpPrice + ethers.parseEther("0.001"))) { // 0.001 ETH buffer for gas
      const balanceETH = ethers.formatEther(balance);
      const costETH = ethers.formatEther(levelUpPrice);
      throw new Error(`Insufficient balance. You have ${balanceETH} ETH but need at least ${costETH} ETH + gas fees`);
    }
    
    // Pre-flight check: Verify NFT is not at max level
    if (currentLevel >= 5) {
      throw new Error('NFT is already at maximum level (5)');
    }
    
    const tx = await contract.levelUp(tokenId, {
      value: ethers.parseEther("0.02")
    });
    const receipt = await tx.wait();
    
    if (!receipt) {
      throw new Error('Transaction failed - no receipt returned');
    }
    
    // Read new level
    const newLevel = await contract.levels(tokenId);
    
    return { newLevel: Number(newLevel), txHash: receipt.hash };
  } catch (error: any) {
    console.error('Level up error:', error);
    
    // Network connection errors
    if (error.code === 'NETWORK_ERROR' || error.message?.includes('Failed to fetch')) {
      throw new Error('Cannot connect to blockchain. Please ensure Hardhat node is running and MetaMask is connected.');
    }
    
    // User rejection
    if (error.code === 'ACTION_REJECTED') {
      throw new Error('Transaction rejected by user');
    }
    
    // Insufficient funds
    if (error.code === 'INSUFFICIENT_FUNDS') {
      throw new Error('Insufficient funds to complete level up transaction');
    }
    
    // Contract revert errors
    if (error.message?.includes('execution reverted') || error.message?.includes('revert')) {
      // Try to extract custom error message if available
      if (error.message?.includes('Not the owner')) {
        throw new Error('You are not the owner of this NFT');
      }
      if (error.message?.includes('Insufficient payment')) {
        throw new Error('Insufficient payment for level up (requires 0.02 ETH)');
      }
      throw new Error(`Transaction failed: ${error.reason || error.message || 'Unknown revert'}`);
    }
    
    // Re-throw with better message if it's our custom error
    if (error.message?.includes('You do not own') || 
        error.message?.includes('Insufficient balance') || 
        error.message?.includes('maximum level')) {
      throw error;
    }
    
    throw new Error(`Level up failed: ${error.message || 'Unknown error'}`);
  }
}

// Get NFT level
export async function getNFTLevel(tokenId: number): Promise<number> {
  const contract = await getReadOnlyContract();
  if (!contract) return 1;
  
  const level = await contract.levels(tokenId);
  return Number(level);
}

// Get NFT owner
export async function getNFTOwner(tokenId: number): Promise<string | null> {
  const contract = await getReadOnlyContract();
  if (!contract) return null;
  
  try {
    return await contract.ownerOf(tokenId);
  } catch {
    return null;
  }
}

// Get total minted NFTs
export async function getTotalMinted(): Promise<number> {
  const contract = await getReadOnlyContract();
  if (!contract) return 0;
  
  const counter = await contract.tokenCounter();
  return Number(counter);
}

// Get all NFTs owned by address
export async function getNFTsByOwner(ownerAddress: string): Promise<NFTData[]> {
  const contract = await getReadOnlyContract();
  if (!contract) return [];
  
  const totalMinted = await getTotalMinted();
  const ownedNFTs: NFTData[] = [];
  let skippedCount = 0;
  
  for (let tokenId = 0; tokenId < totalMinted; tokenId++) {
    try {
      const owner = await contract.ownerOf(tokenId);
      
      if (owner.toLowerCase() === ownerAddress.toLowerCase()) {
        const level = await contract.levels(tokenId);
        const tokenURI = await contract.tokenURI(tokenId);
        const stage = getEvolutionStage(Number(level));
        
        // Parse name from tokenURI if possible
        let name = `NFTerra #${tokenId}`;
        try {
          if (tokenURI.startsWith('data:application/json;base64,')) {
            const base64 = tokenURI.replace('data:application/json;base64,', '');
            const json = JSON.parse(atob(base64));
            name = json.name || name;
          }
        } catch {
          // Keep default name
        }
        
        ownedNFTs.push({
          tokenId,
          name,
          level: Number(level),
          stage: stage.name,
          owner,
          tokenURI,
        });
      }
    } catch (err: any) {
      // Token doesn't exist or error reading - skip it
      // This can happen if: contract was redeployed, token burned, or counter is stale
      skippedCount++;
      continue;
    }
  }
  
  // If we skipped a lot of tokens, log a warning
  if (skippedCount > totalMinted * 0.5) {
    console.warn(
      `⚠️  Warning: ${skippedCount}/${totalMinted} tokens are invalid. ` +
      `This usually means the contract was redeployed or the blockchain was reset. ` +
      `Found ${ownedNFTs.length} valid NFTs.`
    );
  }
  
  return ownedNFTs;
}

// Marketplace transactions - send ETH for purchases/listings
export async function sendMarketplaceTransaction(amountETH: string): Promise<{ txHash: string }> {
  try {
    // Validate amount
    const amount = parseFloat(amountETH);
    if (isNaN(amount) || amount <= 0) {
      throw new Error('Invalid transaction amount. Must be greater than 0.');
    }

    console.log('📤 Getting signer for transaction...');
    const signer = await getSigner();
    const userAddress = await signer.getAddress();
    console.log('✅ Signer ready:', userAddress);
    
    // Validate user has sufficient balance
    console.log('🔍 Checking balance...');
    const balance = await signer.provider?.getBalance(userAddress);
    const amountWei = ethers.parseEther(amountETH);
    
    if (balance && balance < amountWei) {
      const balanceETH = ethers.formatEther(balance);
      throw new Error(`Insufficient balance. You have ${balanceETH} ETH but need ${amountETH} ETH`);
    }
    
    console.log('✅ Balance OK. Sending transaction...');

    // Send transaction - this will trigger MetaMask dialog
    console.log('📝 Requesting signature from MetaMask...');
    const tx = await signer.sendTransaction({
      to: CONTRACT_ADDRESS,
      value: amountWei,
    });
    
    console.log('⏳ Waiting for transaction confirmation...');
    const receipt = await tx.wait();
    
    if (!receipt) {
      throw new Error('Transaction failed - no receipt returned');
    }
    
    console.log('✅ Transaction confirmed:', receipt.hash);
    return { txHash: receipt.hash };
  } catch (error: any) {
    console.error('❌ Marketplace transaction error:', error);
    
    // User rejection
    if (error.code === 'ACTION_REJECTED') {
      throw new Error('Transaction rejected by user');
    }
    
    // Network errors
    if (error.code === 'NETWORK_ERROR') {
      throw new Error('Network error. Make sure your Hardhat/Ganache node is running and MetaMask is connected.');
    }
    
    throw error;
  }
}
