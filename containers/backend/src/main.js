const serverConfig = require('./config/serverConfiguration');
const { buildApp } = require('./config/app');
const { db } = require('./api/db/database');

const { setupWebSocketServers, handleUpgrade } = require('./server/wsServer');
const { setupChatWebSocket } = require('./websocket/chatSocket');
const { setupGameWebSocket } = require('./websocket/gameSocket');
const RedisService = require('./redis/redisService');
const GameManager = require('./game/gameManager');

const redisUrl = process.env.REDIS_URL || 'redis://redis:6379';

async function startServer() {
  const app = buildApp();
  
  const redisService = new RedisService(redisUrl);
  const redisConnected = await redisService.connect();
  if (!redisConnected) {
    process.exit(1);
  }
  
  const gameManager = new GameManager();
  
  const { wss, gameWss } = setupWebSocketServers();
  
  await app.listen({ host: serverConfig.ADDRESS, port: serverConfig.PORT });
  const nodeServer = app.server;
  
  handleUpgrade(wss, gameWss, nodeServer);
  
  setupChatWebSocket(wss, redisService);
  setupGameWebSocket(gameWss, redisService, gameManager);
  
  ['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach(signal => {
    process.on(signal, () => serverConfig.gracefulShutdown(app, db, signal));
  });
}

startServer().catch(err => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});