const profileSchema = {
	description: 'Get non-sensitive data from the user\'s profile. The user needs to be logged-in prior to accessing the profile.',
	tags: ['profile'],
	querystring: {
	  type: 'object',
	  required: ['user'],
	  properties: {
		id: { type: 'string', description: 'User\s ID from the database' },
	  }
	},
	response: {
	  200: {
		description: 'Successful sign-in',
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
		description: 'Couldn\t fetch user\s profile',
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
		description: 'Couldn\t fetch user\s profile',
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

module.exports = {
	profileSchema
  };