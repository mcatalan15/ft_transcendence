// routes/game.js
const { saveGameToDatabase } = require('../../db/database');
const gameSchema = require('../../schemas/game');

async function gameRoutes(fastify, options) {
    fastify.post('/api/games', { schema: gameSchema }, async (request, reply) => {
        const { player1_name, player1_score,player2_name, player2_score, winner_name } = request.body;

        try {
            const gameId = await saveGameToDatabase(player1_name, player1_score,player2_name, player2_score, winner_name);
            
            reply.status(201).send({
                success: true,
                message: 'Game saved successfully',
                gameId
            });
        } catch (error) {
            fastify.log.error('Error saving game:', error);
            
            if (error.message.includes('SQLITE_CONSTRAINT')) {
                reply.status(400).send({
                    success: false,
                    message: 'Database constraint error'
                });
            } else {
                reply.status(500).send({
                    success: false,
                    message: 'Failed to save game'
                });
            }
        }
    });

    // Optional: Add a GET endpoint to retrieve games
    fastify.get('/api/games', async (request, reply) => {
        try {
            const games = await fastify.db.all('SELECT * FROM games ORDER BY id_game DESC');
            reply.send({
                success: true,
                games
            });
        } catch (error) {
            fastify.log.error('Error fetching games:', error);
            reply.status(500).send({
                success: false,
                message: 'Failed to fetch games'
            });
        }
    });
}

module.exports = gameRoutes;