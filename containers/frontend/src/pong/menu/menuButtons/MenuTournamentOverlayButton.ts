/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   MenuTournamentOverlayButton.ts                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/25 19:36:32 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/26 10:39:04 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { MenuButton } from "./MenuButton";

import { ButtonStyle } from "./BaseButton";

import { getThemeColors } from "../../utils/Utils";
import { getTournamentOverlayButtonPoints } from "../../utils/MenuUtils";

export class MenuTournamentOverlayButton extends MenuButton {
	protected getButtonPoints(): number[] {
        return getTournamentOverlayButtonPoints(this.menu, this)!;
    }

	protected getButtonDimensions(): { width: number, height: number } {
        return { 
            width: this.menu.tournamentOverlayButtonWidth,
            height: this.menu.tournamentOverlayButtonHeight 
        };
    }

	protected getTextStyle(): ButtonStyle {
        return {
            fontSize: 20,
            fontFamily: 'monospace',
            fontWeight: 'bold',
            padding: 0,
        };
    }

	protected updateTextPosition(): void {
        if (!this.buttonText) return;
        
        this.buttonText.anchor.set(0.5);
        this.buttonText.x = this.menu.tournamentOverlayButtonWidth / 2;
        this.buttonText.y = this.menu.tournamentOverlayButtonHeight / 2;
    }

	protected onButtonClick(): void {
        console.log("Tournament overlay button clicked");
        if (this.id.includes('taunt')) {
            this.menu.eventQueue.push({
                type: 'TOURNAMENT_TAUNT_CLICK',
                target: this.buttonContainer,
                buttonName: 'tournamentOverlayTauntButton'
            });
        } else if (this.id.includes('crt')) {
            this.menu.eventQueue.push({
                type: 'FILTERS_CLICK',
                target: this.buttonContainer,
                buttonName: 'tournamentOverlayFiltersButton'
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
        
            let alpha: number;
            if (this.isClicked) {
                alpha = 0.3;
            } else {
                alpha = 1;
            }

        return {
            color: themeColor,
            alpha: alpha,
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
        if (!this.isClickable) {
            return 0.3; 
        } else if (this.buttonId === 'FILTERS' && this.isClicked) {
            return 0.3;
        } else if (this.buttonId === 'CHAT' && this.isClicked) {
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

    public setClickable(clickable: boolean): void {
        super.setClickable(clickable);
        
        if (clickable) {
            this.buttonContainer.cursor = 'pointer';
        } else {
            this.buttonContainer.cursor = 'default';
        }
        
        this.resetButton();
    }

    public resetButton(): void {
        this.isStateChanging = true;
        this.isHovered = false;
        this.resetTournamentButtonState();
        this.isStateChanging = false;
    }
    
    protected resetTournamentButtonState(): void {
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
            
            const textAlpha = this.getEffectiveAlpha();
            
            this.buttonText.style.fill = { color: themeColor, alpha: textAlpha };
        }
    }
}