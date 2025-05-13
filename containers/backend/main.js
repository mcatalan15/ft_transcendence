const serverConfig = require('./config/serverConfiguration');
const { buildApp } = require('./app');
const { db } = require('./api/db/database');
const { createClient } = require('redis');
const { WebSocketServer } = require('ws');

const redisUrl = process.env.REDIS_URL || 'redis://redis:6380';

async function startServer() {
  const app = buildApp();

  const redisPublisher = createClient({ url: redisUrl });
  const redisSubscriber = redisPublisher.duplicate();

  try {
    await redisPublisher.connect();
    await redisSubscriber.connect();
    console.log('Connected to Redis');
  } catch (err) {
    console.error('Failed to connect to Redis:', err);
    process.exit(1);
  }

  const server = app.listen({
    host: serverConfig.ADDRESS,
    port: serverConfig.PORT
  }, (err, address) => {
    if (err) {
      app.log.error(err);
      process.exit(1);
    }
    app.log.info(`Server listening at ${address}`);
  });

  const wss = new WebSocketServer({ server });

  await redisSubscriber.subscribe('game-messages', (message) => {
    wss.clients.forEach(client => {
      if (client.readyState === client.OPEN) {
        client.send(message);
      }
    });
  });

  wss.on('connection', (ws) => {
    console.log('New WebSocket connection');

    ws.on('message', async (data) => {
      console.log('Received:', data.toString());
      await redisPublisher.publish('game-messages', data.toString());
    });

    ws.on('close', () => {
      console.log('WebSocket disconnected');
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
