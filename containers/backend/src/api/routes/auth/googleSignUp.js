const { OAuth2Client } = require('google-auth-library');
const { saveUserToDatabase, checkUserExists, getUserByEmail } = require('../../db/database');
const jwt = require('jsonwebtoken');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function googleAuthRoutes(fastify, options) {
  fastify.post('/api/auth/google', async (request, reply) => {
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
		  id: user.id,
		  username: user.username,
		  email: user.email
		});

		//fastify.metrics.authAttempts.labels('local', 'success').inc();
        return reply.status(200).send({
          success: true,
          message: 'Google authentication successful',
          user: { 
            id: user.id,
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

      const newUser = await saveUserToDatabase(nickname, email, null, 'google');

      const authToken = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
      });

	  	request.session.set('token', authToken);
		request.session.set('user', {
			id: newUser.id,
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
  });
}

module.exports = googleAuthRoutes;
