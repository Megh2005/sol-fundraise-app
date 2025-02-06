require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */

module.exports = {
  solidity: "0.8.24",
  defaultNetwork: "sonic",
  networks: {
    sonic: {
      url: process.env.SONIC_URL,
      chainId: 57054,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};
