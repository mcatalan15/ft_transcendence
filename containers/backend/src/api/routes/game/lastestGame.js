// backend/routes/game/latestGame.js
const { getLatestGame } = require('../../db/database');

async function latestGameRoutes(fastify) {
    fastify.get('/api/games/latest', async (request, reply) => {
        try {
            const latestGame = await getLatestGame();
            
            if (!latestGame) {
                return reply.status(404).send({
                    success: false,
                    message: 'No games found'
                });
            }

            reply.send({
                success: true,
                game: latestGame
            });
        } catch (error) {
            fastify.log.error('Error fetching latest game:', error);
            reply.status(500).send({
                success: false,
                message: 'Failed to fetch latest game'
            });
        }
    });
}

module.exports = latestGameRoutes;