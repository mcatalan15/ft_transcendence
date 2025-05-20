// require("@nomicfoundation/hardhat-toolbox");
// require("dotenv").config();

// // Use correct environment variables and provide fallbacks
// const FUJI_RPC_URL = process.env.FUJI_RPC_URL || "https://api.avax-test.network/ext/bc/C/rpc";
// const PRIVATE_KEY = process.env.BLOCKCHAIN_PRIVATE_KEY || process.env.PRIVATE_KEY;

// module.exports = {
// 	solidity: "0.8.18",
// 	networks: {
// 		fuji: {
// 			url: FUJI_RPC_URL,
// 			accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
// 			chainId: 43113, // Fuji Testnet chain ID
// 			// Add timeout and confirmation settings for network stability
// 			timeout: 60000,
// 			gas: 5000000,
// 			gasPrice: 225000000000,
// 		},
// 	},
// 	etherscan: {
// 		// This is the key part - provide an empty string for the API key
// 		apiKey: {
// 			avalancheFujiTestnet: process.env.SNOWTRACE_API_KEY || ""
// 		},
// 		customChains: [
// 			{
// 				network: "avalancheFujiTestnet",
// 				chainId: 43113,
// 				urls: {
// 					apiURL: "https://api-testnet.snowtrace.io/api",
// 					browserURL: "https://testnet.snowtrace.io"
// 				}
// 			}
// 		]
// 	},
// };
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// Use correct environment variables and provide fallbacks
const FUJI_RPC_URL = process.env.FUJI_RPC_URL || "https://api.avax-test.network/ext/bc/C/rpc";
const PRIVATE_KEY = process.env.BLOCKCHAIN_PRIVATE_KEY || process.env.PRIVATE_KEY;
const SNOWTRACE_API_KEY = process.env.SNOWTRACE_API_KEY || "snowtrace"; // Default to a non-empty string

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