/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   MenuUtils.ts                                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/28 12:49:41 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/03 10:20:58 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Container, Text, Application } from 'pixi.js';

import { Menu } from '../menu/Menu';

import { GAME_COLORS } from './Types';
import { MenuButton } from '../menu/MenuButton';
import { MenuHalfButton } from '../menu/MenuHalfButton';
import { MenuXButton } from '../menu/MenuXButton';

export interface ButtonConfig {
	text: string;
	onClick: () => void;
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
    const firstPolyOffset = button.getIndex() * 25;
	const middleOffset = 20;
	const optionsShrinkFactor = 500;
	if (!button.isClicked) {
		return [
			0, 0,
			menu.buttonWidth + menu.buttonSlant, 0,
			menu.buttonWidth , menu.buttonHeight,
			0 - menu.buttonSlant, menu.buttonHeight 
		];
	} else if (button.isClicked) {
		if (button.getText() === 'OPTIONS') {
			return [
				(menu.buttonWidth / 2.3 + menu.buttonSlant - firstPolyOffset + middleOffset) - optionsShrinkFactor, 0,
				(menu.buttonWidth / 1.8 + menu.buttonSlant - firstPolyOffset + middleOffset) - optionsShrinkFactor, 0,
				(menu.buttonWidth / 1.8 + middleOffset - firstPolyOffset) - optionsShrinkFactor, menu.buttonHeight,
				(menu.buttonWidth / 2.3 + menu.buttonSlant - firstPolyOffset) - optionsShrinkFactor, menu.buttonHeight 
			];
		}
	}
}

export function getHalfButtonPoints(menu: Menu, button: MenuHalfButton): number[] | undefined {
    const firstPolyOffset = button.getIndex() * 25;
	const middleOffset = 20;
	const optionsShrinkFactor = 500;
	if (!button.isClicked) {
		return [
			0, 0,
			menu.halfButtonWidth + menu.halfButtonSlant, 0,
			menu.halfButtonWidth , menu.halfButtonHeight,
			0 - menu.halfButtonSlant, menu.halfButtonHeight 
		];
	} else if (button.isClicked) {
		if (button.getText() === 'OPTIONS') {
			return [
				(menu.buttonWidth / 2.3 + menu.halfButtonSlant - firstPolyOffset + middleOffset) - optionsShrinkFactor, 0,
				(menu.buttonWidth / 1.8 + menu.halfButtonSlant - firstPolyOffset + middleOffset) - optionsShrinkFactor, 0,
				(menu.buttonWidth / 1.8 + middleOffset - firstPolyOffset) - optionsShrinkFactor, menu.buttonHeight,
				(menu.buttonWidth / 2.3 + menu.halfButtonSlant - firstPolyOffset) - optionsShrinkFactor, menu.buttonHeight 
			];
		}
	}
}

export function getXButtonPoints(menu: Menu, button: MenuXButton): number[] | undefined {
	if (!button.isClicked) {
		return [
			0, 0,
			menu.buttonXWidth + menu.buttonSlant, 0,
			menu.buttonXWidth , menu.buttonHeight,
			0 - menu.buttonSlant, menu.buttonHeight 
		];
	}
}