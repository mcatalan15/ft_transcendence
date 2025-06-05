const saveGameSchema = {
    description: 'Save a completed game to the database with player scores and winner information',
    tags: ['games'],
    body: {
        type: 'object',
        required: ['player1_name', 'player1_score', 'player2_name', 'player2_score', 'winner_name'],
        properties: {
            player1_name: { type: 'string', description: 'Name of player 1' },
            player1_score: { type: 'number', minimum: 0, description: 'Score of player 1' },
            player2_name: { type: 'string', description: 'Name of player 2' },
            player2_score: { type: 'number', minimum: 0, description: 'Score of player 2' },
            winner_name: { type: 'string', description: 'Name of the winning player' }
        }
    },
    response: {
        201: {
            description: 'Game saved successfully',
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                gameId: { type: 'number', description: 'ID of the saved game' }
            },
            example: {
                success: true,
                message: 'Game saved successfully',
                gameId: 123
            }
        },
        400: {
            description: 'Database constraint error',
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' }
            },
            example: {
                success: false,
                message: 'Database constraint error'
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
                message: 'Failed to save game'
            }
        }
    }
};

const retrieveGamesSchema = {
    description: 'Retrieve all games from the database, ordered by most recent first',
    tags: ['games'],
    response: {
        200: {
            description: 'Games retrieved successfully',
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                games: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id_game: { type: 'number', description: 'Game ID' },
                            player1_name: { type: 'string', description: 'Name of player 1' },
                            player1_score: { type: 'number', description: 'Score of player 1' },
                            player2_name: { type: 'string', description: 'Name of player 2' },
                            player2_score: { type: 'number', description: 'Score of player 2' },
                            winner_name: { type: 'string', description: 'Name of the winner' },
                            created_at: { type: 'string', description: 'Game creation timestamp' }
                        }
                    }
                }
            },
            example: {
                success: true,
                games: [
                    {
                        id_game: 123,
                        player1_name: 'Eva',
                        player1_score: 5,
                        player2_name: 'Marc',
                        player2_score: 3,
                        winner_name: 'Eva',
                        created_at: '2025-01-05T13:20:36.331Z'
                    }
                ]
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
                message: 'Failed to fetch games'
            }
        }
    }
};

const retrieveLastGameSchema = {
    description: 'Retrieve the most recently played game from the database',
    tags: ['games'],
    response: {
        200: {
            description: 'Latest game retrieved successfully',
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                game: {
                    type: 'object',
                    properties: {
                        id_game: { type: 'number', description: 'Game ID' },
                        player1_name: { type: 'string', description: 'Name of player 1' },
                        player1_score: { type: 'number', description: 'Score of player 1' },
                        player2_name: { type: 'string', description: 'Name of player 2' },
                        player2_score: { type: 'number', description: 'Score of player 2' },
                        winner_name: { type: 'string', description: 'Name of the winner' },
                        created_at: { type: 'string', description: 'Game creation timestamp' }
                    }
                }
            },
            example: {
                success: true,
                game: {
                    id_game: 123,
                    player1_name: 'Eva',
                    player1_score: 5,
                    player2_name: 'Marc',
                    player2_score: 3,
                    winner_name: 'Eva',
                    created_at: '2025-01-05T13:20:36.331Z'
                }
            }
        },
        404: {
            description: 'No games found',
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' }
            },
            example: {
                success: false,
                message: 'No games found'
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
                message: 'Failed to fetch latest game'
            }
        }
    }
};

const deployContractSchema = {
    description: 'Deploy a smart contract with the latest game data to the blockchain',
    tags: ['games', 'blockchain'],
    response: {
        200: {
            description: 'Contract deployed successfully',
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                contractAddress: { type: 'string', description: 'Address of the deployed smart contract' },
                gameData: {
                    type: 'object',
                    properties: {
                        player1_name: { type: 'string', description: 'Name of player 1' },
                        player1_score: { type: 'number', description: 'Score of player 1' },
                        player2_name: { type: 'string', description: 'Name of player 2' },
                        player2_score: { type: 'number', description: 'Score of player 2' }
                    }
                }
            },
            example: {
                success: true,
                contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
                gameData: {
                    player1_name: 'Eva',
                    player1_score: 5,
                    player2_name: 'Marc',
                    player2_score: 3
                }
            }
        },
        500: {
            description: 'Deployment failed',
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                error: { type: 'string', description: 'Error message' },
                details: { type: 'string', description: 'Additional error details' }
            },
            example: {
                success: false,
                error: 'No game data found in database',
                details: 'Check if database contains game data with player1_name, player1_score, player2_name, player2_score'
            }
        }
    }
};

module.exports = {
    saveGameSchema,
    retrieveGamesSchema,
    retrieveLastGameSchema,
    deployContractSchema
};