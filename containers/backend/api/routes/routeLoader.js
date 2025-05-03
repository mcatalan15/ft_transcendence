/*	This module loads all the API routes needed by the different functions.
	Future routes can be required directly here. */

module.exports = async function (fastify) {
	fastify.register(require('./auth/localSignUp'));
	fastify.register(require('./auth/googleSignUp'));
	fastify.register(require('./auth/localSignIn'));
	// Add future routes here
	fastify.register(require('./profile/displayProfile'));
  };