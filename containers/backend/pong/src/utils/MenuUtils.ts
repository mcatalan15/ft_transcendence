/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   MenuUtils.ts                                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/28 12:49:41 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/29 18:59:58 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Container, Text, Application } from 'pixi.js';

import { GAME_COLORS } from './Types';

export interface ButtonConfig {
	text: string;
	onClick: () => void;
}

export function createButton(text: string, width: number, height: number, color: number, index: number): Container {
	const button = new Container();
	button.eventMode = 'static';
	button.cursor = 'pointer';
  
	// Button background with slanted right edge
	const bg = new Graphics();

	// Define the points for a trapezoid/parallelogram
	makeLeftPolygon(bg, width, height, index, color);

	makeMiddlePolygon(bg, width, height, index, color, false);

	button.addChild(bg);

	makeText(button, text, width, height, index, color);
  
	// Hover effects
	button.on('pointerenter', () => {
	  bg.clear();
	  makeLeftPolygon(bg, width, height, index, GAME_COLORS.white);
	  makeMiddlePolygon(bg, width, height, index, GAME_COLORS.white, true);
	  removeTextFromButton(button);
	  makeText(button, text, width, height, index, GAME_COLORS.black);
	});
  
	button.on('pointerleave', () => {
		bg.clear();
		makeLeftPolygon(bg, width, height, index, color);
		makeMiddlePolygon(bg, width, height, index, color, false);
		removeTextFromButton(button);
		makeText(button, text, width, height, index, color);
	});
  
	return button;
  }

export function setMenuBackground(app: Application): Graphics {
	const bg = new Graphics();
	bg.rect(0, 0, app.screen.width, app.screen.height);
	bg.fill(GAME_COLORS.black);
	return (bg);
}

function makeLeftPolygon(bg: Graphics, width: number, height: number, index: number, color: number): void {
	const slantOffset = 20;
	const firstPolyOffset = index * 25;
	
	const points = [
		0, 0,
		width / 2.3 + slantOffset - firstPolyOffset, 0,
		width / 2.3 - firstPolyOffset, height,
		0, height
	];
	bg.poly(points);
	//bg.stroke({color: color, width: 3});
	bg.fill(color);
	bg.position.set(0, 0);
}

function makeMiddlePolygon(bg: Graphics, width: number, height: number, index: number, color: number, filled: boolean): void {
	const slantOffset = 20;
	const firstPolyOffset = index * 25;
	const middleOffset = 20;
	
	const points = [
		width / 2.3 + slantOffset - firstPolyOffset + middleOffset, 0,
		width / 1.8 + slantOffset - firstPolyOffset + middleOffset, 0,
		width / 1.8  + middleOffset - firstPolyOffset, height,
		width / 2.3 + slantOffset - firstPolyOffset, height 
	];

	bg.poly(points);
	
	if (filled) {
		bg.fill(color);
	} else {
		bg.fill(GAME_COLORS.black);
		bg.stroke({color: color, width: 3});
	}

	bg.position.set(0, 0);
}

function makeText(button: Container, text: string, width: number, height: number, index: number, color?: number): void {
	const buttonText = new Text({
		text: text,
		style: {
		  fill: color ?? GAME_COLORS.white,
		  fontSize: 24,
		  fontFamily: 'monospace',
		  fontWeight: 'bold',
		}
	  });
	  
	  buttonText.anchor.set(0.5);
	  buttonText.x = width / 2 - (index * 25) + 20;
	  buttonText.y = height / 2;
	
	  button.addChild(buttonText);
}

function removeTextFromButton(button: Container) {
	for (const child of button.children) {
		if (child instanceof Text) {
			button.removeChild(child);		
		}
	}
}