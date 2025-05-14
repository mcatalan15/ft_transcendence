import { Application } from 'pixi.js';
import { PongGame } from '../pong/engine/Game';
import { WebSocketManager } from '../network/WebSocketManager';

async function initGame(canvas: HTMLCanvasElement, gameId: string, isHost: boolean) {

		const app = new Application();
		await app.init({
		  view: canvas,
		  background: "#171717",
		  width: 1500,
		  height: 500,
		  antialias: false,
		  resolution: 2,
		  autoDensity: true,
		});

		const game = new PongGame(app);
  
		// Initialize WebSocket connection
		const wsManager = new WebSocketManager(sessionStorage.getItem('username') ?? 'undefined');
		wsManager.connect(gameId).then(() => {
		  console.log('Connected to game session');
		  
		  // Set up who controls which paddle based on host status
		  const isLeftPaddle = isHost;
		  
		  // Register handlers for game events
		  wsManager.registerHandler('GAME_STATE_UPDATE', (data) => {
			game.updateState(data.ballPosition, data.player1Position, data.player2Position);
		  });
		  
		  // Register handler for paddle input from opponent
		  wsManager.registerHandler('PADDLE_INPUT', (data) => {
			game.updateState(data.ballPosition, data.player1Position, data.player2Position);
		  });
		  
		  // Handle game starting
		  wsManager.registerHandler('GAME_START', () => {
			game.start();
		  });
		  
		  // Handle player disconnection
		  wsManager.registerHandler('PLAYER_DISCONNECTED', () => {
			// Show message and handle gracefully
		  });
		  
		  // Modify keyboard input to send over network
		  document.addEventListener('keydown', (e) => {
			if ((isLeftPaddle && (e.key === 'w' || e.key === 's')) || 
				(!isLeftPaddle && (e.key === 'ArrowUp' || e.key === 'ArrowDown'))) {
			  
			  const isUp = e.key === 'w' || e.key === 'ArrowUp';
			  wsManager.sendPaddleInput(isUp, !isUp);
			}
		  });
		  
		  document.addEventListener('keyup', (e) => {
			if ((isLeftPaddle && (e.key === 'w' || e.key === 's')) || 
				(!isLeftPaddle && (e.key === 'ArrowUp' || e.key === 'ArrowDown'))) {
			  
			  wsManager.sendPaddleInput(false, false);
			}
		  });
		  
		}).catch(err => {
		  console.error('Failed to connect to game session', err);
		});
	
  }
  
  export function showPong(container: HTMLElement): void {
	const gameDiv = document.createElement('div');
	gameDiv.innerHTML = `
	  <h2>Pong</h2>
	  <canvas id="game-canvas" width="1500" height="500"></canvas>
	  <button onclick="navigate('/home')">Back home</button>
	`;
	container.appendChild(gameDiv);
  
	let canvas = document.getElementById('game-canvas') as HTMLCanvasElement | null;

	if (canvas) {
	  initGame(canvas);
	} else {
	  console.error('Container element not found');
	}
  }
  