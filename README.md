This NFT project applies beacon proxy Factory upgradable pattern for upgrading NFT contracts while the Factory itself is upgraded following Transparent upgradable pattern.

### Prerequisites:

    - create .env file in ./ and feed it your key and an RPC API key.
        + PRIVATE_KEY=<private key>
        + POLYGONSCAN_API_KEY=<polygon api key>
    - npm install
    - npx hardhat test

# I. Factory contract interface

    /// @notice fire when a new proxy is created
    event ProxyCreated(
        address proxyAddress,
        string name,
        string symbol,
        string contractUri,
        uint256 price,
        uint256 proxyIndex
    );

    /// @notice Create nft proxy contract
    /// @param owner: the address that will be the owner of this contract
    /// @param name: nft contract name
    /// @param symbol: nft contract symbol
    /// @param contractURI: nft contract contractURI
    /// @param price: nft base fee per each NFT
    function createProxy(
        address owner,
        string memory name,
        string memory symbol,
        string memory contractURI,
        uint256 price
    ) external onlyOwner returns (address);

    /// @notice get the current implementation contract address
    function getImplementation() public view returns (address);

    /// @notice get the beacon contract address
    function getBeacon() public view returns (address);

    /// @notice get the beacon proxy contract address by index
    function getProxy(uint256 index) public view returns (address);

    /// @notice upgrade all beacon proxies
    /// @param implContract: new implementation contract address
    function upgradeProxies(address implContract) external onlyOwner;
# II. Deploy and upgrade NFT contract
### 1. Deploy an NFT proxy contract
Use Factory contract, function `createProxy(...)` to upgrade nft contracts

### 2. Deploy an NFT contract individually
We might use truffle, hardhat or remix to deploy our new logic/implementation contract. Be sure to follow [contract upgrade rules](https://docs.openzeppelin.com/upgrades-plugins/1.x/writing-upgradeable#modifying-your-contracts) in writing a new implementation contract strictly or new upgrade will bring bugs and unexpected issues.
### 3. Upgrading all NFT proxy contracts
Use Factory contract, function `upgradeProxies(address impl_contract)` and give it new implementation/logic contract address in step2 to upgrade all nft proxy contracts

# III. Deploy and upgrade Factory contract
### 1. Deploy Factory contract
- `npx hardhat run --network localhost scripts/deploy_factory.js`

### 2. Mind transfering upgradership to a Gnosis wallet for better security?
- `npx hardhat run --network localhost scripts/transfer_upgrade_ownership_factory.js`
### 2. Prepare to upgrade Factory contract
- `npx hardhat run --network localhost scripts/prepare_upgrade_factory.js`
### 3. Upgrade Factory contract
- `npx hardhat run --network localhost scripts/upgrade_factory.js`

### 4. Details on how to upgrade a contract with Gnosis
- https://forum.openzeppelin.com/t/openzeppelin-upgrades-step-by-step-tutorial-for-hardhat/3580

# IV. Note:

- Network options(check hardhat.config.js):
    - mumbai
    - polygon

- Follow strictly https://docs.openzeppelin.com/upgrades-plugins/1.x/writing-upgradeable#modifying-your-contracts to upgrade any contract (nft or factory)
