const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying DynamicNFT contract...");
  
  // Get the contract factory
  const DynamicNFT = await ethers.getContractFactory("DynamicNFT");
  
  // Deploy the contract
  const dynamicNFT = await DynamicNFT.deploy();
  await dynamicNFT.waitForDeployment();
  
  const deployedAddress = await dynamicNFT.getAddress();
  
  console.log("✅ DynamicNFT deployed to:", deployedAddress);
  console.log("\n📋 Next steps:");
  console.log("1. Update frontend/.env.local:");
  console.log(`   NEXT_PUBLIC_CONTRACT_ADDRESS=${deployedAddress}`);
  console.log("2. Make sure Hardhat node is running: npx hardhat node");
  console.log("3. Configure MetaMask to use Hardhat Local network (Chain ID: 31337)");
  console.log("4. Import account with private key: 0x18340aff51237b447025ec9cb2906ef7c502791e7bb74387d3f682d405c31d88");
  
  return deployedAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });