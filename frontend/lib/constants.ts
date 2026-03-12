export const NETWORKS = {
  1: { name: 'Ethereum Mainnet', rpc: 'https://eth.llamarpc.com' },
  11155111: { name: 'Sepolia Testnet', rpc: 'https://sepolia.drpc.org' },
  137: { name: 'Polygon', rpc: 'https://polygon-rpc.com' },
  80001: { name: 'Mumbai Testnet', rpc: 'https://rpc-mumbai.maticvigil.com' },
};

export const NFTERA_CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000';

export const NFTERA_ABI = [
  'function mint(string name) public payable returns (uint256)',
  'function levelUp(uint256 tokenId) public payable',
  'function balanceOf(address owner) public view returns (uint256)',
  'function tokenOfOwnerByIndex(address owner, uint256 index) public view returns (uint256)',
  'function tokenURI(uint256 tokenId) public view returns (string)',
];

export const MINT_PRICE = '0.05'; // ETH
export const LEVEL_UP_PRICE = '0.02'; // ETH
