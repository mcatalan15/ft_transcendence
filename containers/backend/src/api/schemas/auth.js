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
				userId: { type: 'number', description: 'ID of the newly registered user' },
				username: { type: 'string', description: 'Username of the new user' },
				email: { type: 'string', description: 'Email of the new user' },
				twoFAEnabled: { type: 'number', description: '0 = disabled, 1 = enabled' }
			},
			example: {
				success: true,
				message: 'User registered successfully',
				userId: 123,
				username: 'testuser',
				email: 'test@user.com',
				twoFAEnabled: 0
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
	description: 'Authenticate a user with their email and password. No token is generated at this stage.',
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
		200: {
			description: 'Successful authentication',
			type: 'object',
			properties: {
				success: { type: 'boolean' },
				message: { type: 'string' },
				userId: { type: 'number', description: 'ID of the user' },
				username: { type: 'string', description: 'Username of the user' },
				email: { type: 'string', description: 'Email of the user' },
				twoFAEnabled: { type: 'number', description: '0 = disabled, 1 = enabled' }
			},
			example: {
				success: true,
				message: 'Authentication successful',
				userId: 42,
				username: 'test-user',
				email: 'cucufu@gmail.com',
				twoFAEnabled: 0
			}
		},
		400: {
			description: 'Bad request - could be invalid data or that the user could not be found in the database',
			type: 'object',
			properties: {
				success: { type: 'boolean' },
				message: { type: 'string' },
				token: { type: 'string' || null },
				usernumber: { type: 'string' || null },
				userId: { type: 'number', description: 'ID of the user' },
				twoFAEnabled: { type: 'number', description: ' 1 not enabled 0 enabled' }
		    },
		    example: {
		    	success: false,
		        message: 'User not found',
		        token: null,
				username: 'pepe123',
				userId: 2,
				twoFAEnabled: '1'
			}
		},
		500: {
		    description: 'Server error',
		    type: 'object',
		    properties: {
		       success: { type: 'boolean' },
		        message: { type: 'string' },
		        token: { type: 'string' || null },
				user: { type: 'string' || null }
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
	description: 'Authenticate or register a user using Google OAuth credential token. No JWT token is generated at this stage.',
	tags: ['authentication'],
	body: {
		type: 'object',
		required: ['credential'],
		properties: {
			credential: {
				type: 'string',
				description: 'JWT credential token from Google OAuth'
			}
		}
	},
	response: {
		200: {
			description: 'Successful Google authentication',
			type: 'object',
			properties: {
				success: { type: 'boolean' },
				message: { type: 'string' },
				userId: { type: 'number', description: 'ID of the user' },
				username: { type: 'string', description: 'Username of the user' },
				email: { type: 'string', description: 'Email of the user' },
				twoFAEnabled: { type: 'number', description: '0 = disabled, 1 = enabled' },
				isNewUser: { type: 'boolean', description: 'Indicates if the user is new' }
			},
			example: {
				success: true,
				message: 'Google authentication successful',
				userId: 42,
				username: 'googleuser',
				email: 'user@gmail.com',
				twoFAEnabled: 0,
				isNewUser: false
			}
		},
		201: {
			description: 'Successful Google registration',
			type: 'object',
			properties: {
				success: { type: 'boolean' },
				message: { type: 'string' },
				userId: { type: 'number', description: 'ID of the user' },
				username: { type: 'string', description: 'Username of the user' },
				email: { type: 'string', description: 'Email of the user' },
				twoFAEnabled: { type: 'number', description: '0 = disabled, 1 = enabled' },
				isNewUser: { type: 'boolean', description: 'Indicates if the user is new' }
			},
			example: {
				success: true,
				message: 'Google registration successful',
				userId: 42,
				username: 'googleuser',
				email: 'user@gmail.com',
				twoFAEnabled: 0,
				isNewUser: true
			}
		},
		400: {
			description: 'Bad request - invalid or missing credential',
			type: 'object',
			properties: {
				success: { type: 'boolean' },
				message: { type: 'string' }
			},
			example: {
				success: false,
				message: 'Invalid Google credential'
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
	description: 'Verifies the 2FA token entered by the user and generates JWT token upon success.',
	tags: ['authentication'],
	body: {
		type: 'object',
		properties: {
			userId: { type: 'number', description: 'The ID of the registered user.' },
			token: { type: 'string', description: 'The 6-digit 2FA token' }
		},
		required: ['userId', 'token']
	},
	response: {
		200: {
			description: 'Code successfully verified and JWT token generated',
			type: 'object',
			properties: {
				message: { type: 'string' },
				verified: { type: 'boolean' },
				token: { type: 'string', description: 'JWT authentication token' },
				userId: { type: 'number', description: 'ID of the user' },
				username: { type: 'string', description: 'Username of the user' },
				email: { type: 'string', description: 'Email of the user' },
				twoFAEnabled: { type: 'boolean', description: 'Always true after verification' }
			},
			example: {
				message: '2FA token verified successfully!',
				verified: true,
				token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
				userId: 42,
				username: 'testuser',
				email: 'test@example.com',
				twoFAEnabled: true
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

const refreshTokenSchema = {
	description: 'Renews the user\'s authentication token using a valid refresh token extracted from the cookies.',
	tags: ['authentication'],
	body: false,
	response: {
		200: {
			description: 'Token successfully renewed',
			type: 'object',
			properties: {
				success: { type: 'boolean' },
				message: { type: 'string' },
				newToken: { type: 'string', description: 'Newly generated JWT token' }
			},
			example: {
				success: true,
				message: 'Token renewed successfully',
				newToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
			}
		},
		400: {
			description: 'Bad request - invalid token provided',
			type: 'object',
			properties: {
				success: { type: 'boolean' },
				message: { type: 'string' }
			},
			example: {
				success: false,
				message: 'Invalid token provided'
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

const get2FAStatusSchema = {
	description: 'Fetches the 2FA status for a user.',
	tags: ['authentication'],
	params: {
		type: 'object',
		properties: {
			userId: { type: 'number', description: 'ID of the user' }
		},
		required: ['userId']
	},
	response: {
		200: {
			description: '2FA status fetched successfully',
			type: 'object',
			properties: {
				success: { type: 'boolean' },
				twoFAEnabled: { type: 'boolean', description: 'Indicates if 2FA is enabled for the user' }
			},
			example: {
				success: true,
				twoFAEnabled: true
			}
		},
		400: {
			description: 'Bad request - invalid user ID provided',
			type: 'object',
			properties: {
				success: { type: 'boolean' },
				message: { type: 'string' }
			},
			example: {
				success: false,
				message: 'Invalid user ID provided'
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
  logoutSchema,
  googleSchema,
  setupTwoFaSchema,
  verifyTwoFaSchema,
  refreshTokenSchema,
  get2FAStatusSchema
};