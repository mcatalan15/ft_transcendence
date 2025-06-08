/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   MenuOrnaments.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/02 14:18:30 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/08 19:02:55 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Container, Text, FederatedPointerEvent } from 'pixi.js';
import { Entity } from '../engine/Entity';
import { RenderComponent } from '../components/RenderComponent';
import { AnimationComponent } from '../components/AnimationComponent';
import { GAME_COLORS} from '../utils/Types';
import { Menu } from './Menu';
import { getButtonPoints, MenuButtonConfig } from '../utils/MenuUtils';
import { getThemeColors } from '../utils/Utils';
import { isMenuButton } from '../utils/Guards';
import { MenuButton } from './buttons/MenuButton';

interface OrnamentConfig {
	layer: string;
	color: number;
	points: number[];
	position: { x: number; y: number };
	clickedPoints?: number[];
	clickedColor?: number;
}

export class MenuOrnament extends Entity {
	menu: Menu;
	private ornamentContainer: Container;
	private ornamentGraphic: Graphics;
	private config: OrnamentConfig;
	private isClicked: boolean = false;

	constructor(id: string, layer: string, menu: Menu, ornamentLayer?: string) {
		super(id, layer);
		this.menu = menu;
		this.ornamentContainer = new Container();
		
		this.config = this.generateOrnamentConfig(ornamentLayer || layer);
		
		this.ornamentGraphic = this.createOrnament();
		this.ornamentContainer.addChild(this.ornamentGraphic);
		
		const renderComponent = new RenderComponent(this.ornamentContainer);
		this.addComponent(renderComponent, 'render');
	}

	private generateOrnamentConfig(ornamentLayer: string): OrnamentConfig {
		const themeColors = getThemeColors(this.menu.config.classicMode);
		const baseY = this.menu.app.screen.height / 3;
		
		const configs: { [key: string]: OrnamentConfig } = {
			'START': {
				layer: 'START',
				color: themeColors.menuBlue,
				points: this.calculatePoints('START', false),
				position: { x: 0, y: baseY },
				clickedPoints: this.calculatePoints('START', true),
				clickedColor: themeColors.white
			},
			'PLAY': {
				layer: 'PLAY',
				color: themeColors.white,
				points: this.calculatePoints('PLAY', false),
				position: { x: 0, y: baseY },
				clickedPoints: this.calculatePoints('PLAY', true),
				clickedColor: themeColors.white
			},
			'OPTIONS': {
				layer: 'OPTIONS',
				color: themeColors.menuGreen,
				points: this.calculatePoints('OPTIONS', false),
				position: { x: 0, y: baseY + (this.menu.buttonHeight + this.menu.buttonVerticalOffset) },
				clickedPoints: this.calculatePoints('OPTIONS', true),
				clickedColor: themeColors.white
			},
			'OPTIONS_CLICKED': {
				layer: 'OPTIONS_CLICKED',
				color: themeColors.white,
				points: this.calculatePoints('OPTIONS_CLICKED', false),
				position: { x: 0, y: baseY + (this.menu.buttonHeight + this.menu.buttonVerticalOffset) },
				clickedPoints: this.calculatePoints('OPTIONS', true),
				clickedColor: themeColors.white
			},
			'GLOSSARY': {
				layer: 'GLOSSARY',
				color: themeColors.menuOrange,
				points: this.calculatePoints('GLOSSARY', false),
				position: { x: 0, y: baseY + (this.menu.buttonHeight + this.menu.buttonVerticalOffset) * 2 },
				clickedPoints: this.calculatePoints('GLOSSARY', true),
				clickedColor: themeColors.white
			},
			'ABOUT': {
				layer: 'ABOUT',
				color: themeColors.menuPink,
				points: this.calculatePoints('ABOUT', false),
				position: { x: 0, y: baseY + (this.menu.buttonHeight + this.menu.buttonVerticalOffset) * 3 },
				clickedPoints: this.calculatePoints('ABOUT', true),
				clickedColor: themeColors.white
			}
		};

		return configs[ornamentLayer] || configs['START'];
	}

