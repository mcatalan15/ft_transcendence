/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   MenuXButton.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/02 12:00:00 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/05 19:50:18 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Container, Text, FederatedPointerEvent } from 'pixi.js';
import { Entity } from '../engine/Entity';
import { RenderComponent } from '../components/RenderComponent';
import { AnimationComponent } from '../components/AnimationComponent';
import { GAME_COLORS } from '../utils/Types';
import { Menu } from './Menu';
import { getButtonPoints, getXButtonPoints, MenuButtonConfig } from '../utils/MenuUtils';
import { MenuOrnaments } from './MenuOrnaments';
import { isMenuOrnaments } from '../utils/Guards';
import { getThemeColors } from '../utils/Utils';

export class MenuXButton extends Entity {
    private buttonContainer: Container;
    private buttonPolygon: Graphics;
    private buttonText: Text;
    private isHovered: boolean = false;
	isClicked: boolean = false;
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

        this.buttonContainer = new Container();
        this.buttonContainer.eventMode = 'static';
        this.buttonContainer.cursor = 'pointer';

        this.buttonPolygon = new Graphics();
        
        this.buttonText = new Text({
            text: config.text,
            style: {
                fill: config.color,
                fontSize: 24,
                fontFamily: 'monospace',
                fontWeight: 'bold',
                fontStyle: 'italic',
                padding: 1.5,
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
        
        const color = isHovered ? GAME_COLORS.white : this.config.color;

        this.makeButtonPolygon(color, isHovered, isClicked);

        this.buttonText.style.fill = isHovered ? GAME_COLORS.black : color;
		if (!isClicked) {
			this.buttonText.anchor.set(0.5);
			this.buttonText.x = this.menu.buttonXWidth / 2 + 4;
			this.buttonText.y = this.menu.buttonHeight / 2;
		}
    }

    private makeButtonPolygon(color: number, filled: boolean, isClicked: boolean = false): void { 

		const points = getXButtonPoints(this.menu, this);

        if (this.originalButtonPolygonPoints.length === 0) {
            this.originalButtonPolygonPoints = [...points!];
        }

        this.buttonPolygon.poly(points!);
        
        if (filled) {
            this.buttonPolygon.fill(color);
        } else {
            this.buttonPolygon.fill(GAME_COLORS.black);
            this.buttonPolygon.stroke({color: color, width: 3});
        }
    }

    private setupEventHandlers(): void {
        this.buttonContainer.on('pointerdown', (event: FederatedPointerEvent) => { 
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
            this.config.onClick();
        });

        this.buttonContainer.on('pointerenter', () => {
            if (!this.isHovered) {
                this.isHovered = true;
                this.updateButtonPolygon(true);
				this.highlightOrnament(this);
				this.buttonText.style.fill = GAME_COLORS.black;
                this.menu.sounds.menuMove.play();
            }
        });

        this.buttonContainer.on('pointerleave', () => {
				this.isHovered = false;
            	this.updateButtonPolygon(false, this.menu.config.classicMode ? getThemeColors(this.menu.config.classicMode).white : this.config.color);
				this.resetOrnamentColor(this);
				this.buttonText.style.fill = { color: this.menu.config.classicMode ? getThemeColors(this.menu.config.classicMode).white : this.config.color, alpha: this.isClicked ? 1 : 0.3 };
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
        
		const points = getXButtonPoints(this.menu, this);
		this.buttonPolygon.poly(points!);
        
        const fillColor = color || (this.isHovered ? GAME_COLORS.white : this.config.color);
        const shouldFill = filled !== undefined ? filled : this.isHovered;
        
        if (shouldFill) {
            this.buttonPolygon.fill(fillColor);
            this.buttonPolygon.stroke({color: fillColor, width: 3});
        } else {
            this.buttonPolygon.fill(GAME_COLORS.black);
            this.buttonPolygon.stroke({color: fillColor, width: 3});
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

	highlightOrnament(button: MenuXButton) {
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
				targetChild.fill(GAME_COLORS.white);
				targetChild.stroke( {color: GAME_COLORS.white, width: 3} );
				break;
			}
			case ('GLOSSARY'): {
				targetChild = graphic!.children[1] as Graphics;
				targetChild.fill(GAME_COLORS.white);
				targetChild.stroke( {color: GAME_COLORS.white, width: 3} );
				break;
			}
			case ('OPTIONS'): {
				targetChild = graphic!.children[2] as Graphics;
				targetChild.fill(GAME_COLORS.white);
				targetChild.stroke( {color: GAME_COLORS.white, width: 3} );
				break;
			}
			case ('ABOUT'): {
				targetChild = graphic!.children[3] as Graphics;
				targetChild.fill(GAME_COLORS.white);
				targetChild.stroke( {color: GAME_COLORS.white, width: 3} );
				break;
			}
		}
	}

	resetOrnamentColor(button: MenuXButton) {
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
				targetChild.fill(GAME_COLORS.menuBlue);
				targetChild.stroke( {color: GAME_COLORS.menuBlue, width: 2} );
				break;
			}
			case ('GLOSSARY'): {
				targetChild = graphic!.children[1] as Graphics;
				targetChild.fill(GAME_COLORS.menuGreen);
				targetChild.stroke( {color: GAME_COLORS.menuGreen, width: 2} );
				break;
			}
			case ('OPTIONS'): {
				targetChild = graphic!.children[2] as Graphics;
				targetChild.fill(GAME_COLORS.menuOrange);
				targetChild.stroke( {color: GAME_COLORS.menuOrange, width: 2} );
				break;
			}
			case ('ABOUT'): {
				targetChild = graphic!.children[3] as Graphics;
				targetChild.fill(GAME_COLORS.menuPink);
				targetChild.stroke( {color: GAME_COLORS.menuPink, width: 2} );
				break;
			}
		}
	}
}