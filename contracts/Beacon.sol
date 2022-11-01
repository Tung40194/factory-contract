// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Beacon is Ownable {

    event BeaconUpgradedTo(address oldImpl, address newImpl);

    UpgradeableBeacon immutable beacon;
    address public implementationContract;

    constructor(address impl) {
        beacon = new UpgradeableBeacon(impl);
        implementationContract = impl;
    }

    function updateContract(address impl) public onlyOwner {
        beacon.upgradeTo(impl);
        emit BeaconUpgradedTo(implementationContract, impl);
        implementationContract = impl;
    }

    function implementation() public view returns(address) {
        return beacon.implementation();
    }

}