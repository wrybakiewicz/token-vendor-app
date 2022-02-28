const {expect} = require("chai");
const {ethers, waffle} = require("hardhat");
const {BigNumber} = require("ethers");

const bugCoinSupply = BigNumber.from(10).pow(18).mul(1000);

describe("Vendor", function () {
    it("should deploy vendor with 0 balance", async function () {
        const [owner, address1] = await ethers.getSigners();
        const bugCoin = await deployBugCoin();
        const Vendor = await ethers.getContractFactory("Vendor");
        const vendor = await Vendor.connect(address1).deploy(bugCoin.address);
        await vendor.deployed();

        const receivedBugCoin = await vendor.bugCoin();
        expect(receivedBugCoin).to.equal(bugCoin.address);
        const vendorBalance = await bugCoin.balanceOf(vendor.address);
        expect(vendorBalance).to.equal(0);
        const vendorOwner = await vendor.owner();
        expect(vendorOwner).to.equal(address1.address);
    });

    it("should buy from vendor", async function () {
        const [owner, address1] = await ethers.getSigners();
        const bugCoin = await deployBugCoin();
        const vendor = await deployVendor(bugCoin.address);
        const vendorBalance = ethers.utils.parseEther("10.5");
        await bugCoin.transfer(vendor.address, vendorBalance);
        const ownerEthBalanceInitial = await owner.getBalance();
        const address1EthBalanceInitial = await address1.getBalance();
        const buyTxValue = ethers.utils.parseEther("1");

        const buyTx = await vendor.connect(address1).buy({value: buyTxValue});

        const newVendorBalance = await bugCoin.balanceOf(vendor.address);
        expect(newVendorBalance).to.equal(ethers.utils.parseEther("0.5"));
        const address1BalanceBgc = await bugCoin.balanceOf(address1.address);
        expect(address1BalanceBgc).to.equal(ethers.utils.parseEther("10"));
        const vendorEthBalance = await waffle.provider.getBalance(vendor.address);
        expect(vendorEthBalance).to.equal(buyTxValue);
        const ownerBalance = await owner.getBalance();
        expect(ownerBalance).to.equal(ownerEthBalanceInitial);
        const address1Balance = await address1.getBalance();
        const buyGasFee = await getGasFee(buyTx);
        expect(address1Balance).to.equal(address1EthBalanceInitial.sub(buyTxValue).sub(buyGasFee));
        expect(buyTx).to.emit(vendor, "TokenBought")
            .withArgs(address1.address, ethers.utils.parseEther("1"), ethers.utils.parseEther("10"));
    });

    it("should buy from vendor all supply", async function () {
        const [owner, address1] = await ethers.getSigners();
        const bugCoin = await deployBugCoin();
        const vendor = await deployVendor(bugCoin.address);
        const vendorBalance = ethers.utils.parseEther("10.5");
        await bugCoin.transfer(vendor.address, vendorBalance)
        const buyTxValue = vendorBalance.div(10);
        const ownerEthBalanceInitial = await owner.getBalance();
        const address1EthBalanceInitial = await address1.getBalance();

        const buyTx = await vendor.connect(address1).buy({value: buyTxValue});

        const newVendorBalance = await bugCoin.balanceOf(vendor.address);
        expect(newVendorBalance).to.equal(0);
        const address1BgcBalance = await bugCoin.balanceOf(address1.address);
        expect(address1BgcBalance).to.equal(ethers.utils.parseEther("10.5"));
        const vendorEthBalance = await waffle.provider.getBalance(vendor.address);
        expect(vendorEthBalance).to.equal(buyTxValue);
        const ownerBalance = await owner.getBalance();
        expect(ownerBalance).to.equal(ownerEthBalanceInitial);
        const address1Balance = await address1.getBalance();
        const buyGasFee = await getGasFee(buyTx);
        expect(address1Balance).to.equal(address1EthBalanceInitial.sub(buyTxValue).sub(buyGasFee));
        expect(buyTx).to.emit(vendor, "TokenBought")
            .withArgs(address1.address, ethers.utils.parseEther("1.05"), ethers.utils.parseEther("10.5"));
    });

    it("should not buy from vendor when not enough bug coin", async function () {
        const [owner, address1] = await ethers.getSigners();
        const bugCoin = await deployBugCoin();
        const vendor = await deployVendor(bugCoin.address);
        const vendorBalance = ethers.utils.parseEther("10.5");
        await bugCoin.transfer(vendor.address, vendorBalance);
        const allSupplyValue = bugCoinSupply.div(10);

        const buyTx = vendor.connect(address1).buy({value: allSupplyValue.add(1)});

        await expect(buyTx).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });

    it("should buy from vendor & withdraw eth", async function () {
        const [owner, address1] = await ethers.getSigners();
        const bugCoin = await deployBugCoin();
        const vendor = await deployVendor(bugCoin.address);
        const vendorBgcBalance = ethers.utils.parseEther("10.5");
        await bugCoin.transfer(vendor.address, vendorBgcBalance);
        const address1EthBalanceInitial = await address1.getBalance();
        const vendorEthBalanceInitial = await owner.getBalance();
        const buyTxValue = ethers.utils.parseEther("1");

        const buyTx = await vendor.connect(address1).buy({value: buyTxValue});
        const withdrawTx = await vendor.connect(owner).withdraw();

        const vendorEthBalance = await waffle.provider.getBalance(vendor.address);
        expect(vendorEthBalance).to.equal(0);
        const ownerEthBalance = await owner.getBalance();
        const withdrawGasFee = await getGasFee(withdrawTx);
        expect(ownerEthBalance).to.equal(vendorEthBalanceInitial.sub(withdrawGasFee).add(buyTxValue));
        const address1Balance = await address1.getBalance();
        const buyGasFee = await getGasFee(buyTx);
        expect(address1Balance).to.equal(address1EthBalanceInitial.sub(buyTxValue).sub(buyGasFee));
        expect(withdrawTx).to.emit(vendor, "EthWithdrawn")
            .withArgs(owner.address, ethers.utils.parseEther("1"));
    });

    it("should buy from vendor & fail to withdraw eth not by owner", async function () {
        const [owner, address1] = await ethers.getSigners();
        const bugCoin = await deployBugCoin();
        const vendor = await deployVendor(bugCoin.address);
        const vendorBgcBalance = ethers.utils.parseEther("10.5");
        await bugCoin.transfer(vendor.address, vendorBgcBalance);
        const buyTxValue = ethers.utils.parseEther("1");

        await vendor.connect(address1).buy({value: buyTxValue});
        const withdrawTx = vendor.connect(address1).withdraw();

        await expect(withdrawTx).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should buy & sell tokens", async function () {
        const [owner, address1] = await ethers.getSigners();
        const bugCoin = await deployBugCoin();
        const vendor = await deployVendor(bugCoin.address);
        const vendorBgcBalance = ethers.utils.parseEther("10.5");
        await bugCoin.transfer(vendor.address, vendorBgcBalance);
        const address1EthBalanceInitial = await address1.getBalance();
        const ownerEthBalanceInitial = await owner.getBalance();
        const buyTxValue = ethers.utils.parseEther("1");
        const sellValue = ethers.utils.parseEther("3");

        const approveTx = await bugCoin.connect(address1).approve(vendor.address, sellValue);
        const buyTx = await vendor.connect(address1).buy({value: buyTxValue});
        const sellTx = await vendor.connect(address1).sell(sellValue);

        const newVendorBgcBalance = await bugCoin.balanceOf(vendor.address);
        expect(newVendorBgcBalance).to.equal(ethers.utils.parseEther("3.5"));
        const vendorEthBalance = await waffle.provider.getBalance(vendor.address);
        expect(vendorEthBalance).to.equal(ethers.utils.parseEther("0.7"));
        const address1EthBalance = await address1.getBalance();
        const buyGasFee = await getGasFee(buyTx);
        const sellGasFee = await getGasFee(sellTx);
        const approveGasFee = await getGasFee(approveTx);
        expect(address1EthBalance).to.equal(
            address1EthBalanceInitial.sub(buyTxValue).sub(buyGasFee).sub(sellGasFee).sub(approveGasFee)
                .add(ethers.utils.parseEther("0.3")));
        const address1BgcBalance = await bugCoin.balanceOf(address1.address);
        expect(address1BgcBalance).to.equal(ethers.utils.parseEther("7"));
        const ownerBgcBalance = await bugCoin.balanceOf(owner.address);
        expect(ownerBgcBalance).to.equal(bugCoinSupply.sub(vendorBgcBalance));
        const ownerEthBalance = await owner.getBalance();
        expect(ownerEthBalance).to.equal(ownerEthBalanceInitial);
        expect(sellTx).to.emit(vendor, "TokenSold")
            .withArgs(address1.address, ethers.utils.parseEther("0.3"), sellValue);
    });

    it("should buy & sell all tokens", async function () {
        const [owner, address1] = await ethers.getSigners();
        const bugCoin = await deployBugCoin();
        const vendor = await deployVendor(bugCoin.address);
        const vendorBgcBalance = ethers.utils.parseEther("10.5");
        await bugCoin.transfer(vendor.address, vendorBgcBalance);
        const address1EthBalanceInitial = await address1.getBalance();
        const ownerEthBalanceInitial = await owner.getBalance();
        const buyTxValue = ethers.utils.parseEther("1");
        const sellValue = ethers.utils.parseEther("10");

        const approveTx = await bugCoin.connect(address1).approve(vendor.address, sellValue);
        const buyTx = await vendor.connect(address1).buy({value: buyTxValue});
        const sellTx = await vendor.connect(address1).sell(sellValue);

        const newVendorBgcBalance = await bugCoin.balanceOf(vendor.address);
        expect(newVendorBgcBalance).to.equal(vendorBgcBalance);
        const vendorEthBalance = await waffle.provider.getBalance(vendor.address);
        expect(vendorEthBalance).to.equal(0);
        const address1EthBalance = await address1.getBalance();
        const buyGasFee = await getGasFee(buyTx);
        const sellGasFee = await getGasFee(sellTx);
        const approveGasFee = await getGasFee(approveTx);
        expect(address1EthBalance).to.equal(
            address1EthBalanceInitial.sub(buyGasFee).sub(sellGasFee).sub(approveGasFee));
        const address1BgcBalance = await bugCoin.balanceOf(address1.address);
        expect(address1BgcBalance).to.equal(0);
        const ownerBgcBalance = await bugCoin.balanceOf(owner.address);
        expect(ownerBgcBalance).to.equal(bugCoinSupply.sub(vendorBgcBalance));
        const ownerEthBalance = await owner.getBalance();
        expect(ownerEthBalance).to.equal(ownerEthBalanceInitial);
        expect(sellTx).to.emit(vendor, "TokenSold")
            .withArgs(address1.address, buyTxValue, sellValue);
    });

    it("should buy & sell small amount tokens", async function () {
        const [owner, address1] = await ethers.getSigners();
        const bugCoin = await deployBugCoin();
        const vendor = await deployVendor(bugCoin.address);
        const vendorBgcBalance = ethers.utils.parseEther("10.5");
        await bugCoin.transfer(vendor.address, vendorBgcBalance);
        const address1EthBalanceInitial = await address1.getBalance();
        const ownerEthBalanceInitial = await owner.getBalance();
        const buyTxValue = ethers.utils.parseEther("1");
        const sellValue = 9;

        const approveTx = await bugCoin.connect(address1).approve(vendor.address, sellValue);
        const buyTx = await vendor.connect(address1).buy({value: buyTxValue});
        const sellTx = await vendor.connect(address1).sell(sellValue);

        const newVendorBgcBalance = await bugCoin.balanceOf(vendor.address);
        expect(newVendorBgcBalance).to.equal(ethers.utils.parseEther("0.5").add(sellValue));
        const vendorEthBalance = await waffle.provider.getBalance(vendor.address);
        expect(vendorEthBalance).to.equal(buyTxValue);
        const address1EthBalance = await address1.getBalance();
        const buyGasFee = await getGasFee(buyTx);
        const sellGasFee = await getGasFee(sellTx);
        const approveGasFee = await getGasFee(approveTx);
        expect(address1EthBalance).to.equal(
            address1EthBalanceInitial.sub(buyTxValue).sub(buyGasFee).sub(sellGasFee).sub(approveGasFee));
        const address1BgcBalance = await bugCoin.balanceOf(address1.address);
        expect(address1BgcBalance).to.equal(ethers.utils.parseEther("10").sub(9));
        const ownerBgcBalance = await bugCoin.balanceOf(owner.address);
        expect(ownerBgcBalance).to.equal(bugCoinSupply.sub(vendorBgcBalance));
        const ownerEthBalance = await owner.getBalance();
        expect(ownerEthBalance).to.equal(ownerEthBalanceInitial);
        expect(sellTx).to.emit(vendor, "TokenSold")
            .withArgs(address1.address, 0, sellValue);
    });

    it("should buy & fail to sell without approve", async function () {
        const [owner, address1] = await ethers.getSigners();
        const bugCoin = await deployBugCoin();
        const vendor = await deployVendor(bugCoin.address);
        const vendorBgcBalance = ethers.utils.parseEther("10.5");
        await bugCoin.transfer(vendor.address, vendorBgcBalance);
        const buyTxValue = ethers.utils.parseEther("1");
        const sellValue = 9;

        await vendor.connect(address1).buy({value: buyTxValue});
        const sellTx = vendor.connect(address1).sell(sellValue);

        await expect(sellTx).to.be.revertedWith("ERC20: insufficient allowance");
    });

    it("should buy & fail to sell when not enough balance", async function () {
        const [owner, address1] = await ethers.getSigners();
        const bugCoin = await deployBugCoin();
        const vendor = await deployVendor(bugCoin.address);
        const vendorBgcBalance = ethers.utils.parseEther("10.5");
        await bugCoin.transfer(vendor.address, vendorBgcBalance);
        const buyTxValue = ethers.utils.parseEther("1");
        const sellValue = ethers.utils.parseEther("10").add(1);

        await bugCoin.connect(address1).approve(vendor.address, sellValue);
        await vendor.connect(address1).buy({value: buyTxValue});
        const sellTx = vendor.connect(address1).sell(sellValue);

        await expect(sellTx).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });
})

function deployBugCoin() {
    return ethers.getContractFactory("BugCoin")
        .then(bugCoin => bugCoin.deploy(bugCoinSupply))
        .then(bugCoinDeploy => bugCoinDeploy.deployed())
}

function deployVendor(bugCoinAddress) {
    return ethers.getContractFactory("Vendor")
        .then(vendor => vendor.deploy(bugCoinAddress))
        .then(vendor => vendor.deployed());
}

function getGasFee(tx) {
    return tx.wait()
        .then(txResult => txResult.effectiveGasPrice.mul(txResult.cumulativeGasUsed));
}