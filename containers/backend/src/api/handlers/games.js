const { saveGameToDatabase,
    saveGameResultsToDatabase,
	getLatestGame,
	getAllGames,
	saveSmartContractToDatabase
 } = require('../db/database');

async function saveGameHandler(request, reply) {
    const {
        player1_id,
        player2_id,
        winner_id,
        player1_name,
        player2_name,
        player1_score,
        player2_score,
        winner_name,
        player1_is_ai,
        player2_is_ai,
        game_mode,
        is_tournament,
        smart_contract_link,
        contract_address
    } = request.body;

    try {
        const gameId = await saveGameToDatabase(
            player1_id,
            player2_id,
            winner_id,
            player1_name,
            player2_name,
            player1_score,
            player2_score,
            winner_name,
            player1_is_ai,
            player2_is_ai,
            game_mode,
            is_tournament,
            smart_contract_link,
            contract_address
        );

        reply.status(201).send({
            success: true,
            message: 'Game saved successfully',
            gameId
        });
    } catch (error) {
        console.log('Error saving game:', error);

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
}

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
        console.log('Starting deployment process');
        const latestGame = await getLatestGame();
        console.log('Latest game:', latestGame);
        if (!latestGame) {
            throw new Error("No game data found in database");
        }

        const gameData = {
            teamA: String(latestGame.player1_name || "Player 1"),
            scoreA: Number(latestGame.player1_score || 0),
            teamB: String(latestGame.player2_name || "Player 2"),
            scoreB: Number(latestGame.player2_score || 0)
        };

        if (!gameData.teamA || !gameData.teamB) {
            throw new Error("Missing player names in game data");
        }

        console.log('Sending request to blockchain service:', gameData);
        const response = await fetch("http://blockchain:3002/deploy", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ gameData }),
        });

        console.log('Blockchain response status:', response.status);
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Blockchain container error: ${error}`);
        }

        const blockchainResponse = await response.json();
        console.log("Blockchain deployment response:", blockchainResponse);

        console.log('Saving contract to database:', {
            id_game: latestGame.id_game,
            address: blockchainResponse.address,
            explorerLink: blockchainResponse.explorerLink
        });
        await saveSmartContractToDatabase(
            latestGame.id_game,
            blockchainResponse.address,
            blockchainResponse.explorerLink
        );

        console.log('Deployment completed successfully');
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
        console.error("Deployment failed:", {
            message: error.message,
            stack: error.stack,
            name: error.name,
            code: error.code
        });
        request.log.error("Deployment failed:", error);
        reply.status(500).send({
            success: false,
            error: error.message,
            details: error.message.includes("database")
                ? "Check database connection and game data"
                : error.message.includes("blockchain")
                ? "Check blockchain service connectivity"
                : "Unexpected error during deployment"
        });
    }
};

const getGamesHistoryHandler = async (request, reply) => {
  try {
    const userId = request.user.id;
    
    if (!userId) {
      return reply.code(401).send({
        success: false,
        error: 'Authentication required'
      });
    }

    const { page = 0, limit = 10 } = request.query;
    const offset = page * limit;

    // If you have promisified your database connection
    const db = request.server.db;
    
    const [totalResult, gamesResult] = await Promise.all([
      db.get(`SELECT COUNT(*) as total FROM games WHERE player1_id = ? OR player2_id = ?`, [userId, userId]),
      db.all(`
        SELECT 
          id_game,
          datetime(created_at, 'localtime') as created_at,
          is_tournament,
          player1_id,
          player2_id,
          winner_id,
          player1_name,
          player2_name,
          player1_score,
          player2_score,
          winner_name,
          player1_is_ai,
          player2_is_ai,
          COALESCE(game_mode, 'Classic') as game_mode,
          smart_contract_link,
          contract_address
        FROM games 
        WHERE player1_id = ? OR player2_id = ?
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `, [userId, userId, limit, offset])
    ]);

    const total = totalResult?.total || 0;
    const games = gamesResult || [];

    reply.send({
      success: true,
      games,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: (page + 1) * limit < total,
      hasPrev: page > 0
    });

  } catch (error) {
    request.log.error('Error fetching game history:', error);
    reply.code(500).send({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch game history'
    });
  }
};

const saveResultsHandler = async (request, reply) => {
    try {
        const { gameData } = request.body;
        const userId = request.user.id;

        const player1_id = userId;
        let player2_id = null;
        
        if (gameData.config.mode === 'online' && gameData.config.player2Id) {
            player2_id = gameData.config.player2Id;
        }
        
        let winner_id = null;
        let winner_name = gameData.winner;
        
        if (gameData.generalResult === 'leftWin') {
            winner_id = player1_id;
        } else if (gameData.generalResult === 'rightWin') {
            winner_id = player2_id;
        }

        console.log('Saving game with IDs:', {
            player1_id,
            player2_id,
            winner_id,
            gameMode: gameData.config.mode,
            variant: gameData.config.variant
        });

        const gameId = await saveGameToDatabase(
            player1_id,
            player2_id,
            winner_id,
            gameData.leftPlayer.name,
            gameData.rightPlayer.name,
            gameData.leftPlayer.score,
            gameData.rightPlayer.score,
            winner_name,
            false,
            gameData.config.variant === '1vAI',
            gameData.config.mode,
            gameData.config.variant === 'tournament',
            null,
            null
        );

        await saveGameResultsToDatabase(gameId, gameData);

        reply.status(201).send({
            success: true,
            message: 'Game results saved successfully',
            gameId
        });

    } catch (error) {
        console.error('Error saving game results:', error);
        reply.status(500).send({
            success: false,
            message: 'Failed to save game results',
            error: error.message
        });
    }
};

module.exports = {
	saveGameHandler,
	retrieveGamesHandler,
	retrieveLastGameHandler,
	deployContractHandler,
	getGamesHistoryHandler,
    saveResultsHandler,
};