/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   MenuViewSystem.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/02 09:32:05 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/04 16:15:20 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Filter } from "pixi.js";

import { PongGame } from "../engine/Game";

import { Menu } from "./Menu";
import { MenuButton } from "./MenuButton";
import { MenuHalfButton } from "./MenuHalfButton";
import { MenuXButton } from "./MenuXButton";
import { System } from "../engine/System";
import { Entity } from "../engine/Entity";

import { RenderComponent } from "../components/RenderComponent";

import { isMenuButton, isMenuXButton, isMenuHalfButton, isMenuOrnaments } from "../utils/Guards";
import { FrameData, GameEvent, GAME_COLORS } from "../utils/Types";
import * as menuUtils from '../utils/MenuUtils'


export class MenuViewSystem implements System {
    private menu: Menu;

    constructor(menu: Menu) {
        this.menu = menu;
    }

    update(entities: Entity[], delta: FrameData): void {
        const unhandledEvents = [];

        while (this.menu.eventQueue.length > 0) {
            const event = this.menu.eventQueue.shift() as GameEvent;

            if (event.type === 'START_CLICK') {
                this.handleStartClick(event, entities);
            } else if (event.type === 'GLOSSARY_CLICK') {
				this.handleGlossaryClick(event, entities);
			} else if (event.type === 'OPTIONS_CLICK') {
				this.handleOptionsClick(event, entities);
			} else if (event.type === 'ABOUT_CLICK') {
				this.handleAboutClick(event, entities);
			} else if (event.type === 'PLAY_CLICK') {
				this.handlePlayClick(event, entities);
			} else if (event.type.endsWith('BACK')) {
				this.resetLayer(event, entities);
			} else if (event.type === 'CHANGE_START_OPTIONS') {
				this.changeStartOptions();
			} else {
                unhandledEvents.push(event);
            }
        }
        this.menu.eventQueue.push(...unhandledEvents);

		this.updatePlayButton(entities);
    }

	updatePlayButton(entities: Entity[]) {
		let playButton;
		let firstFlag = false;
		let secondFlag = false;
	
		for (const entity of entities) {
			if (isMenuButton(entity) && entity.id.includes('play')) {
				playButton = entity;
			} else if (isMenuHalfButton(entity) && (entity.id.includes('local') || entity.id.includes('online'))) {
				if (entity.isClicked) {
					firstFlag = true;
				}
			} else if (isMenuHalfButton(entity) && (entity.id.includes('1 vs ia') || entity.id.includes('1 vs 1') || entity.id.includes('tournament'))) {
				if (entity.isClicked) {
					secondFlag = true;
				}
			}
		}
	
		if (playButton) {
			if (firstFlag && secondFlag) {
				playButton.updateClickableState(true);
			} else {
				playButton.updateClickableState(false);
			}
		}
	}

    handleStartClick(event: GameEvent, entities: Entity[]): void {
		let ornaments;
		for (const entity of this.menu.entities) {
			if (isMenuOrnaments(entity)) {
				ornaments = entity;
			}
		}

		const render = ornaments!.getComponent('render') as RenderComponent;
		const graphic = render?.graphic;
		ornaments?.updateOrnament(graphic!.children[0], 'START');

		for (const entity of entities) {
			if (isMenuButton(entity) && entity.getText() === 'START') {
				this.menu.removeEntity(entity.id);
			}
		}

		this.createPlayButton();
		
		this.createXButton('start');

		this.createStartHalfButtons();
	}

	handleOptionsClick(event: GameEvent, entities: Entity[]): void {
        let ornaments;
		for (const entity of this.menu.entities) {
			if (isMenuOrnaments(entity)) {
				ornaments = entity;
			}
		}

		const render = ornaments!.getComponent('render') as RenderComponent;
		const graphic = render?.graphic;
		ornaments?.updateOrnament(graphic!.children[1], 'OPTIONS');
		
		for (const entity of entities) {
			if (isMenuButton(entity) && entity.getText() === 'OPTIONS') {
				this.menu.removeEntity(entity.id);
			}
		}
		
		this.createXButton('options');

		this.createOptionsHalfButtons();
	}

