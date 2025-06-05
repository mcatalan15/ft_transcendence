/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   MenuThemeSystem.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 13:51:48 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/05 17:17:02 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Point, Graphics } from 'pixi.js'

import { PongGame } from '../engine/Game';
import { Entity } from '../engine/Entity';
import type { System } from '../engine/System'

import { Menu } from './Menu';
import { Title } from './Title';
import { ClassicO } from './ClassicO';
import { BallButton } from './BallButton';

import { FrameData, GameEvent } from '../utils/Types';
import { isBall, isMenuButton, isMenuHalfButton, isMenuOrnaments, isMenuXButton } from '../utils/Guards';
import { RenderComponent } from '../components/RenderComponent';
import { getThemeColors } from '../utils/Utils';
import { MenuXButton } from './MenuXButton';

export class MenuThemeSystem implements System {
	private menu: Menu;
	private isClassicModeOn: boolean = false;

	constructor(menu: Menu) {
		this.menu = menu;
	}

	update(entities: Entity[], delta: FrameData): void {
		//!OJO
		/* for (const entity of this.menu.entities) {
			if (isMenuButton(entity)) {
				console.log(`isClicked at ${entity.getText()}? ${entity.isClicked}`);
			}
		} */
		
		if (this.isClassicModeOn !== this.menu.config.classicMode) {
			this.isClassicModeOn = this.menu.config.classicMode;


			this.updateOrnaments();
			
			this.updateButtons();

			this.remakeTitle();
		}
	}

	updateButtons() {
		const entitiesToRemove: string[] = [];

		for (const entity of this.menu.entities) {
			if (isMenuButton(entity) || isMenuHalfButton(entity) || isMenuXButton(entity)) {
				entitiesToRemove.push(entity.id);
				if (entity.id === this.menu.startButton.id) {
					entity.updateButtonPolygon(false, getThemeColors(this.menu.config.classicMode).menuBlue);
					entity.updateButtonTextColor(false, getThemeColors(this.menu.config.classicMode).menuBlue);
				} else if (entity.id === this.menu.optionsButton.id) {
					entity.updateButtonPolygon(false, getThemeColors(this.menu.config.classicMode).menuGreen);
					entity.updateButtonTextColor(false, getThemeColors(this.menu.config.classicMode).menuGreen);
				} else if (entity.id === this.menu.glossaryButton.id) {
					entity.updateButtonPolygon(false, getThemeColors(this.menu.config.classicMode).menuOrange);
					entity.updateButtonTextColor(false, getThemeColors(this.menu.config.classicMode).menuOrange);
				} else if (entity.id === this.menu.aboutButton.id) {
					entity.updateButtonPolygon(false, getThemeColors(this.menu.config.classicMode).menuPink);
					entity.updateButtonTextColor(false, getThemeColors(this.menu.config.classicMode).menuPink);
				} else if (this.menu.playButton && entity.id === this.menu.playButton.id) {
					entity.updateButtonPolygon(false, getThemeColors(this.menu.config.classicMode).menuBlue);
					entity.updateButtonTextColor(false, getThemeColors(this.menu.config.classicMode).menuBlue);
				} else if (this.menu.localButton && entity.id === this.menu.localButton.id) {
					entity.updateButtonPolygon(false, getThemeColors(this.menu.config.classicMode).menuBlue);
					entity.updateButtonTextColor(false, getThemeColors(this.menu.config.classicMode).menuBlue);
				} else if (this.menu.onlineButton && entity.id === this.menu.onlineButton.id) {
					entity.updateButtonPolygon(false, getThemeColors(this.menu.config.classicMode).menuBlue);
					entity.updateButtonTextColor(false, getThemeColors(this.menu.config.classicMode).menuBlue);
				} else if (this.menu.duelButton && entity.id === this.menu.duelButton.id) {
					entity.updateButtonPolygon(false, getThemeColors(this.menu.config.classicMode).menuBlue);
					entity.updateButtonTextColor(false, getThemeColors(this.menu.config.classicMode).menuBlue);
				} else if (this.menu.IAButton && entity.id === this.menu.IAButton.id) {
					entity.updateButtonPolygon(false, getThemeColors(this.menu.config.classicMode).menuBlue);
					entity.updateButtonTextColor(false, getThemeColors(this.menu.config.classicMode).menuBlue);
				} else if (this.menu.tournamentButton && entity.id === this.menu.tournamentButton.id) {
					entity.updateButtonPolygon(false, getThemeColors(this.menu.config.classicMode).menuBlue);
					entity.updateButtonTextColor(false, getThemeColors(this.menu.config.classicMode).menuBlue);
				} else if (entity.id === this.menu.filtersButton.id) {
					entity.updateButtonPolygon(false, getThemeColors(this.menu.config.classicMode).menuGreen);
					entity.updateButtonTextColor(false, getThemeColors(this.menu.config.classicMode).menuGreen);
				} else if (entity.id === this.menu.classicButton.id) {
					entity.updateButtonPolygon(false, getThemeColors(this.menu.config.classicMode).menuGreen);
					entity.updateButtonTextColor(false, getThemeColors(this.menu.config.classicMode).menuGreen);
				} else if (isMenuXButton(entity)) {
					if (entity.id.includes('options')) {
						entity.updateButtonPolygon(false, getThemeColors(this.menu.config.classicMode).menuGreen);
						entity.updateButtonTextColor(false, getThemeColors(this.menu.config.classicMode).menuGreen);
					} else if (entity.id.includes('start')) {
						entity.updateButtonPolygon(false, getThemeColors(this.menu.config.classicMode).menuBlue);
						entity.updateButtonTextColor(false, getThemeColors(this.menu.config.classicMode).menuBlue);
					}
				}
			}
		}
	}

