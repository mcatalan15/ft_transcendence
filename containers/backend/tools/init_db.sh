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
		twoFactorEnabled BOOLEAN DEFAULT 0,
		avatar_filename TEXT DEFAULT NULL,
		avatar_type TEXT DEFAULT 'default' -- 'default', 'uploaded', 'generated'
	);

	CREATE TABLE IF NOT EXISTS refresh_tokens (
		user_id INTEGER PRIMARY KEY,
		token TEXT NOT NULL
	);

	CREATE TABLE IF NOT EXISTS games (
		id_game INTEGER PRIMARY KEY AUTOINCREMENT,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		ended_at TIMESTAMP,
		is_tournament BOOLEAN DEFAULT 0,
		player1_id INTEGER,
		player2_id INTEGER,
		winner_id INTEGER,
		player1_score INTEGER DEFAULT 0,
		player2_score INTEGER DEFAULT 0,
		game_mode TEXT,
		general_result TEXT CHECK(general_result IN ('leftWin', 'rightWin', 'draw')) DEFAULT NULL,
		-- Game configuration will be stored as JSON string
		config_json TEXT,
		-- Ball usage statistics
		default_balls_used INTEGER DEFAULT 0,
		curve_balls_used INTEGER DEFAULT 0,
		multiply_balls_used INTEGER DEFAULT 0,
		spin_balls_used INTEGER DEFAULT 0,
		burst_balls_used INTEGER DEFAULT 0,
		-- Special items usage
		bullets_used INTEGER DEFAULT 0,
		shields_used INTEGER DEFAULT 0,
		-- Wall elements used
		pyramids_used INTEGER DEFAULT 0,
		escalators_used INTEGER DEFAULT 0,
		hourglasses_used INTEGER DEFAULT 0,
		lightnings_used INTEGER DEFAULT 0,
		maws_used INTEGER DEFAULT 0,
		rakes_used INTEGER DEFAULT 0,
		trenches_used INTEGER DEFAULT 0,
		kites_used INTEGER DEFAULT 0,
		bowties_used INTEGER DEFAULT 0,
		honeycombs_used INTEGER DEFAULT 0,
		snakes_used INTEGER DEFAULT 0,
		vipers_used INTEGER DEFAULT 0,
		waystones_used INTEGER DEFAULT 0,
		-- Player 1 detailed stats
		player1_hits INTEGER DEFAULT 0,
		player1_goals_in_favor INTEGER DEFAULT 0,
		player1_goals_against INTEGER DEFAULT 0,
		player1_powerups_picked INTEGER DEFAULT 0,
		player1_powerdowns_picked INTEGER DEFAULT 0,
		player1_ballchanges_picked INTEGER DEFAULT 0,
		player1_result TEXT CHECK(player1_result IN ('win', 'lose', 'draw')) DEFAULT NULL,
		-- Player 2 detailed stats
		player2_hits INTEGER DEFAULT 0,
		player2_goals_in_favor INTEGER DEFAULT 0,
		player2_goals_against INTEGER DEFAULT 0,
		player2_powerups_picked INTEGER DEFAULT 0,
		player2_powerdowns_picked INTEGER DEFAULT 0,
		player2_ballchanges_picked INTEGER DEFAULT 0,
		player2_result TEXT CHECK(player2_result IN ('win', 'lose', 'draw')) DEFAULT NULL,
		-- Smart contract data
		smart_contract_link TEXT,
		contract_address TEXT,
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
		-- Basic game statistics
		total_games INTEGER DEFAULT 0,
		wins INTEGER DEFAULT 0,
		losses INTEGER DEFAULT 0,
		draws INTEGER DEFAULT 0,
		win_rate FLOAT DEFAULT 0.0,
		vs_ai_games INTEGER DEFAULT 0,
		-- Tournament statistics
		total_tournaments INTEGER DEFAULT 0,
		tournaments_won INTEGER DEFAULT 0,
		tournaments_lost INTEGER DEFAULT 0,
		-- Detailed gameplay statistics
		total_hits INTEGER DEFAULT 0,
		total_goals_scored INTEGER DEFAULT 0,
		total_goals_conceded INTEGER DEFAULT 0,
		total_powerups_picked INTEGER DEFAULT 0,
		total_powerdowns_picked INTEGER DEFAULT 0,
		total_ballchanges_picked INTEGER DEFAULT 0,
		-- Ball usage statistics
		total_default_balls INTEGER DEFAULT 0,
		total_curve_balls INTEGER DEFAULT 0,
		total_multiply_balls INTEGER DEFAULT 0,
		total_spin_balls INTEGER DEFAULT 0,
		total_burst_balls INTEGER DEFAULT 0,
		-- Special items usage
		total_bullets INTEGER DEFAULT 0,
		total_shields INTEGER DEFAULT 0,
		-- Wall elements usage
		total_pyramids INTEGER DEFAULT 0,
		total_escalators INTEGER DEFAULT 0,
		total_hourglasses INTEGER DEFAULT 0,
		total_lightnings INTEGER DEFAULT 0,
		total_maws INTEGER DEFAULT 0,
		total_rakes INTEGER DEFAULT 0,
		total_trenches INTEGER DEFAULT 0,
		total_kites INTEGER DEFAULT 0,
		total_bowties INTEGER DEFAULT 0,
		total_honeycombs INTEGER DEFAULT 0,
		total_snakes INTEGER DEFAULT 0,
		total_vipers INTEGER DEFAULT 0,
		total_waystones INTEGER DEFAULT 0,
		-- Performance metrics
		average_score FLOAT DEFAULT 0.0,
		highest_score INTEGER DEFAULT 0,
		goals_per_game FLOAT DEFAULT 0.0,
		hits_per_game FLOAT DEFAULT 0.0,
		powerups_per_game FLOAT DEFAULT 0.0,
		-- Last updated timestamp
		last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY(id_user) REFERENCES users(id_user)
	);

	CREATE TABLE IF NOT EXISTS game_results (
		id_game INTEGER PRIMARY KEY,
		game_data TEXT NOT NULL,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY(id_game) REFERENCES games(id_game)
	);

		-- Create indexes for better performance
	CREATE INDEX IF NOT EXISTS idx_games_player1_id ON games(player1_id);
	CREATE INDEX IF NOT EXISTS idx_games_player2_id ON games(player2_id);
	CREATE INDEX IF NOT EXISTS idx_games_created_at ON games(created_at);

	-- Creation of ButiBot and Guest
	-- Insert ButiBot user if not exists
	INSERT INTO users (username, email, password, provider, twoFactorEnabled, avatar_type)
	SELECT 'ButiBot', 'ButiBot@example.com', 'Hola1234', 'local', 0, 'default'
	WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'ButiBot');

	-- Insert guest user if not exists
	INSERT INTO users (username, email, password, provider, twoFactorEnabled, avatar_type)
	SELECT 'guest', 'guest@example.com', 'Hola1234', 'local', 0, 'default'
	WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'guest');

-- Insert user_stats for ButiBot if not exists
	INSERT OR IGNORE INTO user_stats (id_user)
	SELECT id_user FROM users WHERE username = 'ButiBot';

	-- Insert user_stats for guest if not exists
	INSERT OR IGNORE INTO user_stats (id_user)
	SELECT id_user FROM users WHERE username = 'guest';
EOF

    echo "Database created at $DB_PATH"
else
    echo "Database found at $DB_PATH"
fi

#exec node main.js
exec npm run dev