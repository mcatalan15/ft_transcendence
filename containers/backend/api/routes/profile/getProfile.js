const { requireAuth } = require('../../../config/middleware/auth');
const { profileSchema } = require('../../schemas/profile');

module.exports = async function (fastify, options) {
	fastify.get('/api/profile', { 
		schema: profileSchema, 
		preHandler: requireAuth
	}, async (request, reply) => {
	const user = request.session.get('user');
	
	console.log('User:', user.username);

	if (!user) {
		error.log('Couldn\t fetch user\s profile');
		return reply.status(400).send({
			id: '',
			username: '',
			email: '',
		});
	} 

	return reply.status(200).send({
	  id: user.id,
	  username: user.username,
	  email: user.email,
	});
  });
}
