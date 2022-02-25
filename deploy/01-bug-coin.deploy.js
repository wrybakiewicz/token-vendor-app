const fs = require("fs");
const {BigNumber} = require("ethers");

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
    saveFrontendFiles(bugCoin.address);
}

function saveFrontendFiles(address) {
    const contractsDir = __dirname + "/../frontend/src/contracts";

    if (!fs.existsSync(contractsDir)) {
        fs.mkdirSync(contractsDir);
    }

    fs.writeFileSync(
        contractsDir + "/contract-address.json",
        JSON.stringify({ BugCoin: address }, undefined, 2)
    );

    const BugCoinArtifact = artifacts.readArtifactSync("BugCoin");

    fs.writeFileSync(
        contractsDir + "/BugCoin.json",
        JSON.stringify(BugCoinArtifact, null, 2)
    );
}