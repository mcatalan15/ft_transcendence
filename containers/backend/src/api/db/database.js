const sqlite3 = require('sqlite3').verbose();
const dbPath = '/usr/src/app/db/mydatabase.db';
const db = connectToDatabase();

function connectToDatabase(retries = 5, delay = 2000) {
	const db = new sqlite3.Database(dbPath, (err) => {
		if (err) {
			console.error(`Error opening database (attempts left: ${retries}):`, err.message);
			if (retries > 0) {
				console.log(`Retrying in ${delay/1000} seconds...`);
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
		const query = `INSERT INTO users (username, email, password, provider, avatar_filename, avatar_type) VALUES (?, ?, ?, ?, ?, ?)`;
		const params = [username, email, hashedPassword, provider, avatarFilename, avatarFilename ? 'default' : null];

		db.run(query, params, function (err) {
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
				resolve(this.lastID);
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
			// Neither username nor email provided
			resolve({ exists: false });
			return;
		}

		console.log(`[DB checkUserExists] Query: "${query}" with params: [${params.join(', ')}]`);

		db.get(query, params, (err, row) => {
			if (err) {
				console.error('[DB ERROR]', err);
				reject(new Error('Database error'));
				return;
			}

			if (row) {
				console.log('[DB checkUserExists] User found:', {
					id: row.id_user,
					username: row.username,
					email: row.email
				});
				resolve({
					exists: true,
					usernameExists: username ? row.username === username : false,
					emailExists: email ? row.email === email : false,
					user: row // Include the user data
				});
			} else {
				console.log('[DB checkUserExists] User NOT found.');
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

async function getUserById(userId) {
    return new Promise((resolve, reject) => {
        const query = `SELECT id_user as id, username, email, avatar_filename, avatar_type, twoFactorEnabled FROM users WHERE id_user = ?`;
        db.get(query, [userId], (err, row) => {
            if (err) {
                console.error('Database error in getUserById:', err);
                reject(err);
            } else {
                console.log('getUserById result for userId', userId, ':', row);
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

async function saveGameToDatabase(
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
) {
    return new Promise((resolve, reject) => {
        const query = `
            INSERT INTO games (
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
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
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
        ];
        db.run(query, params, function (err) {
            if (err) {
                console.error('[DB INSERT ERROR] Full error:', {
                    message: err.message,
                    code: err.code,
                    errno: err.errno,
                    stack: err.stack
                });
                reject(err);
            } else {
                resolve(this.lastID);
            }
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

// ! Needed???? !!!!
async function saveTwoFactorSecret(userId, secret) {
    return new Promise((resolve, reject) => {
        const query = `UPDATE users SET twoFactorSecret = ?, twoFactorEnabled = ? WHERE id_user = ?`;
        // Initially, twoFactorEnabled is FALSE until the user successfully verifies the code
        const params = [secret, false, userId];

        db.run(query, params, function (err) {
            if (err) {
                console.error(`[DB ERROR] Failed to save 2FA secret for user ${userId}:`, err.message);
                reject(new Error('Database error saving 2FA secret.'));
            } else if (this.changes === 0) {
                // If no rows were updated, it means the userId probably doesn't exist
                console.warn(`[DB WARN] No user found with ID ${userId} to save 2FA secret.`);
                reject(new Error('User not found.'));
            } else {
                console.log(`[DB] Saved 2FA secret for user ${userId}.`);
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
                console.log(`[DB] Fetched 2FA secret for user ${userId}.`);
                resolve(row.twoFactorSecret);
            } else {
                console.log(`[DB] No user found with ID ${userId} or no 2FA secret set.`);
                resolve(null);
            }
        });
    });
}

async function enableTwoFactor(userId, secret) {
    return new Promise((resolve, reject) => {
        const query = `UPDATE users SET twoFactorSecret = ?, twoFactorEnabled = ? WHERE id_user = ?`;
        const params = [secret, 0, userId];

        db.run(query, params, function (err) {
            if (err) {
                console.error(`[DB ERROR] Failed to enable 2FA for user ${userId}:`, err.message);
                reject(new Error('Database error enabling 2FA.'));
            } else if (this.changes === 0) {
                console.warn(`[DB WARN] No user found with ID ${userId} to enable 2FA.`);
                reject(new Error('User not found.'));
            } else {
                console.log(`[DB] Enabled 2FA for user ${userId}.`);
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
        // Prevent self-friending
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
        
        console.log('Executing DB query:', { query, params });
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
                console.log(`[DB] Successfully saved smart contract data for game ${gameId}`);
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
	saveSmartContractToDatabase
};