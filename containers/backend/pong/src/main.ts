import { Application } from "pixi.js";
import { PongGame } from './engine/Game';

(async () => {
  const app = new Application();
  await app.init({
    background: '#171717',
    width: 1800, //1800
    height: 700, //750 
    antialias: true,
    resolution: 2,
    autoDensity: true,
  });

  const container = document.getElementById("game-container");
	if (!container) throw new Error("game-container not found!");
  container.appendChild(app.canvas);

  const game = new PongGame(app);
  await game.init();
})();