	handleGlossaryClick(event: GameEvent, entities: Entity[]): void {
		let ornaments;
		for (const entity of this.menu.entities) {
			if (isMenuOrnaments(entity)) {
				ornaments = entity;
			}
		}

		const render = ornaments!.getComponent('render') as RenderComponent;
		const graphic = render?.graphic;
		ornaments?.updateOrnament(graphic!.children[2], 'GLOSSARY');
	}
	

	handleAboutClick(event: GameEvent, entities: Entity[]): void {
        let ornaments;
		for (const entity of this.menu.entities) {
			if (isMenuOrnaments(entity)) {
				ornaments = entity;
			}
		}

		const render = ornaments!.getComponent('render') as RenderComponent;
		const graphic = render?.graphic;
		ornaments?.updateOrnament(graphic!.children[3], 'ABOUT');
	}

	handlePlayClick(event: GameEvent, entities: Entity[]) : void {
		this.menu.cleanup();
						
		const game = new PongGame(this.menu.app);
		this.menu.sounds.menuConfirm.play();
		this.menu.sounds.menuBGM.stop();
		game.init();
		this.menu.sounds.menuSelect.play();
	} 

	createXButton(layer: string) {
		const config: menuUtils.MenuButtonConfig = {
			text: 'X',
			onClick: () => {
				console.log(`return at ${layer} clicked`);
				this.menu.sounds.menuSelect.play();
			},
			color: layer === 'start' ? GAME_COLORS.menuBlue : GAME_COLORS.menuGreen,
			index: 0,
		};
	
		const menuXButton = new MenuXButton(
			`${layer}XButton_${config.text.toLowerCase()}`, 
			'menuContainer', 
			this.menu, 
			config
		);
	
		let y;
		let x;
		
		if (layer === 'start') {
			y = (this.menu.app.screen.height / 3);
			x = (this.menu.app.screen.width - this.menu.buttonWidth) / 2 - (this.menu.buttonXWidth * 2) - this.menu.ornamentOffset - (this.menu.ornamentOffset * 3) - (this.menu.halfButtonWidth * 2);
		} else if (layer === 'options') {
			y = (this.menu.app.screen.height / 3) + ((this.menu.buttonHeight + this.menu.buttonVerticalOffset));
			x = (this.menu.app.screen.width - this.menu.buttonWidth) / 2 - (this.menu.buttonWidth / 2) - this.menu.ornamentOffset + 35;
		}
	
		menuXButton.setPosition(x!, y!);
		this.menu.entities.push(menuXButton);
		this.menu.menuContainer.addChild(menuXButton.getContainer());
	}

	createPlayButton() {
		const config: menuUtils.MenuButtonConfig = {
			isClicked: false,
			text: 'PLAY',
			onClick: () => {
				console.log('PLAY clicked');
				this.menu.sounds.menuConfirm.play();
			},
			color: GAME_COLORS.menuBlue,
			index: 0,
		};
	
		const menuXButton = new MenuButton(
			`playButton_${config.text.toLowerCase()}`, 
			'menuContainer', 
			this.menu, 
			config
		);
	
		const x = (this.menu.app.screen.width - this.menu.buttonWidth) / 2;
		const y = (this.menu.app.screen.height / 3);
	
		menuXButton.setPosition(x!, y!);
		this.menu.entities.push(menuXButton);
		this.menu.menuContainer.addChild(menuXButton.getContainer());
	}

