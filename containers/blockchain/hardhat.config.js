require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.19",
  networks: {
    fuji: {
      url: process.env.FUJI_RPC_URL,
      accounts: [process.env.BLOCKCHAIN_PRIVATE_KEY]
    }
  }
};