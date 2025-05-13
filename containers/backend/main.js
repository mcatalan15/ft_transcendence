const serverConfig = require('./config/serverConfiguration');
const { buildApp } = require('./app');
const { db } = require('./api/db/database');
const { createServer } = require('http');
const { createClient } = require('redis');
const WebSocket = require('ws');

const redisUrl = process.env.REDIS_URL || 'redis://redis:6379';

async function startServer() {
  const app = buildApp();

  const redisPublisher = createClient({ url: redisUrl });
  const redisSubscriber = redisPublisher.duplicate();

  try {
    await redisPublisher.connect();
    await redisSubscriber.connect();
    console.log('Connected to Redis');
  } catch (err) {
    console.error('Redis connection failed:', err);
    process.exit(1);
  }

  // Create WebSocket server
  const wss = new WebSocket.Server({ noServer: true });

  wss.on('connection', (ws) => {
    console.log('WebSocket connection established');

    ws.on('message', async (message) => {
      await redisPublisher.publish('chat', message.toString());
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });
  });

  const nodeServer = createServer();

  // Register Fastify with the existing HTTP server
  await app.listen({ server: nodeServer, host: serverConfig.ADDRESS, port: serverConfig.PORT });
  // Handle WebSocket upgrades
  nodeServer.on('upgrade', (request, socket, head) => {
    if (request.url === '/ws') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  // Redis message subscription
  await redisSubscriber.subscribe('chat', (message) => {
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach(signal => {
    process.on(signal, () => serverConfig.gracefulShutdown(app, db, signal));
  });
}

startServer().catch(err => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
