const signupSchema = {
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
};

const loginSchema = {
  // Add login schema
};

module.exports = {
  signupSchema,
  loginSchema
};