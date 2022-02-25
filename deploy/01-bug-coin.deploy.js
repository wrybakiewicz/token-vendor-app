const {BigNumber} = require("ethers");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const {deploy, log} = deployments
    const {deployer} = await getNamedAccounts()

    log("Deploying bug coin")
    const totalSupply = BigNumber.from(10).pow(18).mul(1000)
    const args = [totalSupply]
    await deploy("BugCoin", {
        from: deployer,
        args: args,
        log: true
    });
}