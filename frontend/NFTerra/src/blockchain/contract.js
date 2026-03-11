import { ethers } from "ethers";

export const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export const CONTRACT_ABI = [
  "function mintNFT(string memory tokenURI) public",
  "function levelUp(uint256 tokenId) public",
  "function levels(uint256 tokenId) public view returns(uint256)",
  "function tokenCounter() public view returns(uint256)",
];

// Get a provider + signer from MetaMask
export async function getSigner() {
  const provider = new ethers.BrowserProvider(window.ethereum);
  return provider.getSigner();
}

// Get contract instance connected to signer
export async function getContract() {
  const signer = await getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
}

// Read-only contract (no signer needed)
export async function getReadOnlyContract() {
  const provider = new ethers.BrowserProvider(window.ethereum);
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
}
