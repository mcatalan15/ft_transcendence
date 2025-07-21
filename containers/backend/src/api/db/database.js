const { get } = require('http');

const sqlite3 = require('sqlite3').verbose();
const dbPath = '/usr/src/app/db/mydatabase.db';
const db = connectToDatabase();

function connectToDatabase(retries = 5, delay = 2000) {
	const db = new sqlite3.Database(dbPath, (err) => {
		if (err) {
			if (retries > 0) {
				setTimeout(() => connectToDatabase(retries - 1, delay), delay);
			} else {
				console.error('Failed to connect to database after multiple attempts');
			}
		} else {
		console.log('Connected to SQLite database successfully');
		}
	});
	return db;
}

async function saveUserToDatabase(username, email, hashedPassword, provider, avatarFilename = null) {
    return new Promise((resolve, reject) => {
        const userQuery = `INSERT INTO users (username, email, password, provider, avatar_filename, avatar_type) VALUES (?, ?, ?, ?, ?, ?)`;
        const userParams = [username, email, hashedPassword, provider, avatarFilename, avatarFilename ? 'default' : null];

        db.run(userQuery, userParams, function (err) {
            if (err) {
                console.error('[DB INSERT ERROR] Full error:', {
                    message: err.message,
                    code: err.code,
                    errno: err.errno,
                    stack: err.stack
                });

                if (err.message.includes('UNIQUE constraint failed')) {
                    const customError = new Error('Username or email already exists');
                    customError.code = 'SQLITE_CONSTRAINT';
                    reject(customError);
                } else {
                    reject(err);
                }
            } else {
                const userId = this.lastID;
                const statsQuery = `INSERT INTO user_stats (id_user, total_games, wins, losses, win_rate, vs_ai_games, tournaments_won) VALUES (?, 0, 0, 0, 0.0, 0, 0)`;
                const statsParams = [userId];

                db.run(statsQuery, statsParams, function (statsErr) {
                    if (statsErr) {
                        console.error('[DB USER_STATS INSERT ERROR] Full error:', {
                            message: statsErr.message,
                            code: statsErr.code,
                            errno: statsErr.errno,
                            stack: statsErr.stack
                        });
                        reject(statsErr);
                    } else {
                        resolve(userId);
                    }
                });
            }
        });
    });
}

async function updateUserAvatar(userId, filename, type) {
    return new Promise((resolve, reject) => {
        const query = `UPDATE users SET avatar_filename = ?, avatar_type = ? WHERE id_user = ?`;
        db.run(query, [filename, type, userId], function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.changes > 0);
            }
        });
    });
}

async function checkUserExists(username, email) {
	return new Promise((resolve, reject) => {
		let query;
		let params;

		if (username && email) {
			query = `SELECT * FROM users WHERE username = ? OR email = ?`;
			params = [username, email];
		} else if (username) {
			query = `SELECT * FROM users WHERE username = ?`;
			params = [username];
		} else if (email) {
			query = `SELECT * FROM users WHERE email = ?`;
			params = [email];
		} else {
			resolve({ exists: false });
			return;
		}

		db.get(query, params, (err, row) => {
			if (err) {
				console.error('[DB ERROR]', err);
				reject(new Error('Database error'));
				return;
			}

			if (row) {
				resolve({
					exists: true,
					usernameExists: username ? row.username === username : false,
					emailExists: email ? row.email === email : false,
					user: row
				});
			} else {
				resolve({ exists: false });
			}
		});
	});
}

async function isDatabaseHealthy() {
	return new Promise((resolve) => {
		db.get('SELECT 1', (err) => resolve(!err));
	});
}

async function getHashedPassword(email) {
	return new Promise((resolve, reject) => {
	const query = `SELECT password FROM users WHERE email = ?`;
		db.get(query, [email], (err, row) => {
			if (err) {
				console.error('[DB ERROR]', err);
				reject(new Error('Database error'));
				return;
			}
			if (row) {
				resolve(row.password);
			} else {
				resolve(null);
			}
		});
	});
}

async function getUserByEmail(email) {
	return new Promise((resolve, reject) => {
	const query = `SELECT * FROM users WHERE email = ?`;
		db.get(query, [email], (err, row) => {
			if (err) {
				console.error('[DB ERROR]', err);
				reject(new Error('Database error'));
				return;
			}
			if (row) {
				resolve(row);
			} else {
				resolve(null);
			}
		});
	});
}

