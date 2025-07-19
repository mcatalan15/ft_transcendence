const path = require('path');
const fs = require('fs');
const { updateUserAvatar,
	getUserById,
	getUserByUsername,
	checkFriendship,
	updateNickname,
	getHashedPassword,
	changePassword,
	getUserProfileStats
} = require('../db/database');


const onlineTracker = require('../../utils/onlineTracker');
const bcrypt = require('bcrypt');

async function getUserProfile(request, reply) {
    try {
        const sessionUser = request.session.get('user');
        const requestedUsername = request.params.username;

        let targetUser;
        let userStats;
        let isOwnProfile = false;
        let isFriend = false;

        if (requestedUsername) {
            targetUser = await getUserByUsername(requestedUsername);

            if (!targetUser) {
                return reply.status(404).send({
                    success: false,
                    message: 'User not found'
                });
            }

            // Check if they are friends (only if viewing someone else's profile)
            if (targetUser.id_user !== sessionUser.userId) {
                isFriend = await checkFriendship(sessionUser.userId, targetUser.id_user);
            }
        } else {
            targetUser = {
                id_user: sessionUser.userId,
                username: sessionUser.username,
                email: sessionUser.email
            };
        }

        // Fetch user stats
        userStats = await getUserProfileStats(targetUser.id_user);

        isOwnProfile = !requestedUsername || requestedUsername === sessionUser.username;

        return reply.status(200).send({
            userId: targetUser.id_user,
            username: targetUser.username,
            email: targetUser.email,
            isOwnProfile: isOwnProfile,
            isFriend: isFriend,
            stats: {
                totalGames: userStats.total_games,
                wins: userStats.wins,
                losses: userStats.losses,
                totalTournaments: userStats.total_tournaments
            }
        });

    } catch (error) {
        console.error('Error fetching profile:', error);
        return reply.status(500).send({
            success: false,
            message: 'Internal server error'
        });
    }
}

// async function getUserProfile(request, reply) {
//     try {
//         const sessionUser = request.session.get('user');
//         const requestedUsername = request.params.username;

//         let targetUser;
//         let isOwnProfile = false;
//         let isFriend = false;

//         if (requestedUsername) {
//             targetUser = await getUserByUsername(requestedUsername);

//             if (!targetUser) {
//                 return reply.status(404).send({
//                     success: false,
//                     message: 'User not found'
//                 });
//             }

//             // Check if they are friends (only if viewing someone else's profile)
//             if (targetUser.id_user !== sessionUser.userId) {
//                 isFriend = await checkFriendship(sessionUser.userId, targetUser.id_user);
//             }
//         } else {
//             targetUser = {
//                 id_user: sessionUser.userId,
//                 username: sessionUser.username,
//                 email: sessionUser.email,
// 				isOwnProfile: isOwnProfile,
//             	isFriend: isFriend
//             };
//         }

//         isOwnProfile = !requestedUsername || requestedUsername === sessionUser.username;

//         return reply.status(200).send({
//             userId: targetUser.id_user,
//             username: targetUser.username,
//             email: targetUser.email,
//             isOwnProfile: isOwnProfile,
//             isFriend: isFriend
//         });

