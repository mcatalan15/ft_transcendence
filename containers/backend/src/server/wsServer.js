const WebSocket = require('ws');

function setupWebSocketServers() {
  const wss = new WebSocket.Server({ noServer: true });
  const gameWss = new WebSocket.Server({ noServer: true });
  
  return { wss, gameWss };
}

function handleUpgrade(wss, gameWss, server) {
	server.on('upgrade', (request, socket, head) => {
	  console.log(`WebSocket upgrade request URL: ${request.url}`);
	  
	  const pathname = request.url.split('?')[0];
	  console.log(`WebSocket upgrade request for: ${pathname}`);
  
	  if (pathname === '/ws') {
		console.log('Handling /ws WebSocket connection');
		wss.handleUpgrade(request, socket, head, (ws) => {
		  wss.emit('connection', ws, request);
		});
	  }
	  else if (pathname.startsWith('/socket/game') || pathname.startsWith('/ws/socket/game')) {
		console.log('Handling game WebSocket connection');
		gameWss.handleUpgrade(request, socket, head, (ws) => {
		  const segments = pathname.replace('/ws', '').split('/');
		  const gameId = segments.length >= 3 ? segments[2] : undefined;
		  console.log(`Game websocket connection with ID: ${gameId}`);
		  
		  ws.gameId = gameId;
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