async function getUsernameById(userId) {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT username FROM users WHERE id_user = ?`,
            [userId],
            (err, row) => {
                if (err) {
                    console.error('[DB USERNAME ERROR]', err);
                    reject(err);
                } else {
                    resolve(row ? row.username : null);
                }
            }
        );
    });
}

async function getUserById(userId) {
    return new Promise((resolve, reject) => {
        const query = `SELECT id_user, username, email, avatar_filename, avatar_type, twoFactorEnabled FROM users WHERE id_user = ?`;
        db.get(query, [userId], (err, row) => {
            if (err) {
                console.error('Database error in getUserById:', err);
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}   

async function getUserByUsername(username) {
    return new Promise((resolve, reject) => {
        const query = `SELECT id_user, username, email, avatar_filename, avatar_type FROM users WHERE username = ?`;
        db.get(query, [username], (err, row) => {
            if (err) {
                console.error('[DB ERROR]', err);
                reject(new Error('Database error'));
                return;
            }
            resolve(row || null);
        });
    });
}

async function getLatestGame() {
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM games ORDER BY id_game DESC LIMIT 1`;
        db.get(query, (err, row) => {
            if (err) {
                console.error('[DB FETCH ERROR]', err);
                reject(err);
            } else {
                resolve(row || null);
            }
        });
    });
}

