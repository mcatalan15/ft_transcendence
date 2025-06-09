/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   main.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/28 11:29:12 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/09 09:19:07 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Application } from "pixi.js";
import { Menu } from './menu/Menu';

(async () => {
  const app = new Application();
  await app.init({
    background: '#171717',
    width: 1800,
    height: 750,
    antialias: true,
    resolution: 2,
    autoDensity: true,
  });

  const container = document.getElementById("game-container");
  if (!container) throw new Error("game-container not found!");
  container.appendChild(app.canvas);

  try {
    await document.fonts.ready;
    console.log('All fonts loaded');
  } catch (error) {
    console.warn('Font loading failed, continuing anyway:', error);
  }

  const menu = new Menu(app);
  await menu.init();
})();
