const addFriendSchema = {
    description: 'Add a new friend by user ID. Users cannot add themselves as friends and cannot add the same user twice.',
    tags: ['friends'],
    body: {
        type: 'object',
        required: ['userId'],
        properties: {
            userId: { 
                type: 'number', 
                description: 'ID of the user to add as a friend'
            }
        }
    },
    response: {
        201: {
            description: 'Friend added successfully',
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                friend: {
                    type: 'object',
                    properties: {
                        userId: { type: 'number', description: 'ID of the added friend' },
                        username: { type: 'string', description: 'Username of the added friend' }
                    }
                }
            },
            example: {
                success: true,
                message: 'testuser added as friend',
                friend: {
                    userId: 42,
                    username: 'testuser'
                }
            }
        },
        400: {
            description: 'Bad request - missing username or already friends',
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' }
            },
            example: {
                success: false,
                message: 'Username is required'
            }
        },
        404: {
            description: 'User not found',
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
            description: 'Internal server error',
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

const removeFriendSchema = {
    description: 'Remove a friend by user ID. Only removes the friendship if it exists.',
    tags: ['friends'],
    body: {
        type: 'object',
        required: ['userId'],
        properties: {
            userId: { 
                type: 'number', 
                description: 'ID of the friend to remove' 
            }
        }
    },
    response: {
        200: {
            description: 'Friend removed successfully',
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' }
            },
            example: {
                success: true,
                message: 'testuser removed from friends'
            }
        },
        400: {
            description: 'Bad request - missing username',
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' }
            },
            example: {
                success: false,
                message: 'Username is required'
            }
        },
        404: {
            description: 'User not found or not friends',
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
            description: 'Internal server error',
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

const getFriendsSchema = {
    description: 'Retrieve the current user\'s friends list, ordered by most recently added first.',
    tags: ['friends'],
    response: {
        200: {
            description: 'Friends list retrieved successfully',
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                friends: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id_user: { type: 'number', description: 'Friend\'s user ID' },
                            username: { type: 'string', description: 'Friend\'s username' },
                            email: { type: 'string', description: 'Friend\'s email address' },
                            avatar_filename: { type: 'string', description: 'Friend\'s avatar filename' },
                            avatar_type: { type: 'string', description: 'Friend\'s avatar file type' },
                            created_at: { type: 'string', description: 'Timestamp when friendship was created' }
                        }
                    }
                }
            },
            example: {
                success: true,
                friends: [
                    {
                        id_user: 42,
                        username: 'testuser',
                        email: 'test@example.com',
                        avatar_filename: 'avatar_42.jpg',
                        avatar_type: 'image/jpeg',
                        created_at: '2024-01-15T10:30:00.000Z'
                    },
                    {
                        id_user: 43,
                        username: 'anotheruser',
                        email: 'another@example.com',
                        avatar_filename: null,
                        avatar_type: null,
                        created_at: '2024-01-14T15:45:00.000Z'
                    }
                ]
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
                message: 'Internal server error'
            }
        }
    }
};

const checkFriendshipSchema = {
    description: 'Check if the current user is friends with another user by username.',
    tags: ['friends'],
    params: {
        type: 'object',
        required: ['username'],
        properties: {
            username: { 
                type: 'string', 
                description: 'Username to check friendship status with' 
            }
        }
    },
    response: {
        200: {
            description: 'Friendship status retrieved successfully',
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                isFriend: { type: 'boolean', description: 'Whether users are friends' }
            },
            example: {
                success: true,
                isFriend: true
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
                message: 'Internal server error'
            }
        }
    }
};

module.exports = {
    addFriendSchema,
    removeFriendSchema,
    getFriendsSchema,
    checkFriendshipSchema
};