async function saveGameToDatabase(gameRecord, gameData) {
	return new Promise((resolve, reject) => {
		const query = `
            INSERT INTO games (
                player1_id,
                player2_id,
                winner_id,
                player1_score,
                player2_score,
                game_mode,
                is_tournament,
                smart_contract_link,
                contract_address,
                created_at,
                ended_at,
                config_json,
                general_result,
                default_balls_used,
                curve_balls_used,
                multiply_balls_used,
                spin_balls_used,
                burst_balls_used,
                bullets_used,
                shields_used,
                pyramids_used,
                escalators_used,
                hourglasses_used,
                lightnings_used,
                maws_used,
                rakes_used,
                trenches_used,
                kites_used,
                bowties_used,
                honeycombs_used,
                snakes_used,
                vipers_used,
                waystones_used,
                player1_hits,
                player1_goals_in_favor,
                player1_goals_against,
                player1_powerups_picked,
                player1_powerdowns_picked,
                player1_ballchanges_picked,
                player1_result,
                player2_hits,
                player2_goals_in_favor,
                player2_goals_against,
                player2_powerups_picked,
                player2_powerdowns_picked,
                player2_ballchanges_picked,
                player2_result
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

		const params = [
			gameRecord.player1_id,
			gameRecord.player2_id,
			gameRecord.winner_id,
			gameRecord.player1_score,
			gameRecord.player2_score,
			gameRecord.game_mode,
			gameRecord.is_tournament ? 1 : 0,
			gameRecord.smart_contract_link,
			gameRecord.contract_address,
			gameRecord.created_at,
			gameRecord.ended_at,
			gameRecord.config_json,
			gameRecord.general_result,
			gameRecord.default_balls_used,
			gameRecord.curve_balls_used,
			gameRecord.multiply_balls_used,
			gameRecord.spin_balls_used,
			gameRecord.burst_balls_used,
			gameRecord.bullets_used,
			gameRecord.shields_used,
			gameRecord.pyramids_used,
			gameRecord.escalators_used,
			gameRecord.hourglasses_used,
			gameRecord.lightnings_used,
			gameRecord.maws_used,
			gameRecord.rakes_used,
			gameRecord.trenches_used,
			gameRecord.kites_used,
			gameRecord.bowties_used,
			gameRecord.honeycombs_used,
			gameRecord.snakes_used,
			gameRecord.vipers_used,
			gameRecord.waystones_used,
			gameRecord.player1_hits,
			gameRecord.player1_goals_in_favor,
			gameRecord.player1_goals_against,
			gameRecord.player1_powerups_picked,
			gameRecord.player1_powerdowns_picked,
			gameRecord.player1_ballchanges_picked,
			gameRecord.player1_result,
			gameRecord.player2_hits,
			gameRecord.player2_goals_in_favor,
			gameRecord.player2_goals_against,
			gameRecord.player2_powerups_picked,
			gameRecord.player2_powerdowns_picked,
			gameRecord.player2_ballchanges_picked,
			gameRecord.player2_result
		];

		db.run(query, params, function (err) {
			if (err) {
				console.error('[DB INSERT ERROR] saveGameToDatabase failed:', {
					message: err.message,
					code: err.code,
					errno: err.errno
				});
				return reject(err);
			}

			const gameId = this.lastID;
			const gameResultsQuery = `
                INSERT INTO game_results (id_game, game_data)
                VALUES (?, ?)
            `;
			const gameResultsParams = [gameId, JSON.stringify(gameData)];

			db.run(gameResultsQuery, gameResultsParams, function (err) {
				if (err) {
					console.error('[DB INSERT ERROR] game_results failed:', {
						message: err.message,
						code: err.code,
						errno: err.errno
					});
					return reject(err);
				}
				resolve(gameId);
			});
		});
	});
}

async function getAllGames() {
	return new Promise ((resolve, reject) => {
		const query = `SELECT * FROM games ORDER BY id_game DESC`;
		db.all(query, (err, row) => {
            if (err) {
                console.error('[DB FETCH ERROR]', err);
                reject(err);
            } else {
                resolve(row || null);
            }
        });
	});
}

async function saveGameResultsToDatabase(gameId, gameData) {
    return new Promise((resolve, reject) => {
        const query = `
            INSERT INTO game_results (id_game, game_data) 
            VALUES (?, ?)
        `;
        const params = [gameId, JSON.stringify(gameData)];
        
        db.run(query, params, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.lastID);
            }
        });
    });
}

async function saveTwoFactorSecret(userId, secret) {
    return new Promise((resolve, reject) => {
        const query = `UPDATE users SET twoFactorSecret = ?, twoFactorEnabled = ? WHERE id_user = ?`;
        const params = [secret, false, userId];

        db.run(query, params, function (err) {
            if (err) {
                reject(new Error('Database error saving 2FA secret.'));
            } else if (this.changes === 0) {
                console.warn(`[DB WARN] No user found with ID ${userId} to save 2FA secret.`);
                reject(new Error('User not found.'));
            } else {
                resolve(true);
            }
        });
    });
}

async function getTwoFactorSecret(userId) {
    return new Promise((resolve, reject) => {
        const query = `SELECT twoFactorSecret, twoFactorEnabled FROM users WHERE id_user = ?`;

        db.get(query, [userId], (err, row) => {
            if (err) {
                console.error(`[DB ERROR] Failed to get 2FA secret for user ${userId}:`, err.message);
                reject(new Error('Database error getting 2FA secret.'));
            } else if (row) {
                resolve(row.twoFactorSecret);
            } else {
                resolve(null);
            }
        });
    });
}

async function enableTwoFactor(userId, secret) {
    return new Promise((resolve, reject) => {
        const query = `UPDATE users SET twoFactorSecret = ?, twoFactorEnabled = ? WHERE id_user = ?`;
        const params = [secret, 1, userId];

        db.run(query, params, function (err) {
            if (err) {
                reject(new Error('Database error enabling 2FA.'));
            } else if (this.changes === 0) {
                reject(new Error('User not found.'));
            } else {
                resolve(true);
            }
        });
    });
}

/* 
    FRIENDS FUNCTIONS
    - addFriend: Adds a friend relationship between two users.
    - removeFriend: Removes a friend relationship between two users.
    - getFriendsList: Retrieves a list of friends for a user.
    - checkFriendship: Checks if two users are friends.
*/

async function addFriend(userId, friendId) {
    return new Promise((resolve, reject) => {
        if (userId === friendId) {
            reject(new Error('Cannot add yourself as a friend'));
            return;
        }

        const query = `INSERT INTO friends (user_id, friend_id) VALUES (?, ?)`;
        db.run(query, [userId, friendId], function (err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    reject(new Error('Already friends'));
                } else {
                    console.error('[DB ERROR] Adding friend:', err);
                    reject(new Error('Database error'));
                }
            } else {
                resolve(this.lastID);
            }
        });
    });
}

async function removeFriend(userId, friendId) {
    return new Promise((resolve, reject) => {
        const query = `DELETE FROM friends WHERE user_id = ? AND friend_id = ?`;
        db.run(query, [userId, friendId], function (err) {
            if (err) {
                console.error('[DB ERROR] Removing friend:', err);
                reject(new Error('Database error'));
            } else {
                resolve(this.changes > 0);
            }
        });
    });
}

async function getFriendsList(userId) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT u.id_user, u.username, u.email, u.avatar_filename, u.avatar_type, f.created_at
            FROM friends f
            JOIN users u ON f.friend_id = u.id_user
            WHERE f.user_id = ?
            ORDER BY f.created_at DESC
        `;
        db.all(query, [userId], (err, rows) => {
            if (err) {
                console.error('[DB ERROR] Getting friends list:', err);
                reject(new Error('Database error'));
            } else {
                resolve(rows || []);
            }
        });
    });
}

async function checkFriendship(userId, friendId) {
    return new Promise((resolve, reject) => {
        const query = `SELECT 1 FROM friends WHERE user_id = ? AND friend_id = ?`;
        db.get(query, [userId, friendId], (err, row) => {
            if (err) {
                console.error('[DB ERROR] Checking friendship:', err);
                reject(new Error('Database error'));
            } else {
                resolve(!!row);
            }
        });
    });
}

