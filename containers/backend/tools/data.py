#!/usr/bin/env python3
"""
Database Random Data Generator
Usage: python script.py <number_of_users> <is_tournament>
Example: python script.py 50 true
"""

import sqlite3
import random
import string
import sys
import argparse
from datetime import datetime, timedelta

def generate_random_username(min_length=6):
    """Generate a random username with minimum 6 characters"""
    adjectives = ['Cool', 'Fast', 'Smart', 'Pro', 'Epic', 'Dark', 'Fire', 'Ice', 'Wild', 'Bold']
    nouns = ['Gamer', 'Player', 'Warrior', 'Master', 'Hero', 'Champion', 'Legend', 'Fox', 'Wolf', 'Eagle']
    
    username = random.choice(adjectives) + random.choice(nouns)
    
    # Add random numbers to ensure uniqueness and meet minimum length
    if len(username) < min_length:
        username += str(random.randint(10, 999))
    else:
        username += str(random.randint(1, 99))
    
    return username

def generate_email(username):
    """Generate email based on username"""
    return f"{username.lower()}{random.randint(1, 999)}@gmail.com"

def insert_users(cursor, num_users):
    """Insert random users into the database"""
    users = []
    
    for i in range(num_users):
        username = generate_random_username()
        email = generate_email(username)
        password = "Hola1234"  # Fixed password as specified
        provider = "local"     # Default provider
        twoFactorEnabled = 0   # Disabled as specified
        
        # Random avatar settings
        avatar_types = ['default', 'uploaded', 'generated']
        avatar_type = random.choice(avatar_types)
        avatar_filename = None if avatar_type == 'default' else f"avatar_{i+1}.jpg"
        
        cursor.execute("""
            INSERT INTO users (username, email, password, provider, twoFactorEnabled, avatar_filename, avatar_type)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (username, email, password, provider, twoFactorEnabled, avatar_filename, avatar_type))
        
        users.append({
            'id': cursor.lastrowid,
            'username': username,
            'email': email
        })
    
    return users

def insert_games(cursor, users, is_tournament=False):
    """Insert random games into the database"""
    num_games = random.randint(len(users) // 2, len(users) * 2)  # Variable number of games
    
    game_modes = ['local', 'online', 'vs_ai']
    
    for _ in range(num_games):
        # Random game mode
        game_mode = random.choice(game_modes)
        
        # Select players
        if game_mode == 'vs_ai':
            player1 = random.choice(users)
            player1_name = player1['username']
            player2_name = "AI_Bot"
            player1_is_ai = False
            player2_is_ai = True
        else:
            player1, player2 = random.sample(users, 2)
            player1_name = player1['username']
            player2_name = player2['username']
            player1_is_ai = False
            player2_is_ai = False
        
        # Random scores (typical pong game scores)
        max_score = random.choice([5, 7, 10, 11])  # Common pong winning scores
        player1_score = random.randint(0, max_score)
        player2_score = random.randint(0, max_score)
        
        # Ensure one player reaches the winning score
        if player1_score == player2_score:
            if random.choice([True, False]):
                player1_score = max_score
            else:
                player2_score = max_score
        elif player1_score < max_score and player2_score < max_score:
            if random.choice([True, False]):
                player1_score = max_score
            else:
                player2_score = max_score
        
        # Determine winner
        winner_name = player1_name if player1_score > player2_score else player2_name
        
        # Random creation time (within last 30 days)
        created_at = datetime.now() - timedelta(days=random.randint(0, 30))
        
        cursor.execute("""
            INSERT INTO games (created_at, is_tournament, player1_name, player2_name, 
                             player1_score, player2_score, winner_name, player1_is_ai, 
                             player2_is_ai, game_mode)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (created_at, is_tournament, player1_name, player2_name, player1_score, 
              player2_score, winner_name, player1_is_ai, player2_is_ai, game_mode))

def insert_tournament_data(cursor, users):
    """Insert tournament and tournament participants data"""
    # Create a tournament
    tournament_name = f"Championship {random.randint(2020, 2024)}"
    tournament_status = random.choice(['pending', 'active', 'finished'])
    created_at = datetime.now() - timedelta(days=random.randint(1, 60))
    
    cursor.execute("""
        INSERT INTO tournaments (name, created_at, status)
        VALUES (?, ?, ?)
    """, (tournament_name, created_at, tournament_status))
    
    tournament_id = cursor.lastrowid
    
    # Select participants (between 4 and 16 players for a proper tournament)
    num_participants = min(len(users), random.choice([4, 8, 16]))
    participants = random.sample(users, num_participants)
    
    # Insert tournament participants
    for i, participant in enumerate(participants):
        is_ai = False  # All participants are real users
        # Assign final positions if tournament is finished
        final_position = i + 1 if tournament_status == 'finished' else None
        
        cursor.execute("""
            INSERT INTO tournament_participants (id_tournament, id_user, is_ai, final_position)
            VALUES (?, ?, ?, ?)
        """, (tournament_id, participant['id'], is_ai, final_position))

def main():
    parser = argparse.ArgumentParser(description='Generate random data for the database')
    parser.add_argument('num_users', type=int, help='Number of users to generate')
    parser.add_argument('is_tournament', type=str, help='Whether to generate tournament data (true/false)')
    
    args = parser.parse_args()
    
    # Parse tournament argument
    is_tournament = args.is_tournament.lower() in ['true', '1', 'yes', 'y']
    
    # Validate number of users
    if args.num_users < 1:
        print("Error: Number of users must be at least 1")
        sys.exit(1)
    
    # Connect to database
    try:
        db_path = "/usr/src/app/db/mydatabase.db"
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print(f"Generating data for {args.num_users} users...")
        print(f"Tournament mode: {is_tournament}")
        
        # Insert users
        print("Inserting users...")
        users = insert_users(cursor, args.num_users)
        print(f"✓ Inserted {len(users)} users")
        
        # Insert games
        print("Inserting games...")
        insert_games(cursor, users, is_tournament)
        print("✓ Inserted random games")
        
        # Insert tournament data if requested
        if is_tournament:
            print("Inserting tournament data...")
            insert_tournament_data(cursor, users)
            print("✓ Inserted tournament and participants data")
        
        # Commit changes
        conn.commit()
        print("✓ All data inserted successfully!")
        
    except sqlite3.Error as e:
        print(f"Database error: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    main()