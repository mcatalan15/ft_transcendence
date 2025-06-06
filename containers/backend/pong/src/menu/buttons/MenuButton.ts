/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   MenuButton.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/06 10:25:58 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/06 17:50:59 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics} from "pixi.js";

import { BaseButton, ButtonAnimationConfig, ButtonStyle } from "./BaseButton";
import { getButtonPoints } from "../../utils/MenuUtils";
import { getThemeColors } from "../../utils/Utils";
import { RenderComponent } from "../../components/RenderComponent";
import { isMenuOrnaments } from "../../utils/Guards";

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
        if (eventType) {
            this.menu.eventQueue.push({
                type: eventType,
                target: this,
                buttonName: this.config.text
            });
        }
    }

    protected getEventType(): string | null {
        switch (this.config.text) {
            case 'START': return 'START_CLICK';
            case 'OPTIONS': return 'OPTIONS_CLICK';
            case 'GLOSSARY': return 'GLOSSARY_CLICK';
            case 'ABOUT': return 'ABOUT_CLICK';
            case 'PLAY': return 'PLAY_CLICK';
            default: return null;
        }
    }

    protected highlightOrnament(): void {
        const ornaments = this.findOrnaments();
        if (!ornaments) return;

        const render = ornaments.getComponent('render') as RenderComponent;
        const graphic = render?.graphic;
        if (!graphic) return;

        const childIndex = this.getOrnamentChildIndex();
        if (childIndex !== -1) {
            const targetChild = graphic.children[childIndex] as Graphics;
            const color = getThemeColors(this.menu.config.classicMode).white;
            targetChild.fill(color);
            targetChild.stroke({ color, width: 3 });
        }
    }

    protected resetOrnamentColor(): void {
        if (this.isClicked) return;
        
        const ornaments = this.findOrnaments();
        if (!ornaments) return;

        const render = ornaments.getComponent('render') as RenderComponent;
        const graphic = render?.graphic;
        if (!graphic) return;

        const childIndex = this.getOrnamentChildIndex();
        const color = this.getOrnamentColor();
        
        if (childIndex !== -1 && color) {
            const targetChild = graphic.children[childIndex] as Graphics;
            targetChild.fill(color);
            targetChild.stroke({ color, width: 3 });
        }
    }

    private findOrnaments() {
        return this.menu.entities.find(entity => isMenuOrnaments(entity));
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