const { get } = require('http');
const { saveGameToDatabase,
    saveGameResultsToDatabase,
	getLatestGame,
	getAllGames,
	saveSmartContractToDatabase,
	getGamesHistory,
	getUserById,
	getUserStats,
	getUsernameById,
	updateUserStats,
	getUserByUsername,
	updateTournamentStats,
	
 } = require('../db/database');

async function getUserDataHandler(request, reply) {
    try {
        const { userId } = request.body;
        
        if (!userId) {
            return reply.status(400).send({
                success: false,
                message: 'userId is required'
            });
        }

        try {
            const user = await getUserById(userId);
            
            if (!user) {
                return reply.status(404).send({
                    success: false,
                    message: 'User not found'
                });
            }

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
                const userData = {
                    id: userId,
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
                
                return reply.status(200).send({
                    success: true,
                    userData: userData
                });
            }

            const userData = {
                id: userId,
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
        return 999.0;
    }
    
    let totalGames = stats.total_games || 0;
    if (totalGames === 0) {
        totalGames = (stats.wins || 0) + (stats.losses || 0) + (stats.draws || 0);
    }
    
    if (totalGames === 0) {
        return 999.0;
    }
    
    const winRate = stats.win_rate || (stats.wins / totalGames);
    const wins = stats.wins || 0;
    
    const eloScore = (winRate * 100) + (totalGames * 0.5) + (wins * 2);
    
    const eloRating = Math.max(1.0, Math.min(999.9, 1000 - eloScore));    
    return parseFloat(eloRating.toFixed(1));
}

async function saveGameHandler(request, reply) {
	const { gameData } = request.body;

	try {
		if (!gameData.leftPlayer.name) {
			return reply.status(400).send({
				success: false,
				message: `Player 1 with username '${gameData.leftPlayer.name}' not found`
			});
		}
		
		if (!gameData.rightPlayer.name) {
			return reply.status(400).send({
				success: false,
				message: `Player 2 with username '${gameData.rightPlayer.name}' not found`
			});
		}

		const player1_id = gameData.leftPlayer.id;
		const player2_id = gameData.rightPlayer.id;
		
		let winner_id = 0;
		if (gameData.generalResult === 'leftWin') {
			winner_id = player1_id;
		} else if (gameData.generalResult === 'rightWin') {
			winner_id = player2_id;
		}
		const gameRecord = {
			
			player1_id: player1_id,
			player2_id: player2_id,
			winner_id: winner_id,
			player1_score: gameData.finalScore.leftPlayer,
			player2_score: gameData.finalScore.rightPlayer,
			game_mode: gameData.config.mode.variant || 'tournament',
			is_tournament: true,
			smart_contract_link: gameData.smart_contract_link || '',
			contract_address: gameData.contract_address || '',
			created_at: gameData.createdAt,
			ended_at: gameData.endedAt,
			config_json: JSON.stringify(gameData.config),
			general_result: gameData.generalResult,
			// Ball usage
			default_balls_used: gameData.balls.defaultBalls,
			curve_balls_used: gameData.balls.curveBalls,
			multiply_balls_used: gameData.balls.multiplyBalls,
			spin_balls_used: gameData.balls.spinBalls,
			burst_balls_used: gameData.balls.burstBalls,
			// Special items
			bullets_used: gameData.specialItems.bullets,
			shields_used: gameData.specialItems.shields,
			// Walls
			pyramids_used: gameData.walls.pyramids,
			escalators_used: gameData.walls.escalators,
			hourglasses_used: gameData.walls.hourglasses,
			lightnings_used: gameData.walls.lightnings,
			maws_used: gameData.walls.maws,
			rakes_used: gameData.walls.rakes,
			trenches_used: gameData.walls.trenches,
			kites_used: gameData.walls.kites,
			bowties_used: gameData.walls.bowties,
			honeycombs_used: gameData.walls.honeycombs,
			snakes_used: gameData.walls.snakes,
			vipers_used: gameData.walls.vipers,
			waystones_used: gameData.walls.waystones,
			// Player 1 stats
			player1_hits: gameData.leftPlayer.hits,
			player1_goals_in_favor: gameData.leftPlayer.goalsInFavor,
			player1_goals_against: gameData.leftPlayer.goalsAgainst,
			player1_powerups_picked: gameData.leftPlayer.powerupsPicked,
			player1_powerdowns_picked: gameData.leftPlayer.powerdownsPicked,
			player1_ballchanges_picked: gameData.leftPlayer.ballchangesPicked,
			player1_result: gameData.leftPlayer.result,
			// Player 2 stats
			player2_hits: gameData.rightPlayer.hits,
			player2_goals_in_favor: gameData.rightPlayer.goalsInFavor,
			player2_goals_against: gameData.rightPlayer.goalsAgainst,
			player2_powerups_picked: gameData.rightPlayer.powerupsPicked,
			player2_powerdowns_picked: gameData.rightPlayer.powerdownsPicked,
			player2_ballchanges_picked: gameData.rightPlayer.ballchangesPicked,
			player2_result: gameData.rightPlayer.result
		};

		const gameId = await saveGameToDatabase(gameRecord, gameData);

		await updateUserStats(gameRecord.player1_id, gameRecord.player2_id, gameData);

		reply.status(201).send({
			success: true,
			message: 'Game saved successfully',
			gameId
		});
	} catch (error) {
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
		const { gameId, player1Name, player2Name, player1Score, player2Score } = request.body;

		if (!gameId || !player1Name || !player2Name || player1Score === undefined || player2Score === undefined) {
			return reply.status(400).send({
				success: false,
				error: 'Missing required data',
				details: 'gameId, player1Name, player2Name, player1Score, and player2Score are required'
			});
		}

		const blockchainGameData = {
			player1Name: String(player1Name),
			player1Score: Number(player1Score),
			player2Name: String(player2Name),
			player2Score: Number(player2Score)
		};

		const response = await fetch("http://blockchain:3002/deploy", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ gameData: blockchainGameData }),
		});

		if (!response.ok) {
			const error = await response.text();
			throw new Error(`Blockchain container error: ${error}`);
		}

		const blockchainResponse = await response.json();

		await saveSmartContractToDatabase(
			gameId,
			blockchainResponse.address,
			blockchainResponse.explorerLink
		);

		reply.send({
			success: true,
			contractAddress: blockchainResponse.address,
			explorerLink: blockchainResponse.explorerLink,
			gameData: {
				player1_name: blockchainGameData.player1Name,
				player1_score: blockchainGameData.player1Score,
				player2_name: blockchainGameData.player2Name,
				player2_score: blockchainGameData.player2Score
			}
		});
	} catch (error) {
		reply.status(500).send({
			success: false,
			error: error.message,
			details: error.message.includes("blockchain")
				? "Check blockchain service connectivity"
				: "Unexpected error during deployment"
		});
	}
}

