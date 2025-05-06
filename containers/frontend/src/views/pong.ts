import { Application } from 'pixi.js';
import { PongGame } from '../pong/engine/Game';

async function initGame(canvas: HTMLCanvasElement): Promise<void> {

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

		console.log('PixiJS initialized and attached to the canvas.');
	  
		const game = new PongGame(app);
		await game.init();
	
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

/*	if (!canvas) {
		canvas = document.createElement('canvas');
		canvas.id = 'game-canvas';
		canvas.width = 1500;
		canvas.height = 500;
		container.appendChild(canvas);
	  }*/

	if (canvas) {
	  initGame(canvas);
	} else {
	  console.error('Container element not found');
	}
  }
  