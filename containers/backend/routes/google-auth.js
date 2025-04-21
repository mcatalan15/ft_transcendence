const { OAuth2Client } = require('google-auth-library');
const { saveUserToDatabase, checkUserExists } = require('../db/database');

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
      const { email, name, sub } = payload;

      const userExists = await checkUserExists(null, email);

      if (!userExists) {
        // Save user with null password or flag as Google user
        await saveUserToDatabase(name || email.split('@')[0], email, null);
      }

      // You can generate a token here if you use JWT sessions
      return reply.status(200).send({ success: true, message: 'Google sign-in successful', user: { name, email } });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(401).send({ success: false, message: 'Invalid token' });
    }
  });
}

module.exports = googleAuthRoutes;
