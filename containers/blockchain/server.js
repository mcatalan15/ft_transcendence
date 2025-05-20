/// LOCAL !!!!!! WORKING

// const express = require('express');
// const { ethers } = require('hardhat');

// const app = express();
// app.use(express.json());

// app.post('/deploy', async (req, res) => {
//   try {
//     console.log('Received deploy request:', req.body);

//     const GameContract = await ethers.getContractFactory("GameContract");
//     const gameContract = await GameContract.deploy();
//     await gameContract.deployed();

//     console.log('Contract deployed at:', gameContract.address);

//     res.json({ 
//       success: true,
//       address: gameContract.address,
//       txHash: gameContract.deployTransaction.hash
//     });
//   } catch (error) {
//     console.error('Deployment failed:', error.message);
//     res.status(500).json({ error: error.message });
//   }
// });

// app.listen(3002, () => {
//   console.log("Blockchain service running on port 3002");
// });

// dEPLOYING TO FUJI
//


// server.js (Blockchain service to deploy contract on Fuji)

// const express = require('express');
// const { exec } = require('child_process');
// const dotenv = require('dotenv');

// // Load environment variables from .env
// dotenv.config();

// const app = express();
// app.use(express.json());
// // Start the server
// app.listen(3002, () => {
//   console.log('Blockchain service running on port 3002');
// });
// app.post('/deploy', async (req, res) => {
//     try {
//         const { gameData } = req.body;
        
//         // Validate input
//         if (!gameData || !gameData.teamA || !gameData.teamB) {
//             return res.status(400).json({ 
//                 error: "Missing game data",
//                 required: ["teamA", "scoreA", "teamB", "scoreB"]
//             });
//         }
        
//         // Execute the deployment using environment variable instead of positional argument
//         const { exec } = require('child_process');
//         const command = `GAME_DATA='${JSON.stringify(gameData)}' npx hardhat run scripts/deploy.js --network fuji`;
        
//         console.log("Executing:", command);
        
//         exec(command, (error, stdout, stderr) => {
//             if (error) {
//                 console.error("Deployment error:", error.message);
//                 return res.status(500).json({ 
//                     error: "Deployment failed",
//                     details: stderr.toString()
//                 });
//             }
//             try {
//                 // Parse the output
//                 const result = JSON.parse(stdout);
//                 res.json(result);
//             } catch (e) {
//                 console.error("Output parsing failed:", stdout);
//                 res.status(500).json({
//                     error: "Deployment output invalid",
//                     output: stdout
//                 });
//             }
//         });
//     } catch (err) {
//         console.error("Endpoint error:", err);
//         res.status(500).json({ error: err.message });
//     }
// });
// app.post('/deploy', async (req, res) => {
//     try {
//         const { gameData } = req.body;
        
//         // Validate input
//         if (!gameData || !gameData.teamA || !gameData.teamB) {
//             return res.status(400).json({ 
//                 error: "Missing game data",
//                 required: ["teamA", "scoreA", "teamB", "scoreB"]
//             });
//         }
        
//         // Execute the deployment using environment variable
//         const { exec } = require('child_process');
//         const command = `GAME_DATA='${JSON.stringify(gameData)}' npx hardhat run scripts/deploy.js --network fuji`;
        
//         console.log("Executing:", command);
        
//         exec(command, (error, stdout, stderr) => {
//             if (error) {
//                 console.error("Deployment error:", error.message);
//                 return res.status(500).json({ 
//                     error: "Deployment failed",
//                     details: stderr.toString() || error.message
//                 });
//             }
            
//             console.log("Raw output:", stdout);
            
//             try {
//                 // Look for contract address in the output
//                 const addressMatch = stdout.match(/GameContract deployed to: (0x[a-fA-F0-9]{40})/);
//                 if (!addressMatch || !addressMatch[1]) {
//                     throw new Error("Could not find contract address in output");
//                 }
                
//                 const contractAddress = addressMatch[1];
                
//                 // Extract verification status
//                 const isVerified = stdout.includes("Verification successful") || 
//                                  stdout.includes("Contract already verified");
                
//                 // Return successful response even if verification failed
//                 return res.json({
//                     success: true,
//                     address: contractAddress,
//                     gameData: gameData,
//                     verified: isVerified,
//                     explorerLink: `https://testnet.snowtrace.io/address/${contractAddress}`
//                 });
                
//             } catch (e) {
//                 console.error("Output processing error:", e.message);
//                 // If we can't extract meaningful data, return the raw output
//                 res.status(500).json({
//                     error: "Failed to process deployment output",
//                     details: e.message,
//                     rawOutput: stdout
//                 });
//             }
//         });
//     } catch (err) {
//         console.error("Endpoint error:", err);
//         res.status(500).json({ error: err.message });
//     }
// });
//VERSION 3002
// app.post('/deploy', async (req, res) => {
//     try {
//         const { gameData } = req.body;
        
//         // Validate input
//         if (!gameData || !gameData.teamA || !gameData.teamB) {
//             return res.status(400).json({ 
//                 error: "Missing game data",
//                 required: ["teamA", "scoreA", "teamB", "scoreB"]
//             });
//         }
        
