const signupSchema = {
  description: 'Create a new user account from the data provided by the user via the frontend. The password is received in plain text and is hashed before being stored in the database.',
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
        message: { type: 'string' },
        userId: { type: 'number', description: 'ID of the newly registered user' },    // <--- ADD THIS
        username: { type: 'string', description: 'Username of the new user' } // <--- ADD THIS
      },
      example: {
        success: true,
        message: 'User registered successfully',
        userId: 123, // <--- UPDATE EXAMPLE IF YOU WANT
        username: 'testuser' // <--- UPDATE EXAMPLE IF YOU WANT
      }
    },
    400: {
      description: 'Bad request - could be invalid data, or that the user/email already exists in the database',
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' }
      },
      example: {
        success: false,
        message: 'Username is already taken'
      }
    },
    500: {
      description: 'Server error',
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' }
      },
      example: {
        success: false,
        message: 'Internal server error'
      }
    }
  }
};

const signinSchema = {
  description: 'Authenticate a user with their email and password. \
    The password is compared with the stored hash in the database. \
    If the password matches, a token is generated and returned to the user. \
    Currently, this is a simple phrase, but in production, it will be a JWT token for the authenticated user.',
  tags: ['authentication'],
  body: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', format: 'email', description: 'User email address' },
      password: { type: 'string', description: 'User password' }
    }
  },
  response: {
    201: {
      description: 'Successful sign-in',
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        token: { type: 'string', description: 'Currently a simple phrase, prod will have JWT token for authenticated user' }
      },
      example: {
        success: true,
        message: 'User registered successfully',
        token: 'simple-phrase-token'
      }
    },
    400: {
      description: 'Bad request - could be invalid data or that the user could not be found in the database',
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        token: { type: 'string' || null }
      },
      example: {
        success: false,
        message: 'User not found',
        token: null
      }
    },
    500: {
      description: 'Server error',
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        token: { type: 'string' || null }
      },
      example: {
        success: false,
        message: 'Internal server error',
        token: null
      }
    }
  }
};

const logoutSchema = {
	description: 'Logs a user out. \
	  The session information are deleted, including the token to communicate with backend. \
	',
	tags: ['authentication'],
	body: {
	  type: 'object',
	  required: ['user'],
	  properties: {
		user: { type: 'string', description: 'User\'s session to be destroyed' }
	  }
	},
	response: {
	  201: {
		description: 'Successful logout',
		type: 'object',
		properties: {
		  success: { type: 'boolean' },
		  message: { type: 'string' }
		},
		example: {
		  success: true,
		  message: 'User registered successfully'
		}
	  },
	  400: {
		description: 'Bad request - user session could not be destroyed',
		type: 'object',
		properties: {
		  success: { type: 'boolean' },
		  message: { type: 'string' }
		},
		example: {
		  success: false,
		  message: 'User not found'
		}
	  },
	  500: {
		description: 'Server error',
		type: 'object',
		properties: {
		  success: { type: 'boolean' },
		  message: { type: 'string' }
		},
		example: {
		  success: false,
		  message: 'Internal server error'
		}
	  }
	}
  };

module.exports = {
  signupSchema,
  signinSchema,
  logoutSchema
};