	createStartHalfButtons() {
		const HalfButtonConfigs: menuUtils.MenuButtonConfig[] = [
			{
				isClicked: true,
				text: "LOCAL",
				onClick: () => {
					console.log('LOCAL clicked');
					this.menu.sounds.menuSelect.play();
				},
				color: GAME_COLORS.menuBlue,
				index: 0,
			},
			{
				isClicked: false,
				text: 'ONLINE',
				onClick: () => {
					console.log('ONLINE clicked');
					this.menu.sounds.menuSelect.play();
				},
				color: GAME_COLORS.menuBlue,
				index: 1,	
			},
			{
				isClicked: false,
				text: '1 vs IA',
				onClick: () => {
					console.log('classic toggler clicked');
					this.menu.sounds.menuSelect.play();
				},
				color: GAME_COLORS.menuBlue,
				index: 2,
			},
			{
				isClicked: false,
				text: '1 vs 1',
				onClick: () => {
					console.log('classic toggler clicked');
					this.menu.sounds.menuSelect.play();
				},
				color: GAME_COLORS.menuBlue,
				index: 3,
			},
		];

		HalfButtonConfigs.forEach((config, index) => {
			const optionsHalfButton = new MenuHalfButton(
				`startHalfButton_index${index}_${config.text.toLowerCase()}`, 
				'menuContainer', 
				this.menu, 
				config,
			);

			let x;
			let y;

			switch (index) {
				case (0): {
					this.menu.localButton = optionsHalfButton;
					x = (this.menu.app.screen.width - this.menu.buttonWidth) / 2 - this.menu.ornamentOffset - (this.menu.ornamentOffset * 2) - (this.menu.halfButtonWidth * 2) - (index * this.menu.halfButtonSlant) + 3;
					y = (this.menu.app.screen.height / 3) + (index * this.menu.halfButtonOffset);
					break;
				}
				case (1): {
					this.menu.onlineButton = optionsHalfButton;
					x = (this.menu.app.screen.width - this.menu.buttonWidth) / 2 - this.menu.ornamentOffset - (this.menu.ornamentOffset * 2) - (this.menu.halfButtonWidth * 2) - (index * this.menu.halfButtonSlant) + (index);
					y = (this.menu.app.screen.height / 3) + (index * this.menu.halfButtonOffset);
					break;
				}
				case (2): {
					this.menu.IAButton = optionsHalfButton;
					x = (this.menu.app.screen.width - this.menu.buttonWidth) / 2 - this.menu.ornamentOffset  - (this.menu.halfButtonWidth) - (index * this.menu.halfButtonSlant) + (index * 4.5);
					y = (this.menu.app.screen.height / 3) + ((index - 2) * this.menu.halfButtonOffset);
					break;
				}
				case(3): {
					this.menu.duelButton = optionsHalfButton;
					x = (this.menu.app.screen.width - this.menu.buttonWidth) / 2 - this.menu.ornamentOffset  - (this.menu.halfButtonWidth) - (index * this.menu.halfButtonSlant) + ((index - 1)  * 3.5);
					y = (this.menu.app.screen.height / 3) + ((index - 2) * this.menu.halfButtonOffset);
					break;
				}
			}

			optionsHalfButton.setPosition(x!, y!);

			this.menu.entities.push(optionsHalfButton);
	
			this.menu.menuContainer.addChild(optionsHalfButton.getContainer());
		});
	}

	createOptionsHalfButtons() {
		const HalfButtonConfigs: menuUtils.MenuButtonConfig[] = [
			{
				isClicked: true,
				text: (this.menu.menuContainer.filters && (this.menu.menuContainer.filters as Filter[]).length > 0) ? 'CRT FILTER: ON' : 'CRT FILTER: OFF',
				onClick: () => {
					console.log('filter toggler clicked');
					this.menu.sounds.menuSelect.play();
				},
				color: GAME_COLORS.menuGreen,
				index: 0,
			},
			{
				isClicked: false,
				text: 'CLASSIC: OFF',
				onClick: () => {
					console.log('classic toggler clicked');
					this.menu.sounds.menuSelect.play();
				},
				color: GAME_COLORS.menuGreen,
				index: 1,
			},
		];

		HalfButtonConfigs.forEach((config, index) => {
			const optionsHalfButton = new MenuHalfButton(
				`optionsHalfButton_${config.text.toLowerCase()}`, 
				'menuContainer', 
				this.menu, 
				config
			);

			if (index === 0) {
				this.menu.filtersButton = optionsHalfButton;
			} else if (index === 1) {
				this.menu.classicButton = optionsHalfButton;
			}
			const x = (this.menu.app.screen.width - this.menu.buttonWidth) / 2 - this.menu.buttonWidth / 4 - ((index * this.menu.halfButtonSlant)) + 25 - (index * 2);
			const y = (this.menu.app.screen.height / 3) + ((this.menu.buttonHeight + this.menu.buttonVerticalOffset)) + (index * this.menu.halfButtonOffset);

			optionsHalfButton.setPosition(x, y);

			this.menu.entities.push(optionsHalfButton);
	
			this.menu.menuContainer.addChild(optionsHalfButton.getContainer());
		});
	}

