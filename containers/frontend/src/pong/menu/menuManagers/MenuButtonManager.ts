/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   MenuButtonManager.ts                               :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/06 10:47:11 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/18 11:49:59 by hmunoz-g         ###   ########.fr       */
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
				text: this.getButtonTexts(menu, 'start'),
				onClick: async () => {
					console.log("Start clicked");
					menu.playSound("menuSelect");
				},
				color: getThemeColors(menu.config.classicMode).menuBlue,
				index: 0
			},
			{
				isClicked: false,
				text: this.getButtonTexts(menu, 'play'),
				onClick: async () => {
					console.log("Play clicked");
					menu.playSound("menuSelect");
				},
				color: getThemeColors(menu.config.classicMode).menuBlue,
				index: 1
			},
			{
				isClicked: false,
				text: this.getButtonTexts(menu, 'options'),
				onClick: () => {
					console.log('Options clicked');
					menu.playSound("menuSelect");
				},
				color: getThemeColors(menu.config.classicMode).menuGreen,
				index: 2
			},
			{
				isClicked: false,
				text: this.getButtonTexts(menu, 'glossary'),
				onClick: () => {
					console.log('Glossary clicked');
					menu.playSound("menuSelect");
				},
				color: getThemeColors(menu.config.classicMode).menuOrange,
				index: 3
			},
			{
				isClicked: false,
				text: this.getButtonTexts(menu, 'info'),
				onClick: () => {
					console.log('About clicked');
					menu.playSound("menuSelect");
				},
				color: getThemeColors(menu.config.classicMode).menuPink,
				index: 4
			}
		];
		
		let buttonIds: string[] = [
			'START',
			'PLAY',
			'OPTIONS',
			'GLOSSARY',
			'ABOUT'
		];

		buttonConfigs.forEach((config, index) => {
			const menuButton = new MenuButton(
				`menuButton_${config.text.toLowerCase()}`, 
				buttonIds[index],
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
				text: this.getButtonTexts(menu, 'local'),
				onClick: () => {
					console.log('LOCAL clicked');
					menu.playSound("menuSelect");
				},
				color: getThemeColors(menu.config.classicMode).menuBlue,
				index: 0,
			},
			{
				isClicked: false,
				text: this.getButtonTexts(menu, 'online'),
				onClick: () => {
					console.log('ONLINE clicked');
					menu.playSound("menuSelect");
				},
				color: getThemeColors(menu.config.classicMode).menuBlue,
				index: 1,	
			},
			{
				isClicked: false,
				text: this.getButtonTexts(menu, '1vsIA'),
				onClick: () => {
					console.log('1 VS IA clicked');
					menu.playSound("menuSelect");
				},
				color: getThemeColors(menu.config.classicMode).menuBlue,
				index: 2,
			},
			{
				isClicked: false,
				text: this.getButtonTexts(menu, 'tournament'),
				onClick: () => {
					console.log('TOURNAMENT clicked');
					menu.playSound("menuSelect");
				},
				color: getThemeColors(menu.config.classicMode).menuBlue,
				index: 3,
			},
			{
				isClicked: false,
				text: '1 VS 1',
				onClick: () => {
					console.log('1 VS 1 clicked');
					menu.playSound("menuSelect");
				},
				color: getThemeColors(menu.config.classicMode).menuBlue,
				index: 4,
			},
		];

		let buttonIds: string[] = [
			'LOCAL',
			'ONLINE',
			'1 vs IA',
			'TOURNAMENT',
			'1 vs 1'
		];
	
		HalfButtonConfigs.forEach((config, index) => {
			const halfButton = new MenuHalfButton(
				`startHalfButton_index${index}_${config.text.toLowerCase()}`,
				buttonIds[index],
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
				text: menu.config.filters ? this.getButtonTexts(menu, 'CRTON') : this.getButtonTexts(menu, 'CRTOFF'),
				onClick: () => {
					console.log('filter toggler clicked');
					menu.playSound("menuSelect");
				},
				color: getThemeColors(menu.config.classicMode).menuGreen,
				index: 0,
			},
			{
				isClicked: false,
				text: menu.config.classicMode ? this.getButtonTexts(menu, 'CLASSICON') : this.getButtonTexts(menu, 'CLASSICOFF'),
				onClick: () => {
					console.log('classic toggler clicked');
					menu.playSound("menuSelect");
				},
				color: getThemeColors(menu.config.classicMode).menuGreen,
				index: 1,
			},
		];

		let optionsButtonIds: string[] = [
			'FILTER',
			'CLASSIC',
		];
	
		halfButtonConfigs.forEach((config, index) => {
			const halfButton = new MenuHalfButton(
				`halfButton_${config.text.toLowerCase()}`,
				optionsButtonIds[index],
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
				config.text.toUpperCase(),
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
			{
				isClicked: false,
				text: 'X',
				onClick: () => {
					console.log(`return at play window clicked`);
					menu.playSound("menuSelect");
				},
				color: getThemeColors(menu.config.classicMode).menuBlue,
				index: 2
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
				case (2): {
					tag = `quit_play_${config.text.toLowerCase()}`
					break;
				}
			}
			
			const quitButton = new MenuOverlayQuitButton(
				tag!,
				config.text.toUpperCase(),
				'menuContainer', 
				menu, 
				config,
			);
	
			let x = menu.width / 2 - 55;
			let y = 660;
	
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
				case (2): {
					menu.playQuitButton = quitButton;
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

	static getButtonTexts(menu: Menu, type: string): string {
		switch (type) {
			case ('start'): {
				switch (menu.language) {
					case ('en'): return 'START';
					case ('es'): return 'INICIAR';
					case ('fr'): return 'COMMENCER';
					case ('cat'): return 'INICIAR';
					default: return 'START';
				}
			}

			case ('play'): {
				switch (menu.language) {
					case ('en'): return 'PLAY';
					case ('es'): return 'JUGAR';
					case ('fr'): return 'JOUER';
					case ('cat'): return 'JUGAR';
					default: return 'PLAY';
				}
			}

			case ('options'): {
				switch (menu.language) {
					case ('en'): return 'OPTIONS';
					case ('es'): return 'OPCIONES';
					case ('fr'): return 'OPTIONS';
					case ('cat'): return 'OPCIONS';
					default: return 'OPTIONS';
				}
			}

			case ('glossary'): {
				switch (menu.language) {
					case ('en'): return 'GLOSSARY';
					case ('es'): return 'GLOSARIO';
					case ('fr'): return 'GLOSSAIRE';
					case ('cat'): return 'GLOSSARI';
					default: return 'GLOSSARY';
				}
			}

			case ('info'): {
				switch (menu.language) {
					case ('en'): return 'INFO';
					case ('es'): return 'INFO';
					case ('fr'): return 'INFO';
					case ('cat'): return 'INFO';
					default: return 'INFO';
				}
			}

			case ('local'): {
				switch (menu.language) {
					case ('en'): return 'LOCAL';
					case ('es'): return 'LOCAL';
					case ('fr'): return 'LOCAL';
					case ('cat'): return 'LOCAL';
					default: return 'LOCAL';
				}
			}

			case ('online'): {
				switch (menu.language) {
					case ('en'): return 'ONLINE';
					case ('es'): return 'EN LÍNEA';
					case ('fr'): return 'EN LIGNE';
					case ('cat'): return 'EN LÍNEA';
					default: return 'ONLINE';
				}
			}

			case ('1vsIA'): {
				switch (menu.language) {
					case ('en'): return '1 vs AI';
					case ('es'): return '1 vs IA';
					case ('fr'): return '1 vs IA';
					case ('cat'): return '1 vs IA';
					default: return '1 vs AI';
				}
			}

			case ('tournament'): {
				switch (menu.language) {
					case ('en'): return 'TOURNAMENT';
					case ('es'): return 'TORNEO';
					case ('fr'): return 'TOURNOI';
					case ('cat'): return 'TORNEIG';
					default: return 'TOURNAMENT';
				}
			}

			case ('CRTON'): {
				switch (menu.language) {
					case ('en'): return 'CRT FILTER: ON';
					case ('es'): return 'FILTRO CRT: SÍ';
					case ('fr'): return 'FILTRE CRT: OUI';
					case ('cat'): return 'FILTRE CRT: SI';
					default: return 'CRT FILTER: ON';
				}
			}

			case ('CRTOFF'): {
				switch (menu.language) {
					case ('en'): return 'CRT FILTER: OFF';
					case ('es'): return 'FILTRO CRT: NO';
					case ('fr'): return 'FILTRE CRT: NON';
					case ('cat'): return 'FILTRE CRT: NO';
					default: return 'CRT FILTER: OFF';
				}
			}

			case ('CLASSICON'): {
				switch (menu.language) {
					case ('en'): return 'CLASSIC: ON';
					case ('es'): return 'CLÁSICO: SÍ';
					case ('fr'): return 'CLASSIQUE: OUI';
					case ('cat'): return 'CLÀSSIC: SI';
					default: return 'CLASSIC: ON';
				}
			}

			case ('CLASSICOFF'): {
				switch (menu.language) {
					case ('en'): return 'CLASSIC: OFF';
					case ('es'): return 'CLÁSICO: No';
					case ('fr'): return 'CLASSIQUE: NON';
					case ('cat'): return 'CLÀSSIC: NO';
					default: return 'CLASSIC: OFF';
				}
			}

			default:
				return 'UNKNOWN';
		}
	}
}