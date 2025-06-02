// /api/routes/twofa/twoFaRoutes.js

const { generateTwoFaSetup, verifyTwoFaToken } = require('../../handlers/twoFaHandler');
const { twoFaSetupResponseSchema, twoFaVerifyRequestSchema, twoFaVerifyResponseSchema } = require('../../schemas/twoFaSchema');

async function twoFaRoutes(fastify, options) {

  // Route to initiate 2FA setup (generate QR code)
  // This route should be called *after* a successful user signup.
  // The username and userId should be passed from the signup process.
  fastify.post('/api/auth/setup', {
    schema: {
      body: {
        type: 'object',
        properties: {
          username: { type: 'string', description: 'The username of the user.' },
          userId: { type: 'number', description: 'The ID of the newly registered user.' },
		  email: { type: 'string', description: 'The email of the user'}
        },
        required: ['username', 'userId', 'email'] // Now these are genuinely required
      },
      response: twoFaSetupResponseSchema
    }
  }, async (request, reply) => {
    // These now come directly from the request body, which should be sent by the frontend
    // after a successful signup.
    const { username, userId, email } = request.body;

    // Basic validation to ensure we received proper data
    if (!username || typeof userId !== 'number') {
      reply.code(400).send({ message: 'Invalid user data provided for 2FA setup.' });
      return;
    }

    try {
      // Use the actual user data received from the request
      const { secret, qrCodeUrl, otpAuthUrl } = await generateTwoFaSetup(username, userId, email);
      reply.send({ secret, qrCodeUrl, otpAuthUrl });
    } catch (error) {
      fastify.log.error('Error generating 2FA setup for user:', username, error);
      reply.code(500).send({ message: 'Failed to generate 2FA setup.' });
    }
  });

  // Route to verify the TOTP token (after user scans QR and enters code)
  // This route is called by the frontend to confirm the 2FA setup.
  fastify.post('/api/auth/verify', {
    schema: {
      body: twoFaVerifyRequestSchema, // Requires userId and token
      response: twoFaVerifyResponseSchema
    }
  }, async (request, reply) => {
    // userId and token come from the frontend request body
    const { userId, token } = request.body;

    // Basic validation
    if (typeof userId !== 'number' || !token) {
        reply.code(400).send({ message: 'Invalid verification data provided.' });
        return;
    }

    try {
      const verified = await verifyTwoFaToken(userId, token);
      if (verified) {
        reply.send({ message: '2FA token verified successfully!', verified: true });
      } else {
        reply.code(400).send({ message: 'Invalid 2FA token.' });
      }
    } catch (error) {
      fastify.log.error('Error verifying 2FA token for user:', userId, error);
      reply.code(500).send({ message: 'Failed to verify 2FA token.' });
    }
  });
}

module.exports = twoFaRoutes;