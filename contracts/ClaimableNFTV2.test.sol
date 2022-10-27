// For testing only
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
import "./ClaimableNFTV1.sol";

contract NFTforBadgeV2Test is NFTforBadgeV1 {
    //TODO append new codes here
    /* v2 code appended here*/

    /* for testing only*/
    function upgraded() public pure returns(string memory) {
        return "This function is only available in V2";
    }
    /* for testing only*/

    /* v2 code appended here*/
}

