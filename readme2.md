# NFTerra – Dynamic NFT Project

Dynamic ERC-721 NFT where each token has an on-chain **level** that can be minted and upgraded.

**Stack:** Solidity · Hardhat · OpenZeppelin · Node.js

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

# Compile contracts
npx hardhat compile

# Start local blockchain (keep this running)
npx hardhat node

# Deploy contract
npx hardhat run scripts/deploy.js --network localhost

# Open interactive console
npx hardhat console --network localhost
```

### Console interactions

```js
const NFT = await ethers.getContractFactory("DynamicNFT")
const nft = await NFT.attach("<DEPLOYED_ADDRESS>")

await nft.mintNFT("ipfs://example-metadata")   // Mint
await nft.levels(0)                             // Check level → 1
await nft.levelUp(0)                            // Level up
await nft.levels(0)                             // Check level → 2
```

---

npx hardhat run scripts/deploy.js --network localhost
node deploy-simple.mjs
Stop-Process -Id 4452 -Force