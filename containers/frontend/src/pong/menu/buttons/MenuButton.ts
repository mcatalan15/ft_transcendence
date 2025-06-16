/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   MenuButton.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/06 10:25:58 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/16 16:07:56 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { BaseButton, ButtonAnimationConfig, ButtonStyle } from "./BaseButton";
import { getButtonPoints } from "../../utils/MenuUtils";
import { getThemeColors } from "../../utils/Utils";
import { isMenuOrnament } from "../../utils/Guards";
import { GAME_COLORS } from "../../utils/Types";

export class MenuButton extends BaseButton {
    protected hoverTimeout: number | null = null;

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

    protected handlePointerEnter(): void {
        if (!this.isClickable) return;
        
        if (this.hoverTimeout) {
            clearTimeout(this.hoverTimeout);
        }
        
        this.isHovered = true;
        
        this.buttonGraphic.clear();
        const points = this.getButtonPoints();
        this.buttonGraphic.poly(points);
        this.buttonGraphic.fill({ color: getThemeColors(this.menu.config.classicMode).white, alpha: 1 });
        this.buttonGraphic.stroke({ color: getThemeColors(this.menu.config.classicMode).white, width: 3, alpha: 1 });
    
        if (this.menu.glossaryOverlay.getIsDisplayed()) {
            this.menu.glossaryOverlay.changeStrokeColor(GAME_COLORS.white);
        }
        
        if (this.menu.aboutOverlay.getIsDisplayed()) {
            this.menu.aboutOverlay.changeStrokeColor(GAME_COLORS.white);
        }
        
        if (this.buttonText) {
            this.buttonText.style.fill = { color: getThemeColors(this.menu.config.classicMode).black, alpha: 1 };
        }
        
        this.highlightOrnament(this);
    
        if (this.menu.sounds && this.menu.sounds.menuMove) {
            this.menu.sounds.menuMove.rate(Math.random() * 0.2 + 1.1);
            this.menu.sounds.menuMove.play();
        }
    }
    
    protected handlePointerLeave(): void {
        this.isHovered = false;
        
        if (this.hoverTimeout) {
            clearTimeout(this.hoverTimeout);
        }
        
        this.hoverTimeout = window.setTimeout(() => {
            if (!this.isHovered) {
                this.resetButtonState();
            }
        }, 10);
    
        if (this.menu.glossaryOverlay.getIsDisplayed()) {
            const glossaryColor = this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuOrange;
            this.menu.glossaryOverlay.changeStrokeColor(glossaryColor);
        }
        
        if (this.menu.aboutOverlay.getIsDisplayed()) {
            const aboutColor = this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuPink;
            this.menu.aboutOverlay.changeStrokeColor(aboutColor);
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
            
            const isToggleButton = this.config.text === 'ABOUT' || this.config.text === 'GLOSSARY';
            let textAlpha: number = 1;
            
            if (!this.isClickable) {
                textAlpha = 0.3;
            } else if (isToggleButton && this.isClicked) {
                textAlpha = 0.3;
            } else {
                textAlpha = 1;
            }
            
            this.buttonText.style.fill = { color: themeColor, alpha: textAlpha };
        }
        
        this.resetOrnamentColor();
    }

    public resetButton(): void {
        this.isStateChanging = true;
        this.isHovered = false;
        this.resetButtonState();
        this.isStateChanging = false;
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