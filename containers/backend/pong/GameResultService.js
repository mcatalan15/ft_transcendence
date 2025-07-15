const db = require('../src/api/db/database.js');
const {
	getUserByUsername,
} = require('./../src/api/db/database');

// class GameResultsService {
//     static async saveOnlineGameResults(gameData) {
//         try {
//             console.log('🔍 Attempting to save online game results...');
            
//             return new Promise((resolve, reject) => {
//                 const { db: database } = require('../src/api/db/database');
                
//                 const query = `
//                     INSERT INTO games (
//                         player1_name, player2_name, player1_score, player2_score, winner_name,
//                         player1_is_ai, player2_is_ai, game_mode, is_tournament,
//                         default_balls_used, player1_hits, player1_goals_in_favor, player1_goals_against,
//                         player2_hits, player2_goals_in_favor, player2_goals_against,
//                         player1_result, player2_result, created_at, ended_at
//                     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//                 `;
                
//                 const params = [
//                     gameData.leftPlayer.name,
//                     gameData.rightPlayer.name,
//                     gameData.leftPlayer.score,
//                     gameData.rightPlayer.score,
//                     gameData.leftPlayer.result === 'win' ? gameData.leftPlayer.name : gameData.rightPlayer.name,
//                     false, // player1_is_ai
//                     false, // player2_is_ai
//                     'online', // game_mode
//                     false, // is_tournament
//                     gameData.balls.defaultBalls,
//                     gameData.leftPlayer.hits,
//                     gameData.leftPlayer.goalsInFavor,
//                     gameData.leftPlayer.goalsAgainst,
//                     gameData.rightPlayer.hits,
//                     gameData.rightPlayer.goalsInFavor,
//                     gameData.rightPlayer.goalsAgainst,
//                     // FIX: Convert 'loss' to 'lose' to match database constraint
//                     gameData.leftPlayer.result === 'loss' ? 'lose' : gameData.leftPlayer.result,
//                     gameData.rightPlayer.result === 'loss' ? 'lose' : gameData.rightPlayer.result,
//                     gameData.createdAt,
//                     gameData.endedAt
//                 ];
                
//                 console.log('📝 Saving detailed online game with params:', params);
                
//                 database.run(query, params, function (err) {
//                     if (err) {
//                         console.error('❌ Database insert error for online game:', err);
//                         reject(err);
//                     } else {
//                         console.log('✅ Online game saved successfully with ID:', this.lastID);
//                         resolve(this.lastID);
//                     }
//                 });
//             });
            
//         } catch (error) {
//             console.error('❌ Error in saveOnlineGameResults:', error);
//             throw error;
//         }
//     }
// }

// class GameResultsService {
//     async saveOnlineGameResults(gameData) {
//         try {
//             console.log('🔍 Attempting to save online game results...');
//             console.log('Game Data:', JSON.stringify(gameData, null, 2));
//             // Import the getUserByUsername function
//             const { getUserByUsername } = require('../src/api/db/database');
            
//             // Get user IDs from usernames
//             const player1User = await getUserByUsername(gameData.leftPlayer.name);
// 			console.log('Player 1 User:', player1User);
//             const player2User = await getUserByUsername(gameData.rightPlayer.name);
// 			console.log('Player 2 User:', player2User);
            
//             // Check if users exist
//             if (!player1User) {
//                 throw new Error(`Player 1 with username '${gameData.leftPlayer.name}' not found`);
//             }
            
//             if (!player2User) {
//                 throw new Error(`Player 2 with username '${gameData.rightPlayer.name}' not found`);
//             }

//             const player1_id = player1User.id_user;
//             const player2_id = player2User.id_user;
            
//             // Determine winner ID and general result
//             let winner_id = 0;
//             let generalResult = 'draw';
            
//             if (gameData.leftPlayer.result === 'win') {
//                 winner_id = player1_id;
//                 generalResult = 'leftWin';
//             } else if (gameData.rightPlayer.result === 'win') {
//                 winner_id = player2_id;
//                 generalResult = 'rightWin';
//             }

