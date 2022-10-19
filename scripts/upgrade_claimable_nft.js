
// scripts/upgrade_dvote.js
const { ethers, upgrades } = require("hardhat");

async function main() {
  // take the beacon address from the previous deploy_claimable_nft.js
  const BEACON_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
  const NFTforBadgeV2 = await ethers.getContractFactory("NFTforBadgeV2");

  await upgrades.upgradeBeacon(BEACON_ADDRESS, NFTforBadgeV2);
  console.log("Beacon upgraded");
}

main();