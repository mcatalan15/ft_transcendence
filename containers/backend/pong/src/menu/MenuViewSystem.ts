/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   MenuViewSystem.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/02 09:32:05 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/03 15:49:21 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Filter } from "pixi.js";

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
			} else if (event.type.endsWith('BACK')) {
				this.resetLayer(event, entities);
			} else {
                unhandledEvents.push(event);
            }
        }
        this.menu.eventQueue.push(...unhandledEvents);
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

	createXButton(layer: string) {
		const buttonConfigs: menuUtils.MenuButtonConfig[] = [
			{
				text: 'X',
				onClick: () => {
					console.log('filter toggler clicked');
					this.menu.sounds.menuSelect.play();
				},
				color: GAME_COLORS.menuGreen,
				index: 0
			},
		];

		buttonConfigs.forEach((config, index) => {
			const menuXButton = new MenuXButton(
				`${layer}XButton_${config.text.toLowerCase()}`, 
				'menuContainer', 
				this.menu, 
				config
			);

			let x = (this.menu.app.screen.width - this.menu.buttonWidth) / 2 - (this.menu.buttonWidth / 2) - this.menu.ornamentOffset + 35;
			
			const y = (this.menu.app.screen.height / 3) + ((this.menu.buttonHeight + this.menu.buttonVerticalOffset));
			menuXButton.setPosition(x, y);

			this.menu.entities.push(menuXButton);
	
			this.menu.menuContainer.addChild(menuXButton.getContainer());
		});
	}

	createOptionsHalfButtons() {
		const HalfButtonConfigs: menuUtils.MenuButtonConfig[] = [
			{
				text: (this.menu.menuContainer.filters && (this.menu.menuContainer.filters as Filter[]).length > 0) ? 'CRT FILTER: ON' : 'CRT FILTER: OFF',
				onClick: () => {
					console.log('filter toggler clicked');
					this.menu.sounds.menuSelect.play();
				},
				color: GAME_COLORS.menuGreen,
				index: 0
			},
			{
				text: 'CLASSIC: OFF',
				onClick: () => {
					console.log('classic toggler clicked');
					this.menu.sounds.menuSelect.play();
				},
				color: GAME_COLORS.menuGreen,
				index: 1
			},
		];

		HalfButtonConfigs.forEach((config, index) => {
			const optionsHalfButton = new MenuHalfButton(
				`optionsHalfButton_${config.text.toLowerCase()}`, 
				'menuContainer', 
				this.menu, 
				config
			);
			const x = (this.menu.app.screen.width - this.menu.buttonWidth) / 2 - this.menu.buttonWidth / 4 - ((index * this.menu.halfButtonSlant)) + 25 - (index * 2);
			const y = (this.menu.app.screen.height / 3) + ((this.menu.buttonHeight + this.menu.buttonVerticalOffset)) + (index * this.menu.halfButtonOffset);

			optionsHalfButton.setPosition(x, y);

			this.menu.entities.push(optionsHalfButton);
	
			this.menu.menuContainer.addChild(optionsHalfButton.getContainer());
		});
	}

	resetLayer(event: GameEvent, entities: Entity[]): void {
		
		if (event.type.startsWith('OPTIONS')) {
			const entitiesToRemove: string[] = [];
			
			for (const entity of entities) {
				if (isMenuXButton(entity) && entity.id.startsWith('options')) {
					entitiesToRemove.push(entity.id);
				} else if (isMenuHalfButton(entity)) {
					entitiesToRemove.push(entity.id);
				}
			}
			
			entitiesToRemove.forEach(id => {
				this.menu.removeEntity(id);
			});

			this.rebuildOptionsButton();
		}
	}

	rebuildOptionsButton() {
		const buttonConfigs: menuUtils.MenuButtonConfig[] = [
			{
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
}