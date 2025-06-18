#!/bin/sh

# Database path
DB_PATH="/usr/src/app/db/mydatabase.db"

# Function to check if SQLite3 is installed
check_sqlite() {
    if ! command -v sqlite3 &> /dev/null; then
        echo "Error: sqlite3 is not installed."
        exit 1
    fi
}

# Function to generate random string
random_string() {
    local length=$1
    cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w "$length" | head -n 1
}

# Function to generate random email
random_email() {
    echo "$(random_string 8)@example.com"
}

# Check if correct number of arguments
if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <number_of_users> <tournament_yes_no>"
    exit 1
fi

NUM_USERS=$1
TOURNAMENT=$2
NUM_TOURNAMENTS=0

# Validate number of users
if ! [[ "$NUM_USERS" =~ ^[0-9]+$ ]] || [ "$NUM_USERS" -lt 1 ]; then
    echo "Error: Number of users must be a positive integer."
    exit 1
fi

# Validate tournament input
if [ "$TOURNAMENT" != "yes" ] && [ "$TOURNAMENT" != "no" ]; then
    echo "Error: Tournament must be 'yes' or 'no'."
    exit 1
fi

# If tournament is yes, ask for number of tournaments
if [ "$TOURNAMENT" = "yes" ]; then
    read -p "Enter number of tournaments: " NUM_TOURNAMENTS
    if ! [[ "$NUM_TOURNAMENTS" =~ ^[0-9]+$ ]] || [ "$NUM_TOURNAMENTS" -lt 1 ]; then
        echo "Error: Number of tournaments must be a positive integer."
        exit 1
    fi
fi

check_sqlite

# Create temporary SQL file
TEMP_SQL=$(mktemp)

# Start building SQL commands
cat << EOF > "$TEMP_SQL"
PRAGMA foreign_keys = ON;
BEGIN TRANSACTION;

-- Insert users
EOF

# Generate users
for ((i=1; i<=NUM_USERS; i++)); do
    USERNAME="user$(random_string 4)"
    EMAIL=$(random_email)
    echo "INSERT INTO users (username, email, password, provider, twoFactorEnabled) VALUES ('$USERNAME', '$EMAIL', 'Hola1234', 'local', 0);" >> "$TEMP_SQL"
done

# Generate games (random number between NUM_USERS and NUM_USERS*2)
NUM_GAMES=$((RANDOM % NUM_USERS + NUM_USERS))

cat << EOF >> "$TEMP_SQL"
-- Insert games
EOF

for ((i=1; i<=NUM_GAMES; i++)); do
    PLAYER1_ID=$((RANDOM % NUM_USERS + 1))
    PLAYER2_ID=$((RANDOM % NUM_USERS + 1))
    while [ $PLAYER1_ID -eq $PLAYER2_ID ]; do
        PLAYER2_ID=$((RANDOM % NUM_USERS + 1))
    done
    
    SCORE1=$((RANDOM % 10))
    SCORE2=$((RANDOM % 10))
    
    if [ $SCORE1 -gt $SCORE2 ]; then
        WINNER_ID=$PLAYER1_ID
    elif [ $SCORE2 -gt $SCORE1 ]; then
        WINNER_ID=$PLAYER2_ID
    else
        WINNER_ID=NULL
    fi
    
    IS_TOURNAMENT=$([ $((RANDOM % 2)) -eq 0 ] && echo 0 || echo 1)
    PLAYER1_AI=$([ $((RANDOM % 4)) -eq 0 ] && echo 1 || echo 0)
    PLAYER2_AI=$([ $((RANDOM % 4)) -eq 0 ] && echo 1 || echo 0)
    
    GAME_MODES=('local' 'online' 'vs_ai')
    GAME_MODE=${GAME_MODES[$((RANDOM % 3))]}
    
    echo "INSERT INTO games (is_tournament, player1_id, player2_id, player1_score, player2_score, winner_id, player1_is_ai, player2_is_ai, game_mode) VALUES ($IS_TOURNAMENT, $PLAYER1_ID, $PLAYER2_ID, $SCORE1, $SCORE2, $WINNER_ID, $PLAYER1_AI, $PLAYER2_AI, '$GAME_MODE');" >> "$TEMP_SQL"
