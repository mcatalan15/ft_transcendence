const serverConfig = require('./config/serverConfiguration');
const { buildApp } = require('./config/app');
const { db } = require('./api/db/database');
const { setupWebSocketServers, handleUpgrade } = require('./server/wsServer');
const { setupChatWebSocket } = require('./websocket/chatSocket');
const { setupGameWebSocket } = require('./websocket/gameSocket');
const RedisService = require('./redis/redisService');
const GameManager = require('./game/gameManager');
const redisUrl = process.env.REDIS_URL || 'redis://redis:6379';
const onlineTracker = require('./utils/onlineTracker');
const { trackUserActivity } = require('./config/middleware/activityTracker');

async function startServer() {
  console.log('🔍 About to start main application...');
  
  console.log('🔍 Building app...');
  const app = buildApp();
  console.log('✅ App built successfully');
  
  console.log('🔍 Creating Redis service...');
  const redisService = new RedisService(redisUrl);
  console.log('✅ Redis service created');
  
  console.log('🔍 Connecting to Redis...');
  try {
      await redisService.connect();
      console.log('✅ Redis connected successfully');
  } catch (error) {
      console.error('❌ Failed to connect to Redis:', error);
      process.exit(1);
  }
  
  console.log('🔍 Decorating app with redisService...');
  app.decorate('redisService', redisService);
  console.log('✅ App decorated');

  console.log('🔍 Creating GameManager...');
  const gameManager = new GameManager();
  console.log('✅ GameManager created');
  
  console.log('🔍 Setting up WebSocket servers...');
  const { wss, gameWss } = setupWebSocketServers();
  console.log('✅ WebSocket servers created');
  
  onlineTracker.start();
  app.addHook('preHandler', trackUserActivity);

  app.decorate('notifyMatchmakingSuccess', (gameId, hostId, guestId) => {
    if (chatWss && chatWss.notifyMatchmakingSuccess) {
      chatWss.notifyMatchmakingSuccess(gameId, hostId, guestId);
    }
  });

  await app.listen({ host: serverConfig.ADDRESS, port: serverConfig.PORT });
  const nodeServer = app.server;
  
  handleUpgrade(wss, gameWss, nodeServer);
  const chatWss = setupChatWebSocket(wss, redisService, gameManager);
  setupGameWebSocket(gameWss, redisService, gameManager);

  // Set up periodic cleanup of expired games
  setInterval(() => {
    redisService.cleanupExpiredGames();
  }, 60000);


  ['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach(signal => {
    process.on(signal, () => serverConfig.gracefulShutdown(app, db, onlineTracker, signal));
  });
}

startServer().catch(err => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});