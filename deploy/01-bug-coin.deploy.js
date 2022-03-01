const {BigNumber} = require("ethers");
const {network} = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const {deploy, log} = deployments
    const {deployer} = await getNamedAccounts()

    log("Deploying bug coin")
    const totalSupply = BigNumber.from(10).pow(18).mul(1000)
    const args = [totalSupply]
    const bugCoin = await deploy("BugCoin", {
        from: deployer,
        args: args,
        log: true
    });
    log("Verify bug coin")
    log("hardhat verify --network " + network.name + " --contract contracts/BugCoin.sol:BugCoin " + bugCoin.address + " " + args)
}