const WebSocket = require('ws');

function setupWebSocketServers() {
  const wss = new WebSocket.Server({ noServer: true });
  const gameWss = new WebSocket.Server({ noServer: true });
  
  return { wss, gameWss };
}

function handleUpgrade(wss, gameWss, server) {
  server.on('upgrade', (request, socket, head) => {
    const { pathname } = new URL(request.url, 'http://localhost');
    console.log(`WebSocket upgrade request for: ${pathname}`);

    if (pathname === '/ws') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
    else if (pathname.startsWith('/ws/socket/game')) {
      gameWss.handleUpgrade(request, socket, head, (ws) => {
        const segments = pathname.split('/');
        const gameId = segments.length >= 5 ? segments[4] : undefined;
        console.log(`Game websocket connection with ID: ${gameId}`);
        
        // Store gameId in the WebSocket instance for later access
        ws.gameId = gameId;
        
        // Emit connection with gameId as third parameter
        gameWss.emit('connection', ws, request, { gameId });
      });
    }
    else {
      console.log('Unknown WebSocket path:', pathname);
      socket.destroy();
    }
  });
}

module.exports = {
  setupWebSocketServers,
  handleUpgrade
};