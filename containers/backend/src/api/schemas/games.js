const saveGameSchema = {
    description: 'Save a completed game to the database with player scores and winner information',
    tags: ['games'],
    body: {
        type: 'object',
        required: [
            'player1_id',
            'player2_id',
            'player1_name',
            'player2_name',
            'player1_score',
            'player2_score',
            'winner_name',
            'player1_is_ai',
            'player2_is_ai',
            'game_mode',
            'is_tournament',
            'smart_contract_link',
            'contract_address'
        ],
        properties: {
            player1_id: { type: 'number', description: 'ID of player 1' },
            player2_id: { type: 'number', description: 'ID of player 2' },
            winner_id: { type: 'number', description: 'ID of the winning player, 0 for tie' },
            player1_name: { type: 'string', description: 'Name of player 1' },
            player2_name: { type: 'string', description: 'Name of player 2' },
            player1_score: { type: 'number', minimum: 0, description: 'Score of player 1' },
            player2_score: { type: 'number', minimum: 0, description: 'Score of player 2' },
            winner_name: { type: 'string', description: 'Name of the winning player' },
            player1_is_ai: { type: 'boolean', description: 'Whether player 1 is AI' },
            player2_is_ai: { type: 'boolean', description: 'Whether player 2 is AI' },
            game_mode: { type: 'string', description: 'Mode of the game' },
            is_tournament: { type: 'boolean', description: 'Whether the game is part of a tournament' },
            smart_contract_link: { type: 'string', description: 'Link to the smart contract' },
            contract_address: { type: 'string', description: 'Address of the smart contract' }
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
                    },
					{
                        id_game: 42,
                        player1_name: 'Hugo',
                        player1_score: 11,
                        player2_name: 'Nicolas',
                        player2_score: 3,
                        winner_name: 'Hugo',
                        created_at: '2025-01-08T16:20:36.331Z'
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
                message: 'Failed to retrieve games'
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
    tags: ['blockchain'],
    response: {
        200: {
            description: 'Contract deployed successfully',
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                contractAddress: { type: 'string', description: 'Address of the deployed smart contract' },
				explorerLink: { type: 'string', description: 'Blockchain explorer link for the contract' },
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
                explorerLink: 'https://etherscan.io/address/0x1234567890abcdef1234567890abcdef12345678',
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

const getGamesHistorySchema = {
    description: 'Retrieve paginated game history for the current user',
    tags: ['games'],
    querystring: {
        type: 'object',
        properties: {
            page: { 
                type: 'integer', 
                minimum: 0, 
                default: 0,
                description: 'Page number (0-based)' 
            },
            limit: { 
                type: 'integer', 
                minimum: 1, 
                maximum: 50, 
                default: 10,
                description: 'Number of games per page (max 50)' 
            }
        }
    },
    response: {
        200: {
            description: 'Games history retrieved successfully',
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                games: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id_game: { type: 'number', description: 'Game ID' },
                            created_at: { type: 'string', description: 'Game creation timestamp' },
                            is_tournament: { type: 'boolean', description: 'Whether game was part of a tournament' },
                            player1_id: { type: 'number', description: 'Player 1 user ID' },
                            player2_id: { type: 'number', description: 'Player 2 user ID' },
                            winner_id: { type: ['number', 'null'], description: 'Winner user ID' },
                            player1_name: { type: 'string', description: 'Player 1 username' },
                            player2_name: { type: 'string', description: 'Player 2 username' },
                            player1_score: { type: 'number', description: 'Player 1 final score' },
                            player2_score: { type: 'number', description: 'Player 2 final score' },
                            winner_name: { type: ['string', 'null'], description: 'Winner username' },
                            player1_is_ai: { type: 'boolean', description: 'Whether player 1 is AI' },
                            player2_is_ai: { type: 'boolean', description: 'Whether player 2 is AI' },
                            game_mode: { type: ['string', 'null'], description: 'Game mode (Classic, Tournament, etc.)' },
                            smart_contract_link: { type: ['string', 'null'], description: 'Smart contract URL if available' },
                            contract_address: { type: ['string', 'null'], description: 'Smart contract address if available' }
                        }
                    }
                },
                total: { type: 'number', description: 'Total number of games for this user' },
                page: { type: 'number', description: 'Current page number' },
                limit: { type: 'number', description: 'Games per page limit' },
                totalPages: { type: 'number', description: 'Total number of pages' },
                hasNext: { type: 'boolean', description: 'Whether there are more pages' },
                hasPrev: { type: 'boolean', description: 'Whether there are previous pages' }
            },
            example: {
                success: true,
                games: [
                    {
                        id_game: 45,
                        created_at: '2025-01-15T14:30:00.000Z',
                        is_tournament: false,
                        player1_id: 12,
                        player2_id: 15,
                        winner_id: 12,
                        player1_name: 'john_doe',
                        player2_name: 'jane_smith',
                        player1_score: 11,
                        player2_score: 7,
                        winner_name: 'john_doe',
                        player1_is_ai: false,
                        player2_is_ai: false,
                        game_mode: 'Classic',
                        smart_contract_link: 'https://etherscan.io/tx/0x123...',
                        contract_address: '0xabc123...'
                    },
                    {
                        id_game: 44,
                        created_at: '2025-01-15T13:15:00.000Z',
                        is_tournament: true,
                        player1_id: 12,
                        player2_id: 18,
                        winner_id: 18,
                        player1_name: 'john_doe',
                        player2_name: 'ai_opponent',
                        player1_score: 8,
                        player2_score: 11,
                        winner_name: 'ai_opponent',
                        player1_is_ai: false,
                        player2_is_ai: true,
                        game_mode: 'Tournament',
                        smart_contract_link: null,
                        contract_address: null
                    }
                ],
                total: 25,
                page: 0,
                limit: 10,
                totalPages: 3,
                hasNext: true,
                hasPrev: false
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
                message: 'Authentication required. Please log in to view game history.'
            }
        },
        404: {
            description: 'No games found for user',
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                games: { 
                    type: 'array',
                    items: {}
                },
                total: { type: 'number' }
            },
            example: {
                success: true,
                message: 'No games found for this user',
                games: [],
                total: 0,
                page: 0,
                limit: 10,
                totalPages: 0,
                hasNext: false,
                hasPrev: false
            }
        },
        500: {
            description: 'Server error',
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                error: { type: 'string' }
            },
            example: {
                success: false,
                message: 'Failed to fetch game history',
                error: 'Database connection error'
            }
        }
    }
};

