// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "./BugCoin.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Vendor is Ownable {

    BugCoin public bugCoin;
    uint public immutable bugCoinPerEth = 10;

    event TokenBought(address buyer, uint amountOfEth, uint amountOfBugCoin);
    event EthWithdrawn(address owner, uint amountOfEth);
    event TokenSold(address seller, uint amountOfEth, uint amountOfBugCoin);

    constructor(address _bugCoin) {
        bugCoin = BugCoin(_bugCoin);
    }

    function buy() external payable {
        uint tokens = msg.value * bugCoinPerEth;
        bugCoin.transfer(msg.sender, tokens);
        emit TokenBought(msg.sender, msg.value, tokens);
    }

    function withdraw() external onlyOwner {
        uint balance = address(this).balance;
        payable(msg.sender).transfer(balance);
        emit EthWithdrawn(msg.sender, balance);
    }

    function sell(uint amount) external {
        bugCoin.transferFrom(msg.sender, address(this), amount);
        uint amountEth = amount / bugCoinPerEth;
        payable(msg.sender).transfer(amountEth);
        emit TokenSold(msg.sender, amountEth, amount);
    }
}