async function getGamesHistoryHandler(request, reply) {
    try {
        const userId = request.query.user || request.user?.id;

        if (!userId) {
            return reply.code(401).send({
                success: false,
                error: 'Authentication required',
            });
        }

        const { page = 0, limit = 8 } = request.query;
        const result = await getGamesHistory(userId, page, limit);

        const gamesWithUsernames = await Promise.all(result.games.map(async (game) => {
            const [player1_name, player2_name, winner_name] = await Promise.all([
                getUsernameById(game.player1_id),
                getUsernameById(game.player2_id),
                game.winner_id ? getUsernameById(game.winner_id) : Promise.resolve(null),
            ]);

            return {
                ...game,
                player1_name,
                player2_name,
                winner_name,
            };
        }));

        reply.send({
            success: true,
            games: gamesWithUsernames,
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages,
            hasNext: result.hasNext,
            hasPrev: result.hasPrev,
        });
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

        await saveGameResultsToDatabase(gameId, gameData);

        reply.status(201).send({
            success: true,
            message: 'Game results saved successfully',
            gameId
        });

    } catch (error) {
        
        reply.status(500).send({
            success: false,
            message: 'Failed to save game results',
            error: error.message
        });
    }
};

async function getUserByUsernameHandler(request, reply) {
    try {
        const { username } = request.body;
                
        if (!username) {
            return reply.status(400).send({
                success: false,
                message: 'username is required'
            });
        }

        try {
            const user = await getUserByUsername(username);
            
            if (!user) {
                return reply.status(404).send({
                    success: false,
                    message: 'User not found'
                });
            }

            const userStats = await getUserStats(user.id_user);
            
            let avatarUrl = 'avatarUnknownSquare';

            if (user.avatar_filename) {
                const timestamp = Date.now();
                if (user.avatar_filename.startsWith('/')) {
                    avatarUrl = `${user.avatar_filename}?t=${timestamp}`;
                } else {
                    avatarUrl = `/api/profile/avatar/${user.id_user}?t=${Date.now()}`;
                }
            }
            
            const userData = {
                id: user.id_user.toString(),
                name: user.username,
                avatar: avatarUrl,
                type: 'human',
                side: 'right',
                goalsScored: userStats?.total_goals_scored || 0,
                goalsConceded: userStats?.total_goals_conceded || 0,
                tournaments: userStats?.tournaments_won || 0,
                wins: userStats?.wins || 0,
                losses: userStats?.losses || 0,
                draws: userStats?.draws || 0,
                rank: userStats ? calculateRank(userStats) : 999
            };
            
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
        console.error('Error in getUserByUsernameHandler:', error);
        reply.status(500).send({
            success: false,
            message: 'Failed to fetch user data',
            error: error.message
        });
    }
}

async function saveTournamentResultsHandler(request, reply) {
	try {
		const { tournamentConfig } = request.body;

		if (!tournamentConfig) {
			return reply.status(400).send({
				success: false,
				message: 'tournamentConfig is required in request body'
			});
		}

		if (!tournamentConfig.isFinished) {
			return reply.status(400).send({
				success: false,
				message: 'Tournament must be finished to save results'
			});
		}

		if (!tournamentConfig.tournamentWinner) {
			return reply.status(400).send({
				success: false,
				message: 'Tournament winner is required'
			});
		}

		const result = await updateTournamentStats(tournamentConfig);

		return reply.status(200).send({
			success: true,
			message: 'Tournament results saved successfully',
			updatedPlayers: result.updatedPlayers,
			tournamentWinner: result.tournamentWinner
		});

	} catch (error) {
		console.error('[TOURNAMENT ERROR] Failed to save tournament results:', {
			message: error.message,
			stack: error.stack
		});

		return reply.status(500).send({
			success: false,
			message: 'Failed to save tournament results',
			error: error.message
		});
	}
}

module.exports = {
	getUserDataHandler,
	saveGameHandler,
	retrieveLastGameHandler,
	deployContractHandler,
	getGamesHistoryHandler,
    saveResultsHandler,
    getUserByUsernameHandler,
	saveTournamentResultsHandler
};