	updateOrnaments(){
		let ornaments;

		for (const entity of this.menu.entities) {
			if (isMenuOrnaments(entity)) {
				ornaments = entity;
			}
		}

		const ornamentRender = ornaments?.getComponent('render') as RenderComponent;
			console.log(this.menu.playButton);
			for (let i = 0; i < 5; i++) {
				switch (i) {
					case (0): ornaments!.updateOrnament(this.menu.startButton, ornamentRender.graphic.children[i], 'START', false); break;
					case (1): ornaments!.updateOrnament(this.menu.optionsButton, ornamentRender.graphic.children[i], 'OPTIONS', false); break;
					case (2): ornaments!.updateOrnament(this.menu.glossaryButton, ornamentRender.graphic.children[i], 'GLOSSARY', false); break;
					case (3): ornaments!.updateOrnament(this.menu.aboutButton, ornamentRender.graphic.children[i], 'ABOUT', false); break;
					case (4): {
						if (this.menu.playButton) {
							ornaments!.updateOrnament(this.menu.playButton, ornamentRender.graphic.children[i], 'PLAY', false);
						}
						break;
					} 
				}
				
			}
	}

	remakeTitle() {
		const entitiesToRemove: string[] = [];
		
		for (const entity of this.menu.entities) {
			if (entity instanceof Title) {
				entitiesToRemove.push(entity.id);
			} else if (entity instanceof BallButton) {
				entitiesToRemove.push(entity.id);
			} else if (isBall(entity)) {
				entitiesToRemove.push(entity.id);
			} else if (entity instanceof ClassicO) {
				entitiesToRemove.push(entity.id);
			}
		}

		for (const entityId of entitiesToRemove) {
			this.menu.removeEntity(entityId);
		}

		this.menu.renderLayers.logo.children.splice(0, 2);

		this.menu.createTitle();

		if (!this.menu.config.classicMode) {
			this.menu.createBallButton();
		} else {
			this.createClassicO();
		}
	}

	createClassicO() {
		const classicO = new ClassicO('classicO', 'menuContainer', this.menu);

		this.menu.renderLayers.logo.addChild((classicO.getComponent('render') as RenderComponent).graphic);
		this.menu.entities.push(classicO);
	}
}