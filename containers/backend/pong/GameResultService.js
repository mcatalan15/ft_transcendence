const db = require('../src/api/db/database');

class GameResultsService {
    static async saveOnlineGameResults(gameData) {
        try {
            console.log('🔍 Attempting to save online game results...');
            
            return new Promise((resolve, reject) => {
                const { db: database } = require('../src/api/db/database');
                
                const query = `
                    INSERT INTO games (
                        player1_name, player2_name, player1_score, player2_score, winner_name,
                        player1_is_ai, player2_is_ai, game_mode, is_tournament,
                        default_balls_used, player1_hits, player1_goals_in_favor, player1_goals_against,
                        player2_hits, player2_goals_in_favor, player2_goals_against,
                        player1_result, player2_result, created_at, ended_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;
                
                const params = [
                    gameData.leftPlayer.name,
                    gameData.rightPlayer.name,
                    gameData.leftPlayer.score,
                    gameData.rightPlayer.score,
                    gameData.leftPlayer.result === 'win' ? gameData.leftPlayer.name : gameData.rightPlayer.name,
                    false, // player1_is_ai
                    false, // player2_is_ai
                    'online', // game_mode
                    false, // is_tournament
                    gameData.balls.defaultBalls,
                    gameData.leftPlayer.hits,
                    gameData.leftPlayer.goalsInFavor,
                    gameData.leftPlayer.goalsAgainst,
                    gameData.rightPlayer.hits,
                    gameData.rightPlayer.goalsInFavor,
                    gameData.rightPlayer.goalsAgainst,
                    // FIX: Convert 'loss' to 'lose' to match database constraint
                    gameData.leftPlayer.result === 'loss' ? 'lose' : gameData.leftPlayer.result,
                    gameData.rightPlayer.result === 'loss' ? 'lose' : gameData.rightPlayer.result,
                    gameData.createdAt,
                    gameData.endedAt
                ];
                
                console.log('📝 Saving detailed online game with params:', params);
                
                database.run(query, params, function (err) {
                    if (err) {
                        console.error('❌ Database insert error for online game:', err);
                        reject(err);
                    } else {
                        console.log('✅ Online game saved successfully with ID:', this.lastID);
                        resolve(this.lastID);
                    }
                });
            });
            
        } catch (error) {
            console.error('❌ Error in saveOnlineGameResults:', error);
            throw error;
        }
    }
}

module.exports = GameResultsService;