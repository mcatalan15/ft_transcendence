const { saveGameToDatabase,
	getLatestGame,
	getAllGames
 } = require('../db/database');

async function saveGameHandler(request, reply){
	const {
		player1_name,
		player1_score,player2_name,
		player2_score,
		winner_name
	} = request.body;

	try {
		const gameId = await saveGameToDatabase(player1_name, player1_score,player2_name, player2_score, winner_name);
		
		reply.status(201).send({
			success: true,
			message: 'Game saved successfully',
			gameId
		});
	} catch (error) {
		fastify.log.error('Error saving game:', error);
		
		if (error.message.includes('SQLITE_CONSTRAINT')) {
			reply.status(400).send({
				success: false,
				message: 'Database constraint error'
			});
		} else {
			reply.status(500).send({
				success: false,
				message: 'Failed to save game'
			});
		}
	}
};

async function retrieveGamesHandler(request, reply) {
	try {
		const games = await getAllGames();
		reply.status(200).send({
			success: true,
			games
		});
	} catch (error) {
		console.log('Error fetching games:', error);
		reply.status(500).send({
			success: false,
			message: 'Failed to fetch games'
		});
	}
};

async function retrieveLastGameHandler(request, reply) {
	try {
		const latestGame = await getLatestGame();
		
		if (!latestGame) {
			return reply.status(404).send({
				success: false,
				message: 'No games found'
			});
		}

		reply.send({
			success: true,
			game: latestGame
		});
	} catch (error) {
		request.log.error('Error fetching latest game:', error);
		reply.status(500).send({
			success: false,
			message: 'Failed to fetch latest game'
		});
	}
};

async function deployContractHandler(request, reply) {
    try {
        // 1. Get latest game data from DB
        const latestGame = await getLatestGame();
        
        if (!latestGame) {
            throw new Error("No game data found in database");
        }

        // 2. Map database fields to contract expected fields
        const gameData = {
            teamA: String(latestGame.player1_name || "Player 1"),
            scoreA: Number(latestGame.player1_score || 0),
            teamB: String(latestGame.player2_name || "Player 2"),
            scoreB: Number(latestGame.player2_score || 0)
        };

        // 3. Validate we have required data
        if (!gameData.teamA || !gameData.teamB) {
            throw new Error("Missing player names in game data");
        }

        // 4. Call blockchain container
        const response = await fetch("http://blockchain:3002/deploy", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ gameData }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Blockchain container error: ${error}`);
        }

        const blockchainResponse = await response.json();
        console.log("------------> Blockchain deployment response:", blockchainResponse);

        // 5. Save contract information to database
        await saveSmartContractToDatabase(
            latestGame.id_game, 
            blockchainResponse.address, 
            blockchainResponse.explorerLink
        );

        reply.send({
            success: true,
            contractAddress: blockchainResponse.address,
            explorerLink: blockchainResponse.explorerLink,
            gameData: {
                player1_name: gameData.teamA,
                player1_score: gameData.scoreA,
                player2_name: gameData.teamB,
                player2_score: gameData.scoreB
            }
        });
    } catch (error) {
        request.log.error("Deployment failed:", error);
        reply.status(500).send({ 
            success: false, 
            error: error.message,
            details: "Check if database contains game data with player1_name, player1_score, player2_name, player2_score"
        });
    }
};

module.exports = {
	saveGameHandler,
	retrieveGamesHandler,
	retrieveLastGameHandler,
	deployContractHandler
};