	resetLayer(event: GameEvent, entities: Entity[]): void {
		const entitiesToRemove: string[] = [];

		if (event.type.startsWith('OPTIONS')) {
			for (const entity of entities) {
				if (isMenuXButton(entity) && entity.id.startsWith('options')) {
					entitiesToRemove.push(entity.id);
				} else if (isMenuHalfButton(entity) && entity.id.includes('options')) {
					console.log(`deleting ${entity.id}`);
					entitiesToRemove.push(entity.id);
				}
			}

			this.rebuildOptionsButton();
		} else if (event.type.startsWith('START')) {
			for (const entity of entities) {
				if (isMenuXButton(entity) && entity.id.startsWith('start')) {
					entitiesToRemove.push(entity.id);
				} else if (isMenuHalfButton(entity) && entity.id.includes('start')) {
					entitiesToRemove.push(entity.id);
				} else if (isMenuButton(entity) && entity.id.includes('play')) {
					entitiesToRemove.push(entity.id);
				}
			}

			this.rebuildStartButton();
		}

		entitiesToRemove.forEach(id => {
			this.menu.removeEntity(id);
		});
	}

	rebuildOptionsButton() {
		const buttonConfigs: menuUtils.MenuButtonConfig[] = [
			{
				isClicked: true,
				text: 'OPTIONS',
				onClick: () => {
					console.log('Options clicked');
					this.menu.sounds.menuSelect.play();
				},
				color: GAME_COLORS.menuGreen,
				index: 1,
			},
		];
	
		buttonConfigs.forEach((config, index) => {
			const menuButton = new MenuButton(
				`menuButton_${config.text.toLowerCase()}`, 
				'menuContainer', 
				this.menu, 
				config
			);

			const x = (this.menu.app.screen.width - this.menu.buttonWidth) / 2 - ((this.menu.buttonSlant + 5));
			const y = (this.menu.app.screen.height / 3) + ((this.menu.buttonHeight + this.menu.buttonVerticalOffset));
			menuButton.setPosition(x, y);

			this.menu.entities.push(menuButton);
	
			this.menu.menuContainer.addChild(menuButton.getContainer());
		});

		let ornaments;
		for (const entity of this.menu.entities) {
			if (isMenuOrnaments(entity)) {
				ornaments = entity;
			}
		}

		const render = ornaments!.getComponent('render') as RenderComponent;
		const graphic = render?.graphic;
		ornaments?.updateOrnament(graphic!.children[1], 'OPTIONS', true);
	}

	rebuildStartButton() {
		console.log('holiwi');
		const buttonConfigs: menuUtils.MenuButtonConfig[] = [
			{
				isClicked: true,
				text: 'START',
				onClick: () => {
					console.log('Start clicked');
					this.menu.sounds.menuSelect.play();
				},
				color: GAME_COLORS.menuBlue,
				index: 0,
			},
		];
	
		buttonConfigs.forEach((config, index) => {
			const menuButton = new MenuButton(
				`menuButton_${config.text.toLowerCase()}`, 
				'menuContainer', 
				this.menu, 
				config
			);

			const x = (this.menu.app.screen.width - this.menu.buttonWidth) / 2 - (index * (this.menu.buttonSlant + 5));
			const y = (this.menu.app.screen.height / 3) + (index * (this.menu.buttonHeight + this.menu.buttonVerticalOffset));
			menuButton.setPosition(x, y);

			this.menu.entities.push(menuButton);
	
			this.menu.menuContainer.addChild(menuButton.getContainer());
		});

		let ornaments;
		for (const entity of this.menu.entities) {
			if (isMenuOrnaments(entity)) {
				ornaments = entity;
			}
		}

		const render = ornaments!.getComponent('render') as RenderComponent;
		const graphic = render?.graphic;
		ornaments?.updateOrnament(graphic!.children[0], 'START', true);
	}

	changeStartOptions() {
		let localClicked = false;
		let onlineClicked = false;
		
		const entitiesToRemove: string[] = [];

		for (const entity of this.menu.entities) {
			if (isMenuHalfButton(entity) && entity.id.includes('local')) {
				if (entity.isClicked)
					localClicked = true;
			} else if (isMenuHalfButton(entity) && entity.id.includes('online')) {
				if (entity.isClicked)
					onlineClicked = true;
			} else if (isMenuHalfButton(entity) && (entity.getText().includes('1') || entity.getText().includes('TOURNAMENT'))) {
				entitiesToRemove.push(entity.id);
			}
		}

		entitiesToRemove.forEach(id => {
			this.menu.removeEntity(id);
		});

		if (localClicked) {
			this.updateStartOptions('LOCAL');
		} else if (onlineClicked) {
			this.updateStartOptions('ONLINE');
		} 
	}

