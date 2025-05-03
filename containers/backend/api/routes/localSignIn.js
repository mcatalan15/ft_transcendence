const bcrypt = require('bcrypt');
const { getHashedPassword, getUserByEmail } = require('../db/database');

module.exports = async function (fastify, options) {
  fastify.post('/api/auth/signin', async (request, reply) => {
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
      
        request.session.set('user', {
          id: user.id,
          username: user.username,
          email: user.email,
          //! Never store sensitive data like passwords !
        });

        return reply.status(201).send({
          success: true,
          message: 'Authentication successful'
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
  });
}
