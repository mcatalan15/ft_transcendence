const hre = require("hardhat");

async function main() {
    try {
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