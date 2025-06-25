/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   BaseButton.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/06 10:04:40 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/25 19:15:11 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Container, Text } from 'pixi.js';
import { Entity } from '../../engine/Entity';
import { RenderComponent } from '../../components/RenderComponent';
import { AnimationComponent } from '../../components/AnimationComponent';
import { VFXComponent } from '../../components/VFXComponent';
import { Menu } from '../Menu';
import { MenuButtonConfig } from '../../utils/MenuUtils';
import { getThemeColors } from '../../utils/Utils';

export interface ButtonStyle {
    fontSize: number;
    fontFamily: string;
    fontWeight: 'normal' | 'bold' | 'bolder' | 'lighter' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
    fontStyle?: 'normal' | 'italic' | 'oblique';
    letterSpacing?: number;
    padding?: number;
}

export interface ButtonAnimationConfig {
    floatSpeed: number;
    floatAmplitude: number;
    floatOffset: number;
}

export abstract class BaseButton extends Entity {
    protected menu: Menu;
    protected buttonId: string;
    protected buttonContainer!: Container;
    protected buttonGraphic!: Graphics;
    protected buttonText?: Text;
    protected isHovered: boolean = false;
    protected isClicked: boolean = false;
    protected isClickable: boolean = true;
    protected isHidden: boolean = false;
    protected config: MenuButtonConfig;
    protected originalPolygonPoints: number[] = [];
    
    // State management flags
    public isAnimating: boolean = false;
    public isStateChanging: boolean = false;
    public isUpdating: boolean = false;

    constructor(id: string, buttonId: string, layer: string, menu: Menu, config: MenuButtonConfig) {
        super(id, layer);
        this.buttonId = buttonId;
        this.menu = menu;
        this.config = config;
        this.isClicked = config.isClicked || false;
        this.isClickable == false;
    
        this.initializeContainer();
        this.initializeGraphics();
        this.initializeText();
        this.createButton();
        this.setupEventHandlers();
        this.setupComponents();
    }

    protected initializeContainer(): void {
        this.buttonContainer = new Container();
        
        if (this.isClickable) {
            this.buttonContainer.eventMode = 'static';
            this.buttonContainer.cursor = 'pointer';
        } else {
            this.buttonContainer.eventMode = 'none';
            this.buttonContainer.cursor = 'default';
        }
    }

    protected initializeGraphics(): void {
        this.buttonGraphic = new Graphics();
        this.buttonContainer.addChild(this.buttonGraphic);
    }

    protected initializeText(): void {
        if (this.config.text) {
            const style = this.getTextStyle();
            
            const textStyle = {
                fill: { color: this.config.color, alpha: this.getTextAlpha() },
                fontSize: style.fontSize,
                fontFamily: style.fontFamily,
                fontWeight: style.fontWeight,
                ...(style.letterSpacing && { letterSpacing: style.letterSpacing }),
                ...(style.fontStyle && { fontStyle: style.fontStyle }),
                ...(style.padding && { padding: style.padding })
            };
    
            this.buttonText = new Text({
                text: this.config.text,
                style: textStyle
            });
            
            this.buttonContainer.addChild(this.buttonText);
            
            this.updateTextPosition();
        }
    }

    public setupEventHandlers(): void {
        if (!this.isClickable) return;
    
        this.buttonContainer.removeAllListeners();
    
        this.buttonContainer.on('pointerdown', () => {
            this.handleClick();
        });
    
        this.buttonContainer.on('pointerenter', () => {
            this.handlePointerEnter();
        });
    
        this.buttonContainer.on('pointerleave', () => {
            this.handlePointerLeave();
        });
    }

    protected setupComponents(): void {
        const renderComponent = new RenderComponent(this.buttonContainer);
        this.addComponent(renderComponent, this.getRenderComponentKey());

        const animationConfig = this.getAnimationConfig();
        const animationComponent = new AnimationComponent({
            floatSpeed: animationConfig.floatSpeed,
            floatAmplitude: animationConfig.floatAmplitude,
            floatOffset: animationConfig.floatOffset,
            initialized: false,
            initialX: 0,
            initialY: 0
        });
        this.addComponent(animationComponent, this.getAnimationComponentKey());

        if (this.shouldAddVFXComponent()) {
            const vfxComponent = new VFXComponent();
            this.addComponent(vfxComponent);
        }
    }

    protected handleClick(): void {
        this.onButtonClick();
        this.config.onClick();
    }

    protected handlePointerEnter(): void {
        if (this.constructor.name === 'MenuHalfButton' || this.constructor.name === 'MenuButton') return;
    
        if (!this.isClickable) return;
        
        this.isStateChanging = true;
        this.isHovered = true;
        this.updateVisualState();
        this.highlightOrnament(this);
        this.updateTextColor(getThemeColors(this.menu.config.classicMode).black);
        if (this.menu.sounds && this.menu.sounds.menuMove) {
            this.menu.sounds.menuMove.rate(Math.random() * 0.2 + 1.1);
            this.menu.sounds.menuMove.play();
        }
        this.isStateChanging = false;
    }

