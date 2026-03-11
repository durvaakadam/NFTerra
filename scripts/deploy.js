async function main() {

  const NFT = await ethers.getContractFactory("DynamicNFT");

  console.log("Deploying contract...");

  const nft = await NFT.deploy();

  await nft.deployed();

  console.log("DynamicNFT deployed to:", nft.address);

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});