const { signupSchema,
	signinSchema
 } = require('../../schemas/auth');
 
const { signupHandler,
	signinHandler
 } = require('../../handlers/auth');

module.exports = async function (fastify, options) {
  // Register all auth routes
  fastify.post('/api/auth/signup', { schema: signupSchema }, signupHandler);
  fastify.post('/api/auth/signin', { schema: signinSchema }, signinHandler);

};