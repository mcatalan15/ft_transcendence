const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const otplib = require('otplib');
otplib.authenticator.options = {
	step: 30,
	digits: 6
};

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const onlineTracker = require('../../utils/onlineTracker');

const qrcode = require('qrcode');

const { saveUserToDatabase, 
	checkUserExists,
	getHashedPassword,
	getUserByEmail,
	saveTwoFactorSecret,
	getTwoFactorSecret,
	enableTwoFactor,
	getUserById,
	saveRefreshTokenInDatabase,
	getRefreshTokenFromDatabase,
	deleteRefreshTokenFromDatabase
} = require('../db/database');
const { get } = require('http');


async function signupHandler(request, reply) {
	const { username, email, password } = request.body;

	if (!username || !email || !password) {
		return reply.status(400).send({ success: false, message: 'All fields are required' });
	}

	try {
		const userExists = await checkUserExists(username, email);
		if (userExists?.exists) {
			if (userExists.usernameExists && userExists.emailExists) {
				return reply.status(400).send({
					success: false,
					message: 'Username and email are already taken'
				});
			} else if (userExists.usernameExists) {
				return reply.status(400).send({
					success: false,
					message: 'Username is already taken'
				});
			} else if (userExists.emailExists) {
				return reply.status(400).send({
					success: false,
					message: 'Email is already taken'
				});
			}
		}

		const hashedPassword = await bcrypt.hash(password, 12);
		const defaultAvatarId = Math.floor(Math.random() * 4) + 1;
		const avatarFilename = `square${defaultAvatarId}.png`;

		const newUserId = await saveUserToDatabase(username, email, hashedPassword, 'local', avatarFilename);

		return reply.status(201).send({
			success: true,
			message: 'User registered successfully',
			userId: newUserId,
			username: username,
			email: email,
			twoFAEnabled: 0
		});
	} catch (error) {
		console.error('Registration error:', error);
		return reply.status(500).send({
			success: false,
			message: 'Internal server error'
		});
	}
};

