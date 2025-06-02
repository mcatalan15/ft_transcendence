const WebSocket = require('ws');

function setupChatWebSocket(wss, redisService) {
  wss.on('connection', (ws) => {
    console.log('WebSocket connection established');

    ws.on('message', async (message) => {
      await redisService.publishChatMessage(message.toString());
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });
  });

  // Subscribe to chat messages
  redisService.subscribeToChatMessages((message) => {
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  return wss;
}

module.exports = { setupChatWebSocket };