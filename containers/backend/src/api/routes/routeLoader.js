/*	This module loads all the API routes needed by the different functions.
	Future routes can be required directly here. */

module.exports = async function (fastify) {
	fastify.register(require('./auth/authRoutesIndex'));
	fastify.register(require('./profile/profileRoutesIndex'));
	fastify.register(require('./games/gameRoutesIndex'));

	// Add future routes here
};