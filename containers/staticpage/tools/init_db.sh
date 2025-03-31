#!/bin/sh

# Path to the SQLite database file
DB_PATH="./db/mydatabase.db"

# Check if the database already exists
if [ ! -f "$DB_PATH" ]; then
    echo "Database not found. Creating a new database..."

	mkdir -p ./db
    # Initialize the SQLite database and create the tables (if necessary)
    sqlite3 "$DB_PATH" <<EOF
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
    );
    -- Add more initialization logic as needed
EOF

    echo "Database created at $DB_PATH"
else
    echo "Database already exists at $DB_PATH"
fi

exec ./main
