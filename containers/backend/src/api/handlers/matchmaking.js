async function findMatchmakingGameHandler(request, reply) {
	const { username, userId, gameType } = request.body;

	if (!username || userId || !gameType) {
		return reply.status(400).send({
			error: 'Missing username, userId or gameType'
		});
	}

	try {
		const redisService = request.server.redisService;
		const waitingGame = await redisService.findWaitingGame(gameType);

		if (waitingGame) {
			const updatedGame = await redisService.setGameAsActive(
				waitingGame.gameId,
				waitingGame.hostId,
				username
			);

			request.server.notifyMatchmakingSuccess(
				updatedGame.gameId,
				updatedGame.hostId,
				updatedGame.guestId
			);

			return reply.send({
				gameId: updatedGame.gameId,
				opponent: updatedGame.hostId,
				role: 'guest'
			});
		} else {
			const gameId = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
			const gameData = {
				gameId: gameId,
				hostId: username,
				guestId: null,
				status: 'waiting',
				gameType: gameType,
				createdAt: new Date().toISOString()
			};

			await redisService.createGame(gameId, gameData);

			return reply.send({
				gameId: gameId,
				role: 'host',
				waiting: true
			});
		}
	} catch (error) {
		console.error('Matchmaking error:', error);
		return reply.status(500).send({
			error: 'Internal server error'
		});
	}
}

async function cancelMatchmakingHandler(request, reply) {
	const { username, gameId } = request.body;

	if (!username || !gameId) {
		return reply.status(400).send({
			error: 'Missing username or gameId'
		});
	}

	try {
		const redisService = request.server.redisService;
		const gameData = await redisService.getGame(gameId);

		if (gameData && gameData.hostId === username && gameData.status === 'waiting') {
			await redisService.deleteGame(gameId);
			return reply.send({ success: true, message: 'Matchmaking cancelled' });
		} else {
			return reply.status(404).send({ error: 'Game not found or not cancellable' });
		}
	} catch (error) {
		console.error('Cancel matchmaking error:', error);
		return reply.status(500).send({
			error: 'Internal server error'
		});
	}
}

module.exports = {
	findMatchmakingGameHandler,
	cancelMatchmakingHandler
};