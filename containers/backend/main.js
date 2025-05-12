const serverConfig = require('./config/serverConfiguration');
const buildApp = require('./app');
const { db } = require('./api/db/database');

import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { createClient } from 'redis';

const app = buildApp();

const server = createServer(app);
const wss = new WebSocketServer({ server });

['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach(signal => {
  process.on(signal, () => serverConfig.gracefulShutdown(app, db, signal));
});

const redisPublisher = createClient({ url: 'redis://redis:6379' });
const redisSubscriber = redisPublisher.duplicate();

await redisPublisher.connect();
await redisSubscriber.connect();

// Subscribe to Redis channel for broadcasting messages
await redisSubscriber.subscribe('game-messages', (message) => {
  wss.clients.forEach(client => {
    if (client.readyState === client.OPEN) {
      client.send(message);
    }
  });
});

wss.on('connection', (ws) => {
  console.log('🟢 New WebSocket connection');

  ws.on('message', async (data) => {
    console.log('📨 Received:', data.toString());
    // Broadcast via Redis Pub/Sub
    await redisPublisher.publish('game-messages', data.toString());
  });

  ws.on('close', () => {
    console.log('🔴 WebSocket disconnected');
  });
});

// Graceful shutdown for WebSocket server
wss.on('close', () => {
  console.log('🔴 WebSocket server closed');
});


server = app.listen({ 
  host: serverConfig.ADDRESS, 
  port: serverConfig.PORT 
}, (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  app.log.info(`Server listening at ${address}`);
});