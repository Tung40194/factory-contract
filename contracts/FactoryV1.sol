// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import "./ClaimableNFTV1.sol";
import "./ClaimableNFTV2.sol";
import "./Beacon.sol";

contract FactoryV1 is Initializable, OwnableUpgradeable {
    
    event ProxyCreated(string name, string symbol, string contractUri, uint256 price, uint256 proxyIndex);

    using CountersUpgradeable for CountersUpgradeable.Counter;

    Beacon private beacon;
    CountersUpgradeable.Counter private proxyIdCounter;
    mapping(uint256 => address) private proxies;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address implContract) public initializer {
        beacon = new Beacon(implContract);
        __Ownable_init();
    }

    /// @notice Create nft proxy contract
    /// @param name: nft contract name
    /// @param symbol: nft contract symbol
    /// @param contractURI: nft contract contractURI
    /// @param price: nft base fee per each NFT
    function createProxy(
        string memory name,
        string memory symbol,
        string memory contractURI,
        uint256 price
    ) external onlyOwner returns (address) {
        BeaconProxy proxy = new BeaconProxy(
            address(beacon), 
            abi.encodeWithSelector(NFTforBadgeV1.initialize.selector, name, symbol, contractURI, price)
        );
        proxyIdCounter.increment();
        uint256 index = proxyIdCounter.current();
        proxies[index] = address(proxy);
        emit ProxyCreated(name, symbol, contractURI, price, index);
        return address(proxy);
    }

    /// @notice get the current implementation contract address
    function getImplementation() public view returns (address) {
        return beacon.implementation();
    }

    /// @notice get the beacon contract address
    function getBeacon() public view returns (address) {
        return address(beacon);
    }

    /// @notice get the beacon proxy contract address by index
    function getProxy(uint256 index) public view returns (address) {
        return proxies[index];
    }

    /// @notice get the beacon proxies count
    function getProxyCount() public view returns(uint256) {
        return proxyIdCounter.current();
    }

    /// @notice upgrade all beacon proxies
    /// @param implContract: new implementation contract address
    function upgradeProxies(address implContract) external onlyOwner {
        beacon.updateContract(implContract);
    }

}