/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   MenuButtonManager.ts                               :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/06 10:47:11 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/17 12:07:33 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Menu } from "../Menu";

import { MenuButton } from "../menuButtons/MenuButton";
import { MenuHalfButton } from "../menuButtons/MenuHalfButton";
import { MenuXButton } from "../menuButtons/MenuXButton";
import { BallButton } from "../menuButtons/BallButton";

import { VFXComponent } from "../../components/VFXComponent";
import { MenuBallSpawner } from "../menuSpawners/MenuBallSpawner";

import { getThemeColors } from "../../utils/Utils";
import * as menuUtils from "../../utils/MenuUtils"
import { MenuOverlayQuitButton } from "../menuButtons/MenuOverlayQuitButton";



export class ButtonManager {
	static createMainButtons(menu: Menu) {
		const buttonConfigs: menuUtils.MenuButtonConfig[] = [
			{
				isClicked: false,
				text: 'START',
				onClick: async () => {
					console.log("Start clicked");
					menu.playSound("menuSelect");
				},
				color: getThemeColors(menu.config.classicMode).menuBlue,
				index: 0
			},
			{
				isClicked: false,
				text: 'PLAY',
				onClick: async () => {
					console.log("Play clicked");
					menu.playSound("menuSelect");
				},
				color: getThemeColors(menu.config.classicMode).menuBlue,
				index: 1
			},
			{
				isClicked: false,
				text: 'OPTIONS',
				onClick: () => {
					console.log('Options clicked');
					menu.playSound("menuSelect");
				},
				color: getThemeColors(menu.config.classicMode).menuGreen,
				index: 2
			},
			{
				isClicked: false,
				text: 'GLOSSARY',
				onClick: () => {
					console.log('Glossary clicked');
					menu.playSound("menuSelect");
				},
				color: getThemeColors(menu.config.classicMode).menuOrange,
				index: 3
			},
			{
				isClicked: false,
				text: 'ABOUT',
				onClick: () => {
					console.log('About clicked');
					menu.playSound("menuSelect");
				},
				color: getThemeColors(menu.config.classicMode).menuPink,
				index: 4
			}
		];
	
		buttonConfigs.forEach((config, index) => {
			const menuButton = new MenuButton(
				`menuButton_${config.text.toLowerCase()}`, 
				'menuContainer', 
				menu, 
				config
			);
	
			let x: number;
			let y: number;
	
			if (index === 0 || index === 1) {
				if (index === 0) {
					menu.startButton = menuButton
				} else {
					menu.playButton = menuButton;
				}
				const centerX = menu.app.screen.width / 2;
				x = centerX - menu.buttonWidth/2;
				y = menu.app.screen.height / 3;
			} else {
				switch (index) {
					case (2): menu.optionsButton = menuButton; break;
					case (3): menu.glossaryButton = menuButton; break;
					case (4): menu.aboutButton = menuButton; break;
				}
				const rowIndex = index - 2;
				x = (menu.app.screen.width - menu.buttonWidth) / 2 - (rowIndex * (menu.buttonSlant + 5)) - menu.ornamentOffset;
				y = (menu.app.screen.height / 3) + ((rowIndex + 1) * (menu.buttonHeight + menu.buttonVerticalOffset));
			}
	
			menuButton.setPosition(x, y);
			menu.entities.push(menuButton);
			
	
			switch (index) {
				case (0): {
					menu.startButton = menuButton;
					menu.menuContainer.addChild(menuButton.getContainer());
					break;
				}
				case (1): {
					menu.playButton = menuButton;
					menu.menuHidden.addChild(menuButton.getContainer());
					menuButton.setHidden(true);
					break;
				}
				case (2): {
					menu.optionsButton = menuButton;
					menu.menuContainer.addChild(menuButton.getContainer());
					break;
				}
				case (3): {
					menu.glossaryButton = menuButton;
					menu.menuContainer.addChild(menuButton.getContainer());
					break;
				}
				case (4): {
					menu.aboutButton = menuButton;
					menu.menuContainer.addChild(menuButton.getContainer());
					break;
				}
			}
		});
	}

