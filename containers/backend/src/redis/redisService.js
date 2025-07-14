// redisService.js - Complete fixed version
const { createClient } = require('redis');

class RedisService {
    constructor(redisUrl) {
        this.client = createClient({ url: redisUrl });
        this.subscriber = createClient({ url: redisUrl });
    }

    async connect() {
        try {
            await this.client.connect();
            await this.subscriber.connect();
            console.log('Connected to Redis');
            return true;
        } catch (error) {
            console.error('Failed to connect to Redis:', error);
            return false;
        }
    }

    // Game management methods
    async createGame(gameId, gameData) {
        try {
            await this.client.set(`game:${gameId}`, JSON.stringify(gameData));
            await this.client.expire(`game:${gameId}`, 3600);
            console.log(`Game ${gameId} created in Redis`);
            return true;
        } catch (error) {
            console.error('Error creating game:', error);
            return false;
        }
    }

    async getGameData(gameId) {
        try {
            const gameData = await this.client.get(`game:${gameId}`);
            if (gameData) {
                return JSON.parse(gameData);
            }
            return null;
        } catch (error) {
            console.error('Error getting game data:', error);
            return null;
        }
    }

    async updateGame(gameId, gameData) {
        try {
            await this.client.set(`game:${gameId}`, JSON.stringify(gameData));
            console.log(`Game ${gameId} updated in Redis`);
            return true;
        } catch (error) {
            console.error('Error updating game:', error);
            return false;
        }
    }

    async deleteGame(gameId) {
        try {
            await this.client.del(`game:${gameId}`);
            console.log(`Game ${gameId} deleted from Redis`);
            return true;
        } catch (error) {
            console.error('Error deleting game:', error);
            return false;
        }
    }

    async findWaitingGame(gameType) {
        try {
            const gameKeys = await this.client.keys('game:*');
            
            for (const key of gameKeys) {
                const gameData = await this.client.get(key);
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
            const gameData = await this.getGameData(gameId);
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

    async subscribeToChatMessages(callback) {
        try {
            await this.subscriber.subscribe('chat', callback);
            return true;
        } catch (error) {
            console.error('Error subscribing to chat:', error);
            return false;
        }
    }

    async publishChatMessage(message) {
        try {
            return await this.client.publish('chat', message);
        } catch (error) {
            console.error('Error publishing chat message:', error);
            return false;
        }
    }

    async disconnect() {
        try {
            await this.client.disconnect();
            await this.subscriber.disconnect();
            console.log('Disconnected from Redis');
            return true;
        } catch (error) {
            console.error('Error disconnecting from Redis:', error);
            return false;
        }
    }

    async cleanupExpiredGames() {
      try {
          const cutoffTime = Date.now() - (5 * 60 * 1000); // 5 minutes
          const gameKeys = await this.client.keys('game:*');
          
          for (const key of gameKeys) {
              const gameData = await this.client.get(key);
              if (gameData) {
                  const parsedGame = JSON.parse(gameData);
                  
                  if (parsedGame.status === 'waiting' && 
                      new Date(parsedGame.createdAt).getTime() < cutoffTime) {
                      await this.client.del(key);
                      console.log(`Cleaned up expired game: ${parsedGame.gameId}`);
                  }
              }
          }
      } catch (error) {
          console.error('Error cleaning up expired games:', error);
      }
    }

    async getWaitingGames(gameType) {
        try {
            const gameKeys = await this.client.keys('game:*');
            const waitingGames = [];
            
            for (const key of gameKeys) {
                const gameData = await this.client.get(key);
                if (gameData) {
                    const parsedGame = JSON.parse(gameData);
                    
                    if (parsedGame.status === 'waiting' && 
                        parsedGame.gameType === gameType && 
                        !parsedGame.guestId) {
                        waitingGames.push(parsedGame.gameId);
                    }
                }
            }
            
            return waitingGames;
        } catch (error) {
            console.error('Error getting waiting games:', error);
            return [];
        }
    }
    
    async setGameData(gameId, gameData) {
        try {
            await this.client.set(`game:${gameId}`, JSON.stringify(gameData));
            await this.client.expire(`game:${gameId}`, 3600); // 1 hour expiry
            console.log(`Game ${gameId} data set in Redis`);
            return true;
        } catch (error) {
            console.error('Error setting game data:', error);
            return false;
        }
    }
}

module.exports = RedisService;