import { Application } from 'pixi.js';
/* import { PongGame } from '../pong/engine/Game';
 */import { WebSocketManager } from '../network/WebSocketManager';

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

		/* const game = new PongGame(app);
  
		// Initialize WebSocket connection
		const wsManager = new WebSocketManager(sessionStorage.getItem('username') ?? 'undefined');

		wsManager.connect(gameId).then(() => {
		  console.log('Connected to game session');
		  
		  const isLeftPaddle = isHost;
		  
		  wsManager.registerHandler('GAME_STATE_UPDATE', (data) => {
			console.log('Game state update received:', data);
			game.updateState(data.player1Position, data.player2Position);
		  });
		  
		  wsManager.registerHandler('PADDLE_INPUT', (data) => {
			console.log('Paddle input received:', data);
			game.updateState(data.player1Position, data.player2Position);
		  });
		  
		  wsManager.registerHandler('GAME_START', () => {
			console.log('Game started');
			game.start();
		  });
		  
		  wsManager.registerHandler('PLAYER_DISCONNECTED', () => {
			// Show message and handle gracefully
		  });
		  
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
		}); */
	
  }
  
  export function showPong(container: HTMLElement, gameId: string, isHost: boolean): void {
	const gameDiv = document.createElement('div');
	gameDiv.innerHTML = `
	  <h2>Pong</h2>
	  <canvas id="game-canvas" width="1500" height="500"></canvas>
	  <button onclick="navigate('/home')">Back home</button>
	`;
	container.appendChild(gameDiv);
  
	let canvas = document.getElementById('game-canvas') as HTMLCanvasElement | null;

	if (canvas) {
	  console.log('Game should start now');
	  initGame(canvas, gameId, !!isHost);
	} else {
	  console.error('Container element not found');
	}
  }
  