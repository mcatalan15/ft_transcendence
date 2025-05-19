require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// Use correct environment variables and provide fallbacks
const FUJI_RPC_URL = process.env.FUJI_RPC_URL || "https://api.avax-test.network/ext/bc/C/rpc";
const PRIVATE_KEY = process.env.BLOCKCHAIN_PRIVATE_KEY || process.env.PRIVATE_KEY;

// For debugging
// console.log("RPC URL being used:", FUJI_RPC_URL);
// console.log("Private key exists:", !!PRIVATE_KEY);

module.exports = {
	solidity: "0.8.18",
	networks: {
		fuji: {
			url: FUJI_RPC_URL,
			accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
			chainId: 43113, // Fuji Testnet chain ID
			// Add timeout and confirmation settings for network stability
			timeout: 60000,
			gas: 5000000,
			gasPrice: 225000000000,
		},
	},
	etherscan: {
		
	},
};
