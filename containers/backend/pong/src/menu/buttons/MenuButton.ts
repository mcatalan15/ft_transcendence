/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   MenuButton.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/06 10:25:58 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/08 21:45:16 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics} from "pixi.js";

import { BaseButton, ButtonAnimationConfig, ButtonStyle } from "./BaseButton";
import { getButtonPoints } from "../../utils/MenuUtils";
import { getThemeColors } from "../../utils/Utils";
import { RenderComponent } from "../../components/RenderComponent";
import { isMenuOrnament } from "../../utils/Guards";

export class MenuButton extends BaseButton {
    protected createButton(): void {
        this.buttonGraphic.clear();
        
        const points = this.getButtonPoints();
        if (this.originalPolygonPoints.length === 0) {
            this.originalPolygonPoints = [...points];
        }
    
        this.buttonGraphic.poly(points);
        
        const fillColor = this.getFillColor();
        const strokeColor = this.getStrokeColor();
        
        if (this.isHovered) {
            this.buttonGraphic.fill(fillColor);
            this.buttonGraphic.stroke(strokeColor);
        } else {
            this.buttonGraphic.fill(getThemeColors(this.menu.config.classicMode).black);
            this.buttonGraphic.stroke(strokeColor);
        }
    }

    protected getButtonPoints(): number[] {
        return getButtonPoints(this.menu, this)!;
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
            fontStyle: 'normal'
        };
    }

    protected getAnimationConfig(): ButtonAnimationConfig {
        return {
            floatSpeed: 0,
            floatAmplitude: 0,
            floatOffset: 0
        };
    }

    protected onButtonClick(): void {
        const eventType = this.getEventType();
        console.log(`type: ${eventType}`);
        if (eventType) {
            this.menu.eventQueue.push({
                type: eventType,
                target: this,
                buttonName: this.config.text
            });
        }
    }

    protected getEventType(): string | null {
        console.log(`text: ${this.config.text}`);
        switch (this.config.text) {
            case 'START': return 'START_CLICK';
            case 'OPTIONS': return 'OPTIONS_CLICK';
            case 'GLOSSARY': return 'GLOSSARY_CLICK';
            case 'ABOUT': return 'ABOUT_CLICK';
            case 'PLAY': return 'PLAY_CLICK';
            default: return null;
        }
    }

    protected highlightOrnament(button: MenuButton): void {
        const ornament = this.getOrnament(button);
        if (!ornament) return;
    
        if (isMenuOrnament(ornament)) {
            ornament.highlightOrnament();
        }
    }

    protected resetOrnamentColor(): void {
        if (this.isClicked) return;
        
        const ornament = this.getOrnament(this);
        if (!ornament) return;
    
        // Use the MenuOrnament's updateOrnament method with reset = true
        if (isMenuOrnament(ornament)) {
            ornament.resetOrnament();
        }
    }

    private getOrnament(button: BaseButton) {
        switch ((button as MenuButton).getText()) {
            case ('START'): return this.menu.startOrnament;
            case ('OPTIONS'): return this.menu.optionsOrnament;
            case ('GLOSSARY'): return this.menu.glossaryOrnament;
            case ('ABOUT'): return this.menu.aboutOrnament;
        }
    }

    private getOrnamentChildIndex(): number {
        switch (this.config.text) {
            case 'START': return 0;
            case 'PLAY': return 0;
            case 'OPTIONS': return 1;
            case 'GLOSSARY': return 2;
            case 'ABOUT': return 3;
            default: return -1;
        }
    }

    private getOrnamentColor(): number | null {
        const colors = getThemeColors(this.menu.config.classicMode);
        switch (this.config.text) {
            case 'START': return colors.menuBlue;
            case 'PLAY': return colors.menuBlue;
            case 'OPTIONS': return colors.menuGreen;
            case 'GLOSSARY': return colors.menuOrange;
            case 'ABOUT': return colors.menuPink;
            default: return null;
        }
    }

    public repositionButtonText(factor: number): void {
        if (this.buttonText) {
            this.buttonText.x -= factor;
        }
    }

    public updateButtonPolygon(filled?: boolean, color?: number): void {
        this.buttonGraphic.clear();
        
        const points = this.getButtonPoints();
        this.buttonGraphic.poly(points);
        
        const fillColor = color || (this.isHovered ? getThemeColors(this.menu.config.classicMode).white : this.config.color);
        const shouldFill = filled !== undefined ? filled : this.isHovered;
        
        if (shouldFill) {
            this.buttonGraphic.fill(fillColor);
            this.buttonGraphic.stroke({color: fillColor, width: 3, alpha: this.isClicked ? 0.3 : 1});
        } else {
            this.buttonGraphic.fill(getThemeColors(this.menu.config.classicMode).black);
            this.buttonGraphic.stroke({color: fillColor, width: 3, alpha: this.isClicked ? 0.3 : 1});
        }
    }

    public resetPolygon(): void {
        this.createButton();
    }

    // Additional method to ensure text positioning matches old behavior
    public updateButtonTextColor(filled?: boolean, color?: number): void {
        if (!this.buttonText) return;
        
        const fillColor = color || (this.isHovered ? getThemeColors(this.menu.config.classicMode).white : this.config.color);
        const shouldFill = filled !== undefined ? filled : this.isHovered;
        
        if (shouldFill) {
            this.buttonText.style.fill = getThemeColors(this.menu.config.classicMode).black;
        } else {
            this.buttonText.style.fill = { color: fillColor, alpha: this.isClicked ? 0.3 : 1 };
        }
    }
}