const { get } = require('http');
const { saveGameToDatabase,
    saveGameResultsToDatabase,
	getLatestGame,
	getAllGames,
	saveSmartContractToDatabase,
	getGamesHistory,
	getUserById,
	getUserStats,
	calculateUserStats,
 } = require('../db/database');

async function getUserDataHandler(request, reply) {
    try {
        const { userId } = request.body;
        
        console.log('Received getUserData request for userId:', userId);
        
        if (!userId) {
            return reply.status(400).send({
                success: false,
                message: 'userId is required'
            });
        }

        try {
            const user = await getUserById(userId);
            
            if (!user) {
                console.log(`User ${userId} not found in users table`);
                return reply.status(404).send({
                    success: false,
                    message: 'User not found'
                });
            }

            console.log('Found user:', user);

            const userStats = await getUserStats(userId);
            
            let avatarUrl = 'avatarUnknownSquare';

            if (user.avatar_filename) {
                const timestamp = Date.now();
                if (user.avatar_filename.startsWith('/')) {
                    avatarUrl = `${user.avatar_filename}?t=${timestamp}`;
                } else {
                    avatarUrl = `/api/profile/avatar/${userId}?t=${Date.now()}`;
                }
            }
            
            if (!userStats) {
                console.log(`No stats found for user ${userId}, returning default stats`);
                const userData = {
                    id: user.id.toString(),
                    name: user.username || user.name || 'PLAYER',
                    avatar: avatarUrl, 
                    goalsScored: 0,
                    goalsConceded: 0,
                    tournaments: 0,
                    wins: 0,
                    losses: 0,
                    draws: 0,
                    rank: 999
                };

                console.log('Returning user with default stats:', userData);
                
                return reply.status(200).send({
                    success: true,
                    userData: userData
                });
            }

            const userData = {
                id: user.id.toString(),
                name: user.username || user.name || 'PLAYER',
                avatar: avatarUrl,
                goalsScored: userStats.total_goals_scored || 0,
                goalsConceded: userStats.total_goals_conceded || 0,
                tournaments: userStats.tournaments_won || 0,
                wins: userStats.wins || 0,
                losses: userStats.losses || 0,
                draws: userStats.draws || 0,
                rank: calculateRank(userStats) || 999
            };

            console.log('Returning real user data:', userData);
            
            reply.status(200).send({
                success: true,
                userData: userData
            });

        } catch (dbError) {
            console.error('Database error:', dbError);
            reply.status(500).send({
                success: false,
                message: 'Database error occurred',
                error: dbError.message
            });
        }
    } catch (error) {
        console.error('Error in getUserDataHandler:', error);
        reply.status(500).send({
            success: false,
            message: 'Failed to fetch user data',
            error: error.message
        });
    }
}

