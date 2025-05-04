const bcrypt = require('bcrypt');
const { saveUserToDatabase, checkUserExists } = require('../../db/database');

module.exports = async function (fastify, options) {
  fastify.post('/api/auth/signup', {
    schema: {
      description: 'Create a new user account',
      tags: ['authentication'],
      body: {
        type: 'object',
        required: ['username', 'email', 'password'],
        properties: {
          username: { type: 'string', description: 'Unique username' },
          email: { type: 'string', format: 'email', description: 'User email address' },
          password: { type: 'string', description: 'User password' }
        }
      },
      response: {
        201: {
          description: 'Successful registration',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        },
        400: {
          description: 'Bad request - invalid data or user already exists',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        },
        500: {
          description: 'Server error',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
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
            message: 'First' 
          });
        } else if (userExists.usernameExists) {
          return reply.status(400).send({ 
            success: false,
            message: 'Second' 
          });
        } else if (userExists.emailExists) {
          return reply.status(400).send({ 
            success: false, 
            message: 'Third' 
          });
        }
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      await saveUserToDatabase(username, email, hashedPassword, 'local');

      return reply.status(201).send({
        success: true,
        message: 'User registered successfully'
      });

    } catch (error) {

      console.error('Registration error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack,
        name: error.name,
        customCode: error.code === 'SQLITE_CONSTRAINT' ? 'This should be caught' : 'Unknown error type'
      });

      if (error.message.includes('First')) {
        return reply.status(400).send({
          success: false,
          message: 'Username and email are already taken'
        });
      }

      if (error.message.includes('Second')) {
        return reply.status(400).send({
          success: false,
          message: 'Username is already taken'
        });
      }

      if (error.message.includes('Third')) {
        return reply.status(400).send({
          success: false,
          message: 'That email is already taken'
        });
      }

      console.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Internal server error'
      });

    }
  });
}
