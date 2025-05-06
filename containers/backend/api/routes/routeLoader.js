/*	This module loads all the API routes needed by the different functions.
	Future routes can be required directly here. */

module.exports = async function (fastify) {
	fastify.register(require('./auth/authRoutesIndex'));
	// Add future routes here
	fastify.register(require('./profile/getProfile'));
	fastify.register(require('./game/gameRoutes'));
};