require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const FUJI_RPC_URL = process.env.FUJI_RPC_URL;
const PRIVATE_KEY = process.env.BLOCKCHAIN_PRIVATE_KEY;
const SNOWTRACE_API_KEY = process.env.SNOWTRACE_API_KEY || "snowtrace";

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
		apiKey: {
			avalancheFujiTestnet: SNOWTRACE_API_KEY
		},
		customChains: [
			{
				network: "avalancheFujiTestnet",
				chainId: 43113,
				urls: {
					apiURL: "https://api-testnet.snowtrace.io/api",
					browserURL: "https://testnet.snowtrace.io"
				}
			}
		]
	},
};