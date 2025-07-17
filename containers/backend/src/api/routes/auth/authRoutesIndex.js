const { 
	signupSchema,
	signinSchema,
	logoutSchema,
	googleSchema,
	setupTwoFaSchema,
	verifyTwoFaSchema,
	refreshTokenSchema,
	get2FAStatusSchema
 } = require('../../schemas/auth');
 
const { 
	signupHandler,
	signinHandler,
	logoutHandler,
	googleHandler,
	setupTwoFa,
	verifyTwoFa,
	refreshTokenHandler,
	get2FAStatusHandler,
 } = require('../../handlers/auth');

module.exports = async function (fastify, options) {

  // Register all auth routes
  fastify.post('/api/auth/signup', { schema: signupSchema }, signupHandler);
  fastify.post('/api/auth/signin', { schema: signinSchema }, signinHandler);
  fastify.post('/api/auth/logout', { schema: logoutSchema }, logoutHandler);
  fastify.post('/api/auth/google', { schema: googleSchema }, googleHandler);
  fastify.post('/api/auth/setup', { schema: setupTwoFaSchema }, setupTwoFa);

  console.log('[Routes] About to register /api/auth/verify route...');
  fastify.post('/api/auth/verify', { schema: verifyTwoFaSchema }, verifyTwoFa);
  console.log('[Routes] Successfully registered /api/auth/verify route');

  fastify.get('/api/auth/status/:userId', { schema: get2FAStatusSchema }, get2FAStatusHandler);
  fastify.post('/api/auth/refresh', { schema: refreshTokenSchema }, refreshTokenHandler);

    console.log('[Routes] All auth routes registered');

  };