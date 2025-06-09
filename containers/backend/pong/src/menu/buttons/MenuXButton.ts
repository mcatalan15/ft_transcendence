/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   MenuXButton.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/06 10:34:34 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/09 10:37:23 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { MenuButton } from "./MenuButton";

import { ButtonStyle } from "./BaseButton";

import { getThemeColors } from "../../utils/Utils";
import { getXButtonPoints } from "../../utils/MenuUtils";

export class MenuXButton extends MenuButton {
    protected getButtonPoints(): number[] {
        return getXButtonPoints(this.menu, this)!;
    }

    protected getButtonDimensions(): { width: number, height: number } {
        return { 
            width: this.menu.buttonWidth,
            height: this.menu.buttonHeight 
        };
    }

    protected getTextStyle(): ButtonStyle {
        return {
            fontSize: 24,
            fontFamily: 'monospace',
            fontWeight: 'bold',
            fontStyle: 'italic',
            padding: 1.5
        };
    }

    protected updateTextPosition(): void {
        if (!this.buttonText) return;
        
        this.buttonText.anchor.set(0.5);
        this.buttonText.x = this.menu.buttonXWidth / 2 + 4;
        this.buttonText.y = this.menu.buttonHeight / 2;
    }

    protected onButtonClick(): void {
        if (this.id.includes('options')) {
            this.menu.eventQueue.push({
                type: 'OPTIONS_BACK',
                target: this.buttonContainer,
                buttonName: 'optionsXButton'
            });
        } else if (this.id.includes('start')) {
            this.menu.eventQueue.push({
                type: 'START_BACK',
                target: this.buttonContainer,
                buttonName: 'startXButton'
            });
        }
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
            width: 3
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
}