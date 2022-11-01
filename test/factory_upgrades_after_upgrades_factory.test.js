const { expect } = require("chai");
const { ethers } = require("hardhat");
const { web3 } = require('@openzeppelin/test-helpers/src/setup');

describe("Test if Factory still works after upgrading to new Factory", function() {
  it('Old factory functions fine and new factory brings new function to get the total proxies count', async () => {

    const accounts = await ethers.getSigners();

    // ------------------- deploy factory v1 -------------------
    const NFTforBadgeV1 = await ethers.getContractFactory("NFTforBadgeV1");
    const deployedNFTV1 = await NFTforBadgeV1.deploy();
    const FactoryV1 = await ethers.getContractFactory('FactoryV1');
    const FactoryV2 = await ethers.getContractFactory('FactoryV2Test');

    // ------------------- use factory v1 -------------------
    const NFTforBadgeV2 = await ethers.getContractFactory("NFTforBadgeV2Test");

    // deploy implementation NFTforBadgeV1 and NFTforBadgeV2
    const deployedNFTV2 = await NFTforBadgeV2.deploy();
    console.log("implementation V1 deployed at: ", deployedNFTV1.address);

    // deploy Factory with initial implementation contract NFTforBadgeV1
    const deployedFactoryV1 = await upgrades.deployProxy(FactoryV1, [deployedNFTV1.address], { initializer: 'initialize' });
    console.log("Factory deployed at: ", deployedFactoryV1.address);

    // create multiple proxies
    await deployedFactoryV1.createProxy(accounts[2].address, "non-fungible token 1", "nft1", "url-nft1", 1000000000); // proxy id 1
    await deployedFactoryV1.createProxy(accounts[3].address, "non-fungible token 2", "nft2", "url-nft2", 2000000000); // proxy id 2
    await deployedFactoryV1.createProxy(accounts[4].address, "non-fungible token 3", "nft3", "url-nft3", 3000000000); // proxy id 3

    const proxy1Address = await deployedFactoryV1.getProxy(1);
    const proxy2Address = await deployedFactoryV1.getProxy(2);
    const proxy3Address = await deployedFactoryV1.getProxy(3);

    // ------------------- upgrade to factory v2 -------------------
    const upgraded = await upgrades.upgradeProxy(deployedFactoryV1, FactoryV2);



    // ------------------- verify if factory v2 works and be compatible to v1 -------------------
    const factoryV2 = await FactoryV2.attach(deployedFactoryV1.address);
    expect(await factoryV2.upgraded()).to.equal("This function is only available in V2");


    // use factory v2 to create a new nft proxy
    await factoryV2.createProxy(accounts[5].address, "non-fungible token 4", "nft4", "url-nft4", 4000000000); // proxy id 4
    const proxy4Address = await factoryV2.getProxy(4);

    const nft1_new = await NFTforBadgeV2.attach(proxy1Address);
    const nft2_new = await NFTforBadgeV2.attach(proxy2Address);
    const nft3_new = await NFTforBadgeV2.attach(proxy3Address);
    const nft4_new = await NFTforBadgeV2.attach(proxy4Address);

    // mass upgrade with 1 transaction to deployedNFTV2 for 
    // 3 proxies (created by factoryv1) and 1 proxy (created by factoryv2)
    await factoryV2.upgradeProxies(deployedNFTV2.address);


    // expect 4 proxies get upgraded
    expect(await nft1_new.upgraded()).to.equal("This function is only available in V2");
    expect(await nft2_new.upgraded()).to.equal("This function is only available in V2");
    expect(await nft3_new.upgraded()).to.equal("This function is only available in V2");
    expect(await nft4_new.upgraded()).to.equal("This function is only available in V2");

    // expect proxycount to be 1 (the 4th proxy created by factory v2)
    let proxycount = await factoryV2.proxiesCount();
    expect(proxycount.toNumber()).to.equal(1);

  });

});
