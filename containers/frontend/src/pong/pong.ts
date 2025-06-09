/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   pong.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/28 11:29:12 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/09 11:40:04 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Application } from "pixi.js";
import { Menu } from './menu/Menu';

export async function initGame() {
  const app = new Application();
  await app.init({
    background: '#171717',
    width: 1800,
    height: 800,
    antialias: true,
    resolution: 2                                                                                                                                                                                                                                                                                   ,
    autoDensity: true,
  });

  const container = document.getElementById("game-container");
  if (!container) throw new Error("game-container not found!");
  container.appendChild(app.canvas);

  const menu = new Menu(app);
  await menu.init();
};