    protected handlePointerLeave(): void {
        this.resetButton();
    }

    protected updateVisualState(): void {
        this.createButton();
        this.updateTextPosition();
    }

    public resetButton() {
        this.isStateChanging = true;
        this.isHovered = false;
        this.updateVisualState();
        this.resetOrnamentColor();
        this.resetTextColor();
        this.isStateChanging = false;
    }
    
    protected updateTextPosition(): void {
        if (!this.buttonText) return;
        
        this.buttonText.anchor.set(0.5);
        const dimensions = this.getButtonDimensions();
        this.buttonText.x = dimensions.width / 2;
        this.buttonText.y = dimensions.height / 2;
    }

    protected updateTextColor(color?: number): void {
        if (!this.buttonText) return;
        
        if (color !== undefined) {
            this.buttonText.style.fill = { color, alpha: 1 };
        } else {
            const themeColor = this.menu.config.classicMode ? 
                getThemeColors(this.menu.config.classicMode).white : 
                this.config.color;
            this.buttonText.style.fill = { 
                color: themeColor, 
                alpha: this.getTextAlpha() 
            };
        }
    }

    protected resetTextColor(): void {
        this.updateTextColor();
    }

    protected getTextAlpha(): number {
        const isToggleButton = this.config.text === 'ABOUT' || this.config.text === 'GLOSSARY';
        
        if (!this.isClickable) {
            return 0.3;
        } else if (isToggleButton && this.isClicked) {
            return 0.3;
        } else {
            return 1;
        }
    }

    protected getFillColor(): { color: number, alpha: number } {
        if (this.isHovered) {
            return { color: getThemeColors(this.menu.config.classicMode).white, alpha: 1 };
        }
        
        const themeColor = this.menu.config.classicMode ? 
            getThemeColors(this.menu.config.classicMode).white : 
            this.config.color;
        
        const isToggleButton = this.config.text === 'ABOUT' || this.config.text === 'GLOSSARY';
        
        let alpha: number;
        if (!this.isClickable) {
            alpha = 0.3;
        } else if (isToggleButton && this.isClicked) {
            alpha = 0.3;
        } else {
            alpha = 1;
        }
        
        return {
            color: themeColor,
            alpha: alpha
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

    protected abstract createButton(): void;
    protected abstract getButtonPoints(): number[];
    protected abstract getButtonDimensions(): { width: number, height: number };
    protected abstract getTextStyle(): ButtonStyle;
    protected abstract getAnimationConfig(): ButtonAnimationConfig;
    protected abstract onButtonClick(): void;
    protected abstract highlightOrnament(button: BaseButton): void;
    protected abstract resetOrnamentColor(): void;

    protected getRenderComponentKey(): string {
        return 'menuButton';
    }

    protected getAnimationComponentKey(): string {
        return 'buttonAnim';
    }

    protected shouldAddVFXComponent(): boolean {
        return false;
    }

    public setPosition(x: number, y: number): void {
        this.buttonContainer.position.set(x, y);
    }

    public getContainer(): Container {
        return this.buttonContainer;
    }

    public getGraphic(): Graphics {
        return this.buttonGraphic;
    }

    public getTextObject(): Text | undefined {
        return this.buttonText;
    }

    public getText(): string {
        return this.config.text || '';
    }

    public getButtonId(): string {
        return this.buttonId || '';
    }

    public getIndex(): number {
        return this.config.index || 0;
    }

    public getIsHovered(): boolean {
        return this.isHovered;
    }

    public getIsClicked(): boolean {
        return this.isClicked;
    }

    public getIsClickable(): boolean {
        return this.isClickable;
    }

    public getIsHidden(): boolean {
        return this.isHidden;
    }

    public updateText(newText: string): void {
        this.config.text = newText;
        if (this.buttonText) {
            this.buttonText.text = newText;
        }
    }

    public updateColor(newColor: number): void {
        this.config.color = newColor;
        this.createButton();
    }

    public getOriginalPolygonPoints(): number[] {
        return [...this.originalPolygonPoints];
    }

    public setHidden(hidden: boolean): void {
        this.isHidden = hidden;
    }

    public setClicked(clicked: boolean): void {
        this.isClicked = clicked;
    }
    
    public setClickable(clickable: boolean): void {
        this.isClickable = clickable;
        
        if (clickable) {
            this.buttonContainer.eventMode = 'static';
            this.buttonContainer.cursor = 'pointer';
        } else {
            this.buttonContainer.eventMode = 'none';
            this.buttonContainer.cursor = 'default';
        }
    }
}