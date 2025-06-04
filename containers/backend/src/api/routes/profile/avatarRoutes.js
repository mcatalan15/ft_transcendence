const path = require('path');
const fs = require('fs');
const { updateUserAvatar, getUserById } = require('../../db/database');
const { verifyToken } = require('../../../config/middleware/auth');

module.exports = async function (fastify, options) {
	fastify.post('/api/profile/avatar', {
		preHandler: verifyToken
	}, async (request, reply) => {
		try {
			console.log('Avatar upload started');
			console.log('Content-Type:', request.headers['content-type']);
			
			// Get the uploaded file
			const data = await request.file();
			
			console.log('File data received:', data ? 'yes' : 'no');
			if (data) {
				console.log('File details:', {
					filename: data.filename,
					mimetype: data.mimetype,
					encoding: data.encoding
				});
			}
	
			if (!data) {
				return reply.status(400).send({
					success: false,
					message: 'No file uploaded'
				});
			}
	
			const user = request.session.get('user');
	
			if (!user) {
				return reply.status(401).send({
					success: false,
					message: 'User not authenticated'
				});
			}
			
			const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
			if (!allowedTypes.includes(data.mimetype)) {
				return reply.status(400).send({
					success: false,
					message: 'Only JPEG, PNG, and GIF files are allowed'
				});
			}
			
			const ext = path.extname(data.filename);
			const filename = `user_${user.id}_avatar${ext}`;
			const filepath = path.join('/usr/src/app/public/avatars/uploads', filename);
			
			console.log('Saving file to:', filepath);
			
			// Save the file
			const buffer = await data.toBuffer();
			fs.writeFileSync(filepath, buffer);
			
			console.log('File saved successfully');
			
			// Update database
			await updateUserAvatar(user.id, filename, 'uploaded');
			
			console.log('Database updated successfully');
			
			reply.send({
				success: true,
				message: 'Avatar updated successfully',
				avatarUrl: `/api/profile/avatar/${user.id}`
			});
		} catch (error) {
			console.error('Avatar upload error:', error);
			reply.status(500).send({
				success: false,
				message: 'Failed to upload avatar',
				error: error.message
			});
		}
	});
    
	fastify.get('/api/profile/avatar/:userId', async (request, reply) => {
		try {
			const { userId } = request.params;
			console.log('1. Avatar request for userId:', userId, 'type:', typeof userId);
			
			// Test if getUserById function exists
			console.log('2. getUserById function exists:', typeof getUserById);
			
			let user;
			try {
				user = await getUserById(userId);
				console.log('3. getUserById result:', user);
			} catch (dbError) {
				console.error('4. Database error:', dbError);
				return reply.status(500).send({ message: 'Database error', error: dbError.message });
			}
			
			if (!user) {
				console.log('5. No user found, serving default');
				const defaultPath = path.join(__dirname, '../../../public/avatars/defaults/default_1.png');
				console.log('6. Default path:', defaultPath);
				console.log('7. Default file exists:', fs.existsSync(defaultPath));
				
				if (fs.existsSync(defaultPath)) {
					return reply.type('image/png').send(fs.createReadStream(defaultPath));
				} else {
					return reply.status(404).send({ message: 'Default avatar not found', path: defaultPath });
				}
			}
			
			if (!user.avatar_filename) {
				console.log('8. User found but no avatar_filename');
				// Serve default fallback
				const defaultPath = path.join('/usr/src/app/public/avatars/defaults/default_1.png');
				return reply.type('image/png').send(fs.createReadStream(defaultPath));
			}
			
			console.log('9. User has avatar_filename:', user.avatar_filename, 'type:', user.avatar_type);
			
			const avatarPath = user.avatar_type === 'default' 
				? path.join('/usr/src/app/public/avatars/defaults', user.avatar_filename)
				: path.join('/usr/src/app/public/avatars/uploads', user.avatar_filename);
			
			console.log('10. Final avatar path:', avatarPath);
			console.log('11. File exists check:', fs.existsSync(avatarPath));
			
			if (fs.existsSync(avatarPath)) {
				console.log('12. File found, sending stream');
				return reply.type('image/*').send(fs.createReadStream(avatarPath));
			} else {
				console.log('13. File not found');
				return reply.status(404).send({ message: 'Avatar file not found', path: avatarPath });
			}
			
		} catch (error) {
			console.error('14. Catch block error:', error);
			return reply.status(500).send({ message: 'Server error', error: error.message });
		}
	});
};