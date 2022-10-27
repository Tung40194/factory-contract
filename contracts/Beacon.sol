// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";

contract Beacon {

    UpgradeableBeacon immutable beacon;
    address public implementationContract;

    constructor(address impl) {
        beacon = new UpgradeableBeacon(impl);
        implementationContract = impl;
    }

    function updateContract(address impl) public {
        beacon.upgradeTo(impl);
        implementationContract = impl;
    }

    function getImplementation() public view returns(address) {
        return beacon.implementation();
    }

}