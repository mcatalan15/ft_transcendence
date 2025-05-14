require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const FUJI_RPC_URL = process.env.FUJI_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

module.exports = {
  solidity: "0.8.18",
  networks: {
    fuji: {
      url: FUJI_RPC_URL, // Ensure this is correctly set in your .env
      accounts: [PRIVATE_KEY], // Ensure private key is correct
      chainId: 43113, // Fuji Testnet chain ID
    },
  },
};