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

        if (!gameData.player1Name || !gameData.player2Name) {
            console.error("Missing required game data. Expected format: {\"player1Name\":\"Name\",\"player1Score\":0,\"player2Name\":\"Name\",\"player2Score\":0}");
            process.exit(1);
        }
        
        console.log("Starting deployment with game data:", gameData);
        
        const [deployer] = await hre.ethers.getSigners();
        console.log("Deploying with account:", deployer.address);
        console.log("Account balance:", (await deployer.getBalance()).toString());
        
        const player1Score = gameData.player1Score || 0;
        const player2Score = gameData.player2Score || 0;

        console.log("Deploying with parameters:", {
            player1Name: gameData.player1Name,
            player1Score: player1Score,
            player2Name: gameData.player2Name,
            player2Score: player2Score
        });
        
        const GameContract = await hre.ethers.getContractFactory("GameContract");
        const gameContract = await GameContract.deploy(
            gameData.player1Name,
            player1Score,
            gameData.player2Name,
            player2Score
        );
        
        await gameContract.deployed();
        const contractAddress = gameContract.address;
        console.log("GameContract deployed to:", contractAddress);
        
        console.log("Attempting to verify contract at:", contractAddress);
        try {
            await hre.run("verify:verify", {
                address: contractAddress,
                constructorArguments: [
                    gameData.player1Name,
                    player1Score,
                    gameData.player2Name,
                    player2Score
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