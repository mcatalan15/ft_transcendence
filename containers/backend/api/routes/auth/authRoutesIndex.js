const { 
	signupSchema,
	signinSchema,
	logoutSchema,
 } = require('../../schemas/auth');
 
const { 
	signupHandler,
	signinHandler,
	logoutHandler,
 } = require('../../handlers/auth');

module.exports = async function (fastify, options) {
  // Register all auth routes
  fastify.post('/api/auth/signup', { schema: signupSchema }, signupHandler);
  fastify.post('/api/auth/signin', { schema: signinSchema }, signinHandler);
  fastify.post('/api/auth/logout', { schema: logoutSchema }, logoutHandler);
};