#!/usr/bin/env python3
import sqlite3
import sys
import os
import bcrypt
import random
import json
from datetime import datetime


DB_PATH = "/usr/src/app/db/mydatabase.db"

def create_users(n):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    for i in range(1, n + 1):
        username = f"user{i}"
        email = f"{username}@gmail.com"
        plain_password = "Hola1234"
        provider = "local"

        hashed_password = bcrypt.hashpw(plain_password.encode('utf-8'), bcrypt.gensalt())

        try:
            c.execute(
                """
                INSERT INTO users (username, email, password, provider)
                VALUES (?, ?, ?, ?)
                """,
                (username, email, hashed_password.decode('utf-8'), provider)
            )
            print(f"Created user: {username}")
        except sqlite3.IntegrityError as e:
            print(f"Error creating user {username}: {e}")

    conn.commit()
    conn.close()

def create_friends(n):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    c.execute("SELECT id_user FROM users ORDER BY id_user ASC")
    users = [row[0] for row in c.fetchall()]

    if len(users) < n + 1:
        print(f"Error: Not enough users to create {n} friends per user.")
        conn.close()
        sys.exit(1)

    for user_id in users:
        friends_added = 0
        for friend_id in users:
            if friend_id == user_id:
                continue  # no self-friend
            # Check if friendship already exists
            c.execute(
                "SELECT 1 FROM friends WHERE user_id = ? AND friend_id = ?",
                (user_id, friend_id)
            )
            if c.fetchone():
                continue  # already friends
            c.execute(
                """
                INSERT OR IGNORE INTO friends (user_id, friend_id)
                VALUES (?, ?)
                """,
                (user_id, friend_id)
            )
            friends_added += 1
            if friends_added >= n:
                break

        print(f"User {user_id} now has {friends_added} new friends.")

    conn.commit()
    conn.close()

