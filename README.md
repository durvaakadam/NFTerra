# NFTerra – Dynamic NFT Project

A blockchain project that demonstrates **Dynamic NFTs** using Solidity, Hardhat, and OpenZeppelin.

Dynamic NFTs are NFTs whose **metadata or attributes can change over time**.
In this project, each NFT has a **level** that can increase using a smart contract function.

---

# Project Overview

This project implements a **Dynamic ERC-721 NFT** where:

* Users can **mint NFTs**
* Each NFT has a **level stored on-chain**
* Users can **increase the level**
* The level can later be used to **change metadata or artwork**

Example concept:

| Token ID | Level |
| -------- | ----- |
| 0        | 1     |
| 1        | 3     |
| 2        | 5     |

Future upgrades can map levels to **different images or metadata**.

---

# Tech Stack

* **Solidity** – Smart contract programming
* **Hardhat** – Ethereum development environment
* **OpenZeppelin** – Secure ERC-721 implementation
* **Node.js + NPM** – Package management
* **Local Hardhat Network** – Local blockchain for testing

---

# Project Structure

```
NFTerra
│
├── contracts
│   └── DynamicNFT.sol
│
├── scripts
│   └── deploy.js
│
├── frontend
│
├── assets
│   ├── images
│   └── metadata
│
├── hardhat.config.js
├── package.json
└── README.md
```

---

# Smart Contract

`contracts/DynamicNFT.sol`

Key features:

* Inherits **ERC721URIStorage**
* Allows minting NFTs
* Stores NFT level using mapping
* Allows level upgrades

Core functions:

```
mintNFT(string memory tokenURI)
```

Mints a new NFT.

```
levelUp(uint256 tokenId)
```

Increases the level of an NFT.

```
levels[tokenId]
```

Returns the current level.

---

# Environment Setup

Initialize Node project

```
npm init -y
```

Install Hardhat

```
npm install --save-dev hardhat
```

Install Hardhat ethers plugin

```
npm install --save-dev @nomiclabs/hardhat-ethers ethers
```

Install OpenZeppelin contracts

```
npm install @openzeppelin/contracts
```

---

# Hardhat Configuration

`hardhat.config.js`

```
require("@nomiclabs/hardhat-ethers");

module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      evmVersion: "cancun"
    }
  }
};
```

---

# Compile Smart Contracts

```
npx hardhat compile
```

Output:

```
Compiled Solidity files successfully
```

---

# Start Local Blockchain

Run a local Ethereum network:

```
npx hardhat node
```

This generates:

* 20 test accounts
* 10000 ETH per account
* Local RPC server

```
http://127.0.0.1:8545
```

---

# Deploy Smart Contract

Deploy the contract to the local blockchain:

```
npx hardhat run scripts/deploy.js --network localhost
```

Example output:

```
Deploying contract...
DynamicNFT deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

This address is where the **smart contract lives on the blockchain**.

---

# Interacting with the Contract

Open Hardhat console:

```
npx hardhat console --network localhost
```

Get contract factory

```
const NFT = await ethers.getContractFactory("DynamicNFT")
```

Attach to deployed contract

```
const nft = await NFT.attach("0x5FbDB2315678afecb367f032d93F642f64180aa3")
```

Mint NFT

```
await nft.mintNFT("ipfs://example-metadata")
```

Check NFT level

```
await nft.levels(0)
```

Output:

```
1
```

Level up NFT

```
await nft.levelUp(0)
```

Check level again

```
await nft.levels(0)
```

Output:

```
2
```

---

# What Has Been Achieved

So far the project has successfully:

* Created a **Hardhat blockchain environment**
* Written a **Solidity Dynamic NFT contract**
* Installed **OpenZeppelin ERC721 library**
* Compiled smart contracts
* Started a **local Ethereum network**
* Deployed the smart contract
* Minted NFTs
* Updated NFT levels

This demonstrates **on-chain dynamic state for NFTs**.

---

# Future Improvements

Next features that can be added:

* Dynamic metadata linked to NFT level
* Different NFT images per level
* Frontend interface using React
* IPFS storage for metadata
* Wallet connection using MetaMask
* Automatic evolution logic

Example:

```
Level 1 → egg.png
Level 2 → creature.png
Level 3 → dragon.png
```

---

# Author

NFTerra – Dynamic NFT Blockchain Project