const saveResultsSchema = {
	description: 'Saves a game result with detailed player statistics',
	tags: ['games'],
    body: {
      type: 'object',
      required: ['gameData'],
      properties: {
        gameData: {
          type: 'object',
          properties: {
            gameId: { type: 'string' },
            config: { type: 'object' },
            createdAt: { type: 'string' },
            endedAt: { type: 'string' },
            generalResult: { type: 'string' },
            winner: { type: ['string', 'null'] },
            finalScore: {
              type: 'object',
              properties: {
                leftPlayer: { type: 'number' },
                rightPlayer: { type: 'number' }
              }
            },
            leftPlayer: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                score: { type: 'number' },
                result: { type: ['string', 'null'] },
                hits: { type: 'number' },
                goalsInFavor: { type: 'number' },
                goalsAgainst: { type: 'number' },
                powerupsPicked: { type: 'number' },
                powerdownsPicked: { type: 'number' },
                ballchangesPicked: { type: 'number' }
              }
            },
            rightPlayer: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                score: { type: 'number' },
                result: { type: ['string', 'null'] },
                hits: { type: 'number' },
                goalsInFavor: { type: 'number' },
                goalsAgainst: { type: 'number' },
                powerupsPicked: { type: 'number' },
                powerdownsPicked: { type: 'number' },
                ballchangesPicked: { type: 'number' }
              }
            }
          }
        }
      }
    }
  };

  const getUserDataSchema = {
	description: 'Get user profile and statistics by userId',
	tags: ['games'],
	body: {
	  type: 'object',
	  required: ['userId'],
	  properties: {
		userId: { type: 'string', description: 'User ID to fetch data for' }
	  }
	},
	response: {
	  200: {
		description: 'User data retrieved successfully',
		type: 'object',
		properties: {
		  success: { type: 'boolean' },
		  userData: {
			type: 'object',
			properties: {
			  id: { type: 'string', description: 'User ID' },
			  name: { type: 'string', description: 'Username or display name' },
			  avatar: { type: 'string', description: 'Avatar identifier or URL' },
			  goalsScored: { type: 'number', description: 'Total goals scored' },
			  goalsConceded: { type: 'number', description: 'Total goals conceded' },
			  tournaments: { type: 'number', description: 'Tournaments won' },
			  wins: { type: 'number', description: 'Total wins' },
			  losses: { type: 'number', description: 'Total losses' },
			  draws: { type: 'number', description: 'Total draws' },
			  rank: { type: 'number', description: 'Calculated rank' }
			}
		  }
		},
		example: {
		  success: true,
		  userData: {
			id: '42',
			name: 'eva',
			avatar: 'avatar1.png',
			goalsScored: 10,
			goalsConceded: 5,
			tournaments: 2,
			wins: 7,
			losses: 2,
			draws: 1,
			rank: 123
		  }
		}
	  },
	  400: {
		description: 'Missing userId in request body',
		type: 'object',
		properties: {
		  success: { type: 'boolean' },
		  message: { type: 'string' }
		},
		example: {
		  success: false,
		  message: 'userId is required'
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
		description: 'Server/database error',
		type: 'object',
		properties: {
		  success: { type: 'boolean' },
		  message: { type: 'string' },
		  error: { type: 'string' }
		},
		example: {
		  success: false,
		  message: 'Database error occurred',
		  error: 'SQLITE_ERROR: ...'
		}
	  }
	}
  };

module.exports = {
    saveGameSchema,
    retrieveGamesSchema,
    retrieveLastGameSchema,
    deployContractSchema,
	getGamesHistorySchema,
    saveResultsSchema,
	getUserDataSchema
};