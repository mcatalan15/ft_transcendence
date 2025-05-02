/*	This module loads all the API routes needed by the different functions.
	Future routes can be required directly here. */

module.exports = async function (fastify) {
	fastify.register(require('./localAuthentication'));
	fastify.register(require('./googleAuthentication'));
	// Add future routes here

  };