const findMatchmakingGameSchema = {
    description: 'Find an existing waiting game or create a new matchmaking session. If a waiting game of the specified type exists, the user will join it. Otherwise, a new game session will be created and the user will wait for an opponent.',
    tags: ['matchmaking'],
    body: {
        type: 'object',
        required: ['username', 'gameType'],
        properties: {
            username: { 
                type: 'string', 
                description: 'Username of the player looking for a match' 
            },
            gameType: { 
                type: 'string', 
                enum: ['1v1', 'tournament'],
                description: 'Type of game to find or create' 
            }
        }
    },
    response: {
        200: {
            description: 'Matchmaking successful - joined existing game',
            type: 'object',
            properties: {
                gameId: { type: 'string', description: 'ID of the game session' },
                opponent: { type: 'string', description: 'Username of the opponent' },
                role: { type: 'string', enum: ['guest'], description: 'Player role in the game' }
            },
            example: {
                gameId: 'game_1704469200000_abc123def',
                opponent: 'player1',
                role: 'guest'
            }
        },
        201: {
            description: 'New matchmaking session created - waiting for opponent',
            type: 'object',
            properties: {
                gameId: { type: 'string', description: 'ID of the created game session' },
                role: { type: 'string', enum: ['host'], description: 'Player role in the game' },
                waiting: { type: 'boolean', description: 'Indicates that the player is waiting for an opponent' }
            },
            example: {
                gameId: 'game_1704469200000_xyz789abc',
                role: 'host',
                waiting: true
            }
        },
        400: {
            description: 'Bad request - missing required fields',
            type: 'object',
            properties: {
                error: { type: 'string' }
            },
            example: {
                error: 'Missing username or gameType'
            }
        },
        401: {
            description: 'Unauthorized - user not authenticated',
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' }
            },
            example: {
                success: false,
                message: 'Authentication required'
            }
        },
        500: {
            description: 'Internal server error',
            type: 'object',
            properties: {
                error: { type: 'string' }
            },
            example: {
                error: 'Internal server error'
            }
        }
    }
};

const cancelMatchmakingSchema = {
    description: 'Cancel an active matchmaking session. Only the host of a waiting game session can cancel it. Once cancelled, the game session is removed and other players will not be able to join.',
    tags: ['matchmaking'],
    body: {
        type: 'object',
        required: ['username', 'gameId'],
        properties: {
            username: { 
                type: 'string', 
                description: 'Username of the player cancelling matchmaking' 
            },
            gameId: { 
                type: 'string', 
                description: 'ID of the game session to cancel' 
            }
        }
    },
    response: {
        200: {
            description: 'Matchmaking cancelled successfully',
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' }
            },
            example: {
                success: true,
                message: 'Matchmaking cancelled'
            }
        },
        400: {
            description: 'Bad request - missing required fields',
            type: 'object',
            properties: {
                error: { type: 'string' }
            },
            example: {
                error: 'Missing username or gameId'
            }
        },
        401: {
            description: 'Unauthorized - user not authenticated',
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' }
            },
            example: {
                success: false,
                message: 'Authentication required'
            }
        },
        404: {
            description: 'Game not found or not cancellable',
            type: 'object',
            properties: {
                error: { type: 'string' }
            },
            example: {
                error: 'Game not found or not cancellable'
            }
        },
        500: {
            description: 'Internal server error',
            type: 'object',
            properties: {
                error: { type: 'string' }
            },
            example: {
                error: 'Internal server error'
            }
        }
    }
};

module.exports = {
    findMatchmakingGameSchema,
    cancelMatchmakingSchema
};