	updateStartOptions(selection: string) {
		let HalfButtonConfigs: menuUtils.MenuButtonConfig[];
    
		switch (selection){
			case('LOCAL'): {
				HalfButtonConfigs = [
					{
						isClicked: false,
						text: '1 vs IA',
						onClick: () => {
							console.log('classic toggler clicked');
							this.menu.sounds.menuSelect.play();
						},
						color: GAME_COLORS.menuBlue,
						index: 2,
					},
					{
						isClicked: false,
						text: '1 vs 1',
						onClick: () => {
							console.log('classic toggler clicked');
							this.menu.sounds.menuSelect.play();
						},
						color: GAME_COLORS.menuBlue,
						index: 3,
					},
				];

				HalfButtonConfigs.forEach((config, index) => {
					const optionsHalfButton = new MenuHalfButton(
						`startHalfButton_index${index}_${config.text.toLowerCase()}`, 
						'menuContainer', 
						this.menu, 
						config,
					);
		
					let x;
					let y;
		
					switch (index) {
						case (0): {
							this.menu.IAButton = optionsHalfButton;
							x = (this.menu.app.screen.width - this.menu.buttonWidth) / 2 - this.menu.ornamentOffset  - (this.menu.halfButtonWidth) - (index * this.menu.halfButtonSlant) - 8.5;
							y = (this.menu.app.screen.height / 3) + ((index) * this.menu.halfButtonOffset);
							break;
						}
						case(1): {
							this.menu.duelButton = optionsHalfButton;
							x = (this.menu.app.screen.width - this.menu.buttonWidth) / 2 - this.menu.ornamentOffset  - (this.menu.halfButtonWidth) - (index * this.menu.halfButtonSlant) - 10.5;
							y = (this.menu.app.screen.height / 3) + ((index) * this.menu.halfButtonOffset);
							break;
						}
					}
		
					optionsHalfButton.setPosition(x!, y!);
		
					this.menu.entities.push(optionsHalfButton);
			
					this.menu.menuContainer.addChild(optionsHalfButton.getContainer());
				});

				break;
			}
			
			default: {
				HalfButtonConfigs = [
					{
						isClicked: false,
						text: 'TOURNAMENT',
						onClick: () => {
							console.log('classic toggler clicked');
							this.menu.sounds.menuSelect.play();
						},
						color: GAME_COLORS.menuBlue,
						index: 2,
					},
					{
						isClicked: false,
						text: '1 vs 1',
						onClick: () => {
							console.log('classic toggler clicked');
							this.menu.sounds.menuSelect.play();
						},
						color: GAME_COLORS.menuBlue,
						index: 3,
					},
				];

				HalfButtonConfigs.forEach((config, index) => {
					const optionsHalfButton = new MenuHalfButton(
						`startHalfButton_index${index}_${config.text.toLowerCase()}`, 
						'menuContainer', 
						this.menu, 
						config,
					);
		
					let x;
					let y;
		
					switch (index) {
						case (0): {
							this.menu.tournamentButton = optionsHalfButton;
							x = (this.menu.app.screen.width - this.menu.buttonWidth) / 2 - this.menu.ornamentOffset  - (this.menu.halfButtonWidth) - (index * this.menu.halfButtonSlant) - 8.5;
							y = (this.menu.app.screen.height / 3) + ((index) * this.menu.halfButtonOffset);
							break;
						}
						case(1): {
							this.menu.duelButton = optionsHalfButton;
							x = (this.menu.app.screen.width - this.menu.buttonWidth) / 2 - this.menu.ornamentOffset  - (this.menu.halfButtonWidth) - (index * this.menu.halfButtonSlant) - 10.5;
							y = (this.menu.app.screen.height / 3) + ((index) * this.menu.halfButtonOffset);
							break;
						}
					}
		
					optionsHalfButton.setPosition(x!, y!);
		
					this.menu.entities.push(optionsHalfButton);
			
					this.menu.menuContainer.addChild(optionsHalfButton.getContainer());
				});
			}
		}

		
	}
}