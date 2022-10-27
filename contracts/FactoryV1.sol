// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import "./ClaimableNFTV1.sol";
import "./ClaimableNFTV2.sol";
import "./Beacon.sol";

contract FactoryV1 is Initializable, OwnableUpgradeable, UUPSUpgradeable {
    event ProxyCreated(string name, string symbol, string contractUri, uint256 price, uint256 proxyIndex);

    Beacon private beacon;
    mapping(uint256 => address) private proxies;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address implContract) public initializer {
        beacon = new Beacon(implContract);
        __Ownable_init();
    }

    function createProxy(
        string memory name,
        string memory symbol,
        string memory contractURI,
        uint256 price,
        uint256 index
    ) external onlyOwner returns (address) {
        BeaconProxy proxy = new BeaconProxy(
            address(beacon), 
            abi.encodeWithSelector(NFTforBadgeV1.initialize.selector, name, symbol, contractURI, price)
        );
        proxies[index] = address(proxy);
        emit ProxyCreated(name, symbol, contractURI, price, index);
        return address(proxy);
    }

    function getImplementation() public view returns (address) {
        return beacon.implementation();
    }

     function getBeacon() public view returns (address) {
        return address(beacon);
    }

     function getProxy(uint256 index) public view returns (address) {
        return proxies[index];
    }

    function upgradeProxies(address implContract) external onlyOwner {
        beacon.updateContract(implContract);
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

}