	private calculatePoints(layer: string, isClicked: boolean): number[] {
		switch (layer) {
			case 'START':
				return [
					0, 0,
					(this.menu.buttonWidth * 3) + (this.menu.ornamentOffset * 3) + this.menu.ornamentGap + this.menu.buttonSlant, 0,
					(this.menu.buttonWidth * 3) + (this.menu.ornamentOffset * 3) + this.menu.ornamentGap, this.menu.buttonHeight,
					0, this.menu.buttonHeight
				];
			case 'PLAY':
				return [
					0, 0,
					(this.menu.buttonWidth * 3) + (this.menu.ornamentOffset * 3) + this.menu.ornamentGap + this.menu.buttonSlant - ((this.menu.buttonWidth * 2) + (this.menu.ornamentGap * 2) + 5), 0,
					(this.menu.buttonWidth * 3) + (this.menu.ornamentOffset * 3) + this.menu.ornamentGap - ((this.menu.buttonWidth * 2) + (this.menu.ornamentGap * 2) + 5), this.menu.buttonHeight,
					0, this.menu.buttonHeight
				];
			case 'OPTIONS':
				return [
					0, 0,
					(this.menu.buttonWidth * 3) + (this.menu.ornamentOffset * 2) + this.menu.ornamentGap + this.menu.buttonSlant, 0,
					(this.menu.buttonWidth * 3) + (this.menu.ornamentOffset * 2) + this.menu.ornamentGap, this.menu.buttonHeight,
					0, this.menu.buttonHeight
				];
			case 'OPTIONS_CLICKED':
				return [
					0, 0,
					(this.menu.buttonWidth * 3) + (this.menu.ornamentOffset * 2) + this.menu.ornamentGap + this.menu.buttonSlant - (this.menu.buttonXWidth * 2) - this.menu.ornamentOffset, 0,
					(this.menu.buttonWidth * 3) + (this.menu.ornamentOffset * 2) + this.menu.ornamentGap - (this.menu.buttonXWidth * 2) - this.menu.ornamentOffset, this.menu.buttonHeight,
					0, this.menu.buttonHeight
				];
			case 'GLOSSARY':
				return [
					0, 0,
					(this.menu.buttonWidth * 3) + (this.menu.ornamentOffset) + this.menu.ornamentGap + this.menu.buttonSlant, 0,
					(this.menu.buttonWidth * 3) + (this.menu.ornamentOffset) + this.menu.ornamentGap, this.menu.buttonHeight,
					0, this.menu.buttonHeight
				];
			case 'ABOUT':
				return [
					0, 0,
					(this.menu.buttonWidth * 3) + this.menu.ornamentGap + this.menu.buttonSlant, 0,
					(this.menu.buttonWidth * 3) + this.menu.ornamentGap, this.menu.buttonHeight,
					0, this.menu.buttonHeight
				];
		}

		return [0, 0, 0, 0, 0, 0, 0, 0];
	}

	private createOrnament(): Graphics {
		const ornament = new Graphics();
		ornament.poly(this.config.points);
		ornament.fill(this.getDisplayColor());
		ornament.stroke({ color: this.getDisplayColor(), width: 3 });
		ornament.x = this.config.position.x;
		ornament.y = this.config.position.y;
		ornament.label = `${this.config.layer.toLowerCase()}Ornament`;
		return ornament;
	}

	private getDisplayColor(): number {
		if (this.isClicked && this.config.clickedColor) {
			return this.config.clickedColor;
		}
		
		if (this.menu.config.classicMode) {
			return getThemeColors(true).white;
		}
		
		return this.config.color;
	}

	public highlightOrnament(): void {
        const highlightColor = getThemeColors(this.menu.config.classicMode).white;
        
        this.ornamentGraphic.clear();
        this.ornamentGraphic.poly(this.config.points);
        this.ornamentGraphic.fill(highlightColor);
        this.ornamentGraphic.stroke({ color: highlightColor, width: 3 });
        this.ornamentGraphic.x = this.config.position.x;
        this.ornamentGraphic.y = this.config.position.y;
        this.ornamentGraphic.label = `${this.config.layer.toLowerCase()}Ornament`;
    }

    public resetOrnament(): void {
        const originalColor = this.getOriginalColor();
        
        this.ornamentGraphic.clear();
        this.ornamentGraphic.poly(this.config.points);
        this.ornamentGraphic.fill(originalColor);
        this.ornamentGraphic.stroke({ color: originalColor, width: 3 });
        this.ornamentGraphic.x = this.config.position.x;
        this.ornamentGraphic.y = this.config.position.y;
        this.ornamentGraphic.label = `${this.config.layer.toLowerCase()}Ornament`;
    }

	public getGraphic(): Graphics {
        return this.ornamentGraphic;
    }

    private getOriginalColor(): number {
        const themeColors = getThemeColors(this.menu.config.classicMode);
        
        if (this.menu.config.classicMode) {
            return themeColors.white;
        }
        
        return this.config.color;
    }

	// Getter methods for accessing ornament properties
	public getLayer(): string {
		return this.config.layer;
	}

	public getColor(): number {
		return this.config.color;
	}

	public getPoints(): number[] {
		return this.config.points;
	}

	public getPosition(): { x: number; y: number } {
		return this.config.position;
	}

	// Method to update ornament configuration
	public updateConfig(newConfig: Partial<OrnamentConfig>): void {
		this.config = { ...this.config, ...newConfig };
		this.ornamentGraphic = this.createOrnament();
		this.ornamentContainer.removeChildren();
		this.ornamentContainer.addChild(this.ornamentGraphic);
	}
}