const { verifyToken } = require('../../../config/middleware/auth');

const { 
	profileSchema,
	uploadAvatarSchema,
	fetchUserAvatarSchema,
	getUserOnlineStatusSchema,
	updateNicknameSchema,
	updatePasswordSchema
 } = require('../../schemas/profile');

 const { 
	getUserProfile,
	avatarUploadHandler,
	fetchUserAvatar,
	getUserOnlineStatus,
	updateNicknameHandler,
	changePasswordHandler
 } = require('../../handlers/profile');

 module.exports = async function (fastify, options) {
	// Register all profile routes
	//! Order matters!
	fastify.get('/api/profile/:username', { schema: profileSchema, preHandler: verifyToken }, getUserProfile);
	fastify.get('/api/profile', { schema: profileSchema, preHandler: verifyToken }, getUserProfile);
	fastify.post('/api/profile/avatar', { schema: uploadAvatarSchema, preHandler: verifyToken }, avatarUploadHandler);
	fastify.get('/api/profile/avatar/:userId', { schema: fetchUserAvatarSchema, preHandler: verifyToken }, fetchUserAvatar)
	fastify.get('/api/profile/status/:userId', { schema: getUserOnlineStatusSchema,	preHandler: verifyToken }, getUserOnlineStatus);
	fastify.put('/api/profile/nickname', { schema: updateNicknameSchema, preHandler: verifyToken }, updateNicknameHandler);
	fastify.put('/api/profile/password', { schema: updatePasswordSchema, preHandler: verifyToken }, changePasswordHandler);

};