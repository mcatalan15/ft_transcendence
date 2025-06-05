const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { saveUserToDatabase, 
  checkUserExists,
  getHashedPassword,
  getUserByEmail
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

async function googleHandler(request, reply) {
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
			id: user.id_user,
			username: user.username,
			email: user.email
		  });
  
		  // fastify.metrics.authAttempts.labels('local', 'success').inc();
		  return reply.status(200).send({
			success: true,
			message: 'Google authentication successful',
			user: { 
			  id: user.id_user,
			  username: user.username, 
			  email: user.email 
			},
			token: authToken
		  });
		}
  
		// user doesn't exist? register them with default generated nickname
		const parts = name.toLowerCase().split(' ');
		
		const firstInitial = parts[0].charAt(0);
		const lastName = parts[parts.length - 1];
		const nickname = `${firstInitial}${lastName}`;
  
		const defaultAvatarId = Math.floor(Math.random() * 4) + 1; // Assuming 4 default avatars
		const avatarFilename = `default_${defaultAvatarId}.png`;
  
		const newUser = await saveUserToDatabase(nickname, email, null, 'google', avatarFilename);
  
		const authToken = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, {
		  expiresIn: process.env.JWT_EXPIRES_IN
		});
  
			request.session.set('token', authToken);
		  request.session.set('user', {
			  id: newUser.id_user,
			  username: nickname,
			  email: email
		  });
  
		//fastify.metrics.authAttempts.labels('local', 'success').inc();
		return reply.status(201).send({
		  success: true,
		  message: 'User registered successfully',
		  user: { 
			  id: newUser.id,
			  username: nickname, 
			  email: email 
		  },
		  token: authToken
		});
  
	  } catch (error) {
		fastify.log.error(error);
		//fastify.metrics.authAttempts.labels('local', 'failure').inc();
		return reply.status(401).send({
		  success: false,
		  message: 'Invalid Token' });
	  }
	};

module.exports = {
  signupHandler,
  signinHandler,
  logoutHandler,
  googleHandler

};