import { Application, Graphics, Text } from 'pixi.js';
import { WebSocketManager } from '../network/WebSocketManager';

async function initGame(canvas: HTMLCanvasElement, gameId: string, isHost: boolean) {

  let playerNumber = 0;

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

  // Create game objects (ball, paddles, etc.)
  const ball = new Graphics();
  ball.beginFill(0xFFFFFF);
  ball.drawCircle(0, 0, 10);
  ball.endFill();
  app.stage.addChild(ball);

  const paddle1 = new Graphics();
  paddle1.beginFill(0xFFFFFF);
  paddle1.drawRect(-10, -50, 20, 100);
  paddle1.endFill();
  paddle1.x = 30;
  paddle1.y = 250;
  app.stage.addChild(paddle1);

  const paddle2 = new Graphics();
  paddle2.beginFill(0xFFFFFF);
  paddle2.drawRect(-10, -50, 20, 100);
  paddle2.endFill();
  paddle2.x = 1470;
  paddle2.y = 250;
  app.stage.addChild(paddle2);

	ball.x = 750;
	ball.y = 250;
	paddle1.x = 30;
	paddle1.y = 250;
	paddle2.x = 1470;
	paddle2.y = 250;


	let testTick = 0;
	const testInterval = setInterval(() => {
	testTick++;
	ball.x = 750 + Math.sin(testTick/10) * 300;
	ball.y = 250 + Math.cos(testTick/10) * 100;
	}, 1000/60);


	  app.ticker.add(() => {
    // This function is called every frame
    // No need to do anything here, just having the ticker active
    // ensures PIXI keeps rendering the stage
  });
  
  // Initialize WebSocket connection
  const wsManagerPong = WebSocketManager.getInstance(sessionStorage.getItem('username') ?? 'undefined');

  // IMPORTANT: Register handlers BEFORE connecting
 wsManagerPong.registerHandler('GAME_START', () => {
    console.log('Game started!');
  });

  wsManagerPong.registerHandler('PLAYER_ASSIGNED', (message) => {
    playerNumber = message.playerNumber;
    console.log('Server assigned player number:', playerNumber);
  });

 wsManagerPong.registerHandler('PLAYER_DISCONNECTED', () => {
    console.log('Other player disconnected');
  });
  
 wsManagerPong.registerHandler('GAME_STATE_UPDATE', (message) => {
    if (testInterval) {
      clearInterval(testInterval);
      console.log('Clearing test animation, real game state arrived');
	  }
	// Extract the actual game state data (handle both possible structures)
	const gameState = message.data || message;

	if (gameState && gameState.ball) {
	ball.x = gameState.ball.x;
	ball.y = gameState.ball.y;
	}

	if (gameState && gameState.paddle1) {
	paddle1.y = gameState.paddle1.y;
	}

	if (gameState && gameState.paddle2) {
	paddle2.y = gameState.paddle2.y;
	}

	// Force a render update
	app.renderer.render(app.stage);
	});

  // Now connect after registering handlers
  try {
    await wsManagerPong.connect(gameId);
    console.log('Connected to game session');

    // Handle keyboard input
    document.addEventListener('keydown', (e) => {

      if ((playerNumber === 1 && (e.key === 'w' || e.key === 's')) || 
          (playerNumber === 2 && (e.key === 'ArrowUp' || e.key === 'ArrowDown'))) {
        
        const isUp = e.key === 'w' || e.key === 'ArrowUp';
        const dir = isUp ? -1 : 1;
        
        wsManagerPong.sendPaddleInput(playerNumber, dir);
      }
    });
    
    document.addEventListener('keyup', (e) => {
      if ((playerNumber === 1 && (e.key === 'w' || e.key === 's')) || 
          (playerNumber === 2 && (e.key === 'ArrowUp' || e.key === 'ArrowDown'))) {
        
        wsManagerPong.sendPaddleInput(playerNumber, 0);
      }
    });
  } catch (err) {
    console.error('Failed to connect to game session', err);
  }
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
	  initGame(canvas, gameId, !!isHost);
	} else {
	  console.error('Container element not found');
	}
}
  