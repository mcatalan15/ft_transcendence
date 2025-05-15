const { OAuth2Client } = require('google-auth-library');
const { saveUserToDatabase, checkUserExists } = require('../../db/database');

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

	  	try {
       	 await checkUserExists(name, email);

     	 await saveUserToDatabase(name, email, null, 'provider');

    	 return reply.status(200).send({
			success: true,
			message: 'Google authentication successful',
			user: { name, email, provider } });

		} catch (error) {
		// If user already exists
		return reply.status(400).send({
			success: false,
			message: 'User already exists',
		});
		}

	} catch (error) {
      fastify.log.error(error);
      return reply.status(401).send({
		success: false,
		message: 'Invalid Token' });
    }
  });
}

module.exports = googleAuthRoutes;