//         // Execute the deployment using environment variable
//         const { exec } = require('child_process');
//         const command = `GAME_DATA='${JSON.stringify(gameData)}' npx hardhat run scripts/deploy.js --network fuji`;
        
//         console.log("Executing:", command);
        
//         exec(command, (error, stdout, stderr) => {
//             if (error) {
//                 console.error("Deployment error:", error.message);
//                 return res.status(500).json({ 
//                     error: "Deployment failed",
//                     details: stderr.toString() || error.message
//                 });
//             }
            
//             console.log("Raw output:", stdout);
            
//             try {
//                 // Look for contract address in the output
//                 const addressMatch = stdout.match(/GameContract deployed to: (0x[a-fA-F0-9]{40})/);
//                 if (!addressMatch || !addressMatch[1]) {
//                     throw new Error("Could not find contract address in output");
//                 }
                
//                 const contractAddress = addressMatch[1];
                
//                 // Extract verification status - consider any of these messages as success
//                 const isVerified = stdout.includes("Verification successful") || 
//                                  stdout.includes("Contract already verified");
                
//                 // Check if it's a missing API key error (which we can ignore)
//                 const isMissingApiKey = stdout.includes("but no API token was found") || 
//                                       stdout.includes("apiKey");
                
//                 // Return successful response even if verification failed
//                 return res.json({
//                     success: true,
//                     address: contractAddress,
//                     gameData: gameData,
//                     verified: isVerified,
//                     verification_skipped: isMissingApiKey ? "API key not configured" : false,
//                     explorerLink: `https://testnet.snowtrace.io/address/${contractAddress}`
//                 });
                
//             } catch (e) {
//                 console.error("Output processing error:", e.message);
//                 // If we can't extract meaningful data, return the raw output
//                 res.status(500).json({
//                     error: "Failed to process deployment output",
//                     details: e.message,
//                     rawOutput: stdout
//                 });
//             }
//         });
//     } catch (err) {
//         console.error("Endpoint error:", err);
//         res.status(500).json({ error: err.message });
//     }
// });
// // Start the server
// app.listen(3002, () => {
//   console.log('Blockchain service running on port 3002');
// });
const express = require('express');
const { exec } = require('child_process');
const dotenv = require('dotenv');
// Load environment variables from .env
dotenv.config();
const app = express();
app.use(express.json());
app.post('/deploy', async (req, res) => {
    try {
        const { gameData } = req.body;
        
        // Validate input
        if (!gameData || !gameData.teamA || !gameData.teamB) {
            return res.status(400).json({ 
                error: "Missing game data",
                required: ["teamA", "scoreA", "teamB", "scoreB"]
            });
        }
        
        // Execute the deployment using environment variable
        const { exec } = require('child_process');
        const command = `GAME_DATA='${JSON.stringify(gameData)}' npx hardhat run scripts/deploy.js --network fuji`;
        
        console.log("Executing:", command);
        
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error("Deployment error:", error.message);
                return res.status(500).json({ 
                    error: "Deployment failed",
                    details: stderr.toString() || error.message
                });
            }
            
            console.log("Raw output:", stdout);
            
            try {
                // Look for contract address in the output
                const addressMatch = stdout.match(/GameContract deployed to: (0x[a-fA-F0-9]{40})/);
                if (!addressMatch || !addressMatch[1]) {
                    throw new Error("Could not find contract address in output");
                }
                
                const contractAddress = addressMatch[1];
                
                // Extract verification status - consider any of these messages as success
                const isVerified = stdout.includes("Verification successful") || 
                                 stdout.includes("Contract already verified");
                
                // Enhanced error handling for verification
                let verificationStatus = isVerified ? "success" : "failed";
                let verificationMessage = null;
                
                if (!isVerified) {
                    if (stdout.includes("but no API token was found")) {
                        verificationStatus = "skipped";
                        verificationMessage = "API key not configured";
                    } else if (stdout.includes("Contract verification failed")) {
                        const verificationErrorMatch = stdout.match(/Contract verification failed: (.*?)(?=\n|$)/);
                        verificationMessage = verificationErrorMatch ? verificationErrorMatch[1] : "Unknown verification error";
                    }
                }
                
                // Return successful response even if verification failed
                return res.json({
                    success: true,
                    address: contractAddress,
                    gameData: gameData,
                    verified: isVerified,
                    verification: {
                        status: verificationStatus,
                        message: verificationMessage
                    },
                    explorerLink: `https://testnet.snowtrace.io/address/${contractAddress}`
                });
                
            } catch (e) {
                console.error("Output processing error:", e.message);
                // If we can't extract meaningful data, return the raw output
                res.status(500).json({
                    error: "Failed to process deployment output",
                    details: e.message,
                    rawOutput: stdout
                });
            }
        });
    } catch (err) {
        console.error("Endpoint error:", err);
        res.status(500).json({ error: err.message });
    }
});
// Start the server
app.listen(3002, () => {
  console.log('Blockchain service running on port 3002');
});