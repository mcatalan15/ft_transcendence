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
		provider TEXT NOT NULL DEFAULT 'local'
    );

    CREATE TABLE IF NOT EXISTS games (
        id_game INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_tournament BOOLEAN,
        player1_id INTEGER,
        player2_id INTEGER,
        player1_score INTEGER,
        player2_score INTEGER,
        winner_id INTEGER,
        player1_is_ai BOOLEAN,
        player2_is_ai BOOLEAN,
        game_mode TEXT CHECK(game_mode IN ('local', 'online', 'vs_ai')),
        FOREIGN KEY(player1_id) REFERENCES users(id_user),
        FOREIGN KEY(player2_id) REFERENCES users(id_user),
        FOREIGN KEY(winner_id) REFERENCES users(id_user)
    );
    
    -- Add more initialization logic as needed
EOF

    echo "Database created at $DB_PATH"
else
    echo "Database found at $DB_PATH"
fi

#exec node main.js
exec npm run dev