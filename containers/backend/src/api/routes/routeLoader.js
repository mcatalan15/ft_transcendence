/*	This module loads all the API routes needed by the different functions.
	Future routes can be required directly here. */

module.exports = async function (fastify) {
	fastify.register(require('./auth/authRoutesIndex'));
	fastify.register(require('./profile/profileRoutesIndex'));
	fastify.register(require('./games/gameRoutesIndex'));
	fastify.register(require('./friends/friendsRoutesIndex'));
	fastify.register(require('./matchmaking/matchmakingRoutesIndex'));
	
	// Add future routes here
};