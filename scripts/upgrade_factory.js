
// scripts/upgrade_dvote.js
const { ethers, upgrades } = require('hardhat');

  //TODO: change the proxy address
  const factoryProxyAddress = '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9';

async function main () {
  const FactoryV2 = await ethers.getContractFactory('FactoryV2');
  console.log('Upgrading to FactoryV2...');
  // TODO change contract address
  await upgrades.upgradeProxy(factoryProxyAddress, FactoryV2);
  console.log('FactoryV2 upgraded');
}

main();
