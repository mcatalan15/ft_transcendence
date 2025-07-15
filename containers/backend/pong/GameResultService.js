const db = require('../src/api/db/database.js');

class GameResultsService {
	static async saveOnlineGameResults(gameData) {
		try {
			console.log('🔍 Attempting to save online game results...');

			// Import the database and getUserByUsername function
			const { db, getUserByUsername } = require('../src/api/db/database');

			// Get user IDs from usernames
			const player1User = await getUserByUsername(gameData.leftPlayer.name);
			const player2User = await getUserByUsername(gameData.rightPlayer.name);

			// Check if users exist
			if (!player1User) {
				throw new Error(`Player 1 with username '${gameData.leftPlayer.name}' not found`);
			}

			if (!player2User) {
				throw new Error(`Player 2 with username '${gameData.rightPlayer.name}' not found`);
			}

			const player1_id = player1User.id_user;
			const player2_id = player2User.id_user;

			// Determine winner ID and general result
			let winner_id = 0;
			let generalResult = 'draw';

			if (gameData.leftPlayer.result === 'win') {
				winner_id = player1_id;
				generalResult = 'leftWin';
			} else if (gameData.rightPlayer.result === 'win') {
				winner_id = player2_id;
				generalResult = 'rightWin';
			}

			// Create the database insert query
			const gameQuery = `
                INSERT INTO games (
                    player1_id, player2_id, winner_id, player1_score, player2_score, 
                    game_mode, is_tournament, smart_contract_link, contract_address, 
                    created_at, ended_at, config_json, general_result,
                    default_balls_used, curve_balls_used, multiply_balls_used, spin_balls_used, burst_balls_used,
                    bullets_used, shields_used,
                    pyramids_used, escalators_used, hourglasses_used, lightnings_used, maws_used, 
                    rakes_used, trenches_used, kites_used, bowties_used, honeycombs_used, 
                    snakes_used, vipers_used, waystones_used,
                    player1_hits, player1_goals_in_favor, player1_goals_against, 
                    player1_powerups_picked, player1_powerdowns_picked, player1_ballchanges_picked, player1_result,
                    player2_hits, player2_goals_in_favor, player2_goals_against, 
                    player2_powerups_picked, player2_powerdowns_picked, player2_ballchanges_picked, player2_result
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

			const gameParams = [
				player1_id,
				player2_id,
				winner_id,
				gameData.leftPlayer.score,
				gameData.rightPlayer.score,
				gameData.config.mode,
				false, // is_tournament
				'', // smart_contract_link
				'', // contract_address
				gameData.createdAt,
				gameData.endedAt,
				JSON.stringify(gameData.config),
				generalResult,
				// Ball usage
				gameData.balls?.defaultBalls || 0,
				gameData.balls?.curveBalls || 0,
				gameData.balls?.multiplyBalls || 0,
				gameData.balls?.spinBalls || 0,
				gameData.balls?.burstBalls || 0,
				// Special items
				gameData.specialItems?.bullets || 0,
				gameData.specialItems?.shields || 0,
				// Walls
				gameData.walls?.pyramids || 0,
				gameData.walls?.escalators || 0,
				gameData.walls?.hourglasses || 0,
				gameData.walls?.lightnings || 0,
				gameData.walls?.maws || 0,
				gameData.walls?.rakes || 0,
				gameData.walls?.trenches || 0,
				gameData.walls?.kites || 0,
				gameData.walls?.bowties || 0,
				gameData.walls?.honeycombs || 0,
				gameData.walls?.snakes || 0,
				gameData.walls?.vipers || 0,
				gameData.walls?.waystones || 0,
				// Player 1 stats
				gameData.leftPlayer.hits || 0,
				gameData.leftPlayer.goalsInFavor || 0,
				gameData.leftPlayer.goalsAgainst || 0,
				gameData.leftPlayer.powerupsPicked || 0,
				gameData.leftPlayer.powerdownsPicked || 0,
				gameData.leftPlayer.ballchangesPicked || 0,
				gameData.leftPlayer.result,
				// Player 2 stats
				gameData.rightPlayer.hits || 0,
				gameData.rightPlayer.goalsInFavor || 0,
				gameData.rightPlayer.goalsAgainst || 0,
				gameData.rightPlayer.powerupsPicked || 0,
				gameData.rightPlayer.powerdownsPicked || 0,
				gameData.rightPlayer.ballchangesPicked || 0,
				gameData.rightPlayer.result
			];

			console.log('📝 Saving online game with params:', gameParams);

			// Execute the database operations in a transaction
			return new Promise((resolve, reject) => {
				// Make sure db is defined
				if (!db || typeof db.run !== 'function') {
					reject(new Error('Database not properly initialized'));
					return;
				}

				// Start transaction
				db.serialize(() => {
					db.run("BEGIN TRANSACTION", (err) => {
						if (err) {
							console.error('❌ Error starting transaction:', err);
							reject(err);
							return;
						}

						// Insert the game
						db.run(gameQuery, gameParams, function (gameErr) {
							if (gameErr) {
								console.error('❌ Database insert error for online game:', gameErr);
								db.run("ROLLBACK");
								reject(gameErr);
								return;
							}

							const gameId = this.lastID;
							console.log('✅ Online game saved successfully with ID:', gameId);

							// Update user stats for both players
							Promise.all([
								GameResultsService.updateUserStats(db, player1_id, gameData.leftPlayer, gameData),
								GameResultsService.updateUserStats(db, player2_id, gameData.rightPlayer, gameData)
							]).then(() => {
								db.run("COMMIT", (commitErr) => {
									if (commitErr) {
										console.error('❌ Error committing transaction:', commitErr);
										reject(commitErr);
									} else {
										console.log('✅ Game and user stats updated successfully');
										resolve(gameId);
									}
								});
							}).catch((statsErr) => {
								console.error('❌ Error updating user stats:', statsErr);
								db.run("ROLLBACK");
								reject(statsErr);
							});
						});
					});
				});
			});
		} catch (error) {
			console.error('❌ Error in saveOnlineGameResults:', error);
			throw error;
		}
	}

	static async updateUserStats(db, userId, playerData, gameData) {
		return new Promise((resolve, reject) => {
			// First, get current user stats
			const getStatsQuery = `
                SELECT * FROM user_stats WHERE id_user = ?
            `;

			db.get(getStatsQuery, [userId], (err, currentStats) => {
				if (err) {
					console.error('❌ Error getting current user stats:', err);
					reject(err);
					return;
				}

				// Initialize stats if user doesn't exist in user_stats table
				if (!currentStats) {
					currentStats = {
						total_games: 0,
						wins: 0,
						losses: 0,
						draws: 0,
						win_rate: 0.0,
						vs_ai_games: 0,
						total_tournaments: 0,
						tournaments_won: 0,
						tournaments_lost: 0,
						total_hits: 0,
						total_goals_scored: 0,
						total_goals_conceded: 0,
						total_powerups_picked: 0,
						total_powerdowns_picked: 0,
						total_ballchanges_picked: 0,
						total_default_balls: 0,
						total_curve_balls: 0,
						total_multiply_balls: 0,
						total_spin_balls: 0,
						total_burst_balls: 0,
						total_bullets: 0,
						total_shields: 0,
						total_pyramids: 0,
						total_escalators: 0,
						total_hourglasses: 0,
						total_lightnings: 0,
						total_maws: 0,
						total_rakes: 0,
						total_trenches: 0,
						total_kites: 0,
						total_bowties: 0,
						total_honeycombs: 0,
						total_snakes: 0,
						total_vipers: 0,
						total_waystones: 0,
						average_score: 0.0,
						highest_score: 0,
						goals_per_game: 0.0,
						hits_per_game: 0.0,
						powerups_per_game: 0.0
					};
				}

				// Calculate new stats
				const newStats = { ...currentStats };

				// Update basic game statistics
				newStats.total_games += 1;

				if (playerData.result === 'win') {
					newStats.wins += 1;
				} else if (playerData.result === 'lose') {
					newStats.losses += 1;
				} else {
					newStats.draws += 1;
				}

				// Calculate win rate
				newStats.win_rate = newStats.total_games > 0 ? (newStats.wins / newStats.total_games) * 100 : 0;

				// Update detailed gameplay statistics
				newStats.total_hits += playerData.hits || 0;
				newStats.total_goals_scored += playerData.goalsInFavor || 0;
				newStats.total_goals_conceded += playerData.goalsAgainst || 0;
				newStats.total_powerups_picked += playerData.powerupsPicked || 0;
				newStats.total_powerdowns_picked += playerData.powerdownsPicked || 0;
				newStats.total_ballchanges_picked += playerData.ballchangesPicked || 0;

				// Update ball usage statistics (these are game-wide, so we divide by 2 for each player)
				newStats.total_default_balls += Math.floor((gameData.balls?.defaultBalls || 0) / 2);
				newStats.total_curve_balls += Math.floor((gameData.balls?.curveBalls || 0) / 2);
				newStats.total_multiply_balls += Math.floor((gameData.balls?.multiplyBalls || 0) / 2);
				newStats.total_spin_balls += Math.floor((gameData.balls?.spinBalls || 0) / 2);
				newStats.total_burst_balls += Math.floor((gameData.balls?.burstBalls || 0) / 2);

				// Update special items usage
				newStats.total_bullets += Math.floor((gameData.specialItems?.bullets || 0) / 2);
				newStats.total_shields += Math.floor((gameData.specialItems?.shields || 0) / 2);

				// Update wall elements usage
				newStats.total_pyramids += Math.floor((gameData.walls?.pyramids || 0) / 2);
				newStats.total_escalators += Math.floor((gameData.walls?.escalators || 0) / 2);
				newStats.total_hourglasses += Math.floor((gameData.walls?.hourglasses || 0) / 2);
				newStats.total_lightnings += Math.floor((gameData.walls?.lightnings || 0) / 2);
				newStats.total_maws += Math.floor((gameData.walls?.maws || 0) / 2);
				newStats.total_rakes += Math.floor((gameData.walls?.rakes || 0) / 2);
				newStats.total_trenches += Math.floor((gameData.walls?.trenches || 0) / 2);
				newStats.total_kites += Math.floor((gameData.walls?.kites || 0) / 2);
				newStats.total_bowties += Math.floor((gameData.walls?.bowties || 0) / 2);
				newStats.total_honeycombs += Math.floor((gameData.walls?.honeycombs || 0) / 2);
				newStats.total_snakes += Math.floor((gameData.walls?.snakes || 0) / 2);
				newStats.total_vipers += Math.floor((gameData.walls?.vipers || 0) / 2);
				newStats.total_waystones += Math.floor((gameData.walls?.waystones || 0) / 2);

				// Update performance metrics
				const currentScore = playerData.score || 0;
				newStats.average_score = ((newStats.average_score * (newStats.total_games - 1)) + currentScore) / newStats.total_games;
				newStats.highest_score = Math.max(newStats.highest_score, currentScore);
				newStats.goals_per_game = newStats.total_games > 0 ? newStats.total_goals_scored / newStats.total_games : 0;
				newStats.hits_per_game = newStats.total_games > 0 ? newStats.total_hits / newStats.total_games : 0;
				newStats.powerups_per_game = newStats.total_games > 0 ? newStats.total_powerups_picked / newStats.total_games : 0;

				// Update user stats in database
				const updateStatsQuery = `
                    INSERT OR REPLACE INTO user_stats (
                        id_user, total_games, wins, losses, draws, win_rate, vs_ai_games,
                        total_tournaments, tournaments_won, tournaments_lost,
                        total_hits, total_goals_scored, total_goals_conceded,
                        total_powerups_picked, total_powerdowns_picked, total_ballchanges_picked,
                        total_default_balls, total_curve_balls, total_multiply_balls, total_spin_balls, total_burst_balls,
                        total_bullets, total_shields,
                        total_pyramids, total_escalators, total_hourglasses, total_lightnings, total_maws,
                        total_rakes, total_trenches, total_kites, total_bowties, total_honeycombs,
                        total_snakes, total_vipers, total_waystones,
                        average_score, highest_score, goals_per_game, hits_per_game, powerups_per_game,
                        last_updated
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;

				const updateParams = [
					userId,
					newStats.total_games,
					newStats.wins,
					newStats.losses,
					newStats.draws,
					newStats.win_rate,
					newStats.vs_ai_games,
					newStats.total_tournaments,
					newStats.tournaments_won,
					newStats.tournaments_lost,
					newStats.total_hits,
					newStats.total_goals_scored,
					newStats.total_goals_conceded,
					newStats.total_powerups_picked,
					newStats.total_powerdowns_picked,
					newStats.total_ballchanges_picked,
					newStats.total_default_balls,
					newStats.total_curve_balls,
					newStats.total_multiply_balls,
					newStats.total_spin_balls,
					newStats.total_burst_balls,
					newStats.total_bullets,
					newStats.total_shields,
					newStats.total_pyramids,
					newStats.total_escalators,
					newStats.total_hourglasses,
					newStats.total_lightnings,
					newStats.total_maws,
					newStats.total_rakes,
					newStats.total_trenches,
					newStats.total_kites,
					newStats.total_bowties,
					newStats.total_honeycombs,
					newStats.total_snakes,
					newStats.total_vipers,
					newStats.total_waystones,
					newStats.average_score,
					newStats.highest_score,
					newStats.goals_per_game,
					newStats.hits_per_game,
					newStats.powerups_per_game,
					new Date().toISOString()
				];

				db.run(updateStatsQuery, updateParams, function (updateErr) {
					if (updateErr) {
						console.error('❌ Error updating user stats:', updateErr);
						reject(updateErr);
					} else {
						console.log(`✅ User stats updated successfully for user ${userId}`);
						resolve();
					}
				});
			});
		});
	}
}

module.exports = GameResultsService;