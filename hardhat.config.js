import "@nomicfoundation/hardhat-ethers";

export default {
  solidity: "0.8.19",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    ganache: {
      type: "http",
      url: "http://127.0.0.1:7545"
    }
  }
};