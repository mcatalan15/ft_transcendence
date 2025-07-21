// const { type } = require("os");

const saveGameSchema = {
    body: {
        type: 'object',
        required: ['gameData'],
        properties: {
            gameData: {
                type: 'object',
                required: ['config', 'createdAt', 'endedAt', 'finalScore', 'balls', 'leftPlayer', 'rightPlayer'],
                properties: {
                    config: {
                        type: 'object',
                        required: ['mode', 'classicMode', 'variant'],
                        properties: {
                            mode: { type: 'string', enum: ['local', 'online'] },
                            classicMode: { type: 'boolean' },
                            variant: { type: 'string', enum: ['1v1', '1vAI', 'tournament'] }
                        }
                    },
                    createdAt: { type: ['string', 'null'], format: 'date-time', description: 'Timestamp when the game was created' },
                    endedAt: { type: ['string', 'null'], format: 'date-time', description: 'Timestamp when the game ended' },
                    generalResult: { type: ['string', 'null'], enum: ['leftWin', 'rightWin', 'draw', null], default: null },
                    winner: { type: ['string', 'null'], default: null },
                    finalScore: {
                        type: 'object',
                        required: ['leftPlayer', 'rightPlayer'],
                        properties: {
                            leftPlayer: { type: 'number' },
                            rightPlayer: { type: 'number' }
                        }
                    },
                    balls: {
                        type: 'object',
                        required: ['defaultBalls', 'curveBalls', 'multiplyBalls', 'spinBalls', 'burstBalls'],
                        properties: {
                            defaultBalls: { type: 'number', minimum: 0 },
                            curveBalls: { type: 'number', minimum: 0 },
                            multiplyBalls: { type: 'number', minimum: 0 },
                            spinBalls: { type: 'number', minimum: 0 },
                            burstBalls: { type: 'number', minimum: 0 }
                        }
                    },
                    specialItems: {
                        type: 'object',
                        properties: {
                            bullets: { type: 'number', minimum: 0, default: 0 },
                            shields: { type: 'number', minimum: 0, default: 0 }
                        },
                        default: { bullets: 0, shields: 0 }
                    },
                    walls: {
                        type: 'object',
                        properties: {
                            pyramids: { type: 'number', minimum: 0, default: 0 },
                            escalators: { type: 'number', minimum: 0, default: 0 },
                            hourglasses: { type: 'number', minimum: 0, default: 0 },
                            lightnings: { type: 'number', minimum: 0, default: 0 },
                            maws: { type: 'number', minimum: 0, default: 0 },
                            rakes: { type: 'number', minimum: 0, default: 0 },
                            trenches: { type: 'number', minimum: 0, default: 0 },
                            kites: { type: 'number', minimum: 0, default: 0 },
                            bowties: { type: 'number', minimum: 0, default: 0 },
                            honeycombs: { type: 'number', minimum: 0, default: 0 },
                            snakes: { type: 'number', minimum: 0, default: 0 },
                            vipers: { type: 'number', minimum: 0, default: 0 },
                            waystones: { type: 'number', minimum: 0, default: 0 }
                        },
                        default: {
                            pyramids: 0, escalators: 0, hourglasses: 0, lightnings: 0,
                            maws: 0, rakes: 0, trenches: 0, kites: 0,
                            bowties: 0, honeycombs: 0, snakes: 0, vipers: 0, waystones: 0
                        }
                    },
                    leftPlayer: {
                        type: 'object',
                        required: ['id', 'name', 'isDisconnected', 'score', 'result', 'hits', 'goalsInFavor', 'goalsAgainst', 'powerupsPicked', 'powerdownsPicked', 'ballchangesPicked'],
                        properties: {
                            id: { type: 'string', description: 'Username of the left player' },
                            name: { type: 'string', description: 'Name of the left player' },
                            isDisconnected: { type: 'boolean', description: 'Whether the left player disconnected during the game' },
                            score: { type: 'number', minimum: 0 },
                            result: { type: ['string', 'null'], enum: ['win', 'lose', 'draw', null] },
                            hits: { type: 'number', minimum: 0 },
                            goalsInFavor: { type: 'number', minimum: 0 },
                            goalsAgainst: { type: 'number', minimum: 0 },
                            powerupsPicked: { type: 'number', minimum: 0 },
                            powerdownsPicked: { type: 'number', minimum: 0 },
                            ballchangesPicked: { type: 'number', minimum: 0 }
                        }
                    },
                    rightPlayer: {
                        type: 'object',
                        required: ['id', 'name', 'isDisconnected', 'score', 'result', 'hits', 'goalsInFavor', 'goalsAgainst', 'powerupsPicked', 'powerdownsPicked', 'ballchangesPicked'],
                        properties: {
                            id: { type: 'string', description: 'Username of the right player' },
                            name: { type: 'string', description: 'Name of the left player' },
                            isDisconnected: { type: 'boolean', description: 'Whether the left player disconnected during the game' },
                            score: { type: 'number', minimum: 0 },
                            result: { type: ['string', 'null'], enum: ['win', 'lose', 'draw', null] },
                            hits: { type: 'number', minimum: 0 },
                            goalsInFavor: { type: 'number', minimum: 0 },
                            goalsAgainst: { type: 'number', minimum: 0 },
                            powerupsPicked: { type: 'number', minimum: 0 },
                            powerdownsPicked: { type: 'number', minimum: 0 },
                            ballchangesPicked: { type: 'number', minimum: 0 }
                        }
                    },
                    is_tournament: { type: 'boolean', default: false },
                    smart_contract_link: { type: ['string', 'null'], default: '' },
                    contract_address: { type: ['string', 'null'], default: '' }
                }
            }
        }
    },
    response: {
        201: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' },
                gameId: { type: 'number' }
            }
        },
        400: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' }
            }
        },
        500: {
            type: 'object',
            properties: {
                success: { type: 'boolean' },
                message: { type: 'string' }
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
	description: 'Deploy a smart contract with specific game data to the blockchain',
	tags: ['blockchain'],
	body: {
		type: 'object',
		required: ['gameId', 'player1Name', 'player2Name', 'player1Score', 'player2Score'],
		properties: {
			gameId: {
				type: 'number',
				description: 'ID of the game to deploy contract for'
			},
			player1Name: {
				type: 'string',
				description: 'Name of player 1'
			},
			player2Name: {
				type: 'string',
				description: 'Name of player 2'
			},
			player1Score: {
				type: 'number',
				minimum: 0,
				description: 'Score of player 1'
			},
			player2Score: {
				type: 'number',
				minimum: 0,
				description: 'Score of player 2'
			}
		}
	},
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
			}
		},
		400: {
			description: 'Bad request - missing required data',
			type: 'object',
			properties: {
				success: { type: 'boolean' },
				error: { type: 'string' },
				details: { type: 'string' }
			}
		},
		500: {
			description: 'Deployment failed',
			type: 'object',
			properties: {
				success: { type: 'boolean' },
				error: { type: 'string' },
				details: { type: 'string' }
			}
		}
	}
};

