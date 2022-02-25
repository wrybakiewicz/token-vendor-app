const {expect} = require("chai");
const {ethers} = require("hardhat");
const {BigNumber} = require("ethers");

describe("BugCoin", function () {
    it("should deploy and return total supply", async function () {
        const [owner] = await ethers.getSigners();
        const BugCoin = await ethers.getContractFactory("BugCoin");
        const totalSupply = BigNumber.from(10).pow(18).mul(1000);
        const bugCoin = await BugCoin.deploy(totalSupply);
        await bugCoin.deployed();

        const receivedTotalSupply = await bugCoin.totalSupply();
        expect(receivedTotalSupply).to.equal(totalSupply);
        const ownerBalance = await bugCoin.balanceOf(owner.address);
        expect(ownerBalance).to.equal(totalSupply);
    });

})