//     } catch (error) {
//         console.error('Error fetching profile:', error);
//         return reply.status(500).send({
//             success: false,
//             message: 'Internal server error'
//         });
//     }
// }

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

		const allowedTypes = ['image/jpeg', 'image/png'];
		if (!allowedTypes.includes(data.mimetype)) {
			return reply.status(400).send({
				success: false,
				message: 'Only JPEG and PNG files are allowed'
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
    const defaultPath = path.join('/usr/src/app/public/avatars/square/square1.png');

    try {
        // Get the requested userId from URL params, not from session!
        const requestedUserId = request.params.userId;
        
        if (!requestedUserId) {
            return reply.status(400).send({
                message: 'User ID is required'
            });
        }
        
        const user = await getUserById(requestedUserId); // Use requested user ID
        
        if (!user) {
            // Return default avatar if user not found
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
            ? path.join('/usr/src/app/public/avatars/square', user.avatar_filename)
            : path.join('/usr/src/app/public/avatars/uploads', user.avatar_filename);
        
        if (fs.existsSync(avatarPath)) {
            return reply.type('image/*').send(fs.createReadStream(avatarPath));
        } else {
            return reply.type('image/png').send(fs.createReadStream(defaultPath));
        }
        
    } catch (error) {
        console.error('Error fetching avatar:', error);
        return reply.status(500).send({ message: 'Server error', error: error.message });
    }
}

async function getUserOnlineStatus(request, reply) {
    try {
        const requestedUserId = request.params.userId;
        
        if (!requestedUserId) {
            return reply.status(400).send({
                success: false,
                message: 'User ID is required'
            });
        }

        const user = await getUserById(requestedUserId);
        if (!user) {
            return reply.status(404).send({
                success: false,
                message: 'User not found'
            });
        }

        const isOnline = onlineTracker.isUserOnline(requestedUserId);
        const lastActivity = onlineTracker.getUserLastActivity(requestedUserId);
        
        console.log(`User ${requestedUserId} online status: ${isOnline}`);
        console.log(`Last activity: ${lastActivity ? new Date(lastActivity).toISOString() : 'Never'}`);
        
        return reply.status(200).send({
            success: true,
            userId: requestedUserId,
            isOnline: isOnline,
            lastSeen: lastActivity ? new Date(lastActivity).toISOString() : null
        });
        
    } catch (error) {
        console.error('Error checking online status:', error);
        return reply.status(500).send({
            success: false,
            message: 'Server error'
        });
    }
}

async function updateNicknameHandler(request, reply) {
	try {
		const sessionUser = request.session.get('user');
		const newNickname = request.body.nickname;

		console.log('Session user:', sessionUser);

		if (!sessionUser) {
			return reply.status(401).send({
				success: false,
				message: 'User not authenticated'
			});
		}

		if (!newNickname || newNickname.length < 3 || newNickname.length > 8 || 
			!/^(?=[a-zA-Z0-9-]{3,8}$)(?!-)(?!.*-.*-)[a-zA-Z0-9-]+$/.test(newNickname)) {
			return reply.status(400).send({
				success: false,
				message: 'Nickname must be between 3 and 8 characters and can only contain letters, numbers, and a single hyphen.'
			});
		}

		const existingUser = await getUserByUsername(newNickname);
		if (existingUser && existingUser.id_user !== sessionUser.userId) {
			return reply.status(400).send({
				success: false,
				message: 'Nickname already exists'
			});
		}

		const updatedUser = await updateNickname(sessionUser.userId, newNickname);
		
		if (!updatedUser) {
			return reply.status(500).send({
				success: false,
				message: 'Failed to update nickname'
			});
		}

		return reply.status(200).send({
			success: true,
			message: 'Nickname updated successfully',
			newNickname: updatedUser.nickname
		});

	} catch (error) {
		console.error('Error updating nickname:', error);
		return reply.status(500).send({
			success: false,
			message: 'Failed to update nickname',
			error: error.message
		});
	}
}

async function changePasswordHandler(request, reply) {
	try {
		const sessionUser = request.session.get('user');
		const { oldPassword, newPassword } = request.body;

		if (!sessionUser) {
			return reply.status(401).send({
				success: false,
				message: 'User not authenticated'
			});
		}

		if (!oldPassword || !newPassword || newPassword.length < 6) {
			return reply.status(400).send({
				success: false,
				message: 'Invalid password data'
			});
		}

		const user = await getUserById(sessionUser.userId);
		if (!user) {
			return reply.status(404).send({
				success: false,
				message: 'User not found'
			});
		}

		const currentHashedPassword = await getHashedPassword(user.email);
		const isOldPasswordValid = await bcrypt.compare(oldPassword, currentHashedPassword);

		if (!isOldPasswordValid) {
			return reply.status(400).send({
				success: false,
				message: 'Old password is incorrect'
			});
		}

		const hashedNewPassword = await bcrypt.hash(newPassword, 12);
		const updatedUser = await changePassword(user.id, hashedNewPassword);
		
		if (!updatedUser) {
			return reply.status(500).send({
				success: false,
				message: 'Failed to change password'
			});
		}

		return reply.status(200).send({
			success: true,
			message: 'Password changed successfully'
		});

	} catch (error) {
		console.error('Error changing password:', error);
		return reply.status(500).send({
			success: false,
			message: 'Failed to change password',
			error: error.message
		});
	}
}

module.exports = {
	getUserProfile,
	avatarUploadHandler,
	fetchUserAvatar,
	getUserOnlineStatus,
	updateNicknameHandler,
	changePasswordHandler,
}
