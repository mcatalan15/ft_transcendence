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
        username: { type: 'string', description: 'Username of the new user' }, // <--- ADD THIS
		email: { type: 'string', description: 'Email of the new user' }
      },
      example: {
        success: true,
        message: 'User registered successfully',
        userId: 123,
        username: 'testuser',
		email: 'test@user.com'
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
    If the password matches, a token is generated and returned to the user.',
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
        token: { type: 'string', description: 'JWT token generated from a secret' },
        userId: { type: 'number', description: 'ID of the newly registered user' },    // <--- ADD THIS
        username: { type: 'string', description: 'Username of the new user' }, // <--- ADD THIS
		email: { type: 'string', description: 'Email of the new user' }
      },
      example: {
        success: true,
        message: 'User registered successfully',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiaWF0IjoxNzQ2NjMwOTIxLCJleHAiOjE3NDY2MzA5MjF9.o-1eIW8lMLPdPynK5lx8BfoYSAfTj8gJaNqFGgTL6ik',
		user: 'test-user',
		email: 'cucufu@gmail.com',
		userId: 42
      }
    },
    400: {
      description: 'Bad request - could be invalid data or that the user could not be found in the database',
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        token: { type: 'string' || null },
		user: {type: 'string' || null }
      },
      example: {
        success: false,
        message: 'User not found',
        token: null,
		user: null
      }
    },
    500: {
      description: 'Server error',
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        token: { type: 'string' || null },
		user: {type: 'string' || null }
      },
      example: {
        success: false,
        message: 'Internal server error',
        token: null,
		user: null
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

const googleSchema = {
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
		  username: { type: 'string', description: 'Username of the new user' }, // <--- ADD THIS
		  email: { type: 'string', description: 'Email of the new user' }
		},
		example: {
		  success: true,
		  message: 'User registered successfully',
		  userId: 123,
		  username: 'testuser',
		  email: 'test@user.com'
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

const setupTwoFaSchema = {
	description: 'Fetches the user info after a successful sign-in to generate the 2FA code.',
	tags: ['authentication'],
	body: {
		type: 'object',
		properties: {
		  username: { type: 'string', description: 'The username of the user.' },
		  userId: { type: 'number', description: 'The ID of the registered user.' },
		  email: { type: 'string', description: 'The email of the user'}
		},
		required: ['username', 'userId', 'email']
	},
	response: {
		200: {
			description: 'Code successfully generated',
			type: 'object',
			properties: {
				secret: {
					type: 'string',
					description: 'The TOTP secret key for the user'
				},
				qrCodeUrl: {
					type: 'string',
					description: 'Base64 data URL of the QR code image'
				},
				otpAuthUrl: {
					type: 'string',
					description: 'OTPAuth URL for manual entry in authenticator apps'
				}
			},
			example: {
				secret: 'JBSWY3DPEHPK3PXP',
				qrCodeUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
				otpAuthUrl: 'otpauth://totp/testuser@test@example.com?secret=JBSWY3DPEHPK3PXP&issuer=ft_transcendence'
			}
		},
		400: {
			description: 'Bad request - invalid user data provided',
			type: 'object',
			properties: {
				message: { type: 'string' }
			},
			example: {
				message: 'Invalid user data provided for 2FA setup.'
			}
		},
		500: {
			description: 'Server error',
			type: 'object',
			properties: {
				message: { type: 'string' }
			},
			example: {
				message: 'Failed to generate 2FA setup.'
			}
		}
	}
};

const verifyTwoFaSchema = {
	description: 'Verifies the 2FA token entered by the user.',
	tags: ['authentication'],
	body: {
		type: 'object',
		properties: {
		  userId: { type: 'number', description: 'The ID of the registered user.' },
		  token: { type: 'string', description: 'The token of the user'}
		},
		required: ['userId', 'token']
	},
	response: {
		200: {
			description: 'Code successfully verified',
			type: 'object',
			properties: {
				message: { type: 'string' },
				verified: { type: 'boolean' }
			},
			example: {
				message: '2FA token verified successfully!',
				verified: true
			}
		},
		400: {
			description: 'Bad request - invalid user data provided',
			type: 'object',
			properties: {
				message: { type: 'string' }
			},
			example: {
				message: 'Invalid 2FA token.'
			}
		},
		500: {
			description: 'Server error',
			type: 'object',
			properties: {
				message: { type: 'string' }
			},
			example: {
				message: 'Failed to verify 2FA token.'
			}
		}
	}
};

module.exports = {
  signupSchema,
  signinSchema,
  logoutSchema,
  googleSchema,
  setupTwoFaSchema,
  verifyTwoFaSchema
};