async function saveSmartContractToDatabase(gameId, contractAddress, explorerLink) {
    return new Promise((resolve, reject) => {
        const query = `UPDATE games SET contract_address = ?, smart_contract_link = ? WHERE id_game = ?`;
        const params = [contractAddress, explorerLink, gameId];
        
        db.run(query, params, function (err) {
            if (err) {
                console.error('[DB UPDATE ERROR] Failed to save smart contract data:', {
                    message: err.message,
                    code: err.code,
                    errno: err.errno,
                    stack: err.stack
                });
                reject(err);
            } else if (this.changes === 0) {
                console.warn(`[DB WARN] No game found with ID ${gameId} to update contract data.`);
                reject(new Error('Game not found'));
            } else {
                resolve({
                    gameId: gameId,
                    contractAddress: contractAddress,
                    explorerLink: explorerLink,
                    changes: this.changes
                });
            }
        });
    });
}

async function  updateNickname(userId, newNickname) {
	return new Promise((resolve, reject) => {
		const checkQuery = `UPDATE users SET username = ? WHERE id_user = ? AND id_user != ?`;
		db.run(checkQuery, [newNickname, userId], function (err, row) {
			if (err) {
				console.error('[DB UPDATE ERROR] Failed to update nickname:', {
					message: err.message,
					code: err.code,
					errno: err.errno,
					stack: err.stack
				});
				reject(err);
				return;
			}
			if (row) {
				console.warn(`[DB WARN] Nickname '${newNickname}' already exists for user ${row.id_user}`);
                reject(new Error('Nickname already taken'));
                return;
			}

			const updateQuery = `UPDATE users SET username = ? WHERE id_user = ?`;
            db.run(updateQuery, [newNickname, userId], function (err) {
                if (err) {
                    console.error('[DB UPDATE ERROR] Failed to update nickname:', {
                        message: err.message,
                        code: err.code,
                        errno: err.errno,
                        stack: err.stack
                    });
                    reject(err);
				} else if (this.changes === 0) {
					console.warn(`[DB WARN] No user found with ID ${userId} to update nickname.`);
					reject(new Error('User not found'));
				} else {
					resolve(true);
				}
			});
		});
	});
}

async function changePassword(userId, newHashedPassword) {
	return new Promise((resolve, reject) => {
		const query = `UPDATE users SET password = ? WHERE id_user = ?`;
		db.run(query, [newHashedPassword, userId], function (err) {
			if (err) {
				console.error('[DB UPDATE ERROR] Failed to update password:', {
					message: err.message,
					code: err.code,
					errno: err.errno,
					stack: err.stack
				});
				reject(err);
			} else if (this.changes === 0) {
				console.warn(`[DB WARN] No user found with ID ${userId} to update password.`);
				reject(new Error('User not found'));
			} else {
				resolve(true);
			}
		});
	});
}

async function getUsernameById(userId) {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT username FROM users WHERE id_user = ?`,
            [userId],
            (err, row) => {
                if (err) {
                    console.error('[DB USERNAME ERROR]', err);
                    reject(err);
                } else {
                    resolve(row ? row.username : null);
                }
            }
        );
    });
}

async function getGamesHistory(userId, page = 0, limit = 10) {
	return new Promise((resolve, reject) => {
		const offset = page * limit;

		Promise.all([
			new Promise((res, rej) => {
				db.get(
					`SELECT COUNT(*) as total FROM games WHERE player1_id = ? OR player2_id = ?`,
					[userId, userId],
					(err, row) => {
						if (err) {
							console.error('[DB COUNT ERROR]', err);
							rej(err);
						} else {
							res(row);
						}
					}
				);
			}),
			new Promise((res, rej) => {
				db.all(
					`SELECT 
			   id_game,
			   created_at,
			   is_tournament,
			   player1_id,
			   player2_id,
			   winner_id,
			   player1_score,
			   player2_score,
			   COALESCE(game_mode, 'Classic') as game_mode,
			   smart_contract_link,
			   contract_address
			 FROM games 
			 WHERE player1_id = ? OR player2_id = ?
			 ORDER BY created_at DESC
			 LIMIT ? OFFSET ?`,
					[userId, userId, limit, offset],
					(err, rows) => {
						if (err) {
							console.error('[DB GAMES ERROR]', err);
							rej(err);
						} else {
							res(rows || []);
						}
					}
				);
			}),
		])
			.then(([totalResult, gamesResult]) => {
				const total = totalResult?.total || 0;
				resolve({
					games: gamesResult,
					total,
					page,
					limit,
					totalPages: Math.ceil(total / limit),
					hasNext: (page + 1) * limit < total,
					hasPrev: page > 0,
				});
			})
			.catch(reject);
	});
}

async function getUserStats(userId) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM user_stats WHERE id_user = ?';
        db.get(query, [userId], (err, row) => {
            if (err) {
                console.error('Error getting user stats:', err);
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

async function getUserProfileStats(userId) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT total_games, wins, losses, total_tournaments 
            FROM user_stats 
            WHERE id_user = ?
        `;
        db.get(query, [userId], (err, row) => {
            if (err) {
                console.error('[DB ERROR]', err);
                reject(new Error('Database error'));
                return;
            }
            resolve(row || {
                total_games: 0,
                wins: 0,
                losses: 0,
                total_tournaments: 0
            });
        });
    });
}

