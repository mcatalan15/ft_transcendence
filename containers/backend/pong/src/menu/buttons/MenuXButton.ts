/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   MenuXButton.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/06 10:34:34 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/06 17:18:00 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { MenuButton } from "./MenuButton";

import { ButtonStyle } from "./BaseButton";

import { getThemeColors } from "../../utils/Utils";
import { getXButtonPoints } from "../../utils/MenuUtils";
import { GAME_COLORS } from "../../utils/Types";

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
        
        const color = this.isHovered ? GAME_COLORS.white : this.config.color;
        
        if (this.isHovered) {
            this.buttonGraphic.fill(color);
        } else {
            this.buttonGraphic.fill(GAME_COLORS.black);
            this.buttonGraphic.stroke({ color, width: 3 });
        }
    }

    protected getFillColor(): { color: number, alpha: number } {
        return {
            color: this.isHovered ? GAME_COLORS.white : this.config.color,
            alpha: this.isClicked ? 0.3 : 1 
        };
    }

    protected getStrokeColor(): { color: number, alpha: number, width: number } {
        const fillColor = this.getFillColor();
        return {
            color: fillColor.color,
            alpha: this.isClicked ? 0.3 : 1,
            width: 3
        };
    }

    protected updateTextColor(color?: number): void {
        if (!this.buttonText) return;
        
        if (color !== undefined) {
            this.buttonText.style.fill = GAME_COLORS.black;
        } else {
            const themeColor = this.menu.config.classicMode ? 
                getThemeColors(this.menu.config.classicMode).white : 
                this.config.color;
            this.buttonText.style.fill = { 
                color: themeColor, 
                alpha: this.isClicked ? 0.3 : 1
            };
        }
    }
}