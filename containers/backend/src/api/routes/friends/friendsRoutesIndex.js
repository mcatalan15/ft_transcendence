const { verifyToken } = require('../../../config/middleware/auth');
const { addFriendHandler, removeFriendHandler, getFriendsHandler } = require('../../handlers/friends');
const { checkFriendship } = require('../../db/database');

module.exports = async function (fastify, options) {
    fastify.post('/api/friends/add', { preHandler: verifyToken }, addFriendHandler);
    fastify.delete('/api/friends/remove', { preHandler: verifyToken }, removeFriendHandler);
    fastify.get('/api/friends', { preHandler: verifyToken }, getFriendsHandler);
	fastify.get(`/api/friends/status/:username`, { preHandler: verifyToken }, checkFriendship);
};