	static createHalfButtons(menu: Menu) {
		const HalfButtonConfigs: menuUtils.MenuButtonConfig[] = [
			{
				isClicked: true,
				text: "LOCAL",
				onClick: () => {
					console.log('LOCAL clicked');
					menu.playSound("menuSelect");
				},
				color: getThemeColors(menu.config.classicMode).menuBlue,
				index: 0,
			},
			{
				isClicked: false,
				text: 'ONLINE',
				onClick: () => {
					console.log('ONLINE clicked');
					menu.playSound("menuSelect");
				},
				color: getThemeColors(menu.config.classicMode).menuBlue,
				index: 1,	
			},
			{
				isClicked: false,
				text: '1 vs IA',
				onClick: () => {
					console.log('1 VS IA clicked');
					menu.playSound("menuSelect");
				},
				color: getThemeColors(menu.config.classicMode).menuBlue,
				index: 2,
			},
			{
				isClicked: false,
				text: 'TOURNAMENT',
				onClick: () => {
					console.log('TOURNAMENT clicked');
					menu.playSound("menuSelect");
				},
				color: getThemeColors(menu.config.classicMode).menuBlue,
				index: 3,
			},
			{
				isClicked: false,
				text: '1 vs 1',
				onClick: () => {
					console.log('1 VS 1 clicked');
					menu.playSound("menuSelect");
				},
				color: getThemeColors(menu.config.classicMode).menuBlue,
				index: 4,
			},
		];
	
		HalfButtonConfigs.forEach((config, index) => {
			const halfButton = new MenuHalfButton(
				`startHalfButton_index${index}_${config.text.toLowerCase()}`, 
				'menuContainer', 
				menu, 
				config,
			);
	
			let x;
			let y;
	
			switch (index) {
				case (0): {
					menu.localButton = halfButton;
					x = (menu.app.screen.width - menu.buttonWidth) / 2 - menu.ornamentOffset - (menu.ornamentOffset * 2) - (menu.halfButtonWidth * 2) - (index * menu.halfButtonSlant) + 4;
					y = (menu.app.screen.height / 3) + (index * menu.halfButtonOffset);
					break;
				}
				case (1): {
					menu.onlineButton = halfButton;
					x = (menu.app.screen.width - menu.buttonWidth) / 2 - menu.ornamentOffset - (menu.ornamentOffset * 2) - (menu.halfButtonWidth * 2) - (index * menu.halfButtonSlant) + (index);
					y = (menu.app.screen.height / 3) + (index * menu.halfButtonOffset);
					break;
				}
				case (2): {
					menu.IAButton = halfButton;
					x = (menu.app.screen.width - menu.buttonWidth) / 2 - menu.ornamentOffset - (menu.halfButtonWidth) - (2 * menu.halfButtonSlant) + (2 * 5.5);
					y = (menu.app.screen.height / 3) + ((2 - 2) * menu.halfButtonOffset);
					break;
				}
				case (3): {
					menu.tournamentButton = halfButton;
					x = (menu.app.screen.width - menu.buttonWidth) / 2 - menu.ornamentOffset - (menu.halfButtonWidth) - (2 * menu.halfButtonSlant) + (2 * 5.5);
					y = (menu.app.screen.height / 3) + ((2 - 2) * menu.halfButtonOffset);
					break;
				}
				case (4): {
					menu.duelButton = halfButton;
					x = (menu.app.screen.width - menu.buttonWidth) / 2 - menu.ornamentOffset - (menu.halfButtonWidth) - (index * menu.halfButtonSlant) + (index * 4.5);
					y = (menu.app.screen.height / 3) + ((index - 3) * menu.halfButtonOffset);
					break;
				}
			}
	
			halfButton.setPosition(x!, y!);
			halfButton.setHidden(true);
			menu.entities.push(halfButton);
			menu.menuHidden.addChild(halfButton.getContainer());
		});

		// OPTIONS half buttons
		const halfButtonConfigs: menuUtils.MenuButtonConfig[] = [
			{
				isClicked: true,
				text: menu.config.filters ? 'CRT FILTER: ON' : 'CRT FILTER: OFF',
				onClick: () => {
					console.log('filter toggler clicked');
					menu.playSound("menuSelect");
				},
				color: getThemeColors(menu.config.classicMode).menuGreen,
				index: 0,
			},
			{
				isClicked: false,
				text: menu.config.classicMode ? 'CLASSIC: ON' : 'CLASSIC: OFF',
				onClick: () => {
					console.log('classic toggler clicked');
					menu.playSound("menuSelect");
				},
				color: getThemeColors(menu.config.classicMode).menuGreen,
				index: 1,
			},
		];
	
		halfButtonConfigs.forEach((config, index) => {
			const halfButton = new MenuHalfButton(
				`halfButton_${config.text.toLowerCase()}`, 
				'menuContainer', 
				menu, 
				config
			);
	
			if (index === 0) {
				menu.filtersButton = halfButton;
			} else if (index === 1) {
				menu.classicButton = halfButton;
			}
	
			const x = (menu.app.screen.width - menu.buttonWidth) / 2 - menu.buttonWidth / 4 - ((index * menu.halfButtonSlant)) + 25 - (index * 2);
			const y = (menu.app.screen.height / 3) + ((menu.buttonHeight + menu.buttonVerticalOffset)) + (index * menu.halfButtonOffset);
	
			halfButton.setPosition(x!, y!);
			halfButton.setHidden(true);
			menu.entities.push(halfButton);
			menu.menuHidden.addChild(halfButton.getContainer());
		});
	}

