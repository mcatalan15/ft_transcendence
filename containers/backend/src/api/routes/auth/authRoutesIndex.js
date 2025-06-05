const { 
	signupSchema,
	signinSchema,
	logoutSchema,
	googleSchema,
	setupTwoFaSchema,
	verifyTwoFaSchema
 } = require('../../schemas/auth');
 
const { 
	signupHandler,
	signinHandler,
	logoutHandler,
	googleHandler,
	setupTwoFa,
	verifyTwoFa
 } = require('../../handlers/auth');

module.exports = async function (fastify, options) {
  // Register all auth routes
  fastify.post('/api/auth/signup', { schema: signupSchema }, signupHandler);
  fastify.post('/api/auth/signin', { schema: signinSchema }, signinHandler);
  fastify.post('/api/auth/logout', { schema: logoutSchema }, logoutHandler);
  fastify.post('/api/auth/google', { schema: googleSchema }, googleHandler);
  fastify.post('/api/auth/setup', { schema: setupTwoFaSchema }, setupTwoFa);
  fastify.post('/api/auth/verify', { schema: verifyTwoFaSchema }, verifyTwoFa);
};