const { verifyToken } = require('../../../config/middleware/auth');

const { 
	getUserDataSchema,
	saveGameSchema,
	retrieveGamesSchema,
	retrieveLastGameSchema,
	deployContractSchema,
	getGamesHistorySchema,
	saveResultsSchema

 } = require('../../schemas/games');
 
const { 
	getUserDataHandler,
	saveGameHandler,
	retrieveGamesHandler,
	retrieveLastGameHandler,
	deployContractHandler,
	getGamesHistoryHandler,
	saveResultsHandler,

 } = require('../../handlers/games');

module.exports = async function (fastify, options) {
  // Register all games routes
  fastify.post('/api/games/getUserData', { schema: getUserDataSchema, preHandler: verifyToken }, getUserDataHandler);
  fastify.post('/api/games', { schema: saveGameSchema, preHandler: verifyToken }, saveGameHandler);
//   fastify.get('/api/games', { schema: retrieveGamesSchema, preHandler: verifyToken }, retrieveGamesHandler);
  fastify.get('/api/games/latest', { schema: retrieveLastGameSchema, preHandler: verifyToken }, retrieveLastGameHandler);
  fastify.post('/api/deploy', { schema: deployContractSchema, preHandler: verifyToken }, deployContractHandler);
  fastify.get('/api/games/history', { schema: getGamesHistorySchema, preHandler: verifyToken }, getGamesHistoryHandler);
  fastify.post('/api/games/results', { schema: saveResultsSchema, preHandler: verifyToken }, saveResultsHandler);

  // ! TEST DEBUG
	fastify.get('/api/test-token', async (request, reply) => {
		const jwt = require('jsonwebtoken');
		const token = jwt.sign(
			{ id: 'player1', username: 'testuser' }, 
			process.env.JWT_SECRET || 'your-secret-key',
			{ expiresIn: '1h' }
		);
		
		reply.send({ token });
	});
};
