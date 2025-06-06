/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   MenuButton.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/02 12:00:00 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/05 20:05:55 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Container, Text, FederatedPointerEvent } from 'pixi.js';
import { Entity } from '../engine/Entity';
import { RenderComponent } from '../components/RenderComponent';
import { AnimationComponent } from '../components/AnimationComponent';
import { GAME_COLORS } from '../utils/Types';
import { Menu } from './Menu';
import { getButtonPoints, MenuButtonConfig } from '../utils/MenuUtils';
import { getThemeColors } from '../utils/Utils';
import { MenuOrnaments } from './MenuOrnaments';
import { isMenuOrnaments } from '../utils/Guards';

export class MenuButton extends Entity {
    private buttonContainer: Container;
    private buttonPolygon: Graphics;
    private buttonText: Text;
    private isHovered: boolean = false;
	isClicked: boolean = true;
    isClickable: boolean = true;
    private config: MenuButtonConfig;
    private menu: Menu;
    public isAnimating: boolean = false;
    public isStateChanging: boolean = false;
    public isUpdating: boolean = false;
    
    // Store original polygon points for animation reference
    private originalButtonPolygonPoints: number[] = [];

    constructor(id: string, layer: string, menu: Menu, config: MenuButtonConfig) {
        super(id, layer);
        this.menu = menu;
        this.config = config;
        this.isClicked = config.isClicked!;
    
        this.buttonContainer = new Container();
        
        if (this.isClickable) {
            this.buttonContainer.eventMode = 'static';
            this.buttonContainer.cursor = 'pointer';
        } else {
            this.buttonContainer.eventMode = 'none';
            this.buttonContainer.cursor = 'default';
        }
    
        this.buttonPolygon = new Graphics();
        
        this.buttonText = new Text({
            text: config.text,
            style: {
                fill: { color: config.color, alpha: this.isClicked ? 1 : 0.3 },
                fontSize: 24,
                fontFamily: 'monospace',
                fontWeight: 'bold',
            }
        });
        this.buttonContainer.addChild(this.buttonPolygon);
        this.buttonContainer.addChild(this.buttonText);
    
        this.createButton();
        this.setupEventHandlers();
        this.setupComponents();
    }

    createButton(isHovered: boolean = false, isClicked: boolean = false): void {
        this.buttonPolygon.clear();
        
        let color;
        if (isHovered) {
            color = { color: getThemeColors(this.menu.config.classicMode).white, alpha: 1};
        } else {
            if (this.isClicked) {
                color = { color: this.config.color, alpha: 0.3 };
            } else {
                color = { color: this.config.color, alpha: 1 };
            }
        }

        this.buttonText.style.fill = isHovered ? getThemeColors(this.menu.config.classicMode).black : color;
		if (!isClicked) {
			this.buttonText.anchor.set(0.5);
			this.buttonText.x = this.menu.buttonWidth / 2;
			this.buttonText.y = this.menu.buttonHeight / 2;
		}

        this.makeButtonPolygon(color, isHovered);
    }

    private makeButtonPolygon(color: { color: number, alpha: number}, filled: boolean): void { 

		const points = getButtonPoints(this.menu, this);

        if (this.originalButtonPolygonPoints.length === 0) {
            this.originalButtonPolygonPoints = [...points!];
        }

        this.buttonPolygon.poly(points!);
        
        if (filled) {
            this.buttonPolygon.fill(color);
        } else {
            this.buttonPolygon.fill(getThemeColors(this.menu.config.classicMode).black);
            this.buttonPolygon.stroke({color: color.color, width: 3, alpha: this.isClicked ? 0.3 : 1});
        }
    }

