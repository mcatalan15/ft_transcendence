/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   MenuUtils.ts                                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/28 12:49:41 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/28 18:51:18 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Container, Text, Application } from 'pixi.js';

import { GAME_COLORS } from './Types';

export interface ButtonConfig {
	text: string;
	onClick: () => void;
}

export function createButton(text: string, width: number, height: number, color: number): Container {
	const button = new Container();
	button.eventMode = 'static';
	button.cursor = 'pointer';
  
	// Button background
	const bg = new Graphics();
	bg.rect(0, 0, width, height);
	bg.fill(color);
	//bg.stroke({ width: 2, color: 0x666666 });
	
	// Button text
	const buttonText = new Text({
	  text: text,
	  style: {
		fill: GAME_COLORS.white,
		fontSize: 24,
		fontFamily: 'monospace',
	  }
	});
	
	buttonText.anchor.set(0.5);
	buttonText.x = width / 2;
	buttonText.y = height / 2;
  
	button.addChild(bg);
	button.addChild(buttonText);
  
	// Hover effects
	button.on('pointerenter', () => {
	  bg.clear();
	  bg.rect(0, 0, width, height);
	  bg.fill(GAME_COLORS.orange);
	  //bg.stroke({ width: 2, color: 0x888888 });
	});
  
	button.on('pointerleave', () => {
	  bg.clear();
	  bg.rect(0, 0, width, height);
	  bg.fill(color);
	  //bg.stroke({ width: 2, color: 0x666666 });
	});
  
	return button;
  }
  


export function setMenuBackground(app: Application): Graphics {
	const bg = new Graphics();
	bg.rect(0, 0, app.screen.width, app.screen.height);
	bg.fill(GAME_COLORS.black);
	return (bg);
}