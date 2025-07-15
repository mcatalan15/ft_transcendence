/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   MenuUtils.ts                                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/28 12:49:41 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/26 10:12:25 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Container, Text, Application, ColorMatrixFilter } from 'pixi.js';

import { Menu } from '../menu/Menu';

import { GAME_COLORS } from './Types';
import { MenuButton } from '../menu/menuButtons/MenuButton';
import { MenuHalfButton } from '../menu/menuButtons/MenuHalfButton';
import { MenuXButton } from '../menu/menuButtons/MenuXButton';
import { MenuOverlayQuitButton } from '../menu/menuButtons/MenuOverlayQuitButton';
import { MenuReadyButton } from '../menu/menuButtons/MenuReadyButton';
import { MenuTournamentOverlayButton } from '../menu/menuButtons/MenuTournamentOverlayButton';

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
	button.onClick = () => {};

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
    isClicked?: boolean;
	text: string;
    onClick: () => void;
    color: number;
    index: number;
}

export interface SecretCode {
    name: string;
    sequence: string[];
    timeout: number;
    effect: () => void;
}

export function getRandomGameColor(excludeColors: (keyof typeof GAME_COLORS)[] = []): number {
    const availableColors = Object.entries(GAME_COLORS)
        .filter(([key]) => !excludeColors.includes(key as keyof typeof GAME_COLORS))
        .map(([, value]) => value);
    
    const randomIndex = Math.floor(Math.random() * availableColors.length);
    return availableColors[randomIndex];
}

export function getButtonPoints(menu: Menu, button: MenuButton): number[] | undefined {
	return [
		0, 0,
		menu.buttonWidth + menu.buttonSlant, 0,
		menu.buttonWidth , menu.buttonHeight,
		0 - menu.buttonSlant, menu.buttonHeight 
	];
	}

export function getHalfButtonPoints(menu: Menu, button: MenuHalfButton): number[] | undefined {
	return [
		0, 0,
		menu.halfButtonWidth + menu.halfButtonSlant, 0,
		menu.halfButtonWidth , menu.halfButtonHeight,
		0 - menu.halfButtonSlant, menu.halfButtonHeight 
	];
}

export function getXButtonPoints(menu: Menu, button: MenuXButton): number[] | undefined {
	if (!button.getIsClicked()) {
		return [
			0, 0,
			menu.buttonXWidth + menu.buttonSlant, 0,
			menu.buttonXWidth , menu.buttonHeight,
			0 - menu.buttonSlant, menu.buttonHeight 
		];
	}
}

export function getOverlayQuitButtonPoints(menu: Menu, button: MenuOverlayQuitButton): number[] | undefined {
	if (!button.getIsClicked()) {
		return [
			0, 0,
			90, 0,
			90, 30,
			0, 30,
		];
	}
}

export function getReadyButtonPoints(menu: Menu, button: MenuReadyButton): number[] | undefined {
	if (!button.getIsClicked()) {
		return [
			0, 0,
			menu.readyButtonWidth, 0,
			menu.readyButtonWidth , menu.readyButtonHeight,
			0, menu.readyButtonHeight 
		];
	}
}

export function getTournamentOverlayButtonPoints(menu: Menu, button: MenuTournamentOverlayButton): number[] | undefined {
	return [
		0, 0,
		menu.tournamentOverlayButtonWidth, 0,
		menu.tournamentOverlayButtonWidth , menu.tournamentOverlayButtonHeight,
		0, menu.tournamentOverlayButtonHeight 
	];
}
export function createAdaptiveDuotoneFilter(menu: Menu): ColorMatrixFilter {
    const filter = new ColorMatrixFilter();
    
    // Convert to grayscale first
    filter.desaturate();
    
    let darkColor: number;
    let lightColor: number;
    
    if (menu.config.classicMode) {
        // In classic mode, use your game's black and white
        darkColor = GAME_COLORS.black;   // 0x171717
        lightColor = GAME_COLORS.white;  // 0xfff8e3
    } else {
        // In modern mode, you could use a different color scheme
        // or still use your game's colors
        darkColor = GAME_COLORS.black;   // 0x171717
        lightColor = GAME_COLORS.white;  // 0xfff8e3
    }
    
    // Extract RGB components
    const darkR = (darkColor >> 16) & 0xFF;
    const darkG = (darkColor >> 8) & 0xFF;
    const darkB = darkColor & 0xFF;
    
    const lightR = (lightColor >> 16) & 0xFF;
    const lightG = (lightColor >> 8) & 0xFF;
    const lightB = lightColor & 0xFF;
    
    // Create the gradient mapping matrix
    filter.matrix = [
        (lightR - darkR) / 255, 0, 0, 0, darkR / 255,
        0, (lightG - darkG) / 255, 0, 0, darkG / 255,
        0, 0, (lightB - darkB) / 255, 0, darkB / 255,
        0, 0, 0, 1, 0
    ];
    
    return filter;
}