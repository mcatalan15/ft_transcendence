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

  async createGame(gameId, gameData) {
    try {
      const result = await this.publisher.setEx(`game:${gameId}`, 3600, JSON.stringify(gameData));
      console.log(`Game ${gameId} saved to Redis:`, gameData);
      return result;
    } catch (error) {
      console.error(`Failed to save game ${gameId} to Redis:`, error);
      throw error;
    }
  }

  async findWaitingGame(gameType) {
    try {
      const gameKeys = await this.publisher.keys('game:*');
      
      for (const key of gameKeys) {
        const gameData = await this.publisher.get(key);
        if (gameData) {
          const parsedGame = JSON.parse(gameData);
          
          if (parsedGame.status === 'waiting' && 
              parsedGame.gameType === gameType && 
              !parsedGame.guestId) {
            return parsedGame;
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error finding waiting game:', error);
      return null;
    }
  }

  async setGameAsActive(gameId, hostId, guestId) {
    try {
      const gameData = await this.getGame(gameId);
      if (gameData) {
        gameData.guestId = guestId;
        gameData.status = 'active';
        gameData.matchedAt = new Date().toISOString();
        await this.updateGame(gameId, gameData);
        return gameData;
      }
      return null;
    } catch (error) {
      console.error('Error setting game as active:', error);
      return null;
    }
  }

  async cleanupExpiredGames() {
    try {
      const cutoffTime = Date.now() - (5 * 60 * 1000); // 5 minutes
      const gameKeys = await this.publisher.keys('game:*');
      
      for (const key of gameKeys) {
        const gameData = await this.publisher.get(key);
        if (gameData) {
          const parsedGame = JSON.parse(gameData);
          
          if (parsedGame.status === 'waiting' && 
              new Date(parsedGame.createdAt).getTime() < cutoffTime) {
            await this.publisher.del(key);
            console.log(`Cleaned up expired game: ${parsedGame.gameId}`);
          }
        }
      }
    } catch (error) {
      console.error('Error cleaning up expired games:', error);
    }
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