//             // Create the game record object matching your API structure
//             const gameRecord = {
//                 player1_id: player1_id,
//                 player2_id: player2_id,
//                 winner_id: winner_id,
//                 player1_score: gameData.leftPlayer.score,
//                 player2_score: gameData.rightPlayer.score,
//                 game_mode: gameData.config.mode,
//                 is_tournament: false,
//                 smart_contract_link: '',
//                 contract_address: '',
//                 created_at: gameData.createdAt,
//                 ended_at: gameData.endedAt,
//                 config_json: JSON.stringify(gameData.config),
//                 general_result: generalResult,
//                 // Ball usage
//                 default_balls_used: gameData.balls?.defaultBalls || 0,
//                 curve_balls_used: gameData.balls?.curveBalls || 0,
//                 multiply_balls_used: gameData.balls?.multiplyBalls || 0,
//                 spin_balls_used: gameData.balls?.spinBalls || 0,
//                 burst_balls_used: gameData.balls?.burstBalls || 0,
//                 // Special items
//                 bullets_used: gameData.specialItems?.bullets || 0,
//                 shields_used: gameData.specialItems?.shields || 0,
//                 // Walls
//                 pyramids_used: gameData.walls?.pyramids || 0,
//                 escalators_used: gameData.walls?.escalators || 0,
//                 hourglasses_used: gameData.walls?.hourglasses || 0,
//                 lightnings_used: gameData.walls?.lightnings || 0,
//                 maws_used: gameData.walls?.maws || 0,
//                 rakes_used: gameData.walls?.rakes || 0,
//                 trenches_used: gameData.walls?.trenches || 0,
//                 kites_used: gameData.walls?.kites || 0,
//                 bowties_used: gameData.walls?.bowties || 0,
//                 honeycombs_used: gameData.walls?.honeycombs || 0,
//                 snakes_used: gameData.walls?.snakes || 0,
//                 vipers_used: gameData.walls?.vipers || 0,
//                 waystones_used: gameData.walls?.waystones || 0,
//                 // Player 1 stats
//                 player1_hits: gameData.leftPlayer.hits || 0,
//                 player1_goals_in_favor: gameData.leftPlayer.goalsInFavor || 0,
//                 player1_goals_against: gameData.leftPlayer.goalsAgainst || 0,
//                 player1_powerups_picked: gameData.leftPlayer.powerupsPicked || 0,
//                 player1_powerdowns_picked: gameData.leftPlayer.powerdownsPicked || 0,
//                 player1_ballchanges_picked: gameData.leftPlayer.ballchangesPicked || 0,
//                 player1_result: gameData.leftPlayer.result,
//                 // Player 2 stats
//                 player2_hits: gameData.rightPlayer.hits || 0,
//                 player2_goals_in_favor: gameData.rightPlayer.goalsInFavor || 0,
//                 player2_goals_against: gameData.rightPlayer.goalsAgainst || 0,
//                 player2_powerups_picked: gameData.rightPlayer.powerupsPicked || 0,
//                 player2_powerdowns_picked: gameData.rightPlayer.powerdownsPicked || 0,
//                 player2_ballchanges_picked: gameData.rightPlayer.ballchangesPicked || 0,
//                 player2_result: gameData.rightPlayer.result
//             };

//             // Use the same saveGameToDatabase function as your API
//             const { saveGameToDatabase } = require('../src/api/db/database');
//             const gameId = await saveGameToDatabase(gameRecord, gameData);
            
//             console.log('✅ Online game saved successfully with ID:', gameId);
//             return gameId;
            
//         } catch (error) {
//             console.error('❌ Error in saveOnlineGameResults:', error);
//             throw error;
//         }
//     }
// }

