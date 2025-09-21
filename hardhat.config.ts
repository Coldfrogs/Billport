import type { HardhatUserConfig } from "hardhat/config";
import "dotenv/config";

import hardhatToolboxMochaEthersPlugin from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import { configVariable } from "hardhat/config";

const config: HardhatUserConfig = {
  plugins: [hardhatToolboxMochaEthersPlugin],
  solidity: {
    compilers: [
      {
        version: "0.8.24",
        settings: {
          evmVersion: "paris",
          optimizer: { enabled: true, runs: 200 },
        },
      },
    ],
            overrides: {
              // Safety: keep ProofRegistry bytecode Paris-only and avoid Yul/IR
              "contracts/ProofRegistry.sol": {
                version: "0.8.24",
                settings: {
                  evmVersion: "paris",
                  optimizer: { enabled: true, runs: 200 },
                  viaIR: false,
                },
              },
              // Enable viaIR for complex contracts
              "contracts/DealRegistry.sol": {
                version: "0.8.24",
                settings: {
                  evmVersion: "paris",
                  optimizer: { enabled: true, runs: 200 },
                  viaIR: true,
                },
              },
              "contracts/SecondaryMarket.sol": {
                version: "0.8.24",
                settings: {
                  evmVersion: "paris",
                  optimizer: { enabled: true, runs: 200 },
                  viaIR: true,
                },
              },
            },
  },
  networks: {
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },
    hardhatOp: {
      type: "edr-simulated",
      chainType: "op",
    },
    sepolia: {
      type: "http",
      chainType: "l1",
      url: configVariable("SEPOLIA_RPC_URL"),
      accounts: [configVariable("SEPOLIA_PRIVATE_KEY")],
    },
    coston2: {
      type: "http",
      chainType: "l1",
      url: process.env.COSTON2_RPC_URL,
      accounts: [process.env.PRIVATE_KEY!],
    },
  },
};

export default config;