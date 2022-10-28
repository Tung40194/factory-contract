// scripts/prepare_upgrade.js
async function main() {
    //TODO: change the proxy address
    const proxyAddress = '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9';
   
    const FactoryV2 = await ethers.getContractFactory("FactoryV2");
    console.log("Preparing upgrade & get the implementation contract...");
    const FactoryV2Address = await upgrades.prepareUpgrade(proxyAddress, FactoryV2);
    console.log("FactoryV2 implementation at:", FactoryV2Address);
  }
   
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });