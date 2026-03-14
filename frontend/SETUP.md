# NFTerra Frontend Setup

## Prerequisites

- Node.js 18+ and npm/pnpm installed
- MetaMask browser extension

## Quick Start Guide

### 1. Install Dependencies

**Project Root:**
```bash
cd c:\PROJECTS\NFTerra
npm install
```

**Frontend:**
```bash
cd frontend
pnpm install
```

### 2. Start Local Blockchain (Ganache)

Open a terminal in the project root and run:
```bash
# Start Ganache Desktop app
# or CLI: ganache --port 7545 --chain.networkId 5777
```

This will:
- Start a local blockchain at `http://127.0.0.1:7545`
- Create test accounts with ETH
- Keep running (don't close this terminal)

### 3. Deploy the Contract

Open another terminal and deploy:
```bash
cd c:\PROJECTS\NFTerra
node deploy-simple.mjs
```

Copy the deployed contract address from the output.

### 4. Configure Frontend

Create `.env.local` in the frontend folder:
```bash
cd frontend
cp .env.local.example .env.local
```

Edit `.env.local` and update the contract address:
```env
NEXT_PUBLIC_CONTRACT_ADDRESS=<your-deployed-address>
NEXT_PUBLIC_CHAIN_ID=5777
NEXT_PUBLIC_RPC_URL=http://127.0.0.1:7545
```

### 5. Configure MetaMask

1. **Add Localhost Network:**
   - Open MetaMask
   - Click network dropdown → "Add Network" → "Add a network manually"
   - Fill in:
   - Network Name: `Ganache Local`
     - RPC URL: `http://127.0.0.1:7545`
     - Chain ID: `5777`
     - Currency Symbol: `ETH`

2. **Import Test Account:**
   - Copy a private key from Ganache account list
   - MetaMask → Account menu → "Add account or hardware wallet" → "Import account"
   - Paste private key

### 6. Start Frontend

```bash
cd frontend
pnpm dev
```

Visit `http://localhost:3000`

## Troubleshooting

### "Failed to fetch" Error
- ✅ Ganache is running (`http://127.0.0.1:7545`)
- ✅ MetaMask is connected to your Ganache network
- ✅ Contract address in `.env.local` matches deployed address

### "Transaction Rejected"
- User cancelled transaction in MetaMask

### "Insufficient Funds"
- Use a funded account from Ganache

### "Not Owner" Error
- Only NFT owner can level up their NFTs

### "Cannot read properties of undefined (reading 'getSigners')"
- Use the Ganache deploy script instead: `node deploy-simple.mjs`
- Verify RPC is set to `http://127.0.0.1:7545`

### "could not decode result data" Error
- Contract not deployed at the address in `.env.local`
- Deploy contract first: `node deploy-simple.mjs`
