// For testing only
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import "./ClaimableNFTV1.sol";
import "./ClaimableNFTV2.sol";
import "./Beacon.sol";

contract FactoryV2Test is Initializable, OwnableUpgradeable, UUPSUpgradeable {

    Beacon private beacon;
    mapping(uint256 => address) private proxies;
    uint256 private proxyCount;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address implContract) public initializer {
        beacon = new Beacon(implContract);
        __Ownable_init();
        proxyCount = 0;
    }

    function createProxy(
        string memory _name,
        string memory _symbol,
        string memory _contractURI,
        uint256 _price,
        uint256 index
    ) external onlyOwner returns (address) {
        BeaconProxy proxy = new BeaconProxy(
            address(beacon), 
            abi.encodeWithSelector(NFTforBadgeV1.initialize.selector, _name, _symbol, _contractURI, _price)
        );
        proxies[index] = address(proxy);
        proxyCount ++;
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

    function upgraded() public pure returns(string memory) {
        return "This function is only available in V2";
    }

    function proxiesCount() public view returns(uint256) {
        return proxyCount;
    }
}