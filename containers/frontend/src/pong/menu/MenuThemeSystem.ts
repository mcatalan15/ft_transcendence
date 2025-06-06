/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   MenuThemeSystem.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 13:51:48 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/05 20:15:51 by hmunoz-g         ###   ########.fr       */
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
import { MenuButton } from './MenuButton';
import { MenuHalfButton } from './MenuHalfButton';

export class MenuThemeSystem implements System {
	private menu: Menu;
	private isClassicModeOn: boolean = false;
	private ornamentsNeedUpdate: boolean = false; // ← Add this flag

	constructor(menu: Menu) {
		this.menu = menu;
	}

	update(entities: Entity[], delta: FrameData): void {
		if (this.isClassicModeOn !== this.menu.config.classicMode) {
			this.isClassicModeOn = this.menu.config.classicMode;
			this.ornamentsNeedUpdate = true;
			this.updateButtons();
			this.remakeTitle();
		}
		
		// Only update ornaments when needed
		if (this.ornamentsNeedUpdate) {
			this.updateOrnaments();
			this.ornamentsNeedUpdate = false;
		}
	}
    
    // Call this when PLAY button is created/destroyed
    public markOrnamentsForUpdate(): void {
        this.ornamentsNeedUpdate = true;
    }

	updateButtons() {
		for (const entity of this.menu.entities) {
			if (isMenuButton(entity) || isMenuHalfButton(entity) || isMenuXButton(entity)) {
				// Skip if button is in transition state
				if (entity.isAnimating || entity.isStateChanging || entity.isUpdating) {
					continue;
				}
				
				// Mark as updating to prevent conflicts
				entity.isUpdating = true;
				
				const buttonColors = this.getButtonThemeColors(entity);
				if (buttonColors) {
					entity.updateButtonPolygon(false, buttonColors.color);
					entity.updateButtonTextColor(false, buttonColors.color);
				}
				
				// Clear updating flag after a frame
				requestAnimationFrame(() => {
					entity.isUpdating = false;
				});
			}
		}
	}
	
	private getButtonThemeColors(entity: MenuButton | MenuHalfButton | MenuXButton): { color: number } | null {
		const themeColors = getThemeColors(this.menu.config.classicMode);
		
		// Map button IDs to their theme colors
		const colorMap = new Map([
			[this.menu.startButton?.id, themeColors.menuBlue],
			[this.menu.optionsButton?.id, themeColors.menuGreen],
			[this.menu.glossaryButton?.id, themeColors.menuOrange],
			[this.menu.aboutButton?.id, themeColors.menuPink],
			[this.menu.playButton?.id, themeColors.menuBlue],
			[this.menu.localButton?.id, themeColors.menuBlue],
			[this.menu.onlineButton?.id, themeColors.menuBlue],
			[this.menu.duelButton?.id, themeColors.menuBlue],
			[this.menu.IAButton?.id, themeColors.menuBlue],
			[this.menu.tournamentButton?.id, themeColors.menuBlue],
			[this.menu.filtersButton?.id, themeColors.menuGreen],
			[this.menu.classicButton?.id, themeColors.menuGreen],
		]);
		
		// Handle X buttons by ID pattern
		if (isMenuXButton(entity)) {
			if (entity.id.includes('options')) {
				return { color: themeColors.menuGreen };
			} else if (entity.id.includes('start')) {
				return { color: themeColors.menuBlue };
			}
		}
		
		const color = colorMap.get(entity.id);
		return color ? { color } : null;
	}

	updateOrnaments() {
		let ornaments;
	
		for (const entity of this.menu.entities) {
			if (isMenuOrnaments(entity)) {
				ornaments = entity;
			}
		}
	
		if (!ornaments) return;
	
		const ornamentRender = ornaments.getComponent('render') as RenderComponent;
		
		// Define button-ornament mappings
		const buttonOrnamentMap = [
			{ button: this.menu.startButton, text: 'START', index: 0 },
			{ button: this.menu.optionsButton, text: 'OPTIONS', index: 1 },
			{ button: this.menu.glossaryButton, text: 'GLOSSARY', index: 2 },
			{ button: this.menu.aboutButton, text: 'ABOUT', index: 3 },
			{ button: this.menu.playButton, text: 'PLAY', index: 4 }
		];
	
		// Update all ornaments without state checking (for theme changes)
		for (const mapping of buttonOrnamentMap) {
			if (mapping.button && ornamentRender.graphic.children[mapping.index]) {
				ornaments.updateOrnament(
					mapping.button, 
					ornamentRender.graphic.children[mapping.index], 
					mapping.text, 
					false
				);
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