const getGamesHistorySchema = {
    description: 'Retrieve paginated game history for the current user by ID',
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
                            player1_name: { type: ['string', 'null'], description: 'Player 1 username' },
                            player2_name: { type: ['string', 'null'], description: 'Player 2 username' },
                            winner_name: { type: ['string', 'null'], description: 'Winner username' },
                            player1_score: { type: 'number', description: 'Player 1 final score' },
                            player2_score: { type: 'number', description: 'Player 2 final score' },
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
                        player1_id: 3,
                        player2_id: 15,
                        winner_id: 3,
                        player1_name: 'mcatalan',
                        player2_name: 'jane_smith',
                        winner_name: 'mcatalan',
                        player1_score: 11,
                        player2_score: 7,
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
                        player1_id: 3,
                        player2_id: 18,
                        winner_id: 18,
                        player1_name: 'mcatalan',
                        player2_name: 'ai_opponent',
                        winner_name: 'ai_opponent',
                        player1_score: 8,
                        player2_score: 11,
                        player1_is_ai: false,
                        player2_is_ai: true,
                        game_mode: 'Tournament',
                        smart_contract_link: null,
                        contract_address: null
                    }
                ],
                total: 25,
                page: 0,
                limit: 8,
                totalPages: 4,
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
                limit: 8,
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

