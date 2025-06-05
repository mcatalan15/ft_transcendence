const saveGameSchema = {
	tags: ['games'],
    body: {
        type: 'object',
        required: ['player1_score', 'player2_score'],
        properties: {
            player1_score: { type: 'number', minimum: 0 },
            player2_score: { type: 'number', minimum: 0 }
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

module.exports = {
	saveGameSchema,
};