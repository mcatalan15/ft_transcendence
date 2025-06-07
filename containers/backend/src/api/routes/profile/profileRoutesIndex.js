const { verifyToken } = require('../../../config/middleware/auth');

const { 
	profileSchema,
	uploadAvatarSchema,
	fetchUserAvatarSchema
 } = require('../../schemas/profile');

 const { 
	getUserProfile,
	avatarUploadHandler,
	fetchUserAvatar
 } = require('../../handlers/profile');

 module.exports = async function (fastify, options) {
	// Register all profile routes
	//! Order matters!
	fastify.get('/api/profile/:username', { schema: profileSchema, preHandler: verifyToken }, getUserProfile);
	fastify.get('/api/profile', { schema: profileSchema, preHandler: verifyToken }, getUserProfile);
	fastify.post('/api/profile/avatar', { schema: uploadAvatarSchema, preHandler: verifyToken }, avatarUploadHandler);
	fastify.get('/api/profile/avatar/:userId', { schema: fetchUserAvatarSchema, preHandler: verifyToken }, fetchUserAvatar)

  };