const { expect } = require("chai");

describe("Upgrade NFT contract", function() {
  it('Mass upgrade successfully', async () => {

    const accounts = await ethers.getSigners();

    const NFTforBadgeV1 = await ethers.getContractFactory("NFTforBadgeV1");

    const beacon = await upgrades.deployBeacon(NFTforBadgeV1);
    await beacon.deployed();
    const BEACON_ADDRESS = beacon.address;
    console.log("Beacon deployed to:", BEACON_ADDRESS);
  
    // deploying multiple proxies
    const nft1 = await upgrades.deployBeaconProxy(
      BEACON_ADDRESS,
      NFTforBadgeV1,
      [accounts[2].address, "nameCoin1", "NMC1", "name-coin-uri1", 100000000000],
      { initializer: 'initialize' }
    );
    await nft1.deployed();
    console.log("NFT deployed to:", nft1.address);
  
    const nft2 = await upgrades.deployBeaconProxy(
      BEACON_ADDRESS,
      NFTforBadgeV1,
      [accounts[3].address, "nameCoin2", "NMC2", "name-coin-uri2", 200000000000],
      { initializer: 'initialize' }
    );
    await nft2.deployed();
    console.log("NFT deployed to:", nft2.address);
  
    const nft3 = await upgrades.deployBeaconProxy(
      BEACON_ADDRESS,
      NFTforBadgeV1,
      [accounts[4].address, "nameCoin3", "NMC3", "name-coin-uri3", 300000000000],
      { initializer: 'initialize' }
    );
    await nft3.deployed();
    console.log("NFT deployed to:", nft3.address);

    // get the implementation address
    console.log(
      "Prev-upgrade implementation contract address: ",
      await upgrades.beacon.getImplementationAddress(BEACON_ADDRESS)
    );

    // mass upgrading all proxies
    const NFTforBadgeV2 = await ethers.getContractFactory("NFTforBadgeV2Test");
    await upgrades.upgradeBeacon(BEACON_ADDRESS, NFTforBadgeV2);
    console.log("Beacon upgraded: ", BEACON_ADDRESS)

    // get the implementation address
    console.log(
      "Post-upgrade implementation contract address: ",
      await upgrades.beacon.getImplementationAddress(BEACON_ADDRESS)
    );

    // checking if V2 contains new function
    const nft1_new = await NFTforBadgeV2.attach(nft1.address);
    const nft2_new = await NFTforBadgeV2.attach(nft2.address);
    const nft3_new = await NFTforBadgeV2.attach(nft3.address);

    expect(await nft1_new.upgraded()).to.equal("This function is only available in V2");
    expect(await nft2_new.upgraded()).to.equal("This function is only available in V2");
    expect(await nft3_new.upgraded()).to.equal("This function is only available in V2");

  });
});
