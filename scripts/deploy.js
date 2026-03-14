import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  // Load artifact
  const artifactPath = path.join(__dirname, "../artifacts/contracts/DynamicNFT.sol/DynamicNFT.json");
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

  // Ganache RPC
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545");
  const accounts = await provider.listAccounts();
  const signer = accounts[0];

  console.log("Deploying with account:", signer.address);

  // Create contract factory
  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer);

  // Deploy
  const nft = await factory.deploy();
  await nft.waitForDeployment();

  const address = await nft.getAddress();
  console.log("DynamicNFT deployed to:", address);
  
  return address;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});