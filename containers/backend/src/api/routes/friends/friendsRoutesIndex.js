const { verifyToken } = require('../../../config/middleware/auth');

const { 
    addFriendSchema,
    removeFriendSchema,
    getFriendsSchema,
    checkFriendshipSchema
} = require('../../schemas/friends');

const { addFriendHandler,
	removeFriendHandler,
	getFriendsHandler,
	checkFriendshipHandler
} = require('../../handlers/friends');

module.exports = async function (fastify, options) {
    fastify.post('/api/friends/add', { preHandler: verifyToken, schema: addFriendSchema }, addFriendHandler);
    fastify.delete('/api/friends/remove', { preHandler: verifyToken, schema: removeFriendSchema }, removeFriendHandler);
    fastify.get('/api/friends', { preHandler: verifyToken, schema: getFriendsSchema }, getFriendsHandler);
	fastify.get(`/api/friends/status/:username`, { preHandler: verifyToken, schema: checkFriendshipSchema }, checkFriendshipHandler);
};