def create_games(n):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    # Get all users
    c.execute("SELECT id_user FROM users")
    users = [row[0] for row in c.fetchall()]

    if len(users) < 2:
        print("Need at least 2 users to simulate games.")
        conn.close()
        sys.exit(1)

    for _ in range(n):
        # Randomly pick two distinct players
        player1_id, player2_id = random.sample(users, 2)

        # Random game mode
        game_modes = ['classic', 'arcade', 'time_attack']
        game_mode = random.choice(game_modes)

        # Simulate game stats
        player1_score = random.randint(0, 10)
        player2_score = random.randint(0, 10)

        if player1_score > player2_score:
            winner_id = player1_id
            general_result = 'leftWin'
            player1_result = 'win'
            player2_result = 'lose'
        elif player2_score > player1_score:
            winner_id = player2_id
            general_result = 'rightWin'
            player1_result = 'lose'
            player2_result = 'win'
        else:
            winner_id = None
            general_result = 'draw'
            player1_result = 'draw'
            player2_result = 'draw'

        # Simulated hits and powerups (random reasonable values)
        player1_hits = random.randint(0, 20)
        player2_hits = random.randint(0, 20)

        player1_goals_in_favor = player1_score
        player2_goals_in_favor = player2_score

        player1_goals_against = player2_score
        player2_goals_against = player1_score

        player1_powerups_picked = random.randint(0, 5)
        player2_powerups_picked = random.randint(0, 5)

        player1_powerdowns_picked = random.randint(0, 3)
        player2_powerdowns_picked = random.randint(0, 3)

        player1_ballchanges_picked = random.randint(0, 2)
        player2_ballchanges_picked = random.randint(0, 2)

        # Ball usage and special items usage set to random 0-3
        ball_usage_keys = [
            'default_balls_used', 'curve_balls_used', 'multiply_balls_used',
            'spin_balls_used', 'burst_balls_used'
        ]
        special_items_keys = [
            'bullets_used', 'shields_used'
        ]
        wall_elements_keys = [
            'pyramids_used', 'escalators_used', 'hourglasses_used', 'lightnings_used',
            'maws_used', 'rakes_used', 'trenches_used', 'kites_used', 'bowties_used',
            'honeycombs_used', 'snakes_used', 'vipers_used', 'waystones_used'
        ]

        ball_usage = {k: random.randint(0, 3) for k in ball_usage_keys}
        special_items = {k: random.randint(0, 2) for k in special_items_keys}
        wall_elements = {k: random.randint(0, 1) for k in wall_elements_keys}

        # AI flags (False for all for simplicity)
        player1_is_ai = 0
        player2_is_ai = 0

        # game config JSON (simplified)
        config = {
            "difficulty": random.choice(["easy", "medium", "hard"]),
            "time_limit": random.choice([300, 600, 900]),
        }
        config_json = json.dumps(config)

        # Insert game record
        c.execute("""
            INSERT INTO games (
                player1_id, player2_id, winner_id,
                player1_score, player2_score,
                game_mode, general_result,
                config_json,
                default_balls_used, curve_balls_used, multiply_balls_used,
                spin_balls_used, burst_balls_used,
                bullets_used, shields_used,
                pyramids_used, escalators_used, hourglasses_used,
                lightnings_used, maws_used, rakes_used,
                trenches_used, kites_used, bowties_used,
                honeycombs_used, snakes_used, vipers_used,
                waystones_used,
                player1_hits, player1_goals_in_favor, player1_goals_against,
                player1_powerups_picked, player1_powerdowns_picked, player1_ballchanges_picked,
                player1_result,
                player2_hits, player2_goals_in_favor, player2_goals_against,
                player2_powerups_picked, player2_powerdowns_picked, player2_ballchanges_picked,
                player2_result,
                ended_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            player1_id, player2_id, winner_id,
            player1_score, player2_score,
            None if winner_id is None else (str(winner_id)),
            game_mode, general_result,
            config_json,
            ball_usage['default_balls_used'], ball_usage['curve_balls_used'], ball_usage['multiply_balls_used'],
            ball_usage['spin_balls_used'], ball_usage['burst_balls_used'],
            special_items['bullets_used'], special_items['shields_used'],
            wall_elements['pyramids_used'], wall_elements['escalators_used'], wall_elements['hourglasses_used'],
            wall_elements['lightnings_used'], wall_elements['maws_used'], wall_elements['rakes_used'],
            wall_elements['trenches_used'], wall_elements['kites_used'], wall_elements['bowties_used'],
            wall_elements['honeycombs_used'], wall_elements['snakes_used'], wall_elements['vipers_used'],
            wall_elements['waystones_used'],
            player1_hits, player1_goals_in_favor, player1_goals_against,
            player1_powerups_picked, player1_powerdowns_picked, player1_ballchanges_picked,
            player1_result,
            player2_hits, player2_goals_in_favor, player2_goals_against,
            player2_powerups_picked, player2_powerdowns_picked, player2_ballchanges_picked,
            player2_result,
            datetime.now().isoformat(" ", "seconds")
        ))

        game_id = c.lastrowid

        # Update user_stats for player1
        update_user_stats(c, player1_id,
                          win=player1_result == 'win',
                          loss=player1_result == 'lose',
                          draw=player1_result == 'draw',
                        #   vs_ai=player2_is_ai,
                          hits=player1_hits,
                          goals_scored=player1_goals_in_favor,
                          goals_conceded=player1_goals_against,
                          powerups=player1_powerups_picked,
                          powerdowns=player1_powerdowns_picked,
                          ballchanges=player1_ballchanges_picked,
                          ball_usage={k.replace('_used', ''): ball_usage[k] for k in ball_usage},
                          special_items={k.replace('_used', ''): special_items[k] for k in special_items},
                          wall_elements={k.replace('_used', ''): wall_elements[k] for k in wall_elements},
                          score=player1_score
                          )

        # Update user_stats for player2
        update_user_stats(c, player2_id,
                          win=player2_result == 'win',
                          loss=player2_result == 'lose',
                          draw=player2_result == 'draw',
                        #   vs_ai=player1_is_ai,
                          hits=player2_hits,
                          goals_scored=player2_goals_in_favor,
                          goals_conceded=player2_goals_against,
                          powerups=player2_powerups_picked,
                          powerdowns=player2_powerdowns_picked,
                          ballchanges=player2_ballchanges_picked,
                          ball_usage={k.replace('_used', ''): ball_usage[k] for k in ball_usage},
                          special_items={k.replace('_used', ''): special_items[k] for k in special_items},
                          wall_elements={k.replace('_used', ''): wall_elements[k] for k in wall_elements},
                          score=player2_score
                          )

        print(f"Created game {game_id} between user {player1_id} and user {player2_id}")

    conn.commit()
    conn.close()

def update_user_stats(c, user_id, win=False, loss=False, draw=False,
                      hits=0, goals_scored=0, goals_conceded=0,
                      powerups=0, powerdowns=0, ballchanges=0,
                      ball_usage=None, special_items=None, wall_elements=None,
                      score=0):

    # Check if user_stats row exists
    c.execute("SELECT id_user FROM user_stats WHERE id_user = ?", (user_id,))
    if not c.fetchone():
        # Insert default stats row for user
        c.execute("""
            INSERT INTO user_stats (
                id_user,
                wins, losses, draws,
                hits, goals_scored, goals_conceded,
                powerups_picked, powerdowns_picked, ballchanges_picked,
                default_balls_used, curve_balls_used, multiply_balls_used,
                spin_balls_used, burst_balls_used,
                bullets_used, shields_used,
                pyramids_used, escalators_used, hourglasses_used,
                lightnings_used, maws_used, rakes_used,
                trenches_used, kites_used, bowties_used,
                honeycombs_used, snakes_used, vipers_used,
                waystones_used,
                score
            ) VALUES (?, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0)
        """, (user_id,))

    # Update stats accordingly
    update_query = """
        UPDATE user_stats SET
            wins = wins + ?,
            losses = losses + ?,
            draws = draws + ?,
            hits = hits + ?,
            goals_scored = goals_scored + ?,
            goals_conceded = goals_conceded + ?,
            powerups_picked = powerups_picked + ?,
            powerdowns_picked = powerdowns_picked + ?,
            ballchanges_picked = ballchanges_picked + ?,
            default_balls_used = default_balls_used + ?,
            curve_balls_used = curve_balls_used + ?,
            multiply_balls_used = multiply_balls_used + ?,
            spin_balls_used = spin_balls_used + ?,
            burst_balls_used = burst_balls_used + ?,
            bullets_used = bullets_used + ?,
            shields_used = shields_used + ?,
            pyramids_used = pyramids_used + ?,
            escalators_used = escalators_used + ?,
            hourglasses_used = hourglasses_used + ?,
            lightnings_used = lightnings_used + ?,
            maws_used = maws_used + ?,
            rakes_used = rakes_used + ?,
            trenches_used = trenches_used + ?,
            kites_used = kites_used + ?,
            bowties_used = bowties_used + ?,
            honeycombs_used = honeycombs_used + ?,
            snakes_used = snakes_used + ?,
            vipers_used = vipers_used + ?,
            waystones_used = waystones_used + ?,
            score = score + ?
        WHERE id_user = ?
    """

    values = (
        1 if win else 0,
        1 if loss else 0,
        1 if draw else 0,
        hits,
        goals_scored,
        goals_conceded,
        powerups,
        powerdowns,
        ballchanges,
        ball_usage.get('default_balls', 0),
        ball_usage.get('curve_balls', 0),
        ball_usage.get('multiply_balls', 0),
        ball_usage.get('spin_balls', 0),
        ball_usage.get('burst_balls', 0),
        special_items.get('bullets', 0),
        special_items.get('shields', 0),
        wall_elements.get('pyramids', 0),
        wall_elements.get('escalators', 0),
        wall_elements.get('hourglasses', 0),
        wall_elements.get('lightnings', 0),
        wall_elements.get('maws', 0),
        wall_elements.get('rakes', 0),
        wall_elements.get('trenches', 0),
        wall_elements.get('kites', 0),
        wall_elements.get('bowties', 0),
        wall_elements.get('honeycombs', 0),
        wall_elements.get('snakes', 0),
        wall_elements.get('vipers', 0),
        wall_elements.get('waystones', 0),
        score,
        user_id
    )

    c.execute(update_query, values)

def main():
    if len(sys.argv) < 3:
        print("Usage: python3 script.py <users|friends> <number>")
        sys.exit(1)

    action = sys.argv[1]
    number = int(sys.argv[2])

    if action == "users":
        create_users(number)
    elif action == "friends":
        create_friends(number)
    elif action == "games":
        create_games(number)
    else:
        print(f"Unknown action: {action}")
        sys.exit(1)

if __name__ == "__main__":
    main()