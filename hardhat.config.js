require("@nomiclabs/hardhat-waffle");
require('hardhat-deploy');
require("dotenv").config()
require("@nomiclabs/hardhat-etherscan");

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.4",
  namedAccounts: {
    deployer: {
      default: 0,
    },
    feeCollector: {
      default: 0,
    },
  },
  networks: {
    hardhat: {
      accounts: {
        mnemonic: process.env.MNEMONIC
      },
    },
    localhost: {
      accounts: {
        mnemonic: process.env.MNEMONIC
      },
    }
  },
};
