#!/bin/sh

# example of what mydatabase.db could look like
# mydatabase.db
#  ├── users
#  ├── game_sessions
#  ├── scores
#  └── statistics

DB_PATH="/usr/src/app/db/mydatabase.db"

# Check if the database already exists
if [ ! -f "$DB_PATH" ]; then
    echo "Database not found. Creating a new database..."

	mkdir -p ./db

	sqlite3 "$DB_PATH" <<EOF
	PRAGMA foreign_keys = ON;

	CREATE TABLE IF NOT EXISTS users (
		id_user INTEGER PRIMARY KEY AUTOINCREMENT,
		username TEXT NOT NULL UNIQUE,
		email TEXT NOT NULL UNIQUE,
		password TEXT,
		provider TEXT NOT NULL DEFAULT 'local',
		twoFactorSecret TEXT,
		twoFactorEnabled BOOLEAN DEFAULT 1 CHECK (twoFactorEnabled IN (0, 1)),
		avatar_filename TEXT DEFAULT NULL,
		avatar_type TEXT DEFAULT 'default' -- 'default', 'uploaded', 'generated'
	);

	CREATE TABLE IF NOT EXISTS games (
		id_game INTEGER PRIMARY KEY AUTOINCREMENT,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		is_tournament BOOLEAN,
		player1_name TEXT,
		player2_name TEXT,
		player1_score INTEGER,
		player2_score INTEGER,
		winner_name TEXT,
		player1_is_ai BOOLEAN,
		player2_is_ai BOOLEAN,
		game_mode TEXT CHECK(game_mode IN ('local', 'online', 'vs_ai')),
		FOREIGN KEY(player1_id) REFERENCES users(id_user),
		FOREIGN KEY(player2_id) REFERENCES users(id_user),
		FOREIGN KEY(winner_id) REFERENCES users(id_user)        player2_is_ai BOOLEAN,
		game_mode TEXT CHECK(game_mode IN ('local', 'online', 'vs_ai')),
		FOREIGN KEY(player1_id) REFERENCES users(id_user),
		FOREIGN KEY(player2_id) REFERENCES users(id_user),
		FOREIGN KEY(winner_id) REFERENCES users(id_user)
	);

	CREATE TABLE IF NOT EXISTS friends (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		user_id INTEGER NOT NULL,
		friend_id INTEGER NOT NULL,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (user_id) REFERENCES users(id_user),
		FOREIGN KEY (friend_id) REFERENCES users(id_user),
		UNIQUE(user_id, friend_id)
	);

	CREATE TABLE IF NOT EXISTS tournaments (
		id_tournament INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		status TEXT CHECK(status IN ('pending', 'active', 'finished'))
	);

	CREATE TABLE IF NOT EXISTS tournament_participants (
		id_tournament INTEGER,
		id_user INTEGER,
		is_ai BOOLEAN,
		final_position INTEGER,
		PRIMARY KEY (id_tournament, id_user),
		FOREIGN KEY (id_tournament) REFERENCES tournaments(id_tournament),
		FOREIGN KEY (id_user) REFERENCES users(id_user)
	);

	CREATE TABLE IF NOT EXISTS user_stats (
		id_user INTEGER PRIMARY KEY,
		total_games INTEGER DEFAULT 0,
		wins INTEGER DEFAULT 0,
		losses INTEGER DEFAULT 0,
		win_rate FLOAT DEFAULT 0.0,
		vs_ai_games INTEGER DEFAULT 0,
		tournaments_won INTEGER DEFAULT 0,
		FOREIGN KEY(id_user) REFERENCES users(id_user)
	);

	-- Add more initialization logic as needed
EOF

    echo "Database created at $DB_PATH"
else
    echo "Database found at $DB_PATH"
fi

#exec node main.js
exec npm run dev