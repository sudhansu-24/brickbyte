require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: { enabled: true, runs: 200 }
    }
  },
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
      accounts: [process.env.ETH_PRIVATE_KEY]
    }
  },
  paths: {
    sources: "./src/contracts",
    artifacts: "./src/contracts/artifacts",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};
