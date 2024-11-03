/**
 * @type import('hardhat/config').HardhatUserConfig
 */
require('dotenv').config();
require("@nomicfoundation/hardhat-ethers");
require('hardhat-deploy');
const path = require('path');

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {},
    polygon_amoy: {
      url: process.env.PROVIDER_RPC_URL,
      accounts: [
        process.env.PRIVATE_KEY,
      ],
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "../src/artifacts",
  },
  outputArtifacts: {
    path: path.resolve(__dirname, '../src/artifacts'),
    runOnCompile: true,
  },
};