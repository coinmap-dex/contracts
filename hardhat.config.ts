import "@nomiclabs/hardhat-etherscan";
import '@nomiclabs/hardhat-waffle';
import 'hardhat-deploy';
import "./tasks"

import { HardhatUserConfig } from 'hardhat/config';

const accounts = {
  mnemonic: process.env.MNEMONIC || 'truth wide pink cover cinnamon cup coin iron observe figure surround senior',
};

const config: HardhatUserConfig = {
  namedAccounts: {
    deployer: { default: 0 },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  networks: {
    localhost: {
      accounts,
      live: false,
      saveDeployments: true,
    },
    ganache: {
      chainId: 1337,
      url: 'http://127.0.0.1:7545',
      accounts,
      live: false,
      saveDeployments: true,
    },
    bsc: {
      chainId: 56,
      gasPrice: 7000000000,
      url: 'https://bsc-dataseed.binance.org',
      accounts,
      live: true,
      saveDeployments: true,
    },
    bscTestnet: {
      chainId: 97,
      url: 'https://data-seed-prebsc-1-s1.binance.org:8545',
      accounts,
      live: true,
      saveDeployments: true,
    },
  },
  solidity: {
    compilers: [{
      version: '0.8.4',
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
        metadata: {
          bytecodeHash: 'none',
        },
      },
    }],
  },
};

export default config;
