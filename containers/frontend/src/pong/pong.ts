import { Application } from 'pixi.js';
import { PongGame } from './engine/Game.js';

(async () => {
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

  const game = new PongGame(app);
  await game.init();
})();
