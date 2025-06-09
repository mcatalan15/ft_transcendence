/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   MenuHalfButton.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/06 10:33:14 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/09 10:33:52 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { MenuButton } from "./MenuButton";

import { ButtonStyle } from "./BaseButton";
import { getHalfButtonPoints } from "../../utils/MenuUtils";
import { getThemeColors } from "../../utils/Utils";

export class MenuHalfButton extends MenuButton {
    
    protected getButtonPoints(): number[] {
        return getHalfButtonPoints(this.menu, this)!;
    }

    protected getButtonDimensions(): { width: number, height: number } {
        return { 
            width: this.menu.halfButtonWidth, 
            height: this.menu.halfButtonHeight 
        };
    }

    protected getTextStyle(): ButtonStyle {
        return {
            fontSize: 16,
            fontFamily: 'monospace',
            fontWeight: 'bold',
            fontStyle: 'italic'
        };
    }

    // Override the alpha logic to be opposite of MenuButton
    protected getTextAlpha(): number {
        return this.isClicked ? 1 : 0.3;
    }

    protected getFillColor(): { color: number, alpha: number } {
        if (this.isHovered) {
            return { color: 0xfff8e3, alpha: 1 };
        }
        
        let themeColor: number;
        
        if (this.menu.config.classicMode) {
            themeColor = 0xfff8e3;
        } else {
            const themeColors = getThemeColors(false);
            
            switch (this.config.text) {
                case 'LOCAL':
                case 'ONLINE':
                case '1 vs IA':
                case 'TOURNAMENT':
                case '1 vs 1':
                    themeColor = themeColors.menuBlue;
                    break;
                case 'CRT FILTER: ON':
                case 'CRT FILTER: OFF':
                case 'CLASSIC: ON':
                case 'CLASSIC: OFF':
                    themeColor = themeColors.menuGreen;
                    break;
                default:
                    themeColor = this.config.color;
                    break;
            }
        }
        
        return {
            color: themeColor,
            alpha: this.isClickable ? (this.isClicked ? 1 : 0.3) : 0.3  // Combine both conditions
        };
    }
    
    protected getStrokeColor(): { color: number, alpha: number, width: number } {
        const fillColor = this.getFillColor();
        return {
            color: fillColor.color,
            alpha: this.isClickable ? (this.isClicked ? 1 : 0.3) : 0.3,  // Combine both conditions
            width: 3
        };
    }

    protected onButtonClick(): void {
        const eventType = this.getEventType();
        if (eventType) {
            this.menu.eventQueue.push({
                type: eventType,
                target: this,
                buttonName: this.config.text
            });
        }
    }

    protected handlePointerEnter(): void {
        if (!this.isClickable) return;
        
        // Clear any pending timeout
        if (this.hoverTimeout) {
            clearTimeout(this.hoverTimeout);
        }
        
        this.isHovered = true;
        
        // Immediate visual update
        this.buttonGraphic.clear();
        const points = this.getButtonPoints();
        this.buttonGraphic.poly(points);
        this.buttonGraphic.fill({ color: 0xfff8e3, alpha: 1 });
        this.buttonGraphic.stroke({ color: 0xfff8e3, width: 3, alpha: 1 });
        
        if (this.buttonText) {
            this.buttonText.style.fill = { color: getThemeColors(this.menu.config.classicMode).black, alpha: 1 };
        }
        
        this.highlightOrnament(this);
    
        if (this.menu.sounds && this.menu.sounds.menuMove) {
            this.menu.sounds.menuMove.play();
        }
    }
    
    protected handlePointerLeave(): void {
        this.isHovered = false;
        
        // Debounce the reset to prevent rapid updates
        if (this.hoverTimeout) {
            clearTimeout(this.hoverTimeout);
        }
        
        this.hoverTimeout = window.setTimeout(() => {
            if (!this.isHovered) { // Double-check we're still not hovered
                this.resetButtonState();
            }
        }, 10); // Very short delay
    }
    
    protected resetButtonState(): void {
        this.buttonGraphic.clear();
        const points = this.getButtonPoints();
        this.buttonGraphic.poly(points);
        
        const fillColor = this.getFillColor();
        const strokeColor = this.getStrokeColor();
        
        this.buttonGraphic.fill(getThemeColors(this.menu.config.classicMode).black);
        this.buttonGraphic.stroke(strokeColor);
        
        // Reset text color
        if (this.buttonText) {
            let textColor: number;
            let textAlpha: number;
            
            if (this.menu.config.classicMode) {
                textColor = 0xfff8e3;
                textAlpha = this.isClickable ? (this.isClicked ? 1 : 0.3) : 0.3;  // Updated logic
            } else {
                textColor = fillColor.color;
                textAlpha = this.isClickable ? (this.isClicked ? 1 : 0.3) : 0.3;  // Updated logic
            }
            
            this.buttonText.style.fill = { color: textColor, alpha: textAlpha };
        }
        
        this.resetOrnamentColor();
    }

    protected getEventType(): string | null {
        if (this.config.text.includes('FILTER')) return 'FILTERS_CLICK';
        else if (this.config.text.includes('CLASSIC')) return 'CLASSIC_CLICK';
        else if (this.config.text.includes('LOCAL')) return 'LOCAL_CLICK';
        else if (this.config.text.includes('ONLINE')) return 'ONLINE_CLICK';
        else if (this.config.text.includes('1 vs IA')) return 'IA_CLICK';
        else if (this.config.text.includes('TOURNAMENT')) return 'TOURNAMENT_CLICK';
        else if (this.config.text.includes('1 vs 1')) return 'DUEL_CLICK';
        else return null;
    }

    public updateHalfButtonTextColor(color?: number): void {
        if (!this.buttonText) return;
        
        if (color) {
            this.buttonText.style.fill = { color: color, alpha: 1 };
        } else {
            this.buttonText.style.fill = { 
                color: color || this.config.color, 
                alpha: this.isClicked ? 1 : 0.3,
            };
        }
    }
}