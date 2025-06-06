/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   MenuHalfButton.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/06 10:33:14 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/06 18:28:00 by hmunoz-g         ###   ########.fr       */
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
            return { color: getThemeColors(this.menu.config.classicMode).white, alpha: 1 };
        }
        
        return {
            color: this.config.color,
            alpha: this.isClicked ? 1 : 0.3
        };
    }

    protected getStrokeColor(): { color: number, alpha: number, width: number } {
        const fillColor = this.getFillColor();
        return {
            color: fillColor.color,
            alpha: this.isClicked ? 1 : 0.3,
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

    protected getEventType(): string | null {
        if (this.config.text.includes('FILTER')) return 'FILTERS_CLICK';
        else if (this.config.text.includes('CLASSIC')) return 'CLASSIC_CLICK';
        else if (this.config.text.includes('LOCAL')) return 'LOCAL_CLICK';
        else if (this.config.text.includes('ONLINE')) return 'ONLINE_CLICK';
        else if (this.config.text.includes('1 vs IA')) return 'IA_CLICK';
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