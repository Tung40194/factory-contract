const { expect } = require("chai");
const { ethers } = require("hardhat");
const { web3 } = require('@openzeppelin/test-helpers/src/setup');

describe("Test the upgradability of Factory", function() {
  it('Only contract after upgrade has new function upgraded()', async () => {

    const accounts = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("FactoryV1");
    const NFTforBadgeV1 = await ethers.getContractFactory("NFTforBadgeV1");

    // deploy implementation NFTforBadgeV1 and NFTforBadgeV2
    const deployedNFTV1 = await NFTforBadgeV1.deploy();

    // Init
    const FactoryV1 = await ethers.getContractFactory('FactoryV1');
    const FactoryV2 = await ethers.getContractFactory('FactoryV2Test');

    // Deploy Factory contract
    const factory = await upgrades.deployProxy(FactoryV1, [deployedNFTV1.address], {initializer: 'initialize', kind: 'uups'});
    console.log('Factory deployed to (proxy address):', factory.address);
    console.log('Factory implementation address:', await upgrades.erc1967.getImplementationAddress(factory.address));

    // must cause error
    try {
      await factory.upgraded();
    } catch (error) {
      let result = error.toString().includes("TypeError: factory.upgraded is not a function");
      expect(result).to.equal(true);
    }
    
    // upgrade factory contract
    const upgraded = await upgrades.upgradeProxy(factory, FactoryV2, {kind: 'uups'});

    // verify upgrade status with new function that only exists in factory V2
    const factory_new = await FactoryV2.attach(factory.address);
    expect(await factory_new.upgraded()).to.equal("This function is only available in V2");

  })
});
