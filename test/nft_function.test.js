const { expect } = require("chai");
const { web3 } = require('@openzeppelin/test-helpers/src/setup');

// Revert message
const REVERT_BENEFICIARY_NOT_SET = 'CN1'
const REVERT_NO_FUNDS_TO_WITHDRAW = 'CN2'
const REVERT_FAIL_TO_WITHDRAW = 'CN3'
const REVERT_MINITNG_MODE_NOT_AVAILABLE = 'CN4'
const REVERT_CALLER_IS_NOT_A_MINTER = 'CN5'
const REVERT_INSUFFICIENT_FUNDS = 'CN6'
const REVERT_CLAIMING_MODE_NOT_AVAILABLE = 'CN7'
const REVERT_WITHDRAWER_IS_NOT_THE_OWNER = 'Ownable: caller is not the owner'

const MINTING_MODE = 0
const CLAIMING_MODE = 1

let accounts
let NFTforBadgeV1
let beacon
let BEACON_ADDRESS
let beneficiary
let nft


describe("Upgrade NFT contract", function() {

  beforeEach(async function () {
    accounts = await ethers.getSigners();

    NFTforBadgeV1 = await ethers.getContractFactory("NFTforBadgeV1");
    
    beacon = await upgrades.deployBeacon(NFTforBadgeV1);
    await beacon.deployed();
    BEACON_ADDRESS = beacon.address;
    console.log("Beacon deployed to:", BEACON_ADDRESS);
    
    // deploying proxy
    nft = await upgrades.deployBeaconProxy(
      BEACON_ADDRESS,
      NFTforBadgeV1,
      ["nameCoin1", "NMC1", "name-coin-uri1", 10000000000],
      { initializer: 'initialize' }
    );
    await nft.deployed();
    console.log("NFT deployed to:", nft.address);

    beneficiary = accounts[5].address
  })

  it('Can not mint if caller is a minter', async () => {
    await expect(
      nft.mint([accounts[0].address]),
    ).revertedWith(REVERT_CALLER_IS_NOT_A_MINTER)
  });

  it('Can not withdraw if beneficiary is not set', async () => {
    await expect(
      nft.withdraw(),
    ).revertedWith(REVERT_BENEFICIARY_NOT_SET)
  });

  it('Can not withdraw if beneficiary is not set', async () => {
    await nft.setBeneficiary(beneficiary);
    await expect(
      nft.withdraw(),
    ).revertedWith(REVERT_NO_FUNDS_TO_WITHDRAW)
  });

  it('Can not mint when not in minting mode', async () => {
    await nft.setBeneficiary(beneficiary);
    await nft.setMintingMode(CLAIMING_MODE);
    await nft.setMinters([accounts[0].address]); // accounts[0] is the default caller
    await expect(
      nft.mint([accounts[6].address]),
    ).revertedWith(REVERT_MINITNG_MODE_NOT_AVAILABLE)
  });

  it('Can not mint when not in claiming mode', async () => {
    await nft.setBeneficiary(beneficiary);
    await nft.setMintingMode(MINTING_MODE);
    await nft.setMinters([accounts[0].address]); // accounts[0] is the default caller
    await expect(
      nft.claim({ value: web3.utils.toWei("2", 'ether') }),
    ).revertedWith(REVERT_CLAIMING_MODE_NOT_AVAILABLE)
  });

  it('Can not claim when funds are insufficient', async () => {
    await nft.setBeneficiary(beneficiary);
    await nft.setMintingMode(MINTING_MODE);
    await nft.setMinters([accounts[0].address]); // accounts[0] is the default caller
    await expect(
      nft.claim(),
    ).revertedWith(REVERT_INSUFFICIENT_FUNDS)
  });

  it('Successfully claim when funds are sufficient', async () => {
    await nft.setBeneficiary(beneficiary);
    await nft.setMintingMode(CLAIMING_MODE);
    await nft.claim({ from: accounts[0].address, value: web3.utils.toWei("1", 'ether') });
  });

  it('Successfully mint when funds are sufficient', async () => {
    await nft.setBeneficiary(beneficiary);
    await nft.setMintingMode(MINTING_MODE);
    await nft.setMinters([accounts[1].address]); // accounts[0] is the default caller
    await nft.connect(accounts[1]).mint([accounts[7].address, accounts[8].address], { value: web3.utils.toWei("0.00000002", 'ether') });
  });

  it('Can not withdraw funds when caller is not the owner', async () => {
    await nft.setBeneficiary(beneficiary);
    await nft.setMintingMode(MINTING_MODE);
    await nft.setMinters([accounts[1].address]); // accounts[0] is the default caller
    await nft.connect(accounts[1]).mint([accounts[7].address, accounts[8].address], { value: web3.utils.toWei("0.00000002", 'ether') });
    await expect(
      nft.connect(accounts[1]).withdraw(),
    ).revertedWith(REVERT_WITHDRAWER_IS_NOT_THE_OWNER)
  });

  it('Successfully withdraw funds', async () => {
    const prev_balance = await ethers.provider.getBalance(beneficiary);
    await nft.setBeneficiary(beneficiary);
    await nft.setMintingMode(MINTING_MODE);
    await nft.setMinters([accounts[1].address]); // accounts[0] is the default caller
    await nft.connect(accounts[1]).mint([accounts[7].address, accounts[8].address], { value: web3.utils.toWei("0.00000002", 'ether') });
    await nft.withdraw();

    const price = await nft.price();
    const new_balance = await ethers.provider.getBalance(beneficiary);
    const profit = web3.utils.toBN(2/*account 7 and account 8*/ * price);
    expect((web3.utils.toBN(prev_balance).add(profit)).toString()).to.equal(new_balance);
  });

  it('Successfully burn nfts', async () => {
    await nft.setBeneficiary(beneficiary);
    await nft.setMintingMode(MINTING_MODE);
    await nft.setMinters([accounts[1].address]); // accounts[0] is the default caller
    await nft.connect(accounts[1]).mint([accounts[7].address, accounts[8].address], { value: web3.utils.toWei("0.00000002", 'ether') });
    let totalSuplly = await nft.totalSupply();
    await expect(totalSuplly.toNumber()).to.equal(2);
    await nft.connect(accounts[7]).burn(0); //account7 has token #0
    await nft.connect(accounts[8]).burn(1); //account8 has token #1

    totalSuplly = await nft.totalSupply();
    await expect(totalSuplly.toNumber()).to.equal(0);
  });

});
