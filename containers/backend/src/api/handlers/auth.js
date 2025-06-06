const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const otplib = require('otplib');
otplib.authenticator.options = {
	step: 30, // Default is 30 seconds
	digits: 6 // Default is 6 digits
  };

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const qrcode = require('qrcode');

const { saveUserToDatabase, 
  checkUserExists,
  getHashedPassword,
  getUserByEmail,
  saveTwoFactorSecret,
  getTwoFactorSecret,
  enableTwoFactor
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
    // !!! IMPORTANT CHANGE HERE !!!
    // Make sure saveUserToDatabase returns the newly created user's ID
	const defaultAvatarId = Math.floor(Math.random() * 4) + 1; // Assuming 4 default avatars
	const avatarFilename = `default_${defaultAvatarId}.png`;
	
	const newUserId = await saveUserToDatabase(username, email, hashedPassword, 'local', avatarFilename);
    // MORE DEBUGGIng
    console.log('[BACKEND - signupHandler] Preparing response with:', {
        userId: newUserId,
        username: username,
		email: email
    })
    console.log('[BACKEND - signupHandler] Final response object before sending:', {
            success: true,
            message: 'User registered successfully',
            userId: newUserId,
            username: username,
			email: email
        });
    return reply.status(201).send({
      success: true,
      message: 'User registered successfully',
      userId: newUserId, // <--- Add the new user ID
      username: username, // <--- Add the username (or email, if that's what you use for 2FA display)
	  email: email
    });

  } catch (error) {
    console.error('Registration error:', error);
    return reply.status(500).send({
      success: false,
      message: 'Internal server error'
    });
  }
}

async function signinHandler(request, reply) {

    const { email, password } = request.body;

    if (!email || !password) {
      return reply.status(400).send({ success: false, message: 'All fields are required' });
    }

    try {

      const hash = await getHashedPassword(email);
      if (!hash) {
        return reply.status(400).send({
          success: false,
          message: 'User not found'
        });
      }

      // Compare the provided password with the stored hash
      const match = await bcrypt.compare(password, hash);

      if (match) {

        const user = await getUserByEmail(email);
		    const authToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
			    expiresIn: process.env.JWT_EXPIRES_IN
		    });

        request.session.set('token', authToken);
        request.session.set('user', {
		  userId: user.id_user,
          username: user.username,
          email: user.email,
          //! Never store sensitive data like passwords !
		});

        return reply.status(201).send({
          success: true,
          message: 'Authentication successful',
		  username: user.username,
		  email: user.email,
		  userId: user.id_user,
		  token: authToken
        });
      }
      
      return reply.status(400).send({
        success: false,
        message: 'Invalid email or password'
      });

    } catch (error) {

      console.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Internal server error'
      });

    }
};

async function logoutHandler(request, reply) {
	try {

		// Check if request.session exists
		if (request.session.get('user')) {
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
}

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
  
		// check only by email
		const userExists = await checkUserExists(null, email);
  
		if (userExists?.exists) {
		  // user exists? sign them in instead of registering
		  const user = await getUserByEmail(email);
		  const authToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
			expiresIn: process.env.JWT_EXPIRES_IN
		  });
  
		  request.session.set('token', authToken);
		  request.session.set('user', {
			userId: user.id_user,
			username: user.username,
			email: user.email
		  });

		  return reply.status(200).send({
			success: true,
			message: 'Google authentication successful',
			token: authToken,
			userId: user.id_user,
			username: user.username,
			email: user.email
		  });
		}
  
		// user doesn't exist? register them with default generated nickname
		const parts = name.toLowerCase().split(' ');
		
		const firstInitial = parts[0].charAt(0);
		const lastName = parts[parts.length - 1];
		const nickname = `${firstInitial}${lastName}`;
  
		const defaultAvatarId = Math.floor(Math.random() * 4) + 1; // Assuming 4 default avatars
		const avatarFilename = `default_${defaultAvatarId}.png`;
  
		await saveUserToDatabase(nickname, email, null, 'google', avatarFilename);
		const newUser = await getUserByEmail(email);

		const authToken = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, {
		  expiresIn: process.env.JWT_EXPIRES_IN
		});

		  request.session.set('token', authToken);
		  request.session.set('user', {
			userId: newUser.id_user,
			username: newUser.username,
			email: newUser.email
		  });

		//fastify.metrics.authAttempts.labels('local', 'success').inc();
		return reply.status(201).send({
		  success: true,
		  message: 'User registered successfully',
		  token: authToken,
		  userId: newUser.id_user,
		  username: newUser.username,
		  email: newUser.email
		});
  
	  } catch (error) {
		console.error(error);
		//fastify.metrics.authAttempts.labels('local', 'failure').inc();
		return reply.status(401).send({
		  success: false,
		  message: 'Invalid Token' });
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
  }
  
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
  }

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
        reply.code(200).send({
			message: '2FA token verified successfully!',
			verified: true
		});
      } else {
        reply.code(400).send({
			message: 'Invalid 2FA token.'
		});
      }
    } catch (error) {
      fastify.log.error('Error verifying 2FA token for user:', userId, error);
      reply.code(500).send({
		message: 'Failed to verify 2FA token.'
	  });
    }
}

module.exports = {
  signupHandler,
  signinHandler,
  logoutHandler,
  googleHandler,
  setupTwoFa,
  verifyTwoFa

};