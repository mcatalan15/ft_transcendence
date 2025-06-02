/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   MenuViewSystem.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/02 09:32:05 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/02 18:00:05 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Container } from "pixi.js";

import { Menu } from "./Menu";
import { MenuButton } from "./MenuButton";
import { System } from "../engine/System";
import { Entity } from "../engine/Entity";

import { RenderComponent } from "../components/RenderComponent";

import { isMenuButton, isMenuOrnaments } from "../utils/Guards";
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

	handleGlossaryClick(event: GameEvent, entities: Entity[]): void {
		let ornaments;
		for (const entity of this.menu.entities) {
			if (isMenuOrnaments(entity)) {
				ornaments = entity;
			}
		}

		const render = ornaments!.getComponent('render') as RenderComponent;
		const graphic = render?.graphic;
		ornaments?.updateOrnament(graphic!.children[1], 'GLOSSARY');
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
		ornaments?.updateOrnament(graphic!.children[2], 'OPTIONS');
		(event.target as Container).x -= 474;
		this.createOptionsButtonsLayerTwo();
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

	createOptionsButtonsLayerTwo() {
		const buttonConfigs: menuUtils.MenuButtonConfig[] = [
			{
				text: 'FILTERS: OFF',
				onClick: () => {
					console.log('filter toggler clicked');
					this.menu.sounds.menuSelect.play();
				},
				color: GAME_COLORS.menuOrange,
				index: 0
			},
			{
				text: 'CLASSIC: OFF',
				onClick: () => {
					console.log('Classic toggler clicked');
					this.menu.sounds.menuSelect.play();
				},
				color: GAME_COLORS.menuOrange,
				index: 1
			}
		];

		buttonConfigs.forEach((config, index) => {
			const menuButton = new MenuButton(
				`menuButton_${config.text.toLowerCase()}`, 
				'menuContainer', 
				this.menu, 
				config
			);

			let x;
			switch (index) {
				case (0):
					x = (this.menu.app.screen.width - this.menu.buttonWidth) / 2 - 287;
					break;
				default:
					x = (this.menu.app.screen.width - this.menu.buttonWidth) / 2 - this.menu.ornamentOffset;
					break;
			}
			
			const y = (this.menu.app.screen.height / 3) + (2 * (this.menu.buttonHeight + this.menu.buttonSpacing));
			menuButton.setPosition(x, y);

			this.menu.entities.push(menuButton);
	
			this.menu.menuContainer.addChild(menuButton.getContainer());
		});
	}
}