    private setupEventHandlers(): void {
        this.buttonContainer.on('pointerdown', (event: FederatedPointerEvent) => { 
            this.isClicked = !this.isClicked;
            if (this.config.text === 'START') {
                this.menu.eventQueue.push({
                    type: 'START_CLICK',
                    target: this,
                    buttonName: this.config.text
                });
            } else if (this.config.text === 'OPTIONS') {
                this.menu.eventQueue.push({
                    type: 'OPTIONS_CLICK',
                    target: this,
                    buttonName: this.config.text
                });
            } else if (this.config.text === 'GLOSSARY') {
                this.menu.eventQueue.push({
                    type: 'GLOSSARY_CLICK',
                    target: this,
                    buttonName: this.config.text
                });
            } else if (this.config.text === 'ABOUT') {
                this.menu.eventQueue.push({
                    type: 'ABOUT_CLICK',
                    target: this,
                    buttonName: this.config.text
                });
            } else if (this.config.text === 'PLAY') {
                this.menu.eventQueue.push({
                    type: 'PLAY_CLICK',
                    target: this,
                    buttonName: this.config.text
                });
            }
            
            this.config.onClick();
        });

        this.buttonContainer.on('pointerenter', () => {
            if (!this.isHovered) {
                this.isStateChanging = true;
                this.isHovered = true;
                this.updateButtonPolygon(true);
				this.highlightOrnament(this);
				this.buttonText.style.fill = getThemeColors(this.menu.config.classicMode).black;
                this.menu.sounds.menuMove.play();
                this.isStateChanging = false;
            }
        });

        this.buttonContainer.on('pointerleave', () => {
            this.isStateChanging = true;
            this.isHovered = false;
            this.updateButtonPolygon(false, this.menu.config.classicMode ? getThemeColors(this.menu.config.classicMode).white : this.config.color);
            this.resetOrnamentColor(this);
            this.buttonText.style.fill = { color: this.menu.config.classicMode ? getThemeColors(this.menu.config.classicMode).white : this.config.color, alpha: this.isClicked ? 0.3 : 1 };
            this.isStateChanging = false;
        });
    }

    private setupComponents(): void {
        const renderComponent = new RenderComponent(this.buttonContainer);
        this.addComponent(renderComponent, 'menuButton');

        const animationComponent = new AnimationComponent({
            floatSpeed: 0,
            floatAmplitude: 0,
            floatOffset: 0,
            initialized: false,
            initialX: 0,
            initialY: 0
        });
        this.addComponent(animationComponent, 'buttonAnim');
    }

    public setPosition(x: number, y: number): void {
        this.buttonContainer.position.set(x, y);
    }

    public getContainer(): Container {
        return this.buttonContainer;
    }

	public getTextObject(): Text {
        return this.buttonText;
    }

    public getText(): string {
        return this.config.text;
    }

    public getIndex(): number {
        return this.config.index;
    }

    public getIsHovered(): boolean {
        return this.isHovered;
    }

    public updateText(newText: string): void {
        this.config.text = newText;
        this.buttonText.text = newText;
    }

    public updateColor(newColor: number): void {
        this.config.color = newColor;
        this.createButton(this.isHovered);
    }

    public getButtonPolygon(): Graphics {
        return this.buttonPolygon;
    }

    public getOriginalButtonPolygonPoints(): number[] {
        return [...this.originalButtonPolygonPoints];
    }

    public updateButtonPolygon(filled?: boolean, color?: number): void {
        this.buttonPolygon.clear();
        
		const points = getButtonPoints(this.menu, this);
		this.buttonPolygon.poly(points!);
        
        const fillColor = color || (this.isHovered ? getThemeColors(this.menu.config.classicMode).white : this.config.color);
        const shouldFill = filled !== undefined ? filled : this.isHovered;
        
        if (shouldFill) {
            this.buttonPolygon.fill(fillColor);
            this.buttonPolygon.stroke({color: fillColor, width: 3, alpha: this.isClicked ? 0.3 : 1});
        } else {
            this.buttonPolygon.fill(getThemeColors(this.menu.config.classicMode).black);
            this.buttonPolygon.stroke({color: fillColor, width: 3, alpha: this.isClicked ? 0.3 : 1});
        }
    }

    public updateButtonTextColor(filled?: boolean, color?: number): void {
        const fillColor = color || (this.isHovered ? getThemeColors(this.menu.config.classicMode).white : this.config.color);
        const shouldFill = filled !== undefined ? filled : this.isHovered;
        
        if (shouldFill) {
            this.buttonText.style.fill = getThemeColors(this.menu.config.classicMode).black;
        } else {
            this.buttonText.style.fill = { color: fillColor, alpha: this.isClicked ? 0.3 : 1 };
        }
    }

