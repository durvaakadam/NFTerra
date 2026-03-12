# NFTerra Frontend Setup

## Prerequisites

- Node.js 18+ and npm/pnpm installed
- MetaMask browser extension

## Quick Start Guide

### 1. Install Dependencies

**Project Root (Hardhat):**
```bash
cd c:\PROJECTS\NFTerra
npm install --save-dev hardhat @nomicfoundation/hardhat-ethers ethers @openzeppelin/contracts
```

**Frontend:**
```bash
cd frontend
pnpm install
```

### 2. Start Local Blockchain (Hardhat Node)

Open a terminal in the project root and run:
```bash
npx hardhat node
```

This will:
- Start a local blockchain at `http://127.0.0.1:8545`
- Create test accounts with ETH
- Keep running (don't close this terminal)

### 2. Deploy the Contract

Open another terminal and deploy:
```bash
npx hardhat run scripts/deploy.js --network localhost
```

Copy the deployed contract address from the output.

### 3. Configure Frontend

Create `.env.local` in the frontend folder:
```bash
cd frontend
cp .env.local.example .env.local
```

Edit `.env.local` and update the contract address:
```env
NEXT_PUBLIC_CONTRACT_ADDRESS=<your-deployed-address>
NEXT_PUBLIC_CHAIN_ID=31337
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:8545
```

### 4. Configure MetaMask

1. **Add Localhost Network:**
   - Open MetaMask
   - Click network dropdown → "Add Network" → "Add a network manually"
   - Fill in:
     - Network Name: `Hardhat Local`
     - RPC URL: `http://127.0.0.1:8545`
     - Chain ID: `31337`
     - Currency Symbol: `ETH`

2. **Import Test Account:**
   - Copy a private key from Hardhat node output
   - MetaMask → Account menu → "Add account or hardware wallet" → "Import account"
   - Paste private key

### 5. Start Frontend

```bash
cd frontend
pnpm dev
```

Visit `http://localhost:3000`

## Troubleshooting

### "Failed to fetch" Error
- ✅ Hardhat node is running (`npx hardhat node`)
- ✅ MetaMask is connected to Hardhat Local network
- ✅ Contract address in `.env.local` matches deployed address

### "Transaction Rejected"
- User cancelled transaction in MetaMask

### "Insufficient Funds"
- Use test account from Hardhat node (has 10000 ETH)

### "Not Owner" Error
- Only NFT owner can level up their NFTs

### "Cannot read properties of undefined (reading 'getSigners')"
- Make sure Hardhat node is running first: `npx hardhat node`
- Check that ethers plugin is installed: `npm install --save-dev @nomicfoundation/hardhat-ethers ethers`

### "could not decode result data" Error
- Contract not deployed at the address in `.env.local`
- Deploy contract first: `npx hardhat run scripts/deploy.js --network localhost`
