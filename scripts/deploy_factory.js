
// scripts/deploy_factory.js
const { ethers, upgrades } = require('hardhat');

async function main () {

  console.log('Deploying NFTforBadgeV1...');
  const NFTforBadgeV1 = await ethers.getContractFactory("NFTforBadgeV1");
  const deployedNFTV1 = await NFTforBadgeV1.deploy();
  const FactoryV1 = await ethers.getContractFactory('FactoryV1');
  const factory = await upgrades.deployProxy(FactoryV1, [deployedNFTV1.address], {initializer: 'initialize'});

  console.log('FactoryV1 deployed to (proxy address):', factory.address);
  console.log('FactoryV1 implementation address:', await upgrades.erc1967.getImplementationAddress(factory.address));
  console.log('FactoryV1 admin address:', await upgrades.erc1967.getAdminAddress(factory.address));
}

main();
