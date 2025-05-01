import { Application } from 'pixi.js';
import { PongGame } from '../pong/engine/Game';

// Assuming initGame is defined elsewhere, and it's typed as:
function initGame(canvas: HTMLCanvasElement): void {
	document.addEventListener("DOMContentLoaded", async () => {
		const app = new Application();
		await app.init({
		  background: "#171717",
		  width: 1500,
		  height: 500,
		  antialias: false,
		  resolution: 2,
		  autoDensity: true,
		});
	  
		const container = document.getElementById("game-container");
		  if (!container) throw new Error("game-container not found!");
		container.appendChild(app.canvas);
		console.log('Canvas appended to child');
	  
		const game = new PongGame(app);
		await game.init();
	  });
  }
  
  export function showPong(container: HTMLElement): void {
	const gameDiv = document.createElement('div');
	gameDiv.innerHTML = `
	  <h2>Pong</h2>
	  <canvas id="game-container" width="1500" height="500"></canvas>
	  <button onclick="navigate('/')">Retour à l'accueil</button>
	`;
	container.appendChild(gameDiv);
  
	let canvas = document.getElementById('game-container') as HTMLCanvasElement | null;

	if (!canvas) {
		canvas = document.createElement('canvas');
		canvas.id = 'game-container';
		canvas.width = 1500;
		canvas.height = 500;
		container.appendChild(canvas);
	  }

	if (canvas) {
	  initGame(canvas);
	} else {
	  console.error('Container element not found');
	}
  }
  