async function saveRefreshTokenInDatabase(userId, refreshToken) {
    return new Promise((resolve, reject) => {
        const query = `INSERT INTO refresh_tokens (user_id, token) VALUES (?, ?)
                      ON CONFLICT(user_id) DO UPDATE SET token = ?`;
        const params = [userId, refreshToken, refreshToken];

        db.run(query, params, function (err) {
            if (err) {
                console.error('[DB INSERT ERROR] Failed to save refresh token:', {
                    message: err.message,
                    code: err.code,
                    errno: err.errno,
                    stack: err.stack
                });
                reject(err);
            } else {
                resolve(true);
            }
        });
    });
}

async function getRefreshTokenFromDatabase(userId) {
    return new Promise((resolve, reject) => {
        const query = `SELECT token FROM refresh_tokens WHERE user_id = ?`;
        db.get(query, [userId], (err, row) => {
            if (err) {
                console.error('[DB FETCH ERROR] Failed to get refresh token:', {
                    message: err.message,
                    code: err.code,
                    errno: err.errno,
                    stack: err.stack
                });
                reject(err);
            }
            else if (row) {
                resolve(row.token);
            }
            else {
                resolve(null);
            }
        });
    });
}

async function deleteRefreshTokenFromDatabase(userId) {
    return new Promise((resolve, reject) => {
        const query = `DELETE FROM refresh_tokens WHERE user_id = ?`;
        db.run(query, [userId], function (err) {
            if (err) {
                console.error('[DB DELETE ERROR] Failed to delete refresh token:', {
                    message: err.message,
                    code: err.code,
                    errno: err.errno,
                    stack: err.stack
                });
                reject(err);
            }
            else if (this.changes === 0) {
                console.warn(`[DB WARN] No refresh token found for user ${userId} to delete.`);
                resolve(false);
            }
            else {
                resolve(true);
            }
        });
    });
}

