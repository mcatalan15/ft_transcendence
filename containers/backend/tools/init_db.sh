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
	CREATE TABLE IF NOT EXISTS users (
		id_user INTEGER PRIMARY KEY AUTOINCREMENT,
		username TEXT NOT NULL UNIQUE,
		email TEXT NOT NULL UNIQUE,
		password TEXT,
		provider TEXT NOT NULL DEFAULT 'local',
		twoFactorSecret TEXT,
		twoFactorEnabled BOOLEAN DEFAULT FALSE,
		avatar_filename TEXT DEFAULT NULL,
		avatar_type TEXT DEFAULT 'default' -- 'default', 'uploaded', 'generated'
	);

    CREATE TABLE IF NOT EXISTS games (
        id_game INTEGER PRIMARY KEY AUTOINCREMENT,
        player1_name TEXT,
        player2_name TEXT,
        player1_score INTEGER,
        player2_score INTEGER,
        winner_name TEXT 
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
    
    -- Add more initialization logic as needed
EOF

    echo "Database created at $DB_PATH"
else
    echo "Database found at $DB_PATH"
fi

#exec node main.js
exec npm run dev