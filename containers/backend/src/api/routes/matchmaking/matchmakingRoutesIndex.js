const { verifyToken } = require('../../../config/middleware/auth');

const { findMatchmakingGameSchema,
  cancelMatchmakingSchema
} = require('../../schemas/matchmaking');

const { findMatchmakingGameHandler,
  cancelMatchmakingHandler
} = require('../../handlers/matchmaking');

async function matchmakingRoutesIndex(fastify, options) {
  
  // Matchmaking routes
  fastify.post('/api/matchmaking/find', { schema: findMatchmakingGameSchema, preHandler: verifyToken }, findMatchmakingGameHandler);
  fastify.post('/api/matchmaking/cancel', { schema: cancelMatchmakingSchema, preHandler: verifyToken }, cancelMatchmakingHandler);

}

module.exports = matchmakingRoutesIndex;