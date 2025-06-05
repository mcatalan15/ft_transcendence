/*	This module loads all the API routes needed by the different functions.
	Future routes can be required directly here. */

module.exports = async function (fastify) {
	fastify.register(require('./auth/authRoutesIndex'));
	fastify.register(require('./profile/profileRoutesIndex'));

	// Add future routes here
	fastify.register(require('./auth/twoFaRoutes'))
	fastify.register(require('./game/gameRoutes'));
	fastify.register(require('./game/lastestGame.js'))
	fastify.register(require('./blockchain/deployRoutes.js'))
};