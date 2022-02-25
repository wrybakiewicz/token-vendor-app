const {ethers} = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const {deploy, log, get} = deployments
    const {deployer} = await getNamedAccounts()

    const bugCoin = await get("BugCoin")

    log("Deploying vendor")
    const args = [bugCoin.address]
    const vendor = await deploy("Vendor", {
        from: deployer,
        args: args,
        log: true
    })

    log("Transferring bug coin to vendor")
    const bugCoinContract = await getBugContract(bugCoin.address)
    const bugCoinSupply = await bugCoinContract.totalSupply();
    await bugCoinContract.transfer(vendor.address, bugCoinSupply.div(2))

}

async function getBugContract(address) {
    const accounts = await ethers.getSigners()
    const signer = accounts[0]
    const BugCoin = await ethers.getContractFactory("BugCoin")
    return new ethers.Contract(
        address,
        BugCoin.interface,
        signer
    );
}