require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/**
 * Hardhat Configuration
 * ---------------------
 * - Default network: Hardhat's built-in local blockchain
 * - Sepolia testnet: Configured for Ethereum Sepolia (requires .env vars)
 * - Solidity version: 0.8.20 with optimizer enabled
 */

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    // Hardhat local network (default) — runs on http://127.0.0.1:8545
    localhost: {
      url: "http://127.0.0.1:8545",
    },

    // Sepolia testnet — requires SEPOLIA_RPC_URL and PRIVATE_KEY in .env
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
    },
  },
  paths: {
    // Tell Hardhat where to find contracts and where to output artifacts
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
