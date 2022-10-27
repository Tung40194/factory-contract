const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Contract factory functional testing", function() {
  it('Mass upgrade successfully', async () => {

    const accounts = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("Factory");
    const Beacon = await ethers.getContractFactory("Beacon");
    const NFTforBadgeV1 = await ethers.getContractFactory("NFTforBadgeV1");
    const NFTforBadgeV2 = await ethers.getContractFactory("NFTforBadgeV2Test");

    // deploy implementation NFTforBadgeV1 and NFTforBadgeV2
    const deployedNFTV1 = await NFTforBadgeV1.deploy();
    const deployedNFTV2 = await NFTforBadgeV2.deploy();
    console.log("implementation V1 deployed at: ", deployedNFTV1.address);

    // deploy Factory with initial implementation contract NFTforBadgeV1
    const deployedFactory = await upgrades.deployProxy(Factory, [deployedNFTV1.address], { initializer: 'initialize' });
    console.log("Factory deployed at: ", deployedFactory.address);

    // create multiple proxies
    await deployedFactory.createProxy("non-fungible token 1", "nft1", "url-nft1", 1000000000, 1);
    await deployedFactory.createProxy("non-fungible token 2", "nft2", "url-nft2", 2000000000, 2);
    await deployedFactory.createProxy("non-fungible token 3", "nft3", "url-nft3", 3000000000, 3);

    const proxy1Address = await deployedFactory.getProxy(1);
    const proxy2Address = await deployedFactory.getProxy(2);
    const proxy3Address = await deployedFactory.getProxy(3);

    // mass upgrade with 1 transaction to deployedNFTV2
    const beaconAddress = deployedFactory.getBeacon();
    const deployedBeacon = Beacon.attach(beaconAddress);
    await deployedBeacon.updateContract(deployedNFTV2.address);

    // verify if upgrade has gone into effect
    const nft1_new = await NFTforBadgeV2.attach(proxy1Address);
    const nft2_new = await NFTforBadgeV2.attach(proxy2Address);
    const nft3_new = await NFTforBadgeV2.attach(proxy3Address);

    expect(await nft1_new.upgraded()).to.equal("This function is only available in V2");
    expect(await nft2_new.upgraded()).to.equal("This function is only available in V2");
    expect(await nft3_new.upgraded()).to.equal("This function is only available in V2");

  });

  it.only('Mass upgrade fail because caller is not the Owner of the beacon', async () => {

    const accounts = await ethers.getSigners();

    const Factory = await ethers.getContractFactory("Factory");
    const Beacon = await ethers.getContractFactory("Beacon");
    const NFTforBadgeV1 = await ethers.getContractFactory("NFTforBadgeV1");
    const NFTforBadgeV2 = await ethers.getContractFactory("NFTforBadgeV2Test");

    // deploy implementation NFTforBadgeV1 and NFTforBadgeV2
    const deployedNFTV1 = await NFTforBadgeV1.deploy();
    const deployedNFTV2 = await NFTforBadgeV2.deploy();
    console.log("implementation V1 deployed at: ", deployedNFTV1.address);

    // deploy Factory with initial implementation contract NFTforBadgeV1
    const deployedFactory = await upgrades.deployProxy(Factory, [deployedNFTV1.address], { initializer: 'initialize' });
    console.log("Factory deployed at: ", deployedFactory.address);

    // create multiple proxies
    await deployedFactory.createProxy("non-fungible token 1", "nft1", "url-nft1", 1000000000, 1);
    await deployedFactory.createProxy("non-fungible token 2", "nft2", "url-nft2", 2000000000, 2);
    await deployedFactory.createProxy("non-fungible token 3", "nft3", "url-nft3", 3000000000, 3);

    const proxy1Address = await deployedFactory.getProxy(1);
    const proxy2Address = await deployedFactory.getProxy(2);
    const proxy3Address = await deployedFactory.getProxy(3);

    // mass upgrade with 1 transaction to deployedNFTV2
    const beaconAddress = deployedFactory.getBeacon();
    const deployedBeacon = Beacon.attach(beaconAddress);
    await deployedBeacon.connect(accounts[4]).updateContract(deployedNFTV2.address);

  });
});
