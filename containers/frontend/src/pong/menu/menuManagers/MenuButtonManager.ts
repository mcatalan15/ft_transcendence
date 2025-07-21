/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   MenuButtonManager.ts                               :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/06 10:47:11 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/21 20:44:27 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Menu } from "../Menu";

import { MenuButton } from "../menuButtons/MenuButton";
import { MenuHalfButton } from "../menuButtons/MenuHalfButton";
import { MenuXButton } from "../menuButtons/MenuXButton";
import { BallButton } from "../menuButtons/BallButton";
import { MenuReadyButton } from "../menuButtons/MenuReadyButton";

import { VFXComponent } from "../../components/VFXComponent";
import { MenuBallSpawner } from "../menuSpawners/MenuBallSpawner";

import { getThemeColors } from "../../utils/Utils";
import * as menuUtils from "../../utils/MenuUtils"
import { MenuOverlayQuitButton } from "../menuButtons/MenuOverlayQuitButton";
import { MenuTournamentOverlayButton } from "../menuButtons/MenuTournamentOverlayButton";
import { MenuBigInputButton } from "../menuButtons/MenuBigInputButton";
import { MenuSmallInputButton } from "../menuButtons/MenuSmallInputButton";

export class ButtonManager {
	static createMainButtons(menu: Menu) {
		const buttonConfigs: menuUtils.MenuButtonConfig[] = [
			{
				isClicked: false,
				text: this.getButtonTexts(menu, 'start'),
				onClick: async () => {
					menu.playSound("menuSelect");
				},
				color: getThemeColors(menu.config.classicMode).menuBlue,
				index: 0
			},
			{
				isClicked: false,
				text: this.getButtonTexts(menu, 'play'),
				onClick: async () => {
					menu.playSound("menuSelect");
				},
				color: getThemeColors(menu.config.classicMode).menuBlue,
				index: 1
			},
			{
				isClicked: false,
				text: this.getButtonTexts(menu, 'options'),
				onClick: () => {
					menu.playSound("menuSelect");
				},
				color: getThemeColors(menu.config.classicMode).menuGreen,
				index: 2
			},
			{
				isClicked: false,
				text: this.getButtonTexts(menu, 'glossary'),
				onClick: () => {
					menu.playSound("menuSelect");
				},
				color: getThemeColors(menu.config.classicMode).menuOrange,
				index: 3
			},
			{
				isClicked: false,
				text: this.getButtonTexts(menu, 'info'),
				onClick: () => {
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
				text: this.getButtonTexts(menu, 'practice'),
				onClick: () => {
					menu.playSound("menuSelect");
				},
				color: getThemeColors(menu.config.classicMode).menuBlue,
				index: 0,
			},
			{
				isClicked: false,
				text: this.getButtonTexts(menu, 'ranked'),
				onClick: () => {
					menu.playSound("menuSelect");
				},
				color: getThemeColors(menu.config.classicMode).menuBlue,
				index: 1,	
			},
			{
				isClicked: false,
				text: this.getButtonTexts(menu, '1vsIA'),
				onClick: () => {
					menu.playSound("menuSelect");
				},
				color: getThemeColors(menu.config.classicMode).menuBlue,
				index: 2,
			},
			{
				isClicked: false,
				text: this.getButtonTexts(menu, 'tournament'),
				onClick: () => {
					menu.playSound("menuSelect");
				},
				color: getThemeColors(menu.config.classicMode).menuBlue,
				index: 3,
			},
			{
				isClicked: false,
				text: '1 VS 1',
				onClick: () => {
					menu.playSound("menuSelect");
				},
				color: getThemeColors(menu.config.classicMode).menuBlue,
				index: 4,
			},
		];

		let buttonIds: string[] = [
			'PRACTICE',
			'RANKED',
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
					menu.playSound("menuSelect");
				},
				color: getThemeColors(menu.config.classicMode).menuGreen,
				index: 0,
			},
			{
				isClicked: false,
				text: menu.config.classicMode ? this.getButtonTexts(menu, 'CLASSICON') : this.getButtonTexts(menu, 'CLASSICOFF'),
				onClick: () => {
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
					menu.playSound("menuSelect");
				},
				color: getThemeColors(menu.config.classicMode).menuBlue,
				index: 0
			},
			{
				isClicked: false,
				text: 'X',
				onClick: () => {
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
					menu.playSound("menuSelect");
				},
				color: getThemeColors(menu.config.classicMode).menuOrange,
				index: 0
			},
			{
				isClicked: false,
				text: 'X',
				onClick: () => {
					menu.playSound("menuSelect");
				},
				color: getThemeColors(menu.config.classicMode).menuPink,
				index: 1
			},
			{
				isClicked: false,
				text: 'X',
				onClick: () => {
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
	
			let x = menu.width / 2;
			let y = 660;
	
			switch (index) {
				case (0): {
					menu.glossaryQuitButton = quitButton;
					x = menu.width / 2 - 45;
					y = 660;
					break;
				}
				case (1): {
					menu.aboutQuitButton = quitButton;
					x = menu.width / 2 - 45;
					y = 660;
					break;
				}
				case (2): {
					menu.playQuitButton = quitButton;
					x = menu.width / 2 - 45;
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

	static createReadyButton(menu: Menu) {
		const readyButtonConfig: menuUtils.MenuButtonConfig = {
			isClicked: false,
			text: this.getButtonTexts(menu, 'ready'),
			onClick: () => {
				menu.playSound("menuSelect");
			},
			color: getThemeColors(menu.config.classicMode).menuBlue,
			index: 0
		};
	
		const readyButton = new MenuReadyButton(
			'menuReadyButton',
			'READY',
			'menuContainer',
			menu,
			readyButtonConfig
		);
	
		const x = 1300;
		const y = 540;
	
		readyButton.setPosition(x, y);
		readyButton.setHidden(true);
		menu.entities.push(readyButton);
		menu.menuHidden.addChild(readyButton.getContainer());
	
		menu.readyButton = readyButton;
	}

	static createTournamentOverlayButtons(menu: Menu) {
		const tournamentOverlayButtonConfigs: menuUtils.MenuButtonConfig[] = [
			{
				isClicked: false,
				text: this.getButtonTexts(menu, 'glossary'),
				onClick: () => {
					menu.playSound("menuSelect");
				},
				color: getThemeColors(menu.config.classicMode).menuBlue,
				index: 0
			},
			{
				isClicked: false,
				text: this.getButtonTexts(menu, 'CRTON'),
				onClick: () => {
					menu.playSound("menuSelect");
				},
				color: getThemeColors(menu.config.classicMode).menuBlue,
				index: 1
			}
		];
	
		const buttonIds: string[] = ['GLOSSARY', 'FILTERS'];
	
		tournamentOverlayButtonConfigs.forEach((config, index) => {
			const tournamentOverlayButton = new MenuTournamentOverlayButton(
				`tournamentOverlayButton_${config.text.toLowerCase()}`,
				buttonIds[index],
				'menuContainer',
				menu,
				config
			);
	
			const baseX = menu.width / 2 + 200;
			const baseY = 540;
			const verticalOffset = menu.tournamentOverlayButtonHeight + 10;
	
			const x = baseX;
			const y = baseY + (index * verticalOffset);
	
			tournamentOverlayButton.setPosition(x, y);
			tournamentOverlayButton.setHidden(true);
			menu.entities.push(tournamentOverlayButton);
			menu.menuHidden.addChild(tournamentOverlayButton.getContainer());
	
			if (index === 0) {
				menu.tournamentGlossaryButton = tournamentOverlayButton;
			} else if (index === 1) {
				menu.tournamentFiltersButton = tournamentOverlayButton;
			}
		});
	}

	static createPlayInputButton(menu: Menu) {
		const inputButtonConfig: menuUtils.MenuButtonConfig = {
			isClicked: false,
			text: "GUEST?",
			onClick: () => {
				menu.playSound("menuSelect");
			},
			color: getThemeColors(menu.config.classicMode).menuBlue,
			index: 0
		};
	
		const inputButton = new MenuBigInputButton(
			'playInputButton',
			'playInputButton',
			'menuContainer',
			menu,
			inputButtonConfig
		);
	
		const x = 710;
		const y = 555;
	
		inputButton.setPosition(x, y);
		inputButton.setHidden(true);
		menu.entities.push(inputButton);
		menu.menuHidden.addChild(inputButton.getContainer());
	
		menu.playInputButton = inputButton;
		menu.playInputButton.setClickable(false);
	}

	static createTournamentInputButtons(menu: Menu) {
		const tournamentInputButtonConfigs: menuUtils.MenuButtonConfig[] = [
			{
				isClicked: false,
				text: 'Player-1',
				onClick: () => {
					menu.playSound("menuSelect");
				},
				color: getThemeColors(menu.config.classicMode).menuBlue,
				index: 0
			},
			{
				isClicked: false,
				text: 'Player-2',
				onClick: () => {
					menu.playSound("menuSelect");
				},
				color: getThemeColors(menu.config.classicMode).menuBlue,
				index: 1
			},
			{
				isClicked: false,
				text: 'Player-3',
				onClick: () => {
					menu.playSound("menuSelect");
				},
				color: getThemeColors(menu.config.classicMode).menuBlue,
				index: 2
			},
			{
				isClicked: false,
				text: 'Player-4',
				onClick: () => {
					menu.playSound("menuSelect");
				},
				color: getThemeColors(menu.config.classicMode).menuBlue,
				index: 3
			},
			{
				isClicked: false,
				text: 'Player-5',
				onClick: () => {
					menu.playSound("menuSelect");
				},
				color: getThemeColors(menu.config.classicMode).menuBlue,
				index: 4
			},
			{
				isClicked: false,
				text: 'Player-6',
				onClick: () => {
					menu.playSound("menuSelect");
				},
				color: getThemeColors(menu.config.classicMode).menuBlue,
				index: 5
			},
			{
				isClicked: false,
				text: 'Player-7',
				onClick: () => {
					menu.playSound("menuSelect");
				},
				color: getThemeColors(menu.config.classicMode).menuBlue,
				index: 6
			},
			{
				isClicked: false,
				text: 'Player-8',
				onClick: () => {
					menu.playSound("menuSelect");
				},
				color: getThemeColors(menu.config.classicMode).menuBlue,
				index: 7
			}
		];

		tournamentInputButtonConfigs.forEach((config, index) => {
			const tournamentInputButton = new MenuSmallInputButton(
				`tournamentInputButton_${config.text.toLowerCase()}`,
				`tournamentInputButton_${index}`,
				'menuContainer',
				menu,
				config
			);
	
			let x = 155;
			let y = 195 + (index * 55);
	
			tournamentInputButton.setPosition(x, y);
			tournamentInputButton.setHidden(true);
			menu.entities.push(tournamentInputButton);
			menu.menuHidden.addChild(tournamentInputButton.getContainer());
	
			switch (index) {
				case (0): menu.tournamentInputButtons[index] = tournamentInputButton; break;
				case (1): menu.tournamentInputButtons[index] = tournamentInputButton; break;
				case (2): menu.tournamentInputButtons[index] = tournamentInputButton; break;
				case (3): menu.tournamentInputButtons[index] = tournamentInputButton; break;
				case (4): menu.tournamentInputButtons[index] = tournamentInputButton; break;
				case (5): menu.tournamentInputButtons[index] = tournamentInputButton; break;
				case (6): menu.tournamentInputButtons[index] = tournamentInputButton; break;
				case (7): menu.tournamentInputButtons[index] = tournamentInputButton; break;
			}
		});
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

			case ('practice'): {
				switch (menu.language) {
					case ('en'): return 'PRACTICE';
					case ('es'): return 'PRÁCTICA';
					case ('fr'): return 'PRATIQUE';
					case ('cat'): return 'PRÀCTICA';
					default: return 'PRACTICE';
				}
			}

			case ('ranked'): {
				switch (menu.language) {
					case ('en'): return 'RANKED';
					case ('es'): return 'CLASIFICATORIO';
					case ('fr'): return 'CLASSÉ';
					case ('cat'): return 'CLASSIFICATORI';
					default: return 'RANKED';
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
					case ('cat'): return 'FILTRE CRT: SÍ';
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
					case ('es'): return 'CLÁSICO: NO';
					case ('fr'): return 'CLASSIQUE: NON';
					case ('cat'): return 'CLÀSSIC: NO';
					default: return 'CLASSIC: OFF';
				}
			}

			case ('ready'): {
				switch (menu.language) {
					case ('en'): return 'READY';
					case ('es'): return 'LISTO';
					case ('fr'): return 'PRET';
					case ('cat'): return 'LLEST';
					default: return 'READY';
				}
			}

			case ('taunt'): {
				switch (menu.language) {
					case ('en'): return 'TAUNT';
					case ('es'): return 'PULLA';
					case ('fr'): return 'RAILLE';
					case ('cat'): return 'PULLA';
					default: return 'TAUNT';
				}
			}
			
			case ('filters'): {
				switch (menu.language) {
					case ('en'): return 'FILTERS';
					case ('es'): return 'FILTROS';
					case ('fr'): return 'FILTRES';
					case ('cat'): return 'FILTRES';
					default: return 'FILTERS';
				}
			}

			default:
				return 'UNKNOWN';
		}
	}
}