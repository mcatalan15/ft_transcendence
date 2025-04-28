import * as GoogleSignInModule from "./auth/googleSignIn.js";

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

GoogleSignInModule.initializeGoogleSignIn((credential: string) => {
      
    fetch("/api/auth/google", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ credential })
  })
    .then(res => res.json())
    .then(data => {
      console.log("Results of Google Sign-In:", data);
    })
    .catch(err => {
      console.error("Error signing in with Google:", err);
    });
});
