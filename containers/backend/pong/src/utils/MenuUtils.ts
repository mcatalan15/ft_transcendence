/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   MenuUtils.ts                                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/28 12:49:41 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/02 16:58:38 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Container, Text, Application } from 'pixi.js';

import { Menu } from '../menu/Menu';

import { GAME_COLORS } from './Types';
import { MenuButton } from '../menu/MenuButton';

export interface ButtonConfig {
	text: string;
	onClick: () => void;
}

export function createButton(menu: Menu, text: string, width: number, height: number, color: number, index: number): Container {
	const button = new Container();
	button.eventMode = 'static';
	button.cursor = 'pointer';
	
	let isHovered = false;
  
	const bg = new Graphics();

	makeLeftPolygon(bg, width, height, index, color);
	makeMiddlePolygon(bg, width, height, index, color, false);
	button.addChild(bg);
	makeText(button, text, width, height, index, color);
  
	// Hover effects
	button.on('pointerenter', () => {
		if (!isHovered) {
			isHovered = true;
			bg.clear();
			makeLeftPolygon(bg, width, height, index, GAME_COLORS.white);
			makeMiddlePolygon(bg, width, height, index, GAME_COLORS.white, true);
			removeTextFromButton(button);
			makeText(button, text, width, height, index, GAME_COLORS.black);
			menu.sounds.menuMove.play();
		}
	});
  
	button.on('pointerleave', () => {
		isHovered = false;
		bg.clear();
		makeLeftPolygon(bg, width, height, index, color);
		makeMiddlePolygon(bg, width, height, index, color, false);
		removeTextFromButton(button);
		makeText(button, text, width, height, index, color);
	});
  
	return button;
}

  export function createBallButton(width: number, height: number, color: number): Container & { onClick: () => void } {
	const button = new Container() as Container & { onClick: () => void };
	button.eventMode = 'static';
	button.cursor = 'pointer';
  
	// Create the ball graphics
	const ball = new Graphics();
	ball.circle(0, 0, 75);
	ball.x = width - 470;
	ball.y = height / 8 - 25;
	ball.fill(color);

	button.addChild(ball);

	// Add the onClick method to the button
	button.onClick = () => {
		console.log('SPAWNING BALLZZZ');
	};

	// Hover effects
	button.on('pointerenter', () => {
		ball.clear();
		ball.circle(0, 0, 80); // Slightly larger on hover
		ball.x = width - 470;
		ball.y = height / 8 - 25;
		ball.fill(GAME_COLORS.white); // Change color on hover
	});
  
	button.on('pointerleave', () => {
		ball.clear();
		ball.circle(0, 0, 75); // Back to original size
		ball.x = width - 470;
		ball.y = height / 8 - 25;
		ball.fill(color); // Back to original color
	});
  
	return button;
}

export function setMenuBackground(app: Application): Graphics {
	const bg = new Graphics();
	bg.rect(0, 0, app.screen.width, app.screen.height);
	bg.fill(GAME_COLORS.black);
	return (bg);
}

export function makeLeftPolygon(bg: Graphics, width: number, height: number, index: number, color: number): void {
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

export function makeMiddlePolygon(bg: Graphics, width: number, height: number, index: number, color: number, filled: boolean): void {
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

export function makeText(button: Container, text: string, width: number, height: number, index: number, color?: number): void {
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

export function removeTextFromButton(button: Container) {
	for (const child of button.children) {
		if (child instanceof Text) {
			button.removeChild(child);		
		}
	}
}

export interface MenuButtonConfig {
    text: string;
    onClick: () => void;
    color: number;
    index: number;
}

export function getButtonPoints(menu: Menu, button: MenuButton): number[] | undefined {
	const slantOffset = 20;
    const firstPolyOffset = button.getIndex() * 25;
	const middleOffset = 20;
	const optionsShrinkFactor = 500;
	
	if (!button.isClicked) {
		return [
			menu.buttonWidth / 2.3 + slantOffset - firstPolyOffset + middleOffset, 0,
			menu.buttonWidth / 1.8 + slantOffset - firstPolyOffset + middleOffset, 0,
			menu.buttonWidth / 1.8 + middleOffset - firstPolyOffset, menu.buttonHeight,
			menu.buttonWidth / 2.3 + slantOffset - firstPolyOffset, menu.buttonHeight 
		];
	} else if (button.isClicked) {
		if (button.getText() === 'OPTIONS') {
			return [
				(menu.buttonWidth / 2.3 + slantOffset - firstPolyOffset + middleOffset) - optionsShrinkFactor, 0,
				(menu.buttonWidth / 1.8 + slantOffset - firstPolyOffset + middleOffset) - optionsShrinkFactor, 0,
				(menu.buttonWidth / 1.8 + middleOffset - firstPolyOffset) - optionsShrinkFactor, menu.buttonHeight,
				(menu.buttonWidth / 2.3 + slantOffset - firstPolyOffset) - optionsShrinkFactor, menu.buttonHeight 
			];
		}
	}
}