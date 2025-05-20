
// scripts/deploy.js DEPLOYING AND VERIFYING "Empty Contract"!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//   const hre = require("hardhat");
  
//   async function deploy() {
//     console.log("Starting deployment to Fuji Testnet...");
//     console.log("Network config:", hre.network.config);
    
//     try {
//       // Get the network information
//       const [deployer] = await hre.ethers.getSigners();
//       console.log("Deploying contracts with the account:", deployer.address);
//       console.log("Account balance:", (await deployer.getBalance()).toString());
  
//       // Get the contract factory
//       const GameContract = await hre.ethers.getContractFactory("GameContract");
      
//       console.log("Deploying GameContract...");
//       // Deploy the contract
//       const gameContract = await GameContract.deploy();
      
//       // For hardhat ethers v5 compatibility
//       console.log("Waiting for deployment transaction to be mined...");
//       await gameContract.deployed();
      
//       console.log("GameContract deployed to:", gameContract.address);
//       console.log("Transaction hash:", gameContract.deployTransaction.hash);
      
//       // For verification later (optional)
//       // console.log("Run the following to verify your contract:");
//       // console.log(`npx hardhat verify --network fuji ${gameContract.address}`);
      
//       return gameContract;
//     } catch (error) {
//       console.error("Detailed deployment error:", error);
//       throw error;
//     }
//   }
  
//   async function verify(gameContractAddress) {
//     console.log("Verifying contract at address:", gameContractAddress);
//     try {
//       await hre.run("verify:verify", {
//         address: gameContractAddress,
//         constructorArguments: [], // Add constructor arguments if your contract has any
//       });
//       console.log("Contract verified successfully!");
// 			return gameContractAddress;
//     } catch (error) {
//       console.error("Verification failed:", error.message);
//       // Don't throw here unless you want to stop the entire process
//     }
//   }
  
//   async function main() {
//     try {
//       const deployedContract = await deploy();
//       await verify(deployedContract.address); // Pass the address to verify
//     } catch (deployErr) {
//       console.error("Deployment failed inside main():", deployErr);
//       throw deployErr;
//     }
//   }
  
//   // Execute the deployment
//   main()
//     .then(() => process.exit(0))
//     .catch((error) => {
//       console.error("Deployment and verification proccess failed:", error);
//       process.exit(1);
//     });

// //
// deploy values but error verifiyng
// const hre = require("hardhat");
// const fs = require('fs');

// async function deploy(gameData) {
//     console.log("Starting deployment with game data:", gameData);
    
//     try {
//         // 1. Get signer and network info
//         const [deployer] = await hre.ethers.getSigners();
//         console.log("Deploying with account:", deployer.address);
//         console.log("Account balance:", (await deployer.getBalance()).toString());

//         // 2. Get contract factory
//         const GameContract = await hre.ethers.getContractFactory("GameContract");
        
//         // 3. Validate game data
//         if (!gameData.teamA || !gameData.teamB) {
//             throw new Error("Missing team names in game data");
//         }

//         // Set default scores if not provided
//         const scoreA = gameData.scoreA || 0;
//         const scoreB = gameData.scoreB || 0;

//         console.log("Deploying with parameters:", {
//             teamA: gameData.teamA,
//             scoreA: scoreA,
//             teamB: gameData.teamB,
//             scoreB: scoreB
//         });

//         // 4. Deploy contract
//         const gameContract = await GameContract.deploy(
//             gameData.teamA,
//             scoreA,
//             gameData.teamB,
//             scoreB
//         );
        
//         await gameContract.deployed();
//         console.log("GameContract deployed to:", gameContract.address);
        
//         return {
//             contract: gameContract,
//             gameData: {
//                 teamA: gameData.teamA,
//                 scoreA: scoreA,
//                 teamB: gameData.teamB,
//                 scoreB: scoreB
//             }
//         };
//     } catch (error) {
//         console.error("Deployment failed:", error);
//         throw error;
//     }
// }