const saveTournamentResultsSchema = {
	description: 'Save tournament results and update participant statistics',
	tags: ['tournaments'],
	body: {
		type: 'object',
		required: ['tournamentConfig'],
		properties: {
			tournamentConfig: {
				type: 'object',
				required: ['isFinished', 'registeredPlayerData', 'tournamentWinner'],
				properties: {
					tournamentId: {
						type: ['string', 'number', 'null'],
						description: 'Tournament identifier'
					},
					isPrepared: { type: 'boolean' },
					isFinished: {
						type: 'boolean',
						description: 'Must be true to process results'
					},
					classicMode: { type: 'boolean' },
					currentPhase: {
						type: 'integer',
						minimum: 1,
						maximum: 4
					},
					currentMatch: {
						type: 'integer',
						minimum: 1,
						maximum: 8
					},
					registeredPlayerData: {
						type: 'object',
						properties: {
							player1Data: { type: ['object', 'null'] },
							player2Data: { type: ['object', 'null'] },
							player3Data: { type: ['object', 'null'] },
							player4Data: { type: ['object', 'null'] },
							player5Data: { type: ['object', 'null'] },
							player6Data: { type: ['object', 'null'] },
							player7Data: { type: ['object', 'null'] },
							player8Data: { type: ['object', 'null'] }
						}
					},
					tournamentWinner: {
						type: ['string', 'null'],
						description: 'Name of the tournament winner'
					}
				}
			}
		}
	},
	response: {
		200: {
			description: 'Tournament results saved successfully',
			type: 'object',
			properties: {
				success: { type: 'boolean' },
				message: { type: 'string' },
				updatedPlayers: { type: 'number' },
				tournamentWinner: { type: ['string', 'null'] }
			},
			example: {
				success: true,
				message: 'Tournament results saved successfully',
				updatedPlayers: 8,
				tournamentWinner: 'player1'
			}
		},
		400: {
			description: 'Bad request - invalid tournament data',
			type: 'object',
			properties: {
				success: { type: 'boolean' },
				message: { type: 'string' }
			},
			example: {
				success: false,
				message: 'Tournament must be finished to save results'
			}
		},
		500: {
			description: 'Server error',
			type: 'object',
			properties: {
				success: { type: 'boolean' },
				message: { type: 'string' },
				error: { type: 'string' }
			}
		}
	}
};

const getUserDataSchema = {
    description: 'Retrieve user data and statistics by user ID',
    tags: ['users'],
    body: {
        type: 'object',
        required: ['userId'],
        properties: {
            userId: { type: 'string', description: 'Unique identifier for the user' }
        }
    },
    response: {
        200: {
            description: 'User data retrieved successfully',
            type: 'object',
            properties: {
                success: { type: 'boolean', description: 'Indicates if the request was successful' },
                userData: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', description: 'User ID' },
                        name: { type: 'string', description: 'Username or display name' },
                        avatar: { type: 'string', description: 'User avatar identifier' },
                        goalsScored: { type: 'number', description: 'Total goals scored by the user' },
                        goalsConceded: { type: 'number', description: 'Total goals conceded by the user' },
                        tournaments: { type: 'number', description: 'Number of tournaments won' },
                        wins: { type: 'number', description: 'Number of matches won' },
                        losses: { type: 'number', description: 'Number of matches lost' },
                        draws: { type: 'number', description: 'Number of matches drawn' },
                        rank: { type: 'number', description: 'User rank' }
                    }
                }
            },
            example: {
                success: true,
                userData: {
                    id: '12345',
                    name: 'PLAYER',
                    avatar: 'avatarUnknown',
                    goalsScored: 10,
                    goalsConceded: 5,
                    tournaments: 2,
                    wins: 15,
                    losses: 3,
                    draws: 7,
                    rank: 42
                }
            }
        },
        400: {
            description: 'Bad request - missing userId',
            type: 'object',
            properties: {
                success: { type: 'boolean', description: 'Indicates if the request was successful' },
                message: { type: 'string', description: 'Error message' }
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
                success: { type: 'boolean', description: 'Indicates if the request was successful' },
                message: { type: 'string', description: 'Error message' }
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
                success: { type: 'boolean', description: 'Indicates if the request was successful' },
                message: { type: 'string', description: 'Error message' },
                error: { type: 'string', description: 'Detailed error message' }
            },
            example: {
                success: false,
                message: 'Database error occurred',
                error: 'Specific database error'
            }
        }
    }
};

