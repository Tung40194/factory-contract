/** @type import('hardhat/config').HardhatUserConfig */
require('dotenv').config()
require('@nomiclabs/hardhat-ethers')
require('@nomiclabs/hardhat-web3')
require('@nomicfoundation/hardhat-chai-matchers')
require('@openzeppelin/hardhat-upgrades')
require('hardhat-contract-sizer')
require('hardhat-gas-reporter')

module.exports = {
  // defaultNetwork: "mumbai",
  networks: {
    hardhat: {},
    // mumbai: {
    //   url: "https://matic-mumbai.chainstacklabs.com",
    //   accounts: [process.env.PRIVATE_KEY]
    // },
    // matic: {
    //   url: "https://polygon-rpc.com/",
    //   accounts: [process.env.PRIVATE_KEY]
    // }
  },
  etherscan: {
    apiKey: process.env.POLYGONSCAN_API_KEY,
  },
  solidity: {
    version: '0.8.16',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: true,
    only: [],
  },
  gasReporter: {
    gasPrice: 21,
    token: 'MATIC',
  },
}