done

# Generate friends (each user gets 0-3 random friends)
cat << EOF >> "$TEMP_SQL"
-- Insert friends
EOF

for ((i=1; i<=NUM_USERS; i++)); do
    NUM_FRIENDS=$((RANDOM % 4))
    USED_FRIENDS=()
    
    for ((j=1; j<=NUM_FRIENDS; j++)); do
        FRIEND_ID=$((RANDOM % NUM_USERS + 1))
        while [ $FRIEND_ID -eq $i ] || [[ " ${USED_FRIENDS[@]} " =~ " $FRIEND_ID " ]]; do
            FRIEND_ID=$((RANDOM % NUM_USERS + 1))
        done
        USED_FRIENDS+=($FRIEND_ID)
        echo "INSERT OR IGNORE INTO friends (user_id, friend_id) VALUES ($i, $FRIEND_ID);" >> "$TEMP_SQL"
    done
done

# Generate tournaments and participants if requested
if [ "$TOURNAMENT" = "yes" ]; then
    cat << EOF >> "$TEMP_SQL"
-- Insert tournaments
EOF
    
    for ((i=1; i<=NUM_TOURNAMENTS; i++)); do
        STATUS=('pending' 'active' 'finished')
        T_STATUS=${STATUS[$((RANDOM % 3))]}
        echo "INSERT INTO tournaments (name, status) VALUES ('Tournament_$i', '$T_STATUS');" >> "$TEMP_SQL"
        
        # Add 4-8 participants per tournament
        NUM_PARTICIPANTS=$((RANDOM % 5 + 4))
        PARTICIPANTS=()
        
        for ((j=1; j<=NUM_PARTICIPANTS; j++)); do
            USER_ID=$((RANDOM % NUM_USERS + 1))
            while [[ " ${PARTICIPANTS[@]} " =~ " $USER_ID " ]]; do
                USER_ID=$((RANDOM % NUM_USERS + 1))
            done
            PARTICIPANTS+=($USER_ID)
            IS_AI=$([ $((RANDOM % 4)) -eq 0 ] && echo 1 || echo 0)
            
            # Assign final position only for finished tournaments
            FINAL_POS=""
            if [ "$T_STATUS" = "finished" ]; then
                FINAL_POS=", $j"
            fi
            
            echo "INSERT INTO tournament_participants (id_tournament, id_user, is_ai, final_position) VALUES ($i, $USER_ID, $IS_AI $FINAL_POS);" >> "$TEMP_SQL"
        done
    done
fi

# Generate user stats
cat << EOF >> "$TEMP_SQL"
-- Insert user stats
EOF

for ((i=1; i<=NUM_USERS; i++)); do
    TOTAL_GAMES=$((RANDOM % 20))
    WINS=$((RANDOM % TOTAL_GAMES))
    LOSSES=$((TOTAL_GAMES - WINS))
    WIN_RATE=$(awk "BEGIN {printf \"%.2f\", $WINS / ($TOTAL_GAMES + 0.0001)}")
    VS_AI_GAMES=$((RANDOM % TOTAL_GAMES))
    TOURNAMENTS_WON=$([ "$TOURNAMENT" = "yes" ] && echo $((RANDOM % 2)) || echo 0)
    
    echo "INSERT INTO user_stats (id_user, total_games, wins, losses, win_rate, vs_ai_games, tournaments_won) VALUES ($i, $TOTAL_GAMES, $WINS, $LOSSES, $WIN_RATE, $VS_AI_GAMES, $TOURNAMENTS_WON);" >> "$TEMP_SQL"
done

cat << EOF >> "$TEMP_SQL"
COMMIT;
EOF

# Execute SQL commands
if sqlite3 "$DB_PATH" < "$TEMP_SQL"; then
    echo "Data successfully inserted into database."
else
    echo "Error inserting data into database."
    rm "$TEMP_SQL"
    exit 1
fi

# Clean up
rm "$TEMP_SQL"

echo "Generated:"
echo "- $NUM_USERS users"
echo "- $NUM_GAMES games"
if [ "$TOURNAMENT" = "yes" ]; then
    echo "- $NUM_TOURNAMENTS tournaments"
fi