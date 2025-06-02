const { verifyToken } = require('../../../config/middleware/auth');
const { profileSchema } = require('../../schemas/profile');

module.exports = async function (fastify, options) {
	fastify.get('/api/profile', { 
		schema: profileSchema,
		preHandler: verifyToken,
	}, async (request, reply) => {

	try {
		const user = request.session.get('user');
		
		return reply.status(200).send({
			id: user.id,
			username: user.username,
			email: user.email,
		});

	} catch (error) {
		console.error('Error fetching profile:', error);
		return reply.status(500).send({
		  success: false,
		  message: 'Internal server error'
		});		
	}
  });
}
