/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   pong.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/28 11:29:12 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/08 12:11:04 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Application } from "pixi.js";
import { Menu } from './menu/Menu';
import { Preconfiguration } from "./utils/GameConfig";

export async function initGame(container: HTMLElement) {

  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get('mode');
  const gameId = urlParams.get('gameId');
  
  if (mode === 'online' && gameId) {
    console.log('Online mode detected, skipping menu initialization');
    return; // Don't create menu for online games
  }

  const app = new Application();
  await app.init({
    background: '#171717',
    width: 1800,
    height: 750,
    antialias: true,
    resolution: 2                                                                                                                                                                                                                                                                                   ,
    autoDensity: true,
  });

  const language = localStorage.getItem('i18nextLng') || 'en';

  container.appendChild(app.canvas);

  // example: http://localhost:5173/pong?gameId=game_1751464868262_ehxauuvw2&mode=online&opponent=hmunoz-g
  // Check if the URL path is '/pong' or contains configuration elements like '?opponent=user1+mode=classic'
  const url = new URL(window.location.href);
  const pathname = url.pathname;
  const search = url.search;
  let hasPreconfig = false;
  let preconfig: Preconfiguration | null = null;

  if (pathname.endsWith('/pong') && search.length > 0) {
    const params = new URLSearchParams(search);
    const opponent = params.get('opponent');
    const mode = params.get('mode');
    hasPreconfig = search.length > 0;
    if (hasPreconfig) {
      preconfig = {
        mode: url.searchParams.get('mode') as 'local' | 'online' || 'online',
        variant: mode!,
      };
    }
  }

  const menu = new Menu(app, language, hasPreconfig, preconfig!);
  await menu.init(false, true);
};