function calculateRank(stats) {
    if (!stats) {
        console.log('No stats available, returning lowest ELO rating');
        return 999.0;
    }
    
    let totalGames = stats.total_games || 0;
    if (totalGames === 0) {
        totalGames = (stats.wins || 0) + (stats.losses || 0) + (stats.draws || 0);
    }
    
    if (totalGames === 0) {
        console.log('No games played, returning unrated ELO (999.0)');
        return 999.0;
    }
    
    const winRate = stats.win_rate || (stats.wins / totalGames);
    const wins = stats.wins || 0;
    
    const eloScore = (winRate * 100) + (totalGames * 0.5) + (wins * 2);
    
    const eloRating = Math.max(1.0, Math.min(999.9, 1000 - eloScore));
    
    console.log(`Calculated ELO rating: winRate=${winRate.toFixed(3)}, totalGames=${totalGames}, wins=${wins}, eloScore=${eloScore.toFixed(1)}, finalELO=${eloRating.toFixed(1)}`);
    
    return parseFloat(eloRating.toFixed(1));
}

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
		contract_address,
		gameData
	} = request.body;

	try {
		const defaultGameData = gameData || {
			gameId: `game_${Date.now()}`,
			generalResult: null,
			config: {},
			ballStats: {},
			itemStats: {},
			wallStats: {},
			leftPlayer: {
				hits: 0,
				goalsInFavor: 0,
				goalsAgainst: 0,
				powerupsPickedCount: 0,
				powerdownsPickedCount: 0,
				ballchangesPickedCount: 0,
				score: player1_score
			},
			rightPlayer: {
				hits: 0,
				goalsInFavor: 0,
				goalsAgainst: 0,
				powerupsPickedCount: 0,
				powerdownsPickedCount: 0,
				ballchangesPickedCount: 0,
				score: player2_score
			}
		};

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
			contract_address,
			defaultGameData
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

async function getGamesHistoryHandler(request, reply) {
	try {
		console.log('Entering getGamesHistoryHandler');
		console.log('Request user:', request.user);
		const userId = request.user?.id;
		console.log('User ID:', userId);
		if (!userId) {
			console.log('No userId, returning 401');
			return reply.code(401).send({
				success: false,
				error: 'Authentication required',
			});
		}

		console.log('Parsing query parameters...');
		const { page = 0, limit = 10 } = request.query;
		console.log('Query params:', { page, limit });

		console.log('Fetching game history from database...');
		const result = await getGamesHistory(userId, page, limit);
		console.log('Game history result:', {
			total: result.total,
			gamesCount: result.games.length,
		});

		reply.send({
			success: true,
			games: result.games,
			total: result.total,
			page: result.page,
			limit: result.limit,
			totalPages: result.totalPages,
			hasNext: result.hasNext,
			hasPrev: result.hasPrev,
		});
		console.log('[DB GAMES HISTORY RESPONSE]', result);
	} catch (error) {
		console.error('Error in getGamesHistoryHandler:', {
			message: error.message,
			stack: error.stack,
			name: error.name,
		});
		request.log.error('Error fetching game history:', {
			message: error.message,
			stack: error.stack,
			name: error.name,
		});
		reply.code(500).send({
			success: false,
			error: 'Internal server error',
			message: error.message || 'Failed to fetch game history',
		});
	}
}

const saveResultsHandler = async (request, reply) => {
    try {
        console.log('Received saveResults request');
        console.log('Request body:', JSON.stringify(request.body, null, 2));
        console.log('Request user:', request.user);

        const { gameData } = request.body;
        
        if (!gameData) {
            console.error('No gameData in request body');
            return reply.status(400).send({
                success: false,
                message: 'gameData is required in request body'
            });
        }

        const userId = request.user?.id;
        
        if (!userId) {
            console.error('No user ID found in request');
            return reply.status(401).send({
                success: false,
                message: 'User authentication required'
            });
        }

        console.log('Processing game data for user:', userId);

        const player1_id = userId;
        let player2_id = null;
        
        if (gameData.config?.mode === 'online' && gameData.config?.player2Id) {
            player2_id = gameData.config.player2Id;
        } else if (gameData.config?.variant === '1vAI') {
            player2_id = null;
        } else {
            player2_id = null;
        }
        
        let winner_id = null;
        let winner_name = gameData.winner;
        
        if (gameData.generalResult === 'leftWin') {
            winner_id = player1_id;
        } else if (gameData.generalResult === 'rightWin') {
            winner_id = player2_id;
        }

        console.log('Saving game with data:', {
            player1_id,
            player2_id,
            winner_id,
            leftPlayerName: gameData.leftPlayer?.name,
            rightPlayerName: gameData.rightPlayer?.name,
            leftScore: gameData.leftPlayer?.score,
            rightScore: gameData.rightPlayer?.score,
            gameMode: gameData.config?.mode,
            variant: gameData.config?.variant
        });

        const gameId = await saveGameToDatabase(
            player1_id,
            player2_id,
            winner_id,
            gameData.leftPlayer?.name || 'Player 1',
            gameData.rightPlayer?.name || 'Player 2',
            gameData.leftPlayer?.score || 0,
            gameData.rightPlayer?.score || 0,
            winner_name,
            false,
            gameData.config?.variant === '1vAI',
            gameData.config?.mode || 'local',
            gameData.config?.variant === 'tournament',
            null,
            null,
            new Date().toISOString(),
            gameData.endedAt
        );

        console.log('Game saved with ID:', gameId);

        await saveGameResultsToDatabase(gameId, gameData);
        console.log('Detailed game results saved');

        reply.status(201).send({
            success: true,
            message: 'Game results saved successfully',
            gameId
        });

    } catch (error) {
        console.error('Error in saveResultsHandler:', error);
        console.error('Error stack:', error.stack);
        
        reply.status(500).send({
            success: false,
            message: 'Failed to save game results',
            error: error.message
        });
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

module.exports = {
	getUserDataHandler,
	saveGameHandler,
	retrieveGamesHandler,
	retrieveLastGameHandler,
	deployContractHandler,
	getGamesHistoryHandler,
    saveResultsHandler,
};