async function getUserProfileStats(userId) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT total_games, wins, losses, total_tournaments 
            FROM user_stats 
            WHERE id_user = ?
        `;
        db.get(query, [userId], (err, row) => {
            if (err) {
                console.error('[DB ERROR]', err);
                reject(new Error('Database error'));
                return;
            }
            resolve(row || {
                total_games: 0,
                wins: 0,
                losses: 0,
                total_tournaments: 0
            });
        });
    });
}

async function updateUserStats(player1_id, player2_id, gameData) {
    try {
        await db.run('BEGIN TRANSACTION');

        await db.run(`
            INSERT INTO user_stats (
                id_user,
                total_games,
                wins,
                losses,
                draws,
                total_hits,
                total_goals_scored,
                total_goals_conceded,
                total_powerups_picked,
                total_powerdowns_picked,
                total_ballchanges_picked,
                total_default_balls,
                total_curve_balls,
                total_multiply_balls,
                total_spin_balls,
                total_burst_balls,
                total_bullets,
                total_shields,
                total_pyramids,
                total_escalators,
                total_hourglasses,
                total_lightnings,
                total_maws,
                total_rakes,
                total_trenches,
                total_kites,
                total_bowties,
                total_honeycombs,
                total_snakes,
                total_vipers,
                total_waystones,
                highest_score,
                last_updated
            ) VALUES (?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(id_user) DO UPDATE SET
                total_games = total_games + 1,
                wins = wins + ?,
                losses = losses + ?,
                draws = draws + ?,
                total_hits = total_hits + ?,
                total_goals_scored = total_goals_scored + ?,
                total_goals_conceded = total_goals_conceded + ?,
                total_powerups_picked = total_powerups_picked + ?,
                total_powerdowns_picked = total_powerdowns_picked + ?,
                total_ballchanges_picked = total_ballchanges_picked + ?,
                total_default_balls = total_default_balls + ?,
                total_curve_balls = total_curve_balls + ?,
                total_multiply_balls = total_multiply_balls + ?,
                total_spin_balls = total_spin_balls + ?,
                total_burst_balls = total_burst_balls + ?,
                total_bullets = total_bullets + ?,
                total_shields = total_shields + ?,
                total_pyramids = total_pyramids + ?,
                total_escalators = total_escalators + ?,
                total_hourglasses = total_hourglasses + ?,
                total_lightnings = total_lightnings + ?,
                total_maws = total_maws + ?,
                total_rakes = total_rakes + ?,
                total_trenches = total_trenches + ?,
                total_kites = total_kites + ?,
                total_bowties = total_bowties + ?,
                total_honeycombs = total_honeycombs + ?,
                total_snakes = total_snakes + ?,
                total_vipers = total_vipers + ?,
                total_waystones = total_waystones + ?,
                highest_score = MAX(highest_score, ?),
                win_rate = ROUND((wins + ?) * 100.0 / (total_games + 1), 2),
                average_score = ROUND((total_goals_scored + ?) / (total_games + 1), 2),
                goals_per_game = ROUND((total_goals_scored + ?) / (total_games + 1), 2),
                hits_per_game = ROUND((total_hits + ?) / (total_games + 1), 2),
                powerups_per_game = ROUND((total_powerups_picked + ?) / (total_games + 1), 2),
                last_updated = CURRENT_TIMESTAMP
        `, [
            // Initial insert values
            player1_id,
            gameData.leftPlayer.result === 'win' ? 1 : 0,
            gameData.leftPlayer.result === 'lose' ? 1 : 0,
            gameData.leftPlayer.result === 'draw' ? 1 : 0,
            gameData.leftPlayer.hits,
            gameData.leftPlayer.goalsInFavor,
            gameData.leftPlayer.goalsAgainst,
            gameData.leftPlayer.powerupsPicked,
            gameData.leftPlayer.powerdownsPicked,
            gameData.leftPlayer.ballchangesPicked,
            // Ball usage (these come from the shared gameData, not individual players)
            gameData.balls.defaultBalls,
            gameData.balls.curveBalls,
            gameData.balls.multiplyBalls,
            gameData.balls.spinBalls,
            gameData.balls.burstBalls,
            // Special items
            gameData.specialItems.bullets,
            gameData.specialItems.shields,
            // Wall elements
            gameData.walls.pyramids,
            gameData.walls.escalators,
            gameData.walls.hourglasses,
            gameData.walls.lightnings,
            gameData.walls.maws,
            gameData.walls.rakes,
            gameData.walls.trenches,
            gameData.walls.kites,
            gameData.walls.bowties,
            gameData.walls.honeycombs,
            gameData.walls.snakes,
            gameData.walls.vipers,
            gameData.walls.waystones,
            gameData.leftPlayer.score,
            
            // Update values
            gameData.leftPlayer.result === 'win' ? 1 : 0,
            gameData.leftPlayer.result === 'lose' ? 1 : 0,
            gameData.leftPlayer.result === 'draw' ? 1 : 0,
            gameData.leftPlayer.hits,
            gameData.leftPlayer.goalsInFavor,
            gameData.leftPlayer.goalsAgainst,
            gameData.leftPlayer.powerupsPicked,
            gameData.leftPlayer.powerdownsPicked,
            gameData.leftPlayer.ballchangesPicked,
            gameData.balls.defaultBalls,
            gameData.balls.curveBalls,
            gameData.balls.multiplyBalls,
            gameData.balls.spinBalls,
            gameData.balls.burstBalls,
            gameData.specialItems.bullets,
            gameData.specialItems.shields,
            gameData.walls.pyramids,
            gameData.walls.escalators,
            gameData.walls.hourglasses,
            gameData.walls.lightnings,
            gameData.walls.maws,
            gameData.walls.rakes,
            gameData.walls.trenches,
            gameData.walls.kites,
            gameData.walls.bowties,
            gameData.walls.honeycombs,
            gameData.walls.snakes,
            gameData.walls.vipers,
            gameData.walls.waystones,
            gameData.leftPlayer.score,
            // For calculated fields
            gameData.leftPlayer.result === 'win' ? 1 : 0,
            gameData.leftPlayer.goalsInFavor,
            gameData.leftPlayer.goalsInFavor,
            gameData.leftPlayer.hits,
            gameData.leftPlayer.powerupsPicked
        ]);

        // Update stats for right player (player2)
        await db.run(`
            INSERT INTO user_stats (
                id_user,
                total_games,
                wins,
                losses,
                draws,
                total_hits,
                total_goals_scored,
                total_goals_conceded,
                total_powerups_picked,
                total_powerdowns_picked,
                total_ballchanges_picked,
                total_default_balls,
                total_curve_balls,
                total_multiply_balls,
                total_spin_balls,
                total_burst_balls,
                total_bullets,
                total_shields,
                total_pyramids,
                total_escalators,
                total_hourglasses,
                total_lightnings,
                total_maws,
                total_rakes,
                total_trenches,
                total_kites,
                total_bowties,
                total_honeycombs,
                total_snakes,
                total_vipers,
                total_waystones,
                highest_score,
                last_updated
            ) VALUES (?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(id_user) DO UPDATE SET
                total_games = total_games + 1,
                wins = wins + ?,
                losses = losses + ?,
                draws = draws + ?,
                total_hits = total_hits + ?,
                total_goals_scored = total_goals_scored + ?,
                total_goals_conceded = total_goals_conceded + ?,
                total_powerups_picked = total_powerups_picked + ?,
                total_powerdowns_picked = total_powerdowns_picked + ?,
                total_ballchanges_picked = total_ballchanges_picked + ?,
                total_default_balls = total_default_balls + ?,
                total_curve_balls = total_curve_balls + ?,
                total_multiply_balls = total_multiply_balls + ?,
                total_spin_balls = total_spin_balls + ?,
                total_burst_balls = total_burst_balls + ?,
                total_bullets = total_bullets + ?,
                total_shields = total_shields + ?,
                total_pyramids = total_pyramids + ?,
                total_escalators = total_escalators + ?,
                total_hourglasses = total_hourglasses + ?,
                total_lightnings = total_lightnings + ?,
                total_maws = total_maws + ?,
                total_rakes = total_rakes + ?,
                total_trenches = total_trenches + ?,
                total_kites = total_kites + ?,
                total_bowties = total_bowties + ?,
                total_honeycombs = total_honeycombs + ?,
                total_snakes = total_snakes + ?,
                total_vipers = total_vipers + ?,
                total_waystones = total_waystones + ?,
                highest_score = MAX(highest_score, ?),
                win_rate = ROUND((wins + ?) * 100.0 / (total_games + 1), 2),
                average_score = ROUND((total_goals_scored + ?) / (total_games + 1), 2),
                goals_per_game = ROUND((total_goals_scored + ?) / (total_games + 1), 2),
                hits_per_game = ROUND((total_hits + ?) / (total_games + 1), 2),
                powerups_per_game = ROUND((total_powerups_picked + ?) / (total_games + 1), 2),
                last_updated = CURRENT_TIMESTAMP
        `, [
            // Initial insert values
            player2_id,
            gameData.rightPlayer.result === 'win' ? 1 : 0,
            gameData.rightPlayer.result === 'lose' ? 1 : 0,
            gameData.rightPlayer.result === 'draw' ? 1 : 0,
            gameData.rightPlayer.hits,
            gameData.rightPlayer.goalsInFavor,
            gameData.rightPlayer.goalsAgainst,
            gameData.rightPlayer.powerupsPicked,
            gameData.rightPlayer.powerdownsPicked,
            gameData.rightPlayer.ballchangesPicked,
            // Ball usage (shared between both players)
            gameData.balls.defaultBalls,
            gameData.balls.curveBalls,
            gameData.balls.multiplyBalls,
            gameData.balls.spinBalls,
            gameData.balls.burstBalls,
            // Special items
            gameData.specialItems.bullets,
            gameData.specialItems.shields,
            // Wall elements
            gameData.walls.pyramids,
            gameData.walls.escalators,
            gameData.walls.hourglasses,
            gameData.walls.lightnings,
            gameData.walls.maws,
            gameData.walls.rakes,
            gameData.walls.trenches,
            gameData.walls.kites,
            gameData.walls.bowties,
            gameData.walls.honeycombs,
            gameData.walls.snakes,
            gameData.walls.vipers,
            gameData.walls.waystones,
            gameData.rightPlayer.score,
            
            // Update values
            gameData.rightPlayer.result === 'win' ? 1 : 0,
            gameData.rightPlayer.result === 'lose' ? 1 : 0,
            gameData.rightPlayer.result === 'draw' ? 1 : 0,
            gameData.rightPlayer.hits,
            gameData.rightPlayer.goalsInFavor,
            gameData.rightPlayer.goalsAgainst,
            gameData.rightPlayer.powerupsPicked,
            gameData.rightPlayer.powerdownsPicked,
            gameData.rightPlayer.ballchangesPicked,
            gameData.balls.defaultBalls,
            gameData.balls.curveBalls,
            gameData.balls.multiplyBalls,
            gameData.balls.spinBalls,
            gameData.balls.burstBalls,
            gameData.specialItems.bullets,
            gameData.specialItems.shields,
            gameData.walls.pyramids,
            gameData.walls.escalators,
            gameData.walls.hourglasses,
            gameData.walls.lightnings,
            gameData.walls.maws,
            gameData.walls.rakes,
            gameData.walls.trenches,
            gameData.walls.kites,
            gameData.walls.bowties,
            gameData.walls.honeycombs,
            gameData.walls.snakes,
            gameData.walls.vipers,
            gameData.walls.waystones,
            gameData.rightPlayer.score,
            // For calculated fields
            gameData.rightPlayer.result === 'win' ? 1 : 0,
            gameData.rightPlayer.goalsInFavor,
            gameData.rightPlayer.goalsInFavor,
            gameData.rightPlayer.hits,
            gameData.rightPlayer.powerupsPicked
        ]);

        await db.run('COMMIT');
    } catch (error) {
        console.error('Error updating user stats:', error);
        await db.run('ROLLBACK');
        throw error;
    }
}

async function updateTournamentStats(tournamentConfig) {
    return new Promise((resolve, reject) => {
        if (!tournamentConfig.isFinished) {
            reject(new Error('Tournament must be finished to update stats'));
            return;
        }

        const { registeredPlayerNames, registeredPlayerData, tournamentWinner } = tournamentConfig;

        const players = [];
        const playerDataKeys = Object.keys(registeredPlayerNames);

        playerDataKeys.forEach(playerKey => {
            const playerName = registeredPlayerNames[playerKey];
            if (playerName) {
                const playerDataKey = `${playerKey}Data`;
                const playerData = registeredPlayerData[playerDataKey];
                
                players.push({
                    name: playerName,
                    isWinner: playerName === tournamentWinner,
                    isGuest: playerData === null,
                    actualUserId: playerData ? playerData.id : null
                });
            }
        });

        if (players.length === 0) {
            reject(new Error('No valid players found in tournament'));
            return;
        }

        let completed = 0;
        let errors = [];

        const updatePlayerStats = (playerIndex) => {
            if (playerIndex >= players.length) {
                if (errors.length > 0) {
                    console.error('[DB ERROR] Some players could not be updated:', errors);
                    reject(new Error(`Failed to update some players: ${errors.join(', ')}`));
                } else {
                    resolve({
                        updatedPlayers: players.length,
                        tournamentWinner: tournamentWinner,
                        players: players.map(p => ({ 
                            name: p.name, 
                            isWinner: p.isWinner, 
                            isGuest: p.isGuest 
                        }))
                    });
                }
                return;
            }

            const player = players[playerIndex];
            let targetUserId;
            let targetUsername;

            if (player.isGuest) {
                
                const findGuestQuery = `SELECT id_user FROM users WHERE username = 'guest' LIMIT 1`;
                db.get(findGuestQuery, [], (guestErr, guestRow) => {
                    if (guestErr) {
                        console.error(`[DB ERROR] Failed to find guest user:`, guestErr);
                        errors.push(`Failed to find guest user: ${guestErr.message}`);
                        updatePlayerStats(playerIndex + 1);
                        return;
                    }

                    if (guestRow) {
                        targetUserId = guestRow.id_user;
                        targetUsername = 'guest';
                        updateStats();
                    } else {
                        console.error(`[DB ERROR] Guest user not found in database`);
                        errors.push(`Guest user not found for ${player.name}`);
                        updatePlayerStats(playerIndex + 1);
                    }
                });
                return;
            } else {
                targetUserId = player.actualUserId;
                targetUsername = player.name;
                updateStats();
            }

            function updateStats() {
                const query = `
                    INSERT INTO user_stats (
                        id_user, 
                        total_tournaments, 
                        tournaments_won, 
                        tournaments_lost,
                        last_updated
                    ) VALUES (?, 1, ?, ?, CURRENT_TIMESTAMP)
                    ON CONFLICT(id_user) DO UPDATE SET 
                        total_tournaments = total_tournaments + 1,
                        tournaments_won = tournaments_won + ?,
                        tournaments_lost = tournaments_lost + ?,
                        last_updated = CURRENT_TIMESTAMP
                `;

                const wonIncrement = player.isWinner ? 1 : 0;
                const lostIncrement = player.isWinner ? 0 : 1;
                const params = [targetUserId, wonIncrement, lostIncrement, wonIncrement, lostIncrement];

                db.run(query, params, function (err) {
                    if (err) {
                        console.error(`[DB ERROR] Failed to update stats for player ${player.name} (target: ${targetUsername}):`, err);
                        errors.push(`Failed to update ${player.name}: ${err.message}`);
                    } else if (this.changes === 0) {
                        console.warn(`[DB WARN] No stats updated for player ${player.name} (target: ${targetUsername})`);
                        errors.push(`No stats updated for ${player.name}`);
                    } else {
                        console.log(`[DB] Updated tournament stats for ${player.name} -> ${targetUsername} (Winner: ${player.isWinner})`);
                    }
                    updatePlayerStats(playerIndex + 1);
                });
            }
        };
        updatePlayerStats(0);
    });
}

module.exports = {
	db,
	checkUserExists,
	saveUserToDatabase,
	updateUserAvatar,
	isDatabaseHealthy,
	getHashedPassword,
	getUserByEmail,
	getUserById,
	saveGameToDatabase,
    saveGameResultsToDatabase,
	getLatestGame,
	getAllGames,
	saveTwoFactorSecret,
	getTwoFactorSecret,
	enableTwoFactor,
	getUserByUsername,
    addFriend,
    removeFriend,
    getFriendsList,
    checkFriendship,
	saveSmartContractToDatabase,
	updateNickname,
	changePassword,
	getGamesHistory,
    getUserStats,
	getUserProfileStats,
    saveRefreshTokenInDatabase,
    getRefreshTokenFromDatabase,
    deleteRefreshTokenFromDatabase,
	getUsernameById,
	updateUserStats,
	updateTournamentStats
};