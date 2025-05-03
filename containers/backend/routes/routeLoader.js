/*	This module loads all the API routes needed by the different functions.
	Future routes can be required directly here. */

module.exports = async function (fastify) {
	fastify.register(require('./localSignUp'));
	fastify.register(require('./googleSignUp'));
	fastify.register(require('./localSignIn'));
	// Add future routes here

  };