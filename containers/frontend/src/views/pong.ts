import { Application, Graphics, Text } from 'pixi.js';
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
	console.log('Test animation tick');
	}, 1000/60);


	  app.ticker.add(() => {
    // This function is called every frame
    // No need to do anything here, just having the ticker active
    // ensures PIXI keeps rendering the stage
  });

  const testButton = document.createElement('button');
testButton.textContent = 'Test Handler';
testButton.style.position = 'absolute';
testButton.style.top = '10px';
testButton.style.right = '10px';
testButton.style.zIndex = '1000';
testButton.onclick = () => {
  console.log('🧪 Testing handler manually');
  
  // Clear test animation
  if (testInterval) {
    clearInterval(testInterval);
    console.log('Cleared test animation');
  }
  
  // Force the handler to run with test data
  const testData = {
    ball: { x: 200, y: 200 },
    paddle1: { y: 150 },
    paddle2: { y: 350 }
  };
  
  console.log('📝 Setting test positions:', testData);
  ball.x = testData.ball.x;
  ball.y = testData.ball.y;
  paddle1.y = testData.paddle1.y;
  paddle2.y = testData.paddle2.y;
  
  // Force render
  app.renderer.render(app.stage);
  console.log('🎨 Forced render');
};
canvas.parentElement?.appendChild(testButton);

  // Initialize WebSocket connection
  const wsManager = new WebSocketManager(sessionStorage.getItem('username') ?? 'undefined');

  // IMPORTANT: Register handlers BEFORE connecting
  wsManager.registerHandler('GAME_START', () => {
    console.log('Game started!');
  });
  
	wsManager.registerHandler('GAME_STATE_UPDATE', (message) => {
	if (testInterval) {
	clearInterval(testInterval);
	console.log('Clearing test animation, real game state arrived');
	}

	// Log the entire message to see its structure
	console.log('Received game state update', message);

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

  wsManager.registerHandler('PLAYER_DISCONNECTED', () => {
    console.log('Other player disconnected');
  });

  // Now connect after registering handlers
  try {
    await wsManager.connect(gameId);
    console.log('Connected to game session');

	console.log('Manually triggering test animation clear');
	setTimeout(() => {
	if (testInterval) {
		clearInterval(testInterval);
		console.log('Test interval should be cleared now');
	}
	
	// Try forcing a local update to see if rendering works
	ball.x = 100;
	ball.y = 100;
	}, 5000);

    // Player number based on host status
    const playerNumber = isHost ? 1 : 2;

    // Handle keyboard input
    document.addEventListener('keydown', (e) => {
		  console.log('Key pressed:', e.key);

      if ((playerNumber === 1 && (e.key === 'w' || e.key === 's')) || 
          (playerNumber === 2 && (e.key === 'ArrowUp' || e.key === 'ArrowDown'))) {
        
        const isUp = e.key === 'w' || e.key === 'ArrowUp';
        const dir = isUp ? -1 : 1;
        
		    console.log('Sending paddle input:', playerNumber, dir);

        wsManager.sendPaddleInput(playerNumber, dir);
      }
    });
    
    document.addEventListener('keyup', (e) => {
      if ((playerNumber === 1 && (e.key === 'w' || e.key === 's')) || 
          (playerNumber === 2 && (e.key === 'ArrowUp' || e.key === 'ArrowDown'))) {
        
        wsManager.sendPaddleInput(playerNumber, 0); // Stop moving when key is released
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
	  console.log('Game should start now');
	  initGame(canvas, gameId, !!isHost);
	} else {
	  console.error('Container element not found');
	}
  }
  