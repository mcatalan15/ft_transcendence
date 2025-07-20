/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   MenuBigInputButton.ts                              :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/06 10:34:34 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/19 18:01:48 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Text } from "pixi.js";

import { MenuButton } from "./MenuButton";

import { ButtonStyle } from "./BaseButton";

import { MenuInputSystem } from "../menuSystems/MenuInputSystem";

import { getThemeColors } from "../../utils/Utils";
import { getBigInputButtonPoints } from "../../utils/MenuUtils";

export class MenuBigInputButton extends MenuButton {
	protected getButtonPoints(): number[] {
		return getBigInputButtonPoints(this.menu, this)!;
	}

	protected getButtonDimensions(): { width: number, height: number } {
		return { 
			width: this.menu.buttonWidth,
			height: this.menu.buttonHeight 
		};
	}

	protected getTextStyle(): ButtonStyle {
		return {
			fontSize: 30,
			fontFamily: 'monospace',
			fontWeight: 'bold',
			padding: 1.5
		};
	}

	
	protected updateTextPosition(): void {
		if (!this.buttonText) return;
		
		this.buttonText.anchor.set(0.5, 0.5);
		
		const points = this.getButtonPoints();
		
		let minX = Infinity, maxX = -Infinity;
		let minY = Infinity, maxY = -Infinity;
		
		for (let i = 0; i < points.length; i += 2) {
			const x = points[i];
			const y = points[i + 1];
			
			minX = Math.min(minX, x);
			maxX = Math.max(maxX, x);
			minY = Math.min(minY, y);
			maxY = Math.max(maxY, y);
		}
		
		this.buttonText.x = (minX + maxX) / 2;
		this.buttonText.y = (minY + maxY) / 2 + 1;
	}

	protected onButtonClick(): void {
		const inputSystem = this.menu.systems.find(
			system => system instanceof MenuInputSystem
		) as MenuInputSystem;
		
		if (inputSystem) {
			inputSystem.setCurrentInputButton(this);
		}
		
		if (this.buttonText) {
			this.buttonText.alpha = 0.5;
		}
		this.menu.inputFocus = this.getButtonId();
		this.menu.isProcessingInput = true;
	}

	protected createButton(): void {
		this.buttonGraphic.clear();
		
		const points = this.getButtonPoints();
		if (this.originalPolygonPoints.length === 0) {
			this.originalPolygonPoints = [...points];
		}
	
		this.buttonGraphic.poly(points);
		
		const strokeColor = this.getStrokeColor();
		
		if (this.isHovered) {
			this.buttonGraphic.fill({ color: getThemeColors(this.menu.config.classicMode).white, alpha: 1 });
			this.buttonGraphic.stroke({ color: getThemeColors(this.menu.config.classicMode).white, width: 3, alpha: 1 });
		} else {
			this.buttonGraphic.fill(getThemeColors(this.menu.config.classicMode).black);
			this.buttonGraphic.stroke(strokeColor);
		}
	}

	protected getFillColor(): { color: number, alpha: number } {
		if (this.isHovered) {
			return { color: getThemeColors(this.menu.config.classicMode).white, alpha: 1 };
		}
		
		const themeColor = this.menu.config.classicMode ? 
			getThemeColors(this.menu.config.classicMode).white : 
			this.config.color;
		
		return {
			color: themeColor,
			alpha: this.getEffectiveAlpha()
		};
	}
	
	protected getStrokeColor(): { color: number, alpha: number, width: number } {
		const fillColor = this.getFillColor();
		return {
			color: fillColor.color,
			alpha: fillColor.alpha,
			width: 0
		};
	}

	protected getEffectiveAlpha(): number {
		const isToggleButton = this.config.text === 'ABOUT' || this.config.text === 'GLOSSARY';
		
		if (!this.isClickable) {
			return 0.3; 
		} else if (isToggleButton && this.isClicked) {
			return 0.3;
		} else {
			return 1;
		}
	}

	protected updateTextColor(color?: number): void {
		if (!this.buttonText) return;
		
		if (color !== undefined) {
			this.buttonText.style.fill = { color: getThemeColors(this.menu.config.classicMode).black, alpha: 1 };
		} else {
			const themeColor = this.menu.config.classicMode ? 
				getThemeColors(this.menu.config.classicMode).white : 
				this.config.color;
			this.buttonText.style.fill = { 
				color: themeColor, 
				alpha: this.getEffectiveAlpha()
			};
		}
	}

	public resetButton(shouldRewrite: boolean = true): void {
		this.isStateChanging = true;
		this.isHovered = false;
		this.resetButtonState();
		this.isStateChanging = false;
		if (shouldRewrite) {
			this.updateText('GUEST?');
		}

		if (this.isHidden) {
			this.buttonContainer.eventMode = 'none';
			this.buttonContainer.cursor = 'default';
		}
	}

	protected resetButtonState(): void {
        this.buttonGraphic.clear();
        const points = this.getButtonPoints();
        this.buttonGraphic.poly(points);
        
        const strokeColor = this.getStrokeColor();
        
        this.buttonGraphic.fill(getThemeColors(this.menu.config.classicMode).black);
        this.buttonGraphic.stroke(strokeColor);
        
        if (this.buttonText) {
            const themeColor = this.menu.config.classicMode ? 
                getThemeColors(this.menu.config.classicMode).white : 
                this.config.color;
            
            let textAlpha: number = 1;
            
            this.buttonText.style.fill = { color: themeColor, alpha: textAlpha };
        }
    }

	public unhover() {
		this.handlePointerLeave();
	}

    public getButtonText(): Text {
        if (this.buttonText) {
            return this.buttonText
        };

        throw new Error("Button text is not defined");
    }
}