// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./BugCoin.sol";

contract Vendor {

    BugCoin public bugCoin;
    uint public immutable bugCoinPerEth = 10;

    constructor(address _bugCoin) {
        bugCoin = BugCoin(_bugCoin);
    }

    function buy() external payable {
        uint tokens = msg.value * bugCoinPerEth;
        bugCoin.transfer(msg.sender, tokens);
    }
}
