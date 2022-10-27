// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import "./ClaimableNFTV1.sol";
import "./ClaimableNFTV2.sol";
import "./Beacon.sol";

contract Factory is Initializable, OwnableUpgradeable {

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
        string memory _name,
        string memory _symbol,
        string memory _contractURI,
        uint256 _price,
        uint256 index
    ) external onlyOwner returns (address) {
        BeaconProxy proxy = new BeaconProxy(
            address(beacon), 
            abi.encodeWithSelector(NFTforBadgeV1.init.selector, _name, _symbol, _contractURI, _price)
        );
        proxies[index] = address(proxy);
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


}