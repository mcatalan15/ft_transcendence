const { updatePassword } = require("../db/database");

const profileSchema = {
	description: 'Get non-sensitive data from the user\'s profile.\
	The user needs to be logged-in prior to accessing the profile.\
	Returns null values in case of failure.\
	',
	tags: ['profile'],
	querystring: {
	  type: 'object',
	  properties: {
		userId: { type: 'string', description: 'User\'s ID from the database' },
	  }
	},
	response: {
	  200: {
		description: 'Profile fetched successfully',
		type: 'object',
		properties: {
		  userId: { type: 'string', description: 'User\'s ID' },
		  username: { type: 'string', description: 'Username' },
		  email: { type: 'string', description: 'User\'s email address' },
		  avatarUrl: { type: 'string', description: 'URL of the user\'s avatar' },
		  isOwnProfile: { type: 'boolean', description: 'Whether this is the current user\'s own profile' },
		  isFriend: { type: 'boolean', description: 'Whether the current user is friends with this profile user' }
		},
		example: {
		  userId: '42',
		  username: 'testuser',
		  email: 'user@test.com',
		  avatarUrl: '/api/profile/avatar/42',
		  isOwnProfile: false,
		  isFriend: true
		}
	  },
	  400: {
		description: 'Couldn\'t fetch user\'s profile',
		type: 'object',
		properties: {
		  userId: { type: 'null', description: 'User\'s ID' },
		  username: { type: 'null', description: 'Username' },
		  email: { type: 'null', description: 'User\'s email address' },
		  avatarUrl: { type: 'null', description: 'URL of the user\'s avatar' },
		},
		example: {
		  userId: null,
		  username: null,
		  email: null,
		  avatarUrl: null
		}
	  },
	  500: {
		description: 'Internal server error',
		type: 'object',
		properties: {
		  userId: { type: 'null', description: 'User\'s ID' },
		  username: { type: 'null', description: 'Username' },
		  email: { type: 'null', description: 'User\'s email address' },
		  avatarUrl: { type: 'null', description: 'URL of the user\'s avatar' },
		},
		example: {
		  userId: null,
		  username: null,
		  email: null,
		  avatarUrl: null
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

  const getUserOnlineStatusSchema = {
    description: 'Check if a user is currently online based on recent activity',
    tags: ['profile'],
    params: {
        type: 'object',
        required: ['userId'],
        properties: {
            userId: { type: 'string', description: 'User ID to check online status for' }
        }
    },
    response: {
        200: {
            description: 'Online status retrieved successfully',
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                userId: { type: 'string' },
                isOnline: { type: 'boolean' },
                lastSeen: { type: ['string', 'null'] }
            },
            example: {
                success: true,
                userId: '42',
                isOnline: true,
                lastSeen: '2024-01-10T16:38:43.105Z'
            }
        },
        400: {
            description: 'Bad request - missing userId',
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' }
            }
        },
        404: {
            description: 'User not found',
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' }
            }
        }
    }
};

const updateNicknameSchema = {
	description: 'Update the user\'s nickname',
	tags: ['profile'],
	body: {
		type: 'object',
		required: ['nickname'],
		properties: {
			nickname: { type: 'string', minLength: 3, maxLength: 20, description: 'New nickname for the user' }
		}
	},
	response: {
		200: {
			description: 'Nickname updated successfully',
			type: 'object',
			properties: {
				success: { type: 'boolean' },
				message: { type: 'string' }
			},
			example: {
				success: true,
				message: 'Nickname updated successfully'
			}
		},
		400: {
			description: 'Invalid nickname provided',
			type: 'object',
			properties: {
				success: { type: 'boolean' },
				message: { type: 'string' }
			},
			example: {
				success: false,
				message: 'Nickname must be between 3 and 20 characters long'
			}
		},
		401: {
			description: 'User not authenticated',
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
				message: { type: 'string' }
			},
			example: {
				success: false,
				message: 'Failed to update nickname due to server error'
			}
		}
	}
};

const updatePasswordSchema = {
	description: 'Update the user\'s password',
	tags: ['profile'],
	body: {
		type: 'object',
		required: ['oldPassword', 'newPassword'],
		properties: {
			oldPassword: { type: 'string', minLength: 6, description: 'Current password of the user' },
			newPassword: { type: 'string', minLength: 6, description: 'New password for the user' }
		}
	},
	response: {
		200: {
			description: 'Password updated successfully',
			type: 'object',
			properties: {
				success: { type: 'boolean' },
				message: { type: 'string' }
			},
			example: {
				success: true,
				message: 'Password updated successfully'
			}
		},
		400: {
			description: 'Invalid password data provided',
			type: 'object',
			properties: {
				success: { type: 'boolean' },
				message: { type: 'string' }
			},
			example: {
				success: false,
				message: 'Invalid password data provided'
			}
		},
		401: {
			description: 'User not authenticated',
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
				message: { type: 'string' }
			},
			example: {
				success: false,
				message:'Failed to update password due to server error'
			}
		}
	}
};

module.exports = {
    profileSchema,
    uploadAvatarSchema,
    fetchUserAvatarSchema,
    getUserOnlineStatusSchema,
	updateNicknameSchema,
	updatePasswordSchema,
};