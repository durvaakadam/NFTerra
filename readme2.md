# NFTerra – Dynamic NFT Project

Dynamic ERC-721 NFT where each token has an on-chain **level** that can be minted and upgraded.

**Stack:** Solidity · Ganache · OpenZeppelin · Node.js · ethers.js

---

## Project Structure

```
contracts/DynamicNFT.sol   – Smart contract
scripts/deploy.js          – Deployment script
frontend/                  – Frontend (WIP)
assets/images, metadata/   – NFT assets
```

---

## Contract Functions

| Function | Description |
| -------- | ----------- |
| `mintNFT(tokenURI)` | Mint a new NFT |
| `levelUp(tokenId)` | Increase NFT level |
| `levels(tokenId)` | Get current level |

---

## Commands

```bash
# Install dependencies
npm install

# Start local blockchain (Ganache app or CLI)
# RPC: http://127.0.0.1:7545
# Chain ID: 5777

# Deploy contract to Ganache
node deploy-simple.mjs
npx hardhat run scripts/deploy.js --network ganache
```

### Console interactions

```js
import { ethers } from "ethers"
import artifact from "./artifacts/contracts/DynamicNFT.sol/DynamicNFT.json" assert { type: "json" }

const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545")
const signer = await provider.getSigner(0)
const nft = new ethers.Contract("<DEPLOYED_ADDRESS>", artifact.abi, signer)

await nft.mintNFT("ipfs://example-metadata")   // Mint
await nft.levels(0)                             // Check level → 1
await nft.levelUp(0)                            // Level up
await nft.levels(0)                             // Check level → 2
```

---

npx hardhat run scripts/deploy.js --network localhost
node deploy-simple.mjs
Stop-Process -Id 4452 -Force