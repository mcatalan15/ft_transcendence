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
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT,
		provider TEXT NOT NULL DEFAULT 'local',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    -- Add more initialization logic as needed
EOF

    echo "Database created at $DB_PATH"
else
    echo "Database found at $DB_PATH"
fi

#exec node main.js
exec npm run dev