async function signinHandler(request, reply) {
    const { email, password } = request.body;

    if (!email || !password) {
        return reply.status(400).send({ 
            success: false,
            message: 'Email and password are required' 
        });
    }

    try {
        const user = await getUserByEmail(email);
        if (!user) {
            return reply.status(401).send({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return reply.status(401).send({
                success: false,
                message: 'Invalid email or password'
            });
        }

        return reply.status(200).send({
            success: true,
            message: 'Authentication successful',
            userId: user.id_user,
            username: user.username,
            email: user.email,
            twoFAEnabled: user.twoFactorEnabled
        });

    } catch (error) {
        console.error('Login error:', error);
        return reply.status(500).send({
            success: false,
            message: 'Internal server error'
        });
    }
};

async function logoutHandler(request, reply) {
	try {

        const user = request.session.get('user');
        if (user) {
            if (user.userId) {
                onlineTracker.removeUser(user.userId);
            }
            
			await deleteRefreshTokenFromDatabase(user.userId);

            request.session.destroy();
            return reply.status(200).send({
                success: true,
                message: 'User session destroyed'
            });
        }

		return reply.status(400).send({
			success: false,
			message: 'No user session found'
		});

	} catch (error) {
		console.error(error);
		return reply.status(500).send({
		  success: false,
		  message: 'Internal server error'
		});
	}
};

async function googleHandler(request, reply, fastify) {
	const { credential } = request.body;
	if (!credential) {
		return reply.status(400).send({ success: false, message: 'Missing credential' });
	}

	try {
		const ticket = await client.verifyIdToken({
			idToken: credential,
			audience: process.env.GOOGLE_CLIENT_ID,
		});

		const payload = ticket.getPayload();
		const name = payload.name;
		const email = payload.email;

		let user = await getUserByEmail(email);

		if (user) {
			const twoFAEnabled = user.twoFactorEnabled;

			return reply.status(200).send({
				success: true,
				message: 'Google authentication successful',
				userId: user.id_user,
				username: user.username,
				email: user.email,
				twoFAEnabled: twoFAEnabled,
				isNewUser: false
			});
		} else {

			const parts = name.toLowerCase().split(' ');
			const firstInitial = parts[0].charAt(0);
			const lastName = parts[parts.length - 1];
			let nickname = `${firstInitial}${lastName}`;
			const defaultAvatarId = Math.floor(Math.random() * 4) + 1;
			const avatarFilename = `default_${defaultAvatarId}.png`;

			try {
				await saveUserToDatabase(nickname, email, null, 'google', avatarFilename);
			} catch (error) {
				if (error.message.includes('Username or email already exists')) {
					nickname = nickname + "-";
					await saveUserToDatabase(nickname, email, null, 'google', avatarFilename);
				} else {
					throw error;
				}
			}

			const newUser = await getUserByEmail(email);
			if (!newUser) {
				throw new Error('Failed to retrieve newly created user');
			}

			const twoFAEnabled = newUser.twoFactorEnabled;

			return reply.status(201).send({
				success: true,
				message: 'User registered successfully',
				userId: newUser.id_user,
				username: newUser.username,
				email: newUser.email,
				twoFAEnabled: twoFAEnabled,
				isNewUser: true
			});
		}
	} catch (error) {
		return reply.status(401).send({
			success: false,
			message: 'Invalid Token',
		});
	}
};


async function generateTwoFaSetup(username, userId, email) {

	const secret = otplib.authenticator.generateSecret();

	await saveTwoFactorSecret(userId, secret);

	const accountLabel = `${username}@${email}`;

	const appName = 'ft_transcendence';
	const otpAuthUrl = otplib.authenticator.keyuri(accountLabel, appName, secret);

	const qrCodeUrl = await qrcode.toDataURL(otpAuthUrl);

	return {
		secret,
		qrCodeUrl,
		otpAuthUrl
	};
};

async function verifyTwoFaToken(userId, token) {
	const secret = await getTwoFactorSecret(userId);

	if (!secret) {
		console.warn(`[2FA Verify] No 2FA secret found for user ${userId}.`);
		return false;
	}

	const isValid = otplib.authenticator.verify({ token, secret });

	if (isValid) {
		await enableTwoFactor(userId, secret);
	} else {
	}

	return isValid;
};

async function setupTwoFa(request, reply) {
	const { username, userId, email } = request.body;

	if (!username || typeof userId !== 'number') {
		reply.code(400).send({
			message: 'Invalid user data provided for 2FA setup.'
		});
		return;
	}

	try {
		const { secret, qrCodeUrl, otpAuthUrl } = await generateTwoFaSetup(username, userId, email);
		reply.code(200).send({ secret, qrCodeUrl, otpAuthUrl });
	} catch (error) {
		console.error('Error generating 2FA setup for user:', username, error);
		reply.code(500).send({
			message: 'Failed to generate 2FA setup.'
		});
	}
};

async function verifyTwoFa(request, reply) {
	const { userId, token } = request.body;

	if (typeof userId !== 'number' || !token) {
		reply.code(400).send({
			message: 'Invalid verification data provided.'
		});
		return;
	}

	try {
		const verified = await verifyTwoFaToken(userId, token);
		if (verified) {
			const user = await getUserById(userId);

			if (!user) {
				reply.code(404).send({ message: 'User not found.' });
				return;
			}

			const authToken = jwt.sign({
				id: user.id_user,
				username: user.username,
				email: user.email,
				twoFAEnabled: true,
				twoFAVerified: true
			}, process.env.JWT_SECRET, {
				expiresIn: process.env.JWT_EXPIRES_IN
			});

			const refreshToken = jwt.sign(
				{ id: user.id_user },
				process.env.JWT_REFRESH_SECRET,
				{ expiresIn: '7d' }
			);

			await saveRefreshTokenInDatabase(user.id_user, refreshToken);

			reply.setCookie('refreshToken', refreshToken, {
				httpOnly: true,
				secure: false,
				sameSite: 'strict',
				path: '/',
				maxAge: 7 * 24 * 60 * 60
			});
			request.session.set('token', authToken);
			request.session.set('user', {
				userId: user.id_user,
				username: user.username,
				email: user.email,
				twoFAEnabled: true,
				twoFAVerified: true
			});

			reply.code(200).send({
				message: '2FA token verified successfully!',
				verified: true,
				token: authToken,
				userId: user.id_user,
				username: user.username,
				email: user.email,
				twoFAEnabled: true
			});
		} else {
			reply.code(400).send({
				message: 'Invalid 2FA token.'
			});
		}
	} catch (error) {
		console.error('Error verifying 2FA token for user:', userId, error);
		reply.code(500).send({
			message: 'Failed to verify 2FA token.'
		});
	}
};

async function refreshTokenHandler(request, reply) {
	const { refreshToken } = request.cookies;
	if (!refreshToken) {
		return reply.status(401).send({ success: false, message: 'No refresh token' });
	}
	try {
		const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
		const valid = await isRefreshTokenValid(payload.id, refreshToken);
		if (!valid) {
			return reply.status(401).send({ success: false, message: 'Invalid refresh token' });
		}
		const newAccessToken = jwt.sign(
			{ id: payload.id },
			process.env.JWT_SECRET,
			{ expiresIn: process.env.JWT_EXPIRES_IN }
		);
		reply.send({
			success: true,
			message: 'Token renewed successfully',
			newToken: newAccessToken
		});
	} catch (err) {
		console.error('Refresh token error:', err);
		return reply.status(401).send({ success: false, message: 'Invalid refresh token' });
	}
}

async function isRefreshTokenValid(userId, refreshToken) {
	if (!userId) {
		console.error('userId is undefined in isRefreshTokenValid');
		return false;
	}
	const storedToken = await getRefreshTokenFromDatabase(userId);
	return storedToken === refreshToken;
}

async function get2FAStatusHandler(request, reply) {
	try {
		const { userId } = request.params;
		const user = await getUserById(userId);
		if (!user) {
			throw new Error(`User with ID ${userId} not found`);
		}
		return {
			twoFAEnabled: user.twoFactorEnabled === 1, 
			twoFASecret: user.twoFactorSecret || null,
		};
	} catch (error) {
		console.error(`Error fetching 2FA status for user ${userId}:`, error);
		throw new Error('Failed to fetch 2FA status');
	}
}

module.exports = {
	signupHandler,
	signinHandler,
	logoutHandler,
	googleHandler,
	setupTwoFa,
	verifyTwoFa,
	refreshTokenHandler,
	get2FAStatusHandler,
};