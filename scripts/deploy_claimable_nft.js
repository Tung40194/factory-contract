// scripts/deploy_dvote.js
const { ethers, upgrades } = require("hardhat");

async function main() {
  const NFT = await ethers.getContractFactory("NFTforBadgeV1");

  const beacon = await upgrades.deployBeacon(NFT);
  await beacon.deployed();
  console.log("Beacon deployed to:", beacon.address);

  // Repeat the following if you'd like to deploy multiple proxy instances
  const nft = await upgrades.deployBeaconProxy(beacon, NFT, ["nameCoin", "NMC", "name-coin-uri", 100000000000], { initializer: 'init' });
  await nft.deployed();
  console.log("NFT deployed to:", nft.address);
}

main();