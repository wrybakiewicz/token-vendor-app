const {expect} = require("chai");
const {ethers} = require("hardhat");
const {BigNumber} = require("ethers");

const bugCoinSupply = BigNumber.from(10).pow(18).mul(1000);

describe("Vendor", function () {
    it("should deploy vendor with 0 balance", async function () {
        const bugCoin = await deployBugCoin();
        const Vendor = await ethers.getContractFactory("Vendor");
        const vendor = await Vendor.deploy(bugCoin.address);
        await vendor.deployed();

        const receivedBugCoin = await vendor.bugCoin();
        expect(receivedBugCoin).to.equal(bugCoin.address);
        const vendorBalance = await bugCoin.balanceOf(vendor.address);
        expect(vendorBalance).to.equal(0);
    });

    it("should buy from vendor", async function () {
        const [owner, address1] = await ethers.getSigners();
        const bugCoin = await deployBugCoin();
        const Vendor = await ethers.getContractFactory("Vendor");
        const vendor = await Vendor.deploy(bugCoin.address);
        await vendor.deployed();
        const vendorBalance = ethers.utils.parseEther("10.5");
        await bugCoin.transfer(vendor.address, vendorBalance)

        const buyTx = await vendor.connect(address1).buy({value: ethers.utils.parseEther("1")});

        const newVendorBalance = await bugCoin.balanceOf(vendor.address);
        expect(newVendorBalance).to.equal(ethers.utils.parseEther("0.5"));
        const address1Balance = await bugCoin.balanceOf(address1.address);
        expect(address1Balance).to.equal(ethers.utils.parseEther("10"));
        expect(buyTx).to.emit(vendor, "TokenBought")
            .withArgs(address1.address, ethers.utils.parseEther("1"), ethers.utils.parseEther("10"));
    });

    it("should buy from vendor all supply", async function () {
        const [owner, address1] = await ethers.getSigners();
        const bugCoin = await deployBugCoin();
        const Vendor = await ethers.getContractFactory("Vendor");
        const vendor = await Vendor.deploy(bugCoin.address);
        await vendor.deployed();
        const vendorBalance = ethers.utils.parseEther("10.5");
        await bugCoin.transfer(vendor.address, vendorBalance)

        const buyTx = await vendor.connect(address1).buy({value: vendorBalance.div(10)});

        const newVendorBalance = await bugCoin.balanceOf(vendor.address);
        expect(newVendorBalance).to.equal(0);
        const address1Balance = await bugCoin.balanceOf(address1.address);
        expect(address1Balance).to.equal(ethers.utils.parseEther("10.5"));
        expect(buyTx).to.emit(vendor, "TokenBought")
            .withArgs(address1.address, ethers.utils.parseEther("1.05"), ethers.utils.parseEther("10.5"));
    });

    it("should not buy from vendor when not enough bug coin", async function () {
        const [owner, address1] = await ethers.getSigners();
        const bugCoin = await deployBugCoin();
        const Vendor = await ethers.getContractFactory("Vendor");
        const vendor = await Vendor.deploy(bugCoin.address);
        await vendor.deployed();
        const vendorBalance = ethers.utils.parseEther("10.5");
        await bugCoin.transfer(vendor.address, vendorBalance);
        const allSupplyValue = bugCoinSupply.div(10);

        const buyTx = vendor.connect(address1).buy({value: allSupplyValue.add(1)});

        await expect(buyTx).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });

})

function deployBugCoin() {
    return ethers.getContractFactory("BugCoin")
        .then(bugCoin => bugCoin.deploy(bugCoinSupply))
        .then(bugCoinDeploy => bugCoinDeploy.deployed())
}