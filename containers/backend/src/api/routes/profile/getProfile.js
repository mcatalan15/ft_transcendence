const { verifyToken } = require('../../../config/middleware/auth');
const { profileSchema } = require('../../schemas/profile');

module.exports = async function (fastify, options) {
	fastify.get('/api/profile', { 
		schema: profileSchema,
		preHandler: verifyToken,
	}, async (request, reply) => {

	try {
		
		const user = request.session.get('user');
		
		console.log('User:', user.username);

		//TODO: update so that each user sees their profile, not just the last user logged in
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
