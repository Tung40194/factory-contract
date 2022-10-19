const { expect } = require("chai");

describe("Upgrade NFT contract", function() {
  it('Can not mass upgrade because account does not have the key', async () => {

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
      ["nameCoin1", "NMC1", "name-coin-uri1", 100000000000],
      { initializer: 'init' }
    );
    await nft1.deployed();
    console.log("NFT deployed to:", nft1.address);
  
    const nft2 = await upgrades.deployBeaconProxy(
      BEACON_ADDRESS,
      NFTforBadgeV1,
      ["nameCoin2", "NMC2", "name-coin-uri2", 200000000000],
      { initializer: 'init' }
    );
    await nft2.deployed();
    console.log("NFT deployed to:", nft2.address);
  
    const nft3 = await upgrades.deployBeaconProxy(
      BEACON_ADDRESS,
      NFTforBadgeV1,
      ["nameCoin3", "NMC3", "name-coin-uri3", 300000000000],
      { initializer: 'init' }
    );
    await nft3.deployed();
    console.log("NFT deployed to:", nft3.address);

    // get the implementation address
    console.log(
      "Prev-upgrade implementation contract address: ",
      await upgrades.beacon.getImplementationAddress(BEACON_ADDRESS)
    );

    // mass upgrading all proxies
    const NFTforBadgeV2 = await ethers.getContractFactory("NFTforBadgeV2");
    let result = await upgrades.upgradeBeacon(BEACON_ADDRESS, NFTforBadgeV2);
    console.log(">>>result: \n", result.signer.address)
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
