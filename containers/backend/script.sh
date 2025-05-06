DB_PATH="/usr/src/app/db/mydatabase.db"

# Check if the database already exists
if [ ! -f "$DB_PATH" ]; then
    echo "Database not found. Creating a new database..."

    echo "Database created at $DB_PATH"
else
    echo "Database found at $DB_PATH"
fi
