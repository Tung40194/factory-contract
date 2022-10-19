A simple NFT for Cryptobadge reboot. This project applies beacon proxy upgradable pattern.

### Prerequisites:

    - create .env file in ./ and feed it your key and an RPC API key.
        + PRIVATE_KEY=<private key>
        + POLYGONSCAN_API_KEY=<polygon api key>
    - npm install
    - npx hardhat test

### 1. Deploy an upgradable nft contract

`npx hardhat run --network localhost scripts/deploy_claimable_nft.js`

Network options:
    - mumbai
    - polygon

### 2. [Upgrade the claimable contract code](https://docs.openzeppelin.com/upgrades-plugins/1.x/writing-upgradeable#modifying-your-contracts)

### 3. Deploy the upgraded contract

`npx hardhat run --network localhost scripts/upgrade_claimable_nft.js`

Network options:
    - mumbai
    - polygon