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
		
		// Create JWT token for new user (2FA is disabled by default for new users)
		const twoFAEnabled = 0;
		const authToken = jwt.sign({
			id: newUserId,
			twoFAEnabled: twoFAEnabled,
		}, process.env.JWT_SECRET, {
			expiresIn: process.env.JWT_EXPIRES_IN,
		});

		// Set session data
		request.session.set('token', authToken);
		request.session.set('user', {
			userId: newUserId,
			username: username,
			email: email,
			twoFAEnabled: twoFAEnabled,
		});

		console.log('[BACKEND - signupHandler] User registered and authenticated:', {
			userId: newUserId,
			username: username,
			email: email,
			twoFAEnabled: twoFAEnabled
		});

		return reply.status(201).send({
			success: true,
			message: 'User registered successfully',
			token: authToken,
			userId: newUserId,
			username: username,
			email: email,
			twoFAEnabled: twoFAEnabled
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
	const { email, password, twoFACode } = request.body;

	if (!email || !password) {
		return reply.status(400).send({ 
			success: false,
			message: 'Email and password are required' 
		});
	}

	try {
		// Find user by email
		const user = await getUserByEmail(email);
		console.log('Fetched user:', user);
		if (!user) {
			return reply.status(401).send({
				success: false,
				message: 'Invalid email or password'
			});
		}

		// Verify password
		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) {
			return reply.status(401).send({
				success: false,
				message: 'Invalid email or password'
			});
		}

		// Check if 2FA is enabled
		const twoFAEnabled = user.twoFactorEnabled;
		console.log(`[Local Auth] User ${user.username} has 2FA enabled: ${twoFAEnabled}`);
		if (twoFAEnabled === 1) {
			// If 2FA is enabled but no code provided, request it
			if (!twoFACode) {
				return reply.status(200).send({
					success: false,
					requiresTwoFA: true,
					message: 'Two-factor authentication required',
					userId: user.id_user,
					username: user.username,
					email: user.email,
					twoFAEnabled: twoFAEnabled
				});
			}

			// Verify 2FA code
			const isValid2FA = speakeasy.totp.verify({
				secret: user.two_fa_secret,
				encoding: 'base32',
				token: twoFACode,
				window: 2
			});

			if (!isValid2FA) {
				return reply.status(401).send({
					success: false,
					message: 'Invalid two-factor authentication code'
				});
			}
		}

		// Create JWT token
		const authToken = jwt.sign({
			id: user.id_user,
			twoFAEnabled: twoFAEnabled,
		}, process.env.JWT_SECRET, {
			expiresIn: process.env.JWT_EXPIRES_IN,
		});

		// Set session data
		request.session.set('token', authToken);
		request.session.set('user', {
			userId: user.id_user,
			username: user.username,
			email: user.email,
			twoFAEnabled: twoFAEnabled,
		});

		const refreshToken = jwt.sign(
			{ id: user.id_user },
			process.env.JWT_REFRESH_SECRET,
			{ expiresIn: '7d' }
			);

		// Save refreshToken in DB for this user
		await saveRefreshTokenInDatabase(user.id_user, refreshToken);

		reply.setCookie('refreshToken', refreshToken, {
			httpOnly: true,
			secure: false,
			sameSite: 'strict',
			path: '/',
			maxAge: 7 * 24 * 60 * 60 // 7 days in seconds
		});

		return reply.status(200).send({
			success: true,
			message: 'Authentication successful',
			token: authToken,
			userId: user.id_user,
			username: user.username,
			email: user.email,
			twoFAEnabled: twoFAEnabled
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
		console.log('Logging out user:', user);
        if (user) {
            // Remove user from online tracker
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

		console.log(`[Google Auth] Attempting to authenticate user with email: ${email}`);

		// Try to get the user directly
		let user = await getUserByEmail(email);

		if (user) {
			// Existing user flow
			console.log(`[Google Auth - Existing User] User found - ID: ${user.id_user}, Email: ${user.email}`);
			console.log(`[Google Auth - Existing User] Raw twoFactorEnabled value: ${user.twoFactorEnabled} (type: ${typeof user.twoFactorEnabled})`);

			const twoFAEnabled = user.twoFactorEnabled;

			console.log(`[Google Auth - Existing User] Processed 2FA status: ${twoFAEnabled} (DB value: ${user.twoFactorEnabled})`);

			const authToken = jwt.sign({
				id: user.id_user,
				twoFAEnabled: twoFAEnabled,
			}, process.env.JWT_SECRET, {
				expiresIn: process.env.JWT_EXPIRES_IN,
			});

			request.session.set('token', authToken);
			request.session.set('user', {
				userId: user.id_user,
				username: user.username,
				email: user.email,
				twoFAEnabled: twoFAEnabled,
			});

			const refreshToken = jwt.sign(
				{ id: user.id_user }, // or userId for signup
				process.env.JWT_REFRESH_SECRET,
				{ expiresIn: '7d' }
			);

			await saveRefreshTokenInDatabase(user.id_user, refreshToken);

			reply.setCookie('refreshToken', refreshToken, {
				httpOnly: true,
				secure: false,
				sameSite: 'strict',
				path: '/', // or '/auth'
				maxAge: 7 * 24 * 60 * 60 // 7 days in seconds
			});
			
			console.log(`[Google Auth - Existing User] Sending response with 2FA: ${twoFAEnabled}`);

			return reply.status(200).send({
				success: true,
				message: 'Google authentication successful',
				token: authToken,
				userId: user.id_user,
				username: user.username,
				email: user.email,
				twoFAEnabled: twoFAEnabled,
				isNewUser: false
			});
		} else {
			// New user flow
			console.log(`[Google Auth - New User] User with email ${email} does not exist. Creating new user.`);

			const parts = name.toLowerCase().split(' ');
			const firstInitial = parts[0].charAt(0);
			const lastName = parts[parts.length - 1];
			const nickname = `${firstInitial}${lastName}`;
			const defaultAvatarId = Math.floor(Math.random() * 4) + 1;
			const avatarFilename = `default_${defaultAvatarId}.png`;

			await saveUserToDatabase(nickname, email, null, 'google', avatarFilename);
			console.log(`[Google Auth - New User] User saved to database`);

			// Get the newly created user
			const newUser = await getUserByEmail(email);
			if (!newUser) {
				throw new Error('Failed to retrieve newly created user');
			}

			console.log(`[Google Auth - New User] Retrieved new user - ID: ${newUser.id_user}`);
			console.log(`[Google Auth - New User] Raw twoFactorEnabled value: ${newUser.twoFactorEnabled} (type: ${typeof newUser.twoFactorEnabled})`);

			// FIXED: SQLite logic - 0 = enabled (true), 1 = disabled (false)
			// New users have default value 1 (disabled/false)
			const twoFAEnabled = newUser.twoFactorEnabled;
			console.log(`[Google Auth - New User] Processed 2FA status: ${twoFAEnabled} (DB value: ${newUser.twoFactorEnabled})`);

			const authToken = jwt.sign({
				id: newUser.id_user,
				twoFAEnabled: twoFAEnabled,
			}, process.env.JWT_SECRET, {
				expiresIn: process.env.JWT_EXPIRES_IN,
			});

			request.session.set('token', authToken);
			request.session.set('user', {
				userId: newUser.id_user,
				username: newUser.username,
				email: newUser.email,
				twoFAEnabled: twoFAEnabled,
			});

			const refreshToken = jwt.sign(
				{ id: newUser.id_user },
				process.env.JWT_REFRESH_SECRET,
				{ expiresIn: '7d' }
			);

			await saveRefreshTokenInDatabase(newUser.id_user, refreshToken);

			reply.setCookie('refreshToken', refreshToken, {
				httpOnly: true,
				secure: false,
				sameSite: 'strict',
				path: '/',
				maxAge: 7 * 24 * 60 * 60 // 7 days in seconds
			});

			console.log(`[DEBUG] twoFAEnabled variable:`, twoFAEnabled);
			console.log(`[DEBUG] typeof twoFAEnabled:`, typeof twoFAEnabled);
			const responseObj = {
				success: true,
				message: 'User registered successfully',
				token: authToken,
				userId: newUser.id_user,
				username: newUser.username,
				email: newUser.email,
				twoFAEnabled: twoFAEnabled,
				isNewUser: true
			};
			console.log(`[DEBUG] EXACT response object:`, JSON.stringify(responseObj, null, 2));

			return reply.status(201).send({
				success: true,
				message: 'User registered successfully',
				token: authToken,
				userId: newUser.id_user,
				username: newUser.username,
				email: newUser.email,
				twoFAEnabled: twoFAEnabled,
				isNewUser: true
			});
		}
	} catch (error) {
		console.error('[Google Auth] Error:', error);
		return reply.status(401).send({
			success: false,
			message: 'Invalid Token',
		});
	}
};

/**
 * Generates a new TOTP secret and QR code for a user.
 * @param {string} username - The username (or email) for the OTPAuth URL issuer.
 * @param {number} userId - The unique ID of the user.
 * @returns {Promise<object>} An object containing the secret, QR code data URL, and otpAuthUrl.
 */
async function generateTwoFaSetup(username, userId, email) {
	// 1. Generate a new TOTP secret
	const secret = otplib.authenticator.generateSecret();
	console.log(`Generated 2FA secret for user ${userId}: ${secret}`);

	// 2. Save the secret to the database (linked to the user)
	// This is crucial for later verification
	await saveTwoFactorSecret(userId, secret);

	// 3. Generate the OTPAuth URL
	const accountLabel = `${username}@${email}`;

	// The 'issuer' is your application's name, 'label' is the user's identifier
	const appName = 'ft_transcendence'; // Replace with your application's name
	const otpAuthUrl = otplib.authenticator.keyuri(accountLabel, appName, secret);
	console.log(`Generated OTPAuth URL: ${otpAuthUrl}`);

	// 4. Generate the QR code image as a data URL
	const qrCodeUrl = await qrcode.toDataURL(otpAuthUrl);
	console.log('QR Code Data URL generated.');

	return {
		secret,
		qrCodeUrl,
		otpAuthUrl
	};
};

/**
 * Verifies a TOTP token provided by the user.
 * @param {number} userId - The unique ID of the user.
 * @param {string} token - The 6-digit token entered by the user.
 * @returns {Promise<boolean>} True if the token is valid, false otherwise.
 */
async function verifyTwoFaToken(userId, token) {
	// 1. Retrieve the stored secret for the user from the database
	const secret = await getTwoFactorSecret(userId);

	if (!secret) {
		console.warn(`[2FA Verify] No 2FA secret found for user ${userId}.`);
		return false; // User has no 2FA secret set up
	}

	// 2. Verify the token using otplib
	const isValid = otplib.authenticator.verify({ token, secret });

	if (isValid) {
		// If verification is successful, you might want to mark 2FA as enabled for the user
		// This is important if you want to require 2FA for future logins
		await enableTwoFactor(userId, secret);
		console.log(`[2FA Verify] Token for user ${userId} is valid.`);
	} else {
		console.log(`[2FA Verify] Token for user ${userId} is invalid.`);
	}

	return isValid;
};

async function setupTwoFa(request, reply) {
	// These now come directly from the request body, which should be sent by the frontend
	// after a successful signup.
	const { username, userId, email } = request.body;

	// Basic validation to ensure we received proper data
	if (!username || typeof userId !== 'number') {
		reply.code(400).send({
			message: 'Invalid user data provided for 2FA setup.'
		});
		return;
	}

	try {
		// Use the actual user data received from the request
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
	// userId and token come from the frontend request body
	const { userId, token } = request.body;

	// Basic validation
	if (typeof userId !== 'number' || !token) {
		reply.code(400).send({ 
			message: 'Invalid verification data provided.'
		});
		return;
	}

	try {
		const verified = await verifyTwoFaToken(userId, token);
		if (verified) {
			console.log("Entra verified 2FA token for user:", userId);
			const user = await getUserById(userId); // Assuming you have a function to get user by ID

			if (!user) {
				// This shouldn't happen if userId is valid from `verifyTwoFaToken`
				reply.code(404).send({ message: 'User not found.' });
				return;
			}

			// 2. Create a new JWT with an updated payload
			//    Add a claim like 'twoFAVerified: true' or 'fullyAuthenticated: true'
			const newAuthToken = jwt.sign(
				{
					id: user.id_user, // Use user.id_user as consistently used
					username: user.username,
					email: user.email,
					twoFAEnabled: true, // Confirm 2FA is now enabled
					twoFAVerified: true // Crucial new claim indicating successful verification
				},
				process.env.JWT_SECRET, // Your secret key
				{
					expiresIn: process.env.JWT_EXPIRES_IN // Your token expiration time
				}
			);

			// 3. Update the session (if you're using server-side sessions)
			// This ensures the server-side session also reflects the updated 2FA status.
			request.session.set('token', newAuthToken); // Update the token in session
			request.session.set('user', { // Update user info in session
				userId: user.id_user,
				username: user.username,
				email: user.email,
				twoFAEnabled: true,
				twoFAVerified: true // Update this as well
			});

			// 4. Send the new token back to the frontend
			reply.code(200).send({
				message: '2FA token verified successfully!',
				verified: true,
				token: newAuthToken, // Send the new token to the frontend
				userId: user.id_user, // Re-send relevant user data
				username: user.username,
				email: user.email,
				twoFAEnabled: true // Explicitly confirm
			});
			// --- END: JWT Re-issuance Logic ---
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
        return reply.status(401).send({ success: false, message: 'Invalid refresh token' });
    }
}

async function isRefreshTokenValid(userId, refreshToken) {
	const storedToken = await getRefreshTokenFromDatabase(userId);
	return storedToken === refreshToken;
}

module.exports = {
	signupHandler,
	signinHandler,
	logoutHandler,
	googleHandler,
	setupTwoFa,
	verifyTwoFa,
	refreshTokenHandler
};