    public resetPolygon(): void {
        this.createButton(this.isHovered);
    }

	public repositionButtonText(button: MenuButton, factor: number) {
		const text = button.getTextObject();
		text.x -= factor;
	}

	highlightOrnament(button: MenuButton) {
        let ornaments;

		for (const entity of this.menu.entities) {
			if (isMenuOrnaments(entity)) {
				ornaments = entity;
			}
		}

		const render = ornaments!.getComponent('render') as RenderComponent;
		const graphic = render?.graphic;
		let targetChild;

		switch(button.config.text) {
			case ('START'): {
				targetChild = graphic!.children[0] as Graphics;
				targetChild.fill(getThemeColors(this.menu.config.classicMode).white);
				targetChild.stroke( {color: getThemeColors(this.menu.config.classicMode).white, width: 3} );
				break;
			}
			case ('OPTIONS'): {
				targetChild = graphic!.children[1] as Graphics;
				targetChild.fill(getThemeColors(this.menu.config.classicMode).white);
				targetChild.stroke( {color: getThemeColors(this.menu.config.classicMode).white, width: 3} );
				break;
			}
            case ('GLOSSARY'): {
				targetChild = graphic!.children[2] as Graphics;
				targetChild.fill(getThemeColors(this.menu.config.classicMode).white);
				targetChild.stroke( {color: getThemeColors(this.menu.config.classicMode).white, width: 3} );
				break;
			}
			case ('ABOUT'): {
				targetChild = graphic!.children[3] as Graphics;
				targetChild.fill(getThemeColors(this.menu.config.classicMode).white);
				targetChild.stroke( {color: getThemeColors(this.menu.config.classicMode).white, width: 3} );
				break;
			}
		}
	}

	resetOrnamentColor(button: MenuButton) {
		if (button.isClicked) return;
        
        let ornaments;

		for (const entity of this.menu.entities) {
			if (isMenuOrnaments(entity)) {
				ornaments = entity;
			}
		}

		const render = ornaments!.getComponent('render') as RenderComponent;
		const graphic = render?.graphic;
		let targetChild;
		
		switch(button.config.text) {
			case ('START'): {
				targetChild = graphic!.children[0] as Graphics;
				targetChild.fill(getThemeColors(this.menu.config.classicMode).menuBlue);
				targetChild.stroke( {color: getThemeColors(this.menu.config.classicMode).menuBlue, width: 3} );
				break;
			}
			case ('OPTIONS'): {
				targetChild = graphic!.children[1] as Graphics;
				targetChild.fill(getThemeColors(this.menu.config.classicMode).menuGreen);
				targetChild.stroke( {color: getThemeColors(this.menu.config.classicMode).menuGreen, width: 3} );
				break;
			}
            case ('GLOSSARY'): {
				targetChild = graphic!.children[2] as Graphics;
				targetChild.fill(getThemeColors(this.menu.config.classicMode).menuOrange);
				targetChild.stroke( {color: getThemeColors(this.menu.config.classicMode).menuOrange, width: 3} );
				break;
			}
			case ('ABOUT'): {
				targetChild = graphic!.children[3] as Graphics;
				targetChild.fill(getThemeColors(this.menu.config.classicMode).menuPink);
				targetChild.stroke( {color: getThemeColors(this.menu.config.classicMode).menuPink, width: 3} );
				break;
			}
		}
	}

    public updateClickableState(isClickable: boolean): void {
        // Prevent updates during transitions
        if (this.isStateChanging || this.isUpdating || this.isAnimating) {
            return;
        }
        
        this.isUpdating = true;
        this.config.isClicked = isClickable;
        this.isClickable = isClickable;
        
        if (isClickable) {
            this.buttonContainer.eventMode = 'static';
            this.buttonContainer.cursor = 'pointer';
            this.isClicked = false;
        } else {
            this.buttonContainer.eventMode = 'none';
            this.buttonContainer.cursor = 'default';
            this.isClicked = true;
        }
        
        this.createButton(this.isHovered, isClickable);
        
        requestAnimationFrame(() => {
            this.isUpdating = false;
        });
    }
}