const getUserByUsernameSchema = {
    description: 'Retrieve user data and statistics by username',
    tags: ['users'],
    body: {
        type: 'object',
        required: ['username'],
        properties: {
            username: { type: 'string', description: 'Username to search for' }
        }
    },
    response: {
        200: {
            description: 'User data retrieved successfully',
            type: 'object',
            properties: {
                success: { type: 'boolean', description: 'Indicates if the request was successful' },
                userData: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', description: 'User ID' },
                        name: { type: 'string', description: 'User display name' }, // Changed from 'username'
                        avatar: { type: 'string', description: 'User avatar URL' },
                        type: { type: 'string', enum: ['human', 'ai'], description: 'Player type' }, // Added
                        side: { type: 'string', enum: ['left', 'right'], description: 'Player side' }, // Added
                        goalsScored: { type: 'number', description: 'Total goals scored by the user' },
                        goalsConceded: { type: 'number', description: 'Total goals conceded by the user' },
                        tournaments: { type: 'number', description: 'Number of tournaments won' },
                        wins: { type: 'number', description: 'Number of matches won' },
                        losses: { type: 'number', description: 'Number of matches lost' },
                        draws: { type: 'number', description: 'Number of matches drawn' },
                        rank: { type: 'number', description: 'User rank' },
                        totalPlayers: { type: 'number', description: 'Total number of players (optional)' } // Added optional field
                    },
                    required: ['id', 'name', 'avatar', 'type', 'side', 'goalsScored', 'goalsConceded', 'tournaments', 'wins', 'losses', 'draws', 'rank'] // Updated required fields
                }
            },
            example: {
                success: true,
                userData: {
                    id: '12345',
                    name: 'player123', // Changed from 'username'
                    avatar: '/api/profile/avatar/12345?t=1234567890',
                    type: 'human', // Added
                    side: 'right', // Added
                    goalsScored: 10,
                    goalsConceded: 5,
                    tournaments: 2,
                    wins: 15,
                    losses: 3,
                    draws: 7,
                    rank: 42
                }
            }
        },
        400: {
            description: 'Bad request - missing username',
            type: 'object',
            properties: {
                success: { type: 'boolean', description: 'Indicates if the request was successful' },
                message: { type: 'string', description: 'Error message' }
            },
            example: {
                success: false,
                message: 'username is required'
            }
        },
        404: {
            description: 'User not found',
            type: 'object',
            properties: {
                success: { type: 'boolean', description: 'Indicates if the request was successful' },
                message: { type: 'string', description: 'Error message' }
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
                success: { type: 'boolean', description: 'Indicates if the request was successful' },
                message: { type: 'string', description: 'Error message' },
                error: { type: 'string', description: 'Detailed error message' }
            },
            example: {
                success: false,
                message: 'Database error occurred',
                error: 'Specific database error'
            }
        }
    }
};

module.exports = {
    saveGameSchema,
	saveTournamentResultsSchema,
    retrieveLastGameSchema,
    deployContractSchema,
	getGamesHistorySchema,
    saveResultsSchema,
	getUserDataSchema,
    getUserByUsernameSchema
};