// async function verify(contractAddress, gameData) {
//     console.log("Verifying contract at:", contractAddress);
//     try {
//         await hre.run("verify:verify", {
//             address: contractAddress,
//             constructorArguments: [
//                 gameData.teamA,
//                 gameData.scoreA,
//                 gameData.teamB,
//                 gameData.scoreB
//             ],
//         });
//         console.log("Verification successful!");
//     } catch (error) {
//         if (error.message.includes("Already Verified")) {
//             console.log("Contract already verified");
//         } else {
//             console.warn("Verification failed (non-critical):", error.message);
//         }
//     }
// }

// async function main() {
//     // Get game data from command line arguments or environment
//     const gameData = JSON.parse(process.argv[2] || process.env.GAME_DATA || '{}');
    
//     if (!gameData.teamA || !gameData.teamB) {
//         throw new Error("Missing required game data. Expected format: {\"teamA\":\"Name\",\"scoreA\":0,\"teamB\":\"Name\",\"scoreB\":0}");
//     }

//     try {
//         // 1. Deploy contract
//         const { contract, gameData: deployedData } = await deploy(gameData);
        
//         // 2. Verify contract (optional)
//         await verify(contract.address, deployedData);
        
//         // 3. Return success data
//         console.log(JSON.stringify({
//             success: true,
//             address: contract.address,
//             gameData: deployedData,
//             explorerLink: `https://testnet.snowtrace.io/address/${contract.address}` // Update for your network
//         }));
        
//     } catch (error) {
//         console.error(JSON.stringify({
//             success: false,
//             error: error.message
//         }));
//         process.exit(1);
//     }
// }

// main();
const hre = require("hardhat");

async function main() {
    try {
        // Get game data from environment variable
        let gameData;
        try {
            gameData = process.env.GAME_DATA ? JSON.parse(process.env.GAME_DATA) : {};
        } catch (e) {
            console.error("Failed to parse game data:", e.message);
            process.exit(1);
        }
        
        if (!gameData.teamA || !gameData.teamB) {
            console.error("Missing required game data. Expected format: {\"teamA\":\"Name\",\"scoreA\":0,\"teamB\":\"Name\",\"scoreB\":0}");
            process.exit(1);
        }
        
        console.log("Starting deployment with game data:", gameData);
        
        // Get signer
        const [deployer] = await hre.ethers.getSigners();
        console.log("Deploying with account:", deployer.address);
        console.log("Account balance:", (await deployer.getBalance()).toString());
        
        // Set default scores if not provided
        const scoreA = gameData.scoreA || 0;
        const scoreB = gameData.scoreB || 0;
        
        console.log("Deploying with parameters:", {
            teamA: gameData.teamA,
            scoreA: scoreA,
            teamB: gameData.teamB,
            scoreB: scoreB
        });
        
        // Deploy contract
        const GameContract = await hre.ethers.getContractFactory("GameContract");
        const gameContract = await GameContract.deploy(
            gameData.teamA,
            scoreA,
            gameData.teamB,
            scoreB
        );
        
        await gameContract.deployed();
        const contractAddress = gameContract.address;
        console.log("GameContract deployed to:", contractAddress);
        
        // Try to verify contract (don't exit if verification fails)
        console.log("Attempting to verify contract at:", contractAddress);
        try {
            await hre.run("verify:verify", {
                address: contractAddress,
                constructorArguments: [
                    gameData.teamA,
                    scoreA,
                    gameData.teamB,
                    scoreB
                ],
            });
            console.log("Verification successful!");
        } catch (verifyError) {
            if (verifyError.message.includes("Already Verified")) {
                console.log("Contract already verified");
            } else {
                console.log("Contract verification failed:", verifyError.message);
            }
        }
        
    } catch (error) {
        console.error("Deployment process failed:", error.message);
        process.exit(1);
    }
}

main();