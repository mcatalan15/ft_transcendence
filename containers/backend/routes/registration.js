const bcrypt = require('bcrypt');
const { saveUserToDatabase, checkUserExists } = require('../db/database');

async function registrationRoutes(fastify, options) {
  fastify.post('/api/signup', async (request, reply) => {
    const { username, email, password } = request.body;

    if (!username || !email || !password) {
      return reply.status(400).send({ success: false, message: 'All fields are required' });
    }

    try {
      const userExists = await checkUserExists(username, email);
      if (userExists) {
        return reply.status(400).send({ success: false, message: 'Username or email already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await saveUserToDatabase(username, email, hashedPassword);

      return reply.status(201).send({ success: true, message: 'User registered successfully' });
    } catch (error) {
      console.error(error);
      return reply.status(500).send({ success: false, message: 'Internal server error' });
    }
  });
}

module.exports = registrationRoutes;
