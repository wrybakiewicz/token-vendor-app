// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract BugCoin is ERC20 {

    constructor(uint256 initialSupply) public ERC20("BugCoin", "BGC") {
        _mint(msg.sender, initialSupply);
    }
}