class GameResultsService {
    static async saveOnlineGameResults(gameData) {
        try {
            console.log('🔍 Attempting to save online game results...');
            
            // Import the database and getUserByUsername function
            const { db, getUserByUsername } = require('../src/api/db/database');
            
            // Get user IDs from usernames
            const player1User = await getUserByUsername(gameData.leftPlayer.name);
            const player2User = await getUserByUsername(gameData.rightPlayer.name);
            
            // Check if users exist
            if (!player1User) {
                throw new Error(`Player 1 with username '${gameData.leftPlayer.name}' not found`);
            }
            
            if (!player2User) {
                throw new Error(`Player 2 with username '${gameData.rightPlayer.name}' not found`);
            }

            const player1_id = player1User.id_user;
            const player2_id = player2User.id_user;
            
            // Determine winner ID and general result
            let winner_id = 0;
            let generalResult = 'draw';
            
            if (gameData.leftPlayer.result === 'win') {
                winner_id = player1_id;
                generalResult = 'leftWin';
            } else if (gameData.rightPlayer.result === 'win') {
                winner_id = player2_id;
                generalResult = 'rightWin';
            }

            // Create the database insert query
            const query = `
                INSERT INTO games (
                    player1_id, player2_id, winner_id, player1_score, player2_score, 
                    game_mode, is_tournament, smart_contract_link, contract_address, 
                    created_at, ended_at, config_json, general_result,
                    default_balls_used, curve_balls_used, multiply_balls_used, spin_balls_used, burst_balls_used,
                    bullets_used, shields_used,
                    pyramids_used, escalators_used, hourglasses_used, lightnings_used, maws_used, 
                    rakes_used, trenches_used, kites_used, bowties_used, honeycombs_used, 
                    snakes_used, vipers_used, waystones_used,
                    player1_hits, player1_goals_in_favor, player1_goals_against, 
                    player1_powerups_picked, player1_powerdowns_picked, player1_ballchanges_picked, player1_result,
                    player2_hits, player2_goals_in_favor, player2_goals_against, 
                    player2_powerups_picked, player2_powerdowns_picked, player2_ballchanges_picked, player2_result
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            const params = [
                player1_id,
                player2_id,
                winner_id,
                gameData.leftPlayer.score,
                gameData.rightPlayer.score,
                gameData.config.mode,
                false, // is_tournament
                '', // smart_contract_link
                '', // contract_address
                gameData.createdAt,
                gameData.endedAt,
                JSON.stringify(gameData.config),
                generalResult,
                // Ball usage
                gameData.balls?.defaultBalls || 0,
                gameData.balls?.curveBalls || 0,
                gameData.balls?.multiplyBalls || 0,
                gameData.balls?.spinBalls || 0,
                gameData.balls?.burstBalls || 0,
                // Special items
                gameData.specialItems?.bullets || 0,
                gameData.specialItems?.shields || 0,
                // Walls
                gameData.walls?.pyramids || 0,
                gameData.walls?.escalators || 0,
                gameData.walls?.hourglasses || 0,
                gameData.walls?.lightnings || 0,
                gameData.walls?.maws || 0,
                gameData.walls?.rakes || 0,
                gameData.walls?.trenches || 0,
                gameData.walls?.kites || 0,
                gameData.walls?.bowties || 0,
                gameData.walls?.honeycombs || 0,
                gameData.walls?.snakes || 0,
                gameData.walls?.vipers || 0,
                gameData.walls?.waystones || 0,
                // Player 1 stats
                gameData.leftPlayer.hits || 0,
                gameData.leftPlayer.goalsInFavor || 0,
                gameData.leftPlayer.goalsAgainst || 0,
                gameData.leftPlayer.powerupsPicked || 0,
                gameData.leftPlayer.powerdownsPicked || 0,
                gameData.leftPlayer.ballchangesPicked || 0,
                gameData.leftPlayer.result,
                // Player 2 stats
                gameData.rightPlayer.hits || 0,
                gameData.rightPlayer.goalsInFavor || 0,
                gameData.rightPlayer.goalsAgainst || 0,
                gameData.rightPlayer.powerupsPicked || 0,
                gameData.rightPlayer.powerdownsPicked || 0,
                gameData.rightPlayer.ballchangesPicked || 0,
                gameData.rightPlayer.result
            ];

            console.log('📝 Saving online game with params:', params);

            // Execute the database insert
            return new Promise((resolve, reject) => {
                // Make sure db is defined
                if (!db || typeof db.run !== 'function') {
                    reject(new Error('Database not properly initialized'));
                    return;
                }

                db.run(query, params, function(err) {
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

// Make sure to export the class
// module.exports = GameResultsService;

module.exports = GameResultsService;