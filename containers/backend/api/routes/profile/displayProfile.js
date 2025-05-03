const { requireAuth } = require('../../../config/middleware/requireAuth');

module.exports = async function (fastify, options) {
	fastify.get('/api/profile', { preHandler: requireAuth }, async (request, reply) => {
	const user = request.session.get('user');
	
		console.log('User:', user.username);

	return {
	  id: user.id,
	  username: user.username,
	};
  });
}
