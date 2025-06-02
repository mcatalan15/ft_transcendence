const { createClient } = require('redis');

class RedisService {
  constructor(redisUrl) {
    this.redisUrl = redisUrl;
    this.publisher = null;
    this.subscriber = null;
  }

  async connect() {
    this.publisher = createClient({ url: this.redisUrl });
    this.subscriber = this.publisher.duplicate();

    try {
      await this.publisher.connect();
      await this.subscriber.connect();
      console.log('Connected to Redis');
      
      await this.publisher.set('games:active', '0');
      const oldGames = await this.publisher.keys('game:*');
      if (oldGames.length > 0) {
        await this.publisher.del(oldGames);
      }
      return true;
    } catch (err) {
      console.error('Redis connection failed:', err);
      return false;
    }
  }

  async createGame(gameId, hostId) {
    return await this.publisher.setEx(`game:${gameId}`, 3600, JSON.stringify({
      hostId: hostId,
      status: 'waiting',
      created: Date.now()
    }));
  }

  async getGame(gameId) {
    const gameData = await this.publisher.get(`game:${gameId}`);
    return gameData ? JSON.parse(gameData) : null;
  }

  async updateGame(gameId, gameData) {
    return await this.publisher.set(`game:${gameId}`, JSON.stringify(gameData));
  }

  async deleteGame(gameId) {
    return await this.publisher.del(`game:${gameId}`);
  }

  async subscribeToChatMessages(callback) {
    await this.subscriber.subscribe('chat', callback);
  }

  async publishChatMessage(message) {
    return await this.publisher.publish('chat', message);
  }
}

module.exports = RedisService;