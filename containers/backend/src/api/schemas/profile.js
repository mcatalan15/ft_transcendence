const profileSchema = {
	description: 'Get non-sensitive data from the user\'s profile.\
	The user needs to be logged-in prior to accessing the profile.\
	Returns empty strings in case of failure.\
	',
	tags: ['profile'],
	querystring: {
	  type: 'object',
	  properties: {
		id: { type: 'string', description: 'User\s ID from the database' },
	  }
	},
	response: {
	  200: {
		description: 'Profile fetched successfully',
		type: 'object',
		properties: {
		  id: { type: 'string', description: 'User\s ID' },
		  username: { type: 'string', description: 'Username' },
		  email: { type: 'string', description: 'User\s email address' },
		},
		example: {
		  id: '42',
		  username: 'testuser',
		  email: 'user@test.com'
		}
	  },
	  400: {
		description: 'Couldn\'t fetch user\'s profile',
		type: 'object',
		properties: {
		  id: { type: 'string', description: 'User\s ID', },
		  username: { type: 'string', description:'Username' },
		  email: { type: 'string', description:'User\s email address' },
		},
		example: {
		  id: '',
		  username: '',
		  email: ''
		}
	  },
	  500: {
		description: 'Internal server error',
		type: 'object',
		properties: {
		  id: { type: 'string', description: 'User\s ID' },
		  username: { type: 'string', description: 'Username' },
		  email: { type: 'string', description: 'User\s email address' },
		},
		example: {
		  id: '',
		  username: '',
		  email: ''
		}
	  }
	}
  };

  const uploadAvatarSchema = {
	description: 'Allow the user to upload a new avatar to replace the old one.\
	The user needs to be authenticated, obviously.\
	',
	tags: ['profile'],
	querystring: {
	  type: 'object',
	  properties: {
		id: { type: 'string', description: 'User\s ID from the database' },
	  }
	},
	response: {
	  201: {
		description: 'Avatar successfully uploaded',
		type: 'object',
		properties: {
		  success: { type: 'string' },
		  message: { type: 'string' },
		  avatarUrl: { type: 'string', description: 'the API url of the avatar' },
		},
		example: {
		  success: true,
		  message: 'Avatar updated successfully',
		  avatarUrl: '/api/profile/avatar/42'
		}
	  },
	  400: {
		description: 'Couldn\'t upload a new avatar',
		type: 'object',
		properties: {
			success: { type: 'boolean' },
			message: { type: 'string' }
		},
		example: {
			success: false,
			message: 'No file uploaded'
		}
	  },
	  401: {
		description: 'User was not authenticated',
		type: 'object',
		properties: {
			success: { type: 'boolean' },
			message: { type: 'string' }
		},
		example: {
			success: false,
			message: 'User not authenticated'
		}
	  },
	  500: {
		description: 'Internal server error',
		type: 'object',
		properties: {
			success: { type: 'boolean' },
			message: { type: 'string' },
			error: { type: 'string' }
		},
		example: {
			success: false,
			message: 'Failed to upload avatar',
			error: 'Server is not responding'
		}
	  }
	}
  };

  const fetchUserAvatarSchema = {
	description: 'Fetches the actual user\'s avatar to display it in the profile.\
	The user needs to be authenticated, obviously.\
	',
	tags: ['profile'],
	querystring: {
	  type: 'object',
	  properties: {
		id: { type: 'string', description: 'User\s ID from the database' },
	  }
	},
	response: {
	  404: {
		description: 'Default avatar was not found',
		type: 'object',
		properties: {
			message: { type: 'string' },
			path: { type: 'string' }
		},
		example: {
			message: 'Default avatar not found',
			path: 'path/to/the/default/avatar'
		}
	  },
	  500: {
		description: 'Internal server error',
		type: 'object',
		properties: {
			message: { type: 'string' },
			error: { type: 'string' }
		},
		example: {
			message: 'Database error',
			error: 'Database was not found'
		}
	  }
	}
  };

module.exports = {
	profileSchema,
	uploadAvatarSchema,
	fetchUserAvatarSchema
  };