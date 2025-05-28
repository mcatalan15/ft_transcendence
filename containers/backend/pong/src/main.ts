/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   main.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/28 11:29:12 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/28 11:33:50 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Application } from "pixi.js";
import { PongGame } from './engine/Game';

(async () => {
  const app = new Application();
  await app.init({
    background: '#171717',
    width: 1800, //1800
    height: 750, //750 
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
