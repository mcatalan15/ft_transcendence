const path = require('path');
const fs = require('fs');
const { updateUserAvatar, getUserById } = require('../db/database');

async function getUserProfile (request, reply) {
	try {
		const user = request.session.get('user');

		return reply.status(200).send({
			userId: user.userId,
			username: user.username,
			email: user.email,
		});

	} catch (error) {
		console.error('Error fetching profile:', error);
		return reply.status(500).send({
		  success: false,
		  message: 'Internal server error'
		});		
	}
  };

async function avatarUploadHandler(request, reply) {
	try {
		const data = await request.file();

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
		
		const userId = user.userId || user.id;

		if (!userId) {
			return reply.status(401).send({
			  success: false,
			  message: 'Invalid user session data'
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
		const filename = `user_${userId}_avatar${ext}`;
		const filepath = path.join('/usr/src/app/public/avatars/uploads', filename);

		const buffer = await data.toBuffer();
		fs.writeFileSync(filepath, buffer);
		
		await updateUserAvatar(userId, filename, 'uploaded');

		reply.status(201).send({
			success: true,
			message: 'Avatar updated successfully',
			avatarUrl: `/api/profile/avatar/${userId}`
		});
	} catch (error) {
		console.error('Avatar upload error:', error);
		reply.status(500).send({
			success: false,
			message: 'Failed to upload avatar',
			error: error.message
		});
	}
}

async function fetchUserAvatar(request, reply) {
    const defaultPath = path.join('/usr/src/app/public/avatars/defaults/default_1.png');

	try {
		const sessionUser = request.session.get('user');
		const user = await getUserById(sessionUser.userId);
		
		if (!user) {
			const defaultPath = path.join(__dirname, '../../../public/avatars/defaults/default_1.png');
		
			if (fs.existsSync(defaultPath)) {
				return reply.type('image/png').send(fs.createReadStream(defaultPath));
			} else {
				return reply.status(404).send({
					message: 'Default avatar not found',
					path: defaultPath
				});
			}
		}
		
		if (!user.avatar_filename) {
			// Serve default fallback
			return reply.type('image/png').send(fs.createReadStream(defaultPath));
		}

		const avatarPath = user.avatar_type === 'default' 
			? path.join('/usr/src/app/public/avatars/defaults', user.avatar_filename)
			: path.join('/usr/src/app/public/avatars/uploads', user.avatar_filename);
		
		if (fs.existsSync(avatarPath)) {
			return reply.type('image/*').send(fs.createReadStream(avatarPath));
		} else {
			return reply.status(404).send({ message: 'Avatar file not found', path: avatarPath });
		}
		
	} catch (error) {
		return reply.status(500).send({ message: 'Server error', error: error.message });
	}
}


module.exports = {
	getUserProfile,
	avatarUploadHandler,
	fetchUserAvatar
}