	static createXButtons(menu: Menu) {
		const xButtonConfigs: menuUtils.MenuButtonConfig[] = [
			{
				isClicked: false,
				text: 'X',
				onClick: () => {
					console.log(`return at start clicked`);
					menu.playSound("menuSelect");
				},
				color: getThemeColors(menu.config.classicMode).menuBlue,
				index: 0
			},
			{
				isClicked: false,
				text: 'X',
				onClick: () => {
					console.log(`return at options clicked`);
					menu.playSound("menuSelect");
				},
				color: getThemeColors(menu.config.classicMode).menuGreen,
				index: 1
			},
		];

		xButtonConfigs.forEach((config, index) => {
			let tag;
			
			switch (index) {
				case (0): {
					tag = `xButton_start_${config.text.toLowerCase()}`;
					break;
				}
				case (1): {
					tag = `xButton_options_${config.text.toLowerCase()}`
					break;
				}
			}
			
			const xButton = new MenuXButton(
				tag!, 
				'menuContainer', 
				menu, 
				config,
			);
	
			let x;
			let y;
	
			switch (index) {
				case (0): {
					menu.startXButton = xButton;
					x = (menu.app.screen.width - menu.buttonWidth) / 2 - (menu.buttonXWidth * 2) - menu.ornamentOffset - (menu.ornamentOffset * 3) - (menu.halfButtonWidth * 2);
					y = menu.app.screen.height / 3;
					break;
				}
				case (1): {
					menu.optionsXButton = xButton;
					x = (menu.app.screen.width - menu.buttonWidth) / 2 - (menu.buttonWidth / 2) - menu.ornamentOffset + 35;
					y = (menu.app.screen.height / 3) + ((menu.buttonHeight + menu.buttonVerticalOffset));
					break;
				}
			}

			xButton.setPosition(x!, y!);
			xButton.setHidden(true);
			menu.menuHidden.addChild(xButton.getContainer());
		});
	}

	static createOverlayQuitButtons(menu: Menu) {
		const quitButtonConfigs: menuUtils.MenuButtonConfig[] = [
			{
				isClicked: false,
				text: 'X',
				onClick: () => {
					console.log(`return at glossary window clicked`);
					menu.playSound("menuSelect");
				},
				color: getThemeColors(menu.config.classicMode).menuOrange,
				index: 0
			},
			{
				isClicked: false,
				text: 'X',
				onClick: () => {
					console.log(`return at about window clicked`);
					menu.playSound("menuSelect");
				},
				color: getThemeColors(menu.config.classicMode).menuPink,
				index: 1
			},
		];

		quitButtonConfigs.forEach((config, index) => {
			let tag;
			
			switch (index) {
				case (0): {
					tag = `quit_glossary_${config.text.toLowerCase()}`;
					break;
				}
				case (1): {
					tag = `quit_about_${config.text.toLowerCase()}`
					break;
				}
			}
			
			const quitButton = new MenuOverlayQuitButton(
				tag!, 
				'menuContainer', 
				menu, 
				config,
			);
	
			let x;
			let y;
	
			switch (index) {
				case (0): {
					menu.glossaryQuitButton = quitButton;
					x = menu.width / 2 - 55;
					y = 660;
					break;
				}
				case (1): {
					menu.aboutQuitButton = quitButton;
					x = menu.width / 2 - 55;
					y = 660;
					break;
				}
			}

			quitButton.setPosition(x!, y!);
			quitButton.setHidden(true);
			menu.menuHidden.addChild(quitButton.getContainer());
		});
	}

	

	static createBallButton(menu: Menu) {
		const ballButton = new BallButton('ballButton', 'foreground', menu, () => {
			const vfx = ballButton.getComponent('vfx') as VFXComponent;
			if (vfx) {
				vfx.startFlash(getThemeColors(menu.config.classicMode).white, 10);
			}
			MenuBallSpawner.spawnDefaultBallInMenu(menu);
			menu.sounds.ballClick.play();
		});
	
		ballButton.setPosition(menu.width - 470, 320);

		menu.entities.push(ballButton);

		menu.renderLayers.foreground.addChild(ballButton.getContainer());

		menu.ballButton = ballButton;
	}
}