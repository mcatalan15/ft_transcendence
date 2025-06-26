/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   pong.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: nponchon <nponchon@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/28 11:29:12 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/26 14:35:18 by nponchon         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Application } from "pixi.js";
import { Menu } from './menu/Menu';

export async function initGame(container: HTMLElement) {
  const app = new Application();
  await app.init({
    background: '#171717',
    width: 1800,
    height: 750,
    antialias: true,
    resolution: 2                                                                                                                                                                                                                                                                                   ,
    autoDensity: true,
  });

  //const language = localStorage.getItem('i18nextLng') || 'en';
  const language = 'en';

  container.appendChild(app.canvas);
  
  const menu = new Menu(app, language);
  await menu.init();
};
