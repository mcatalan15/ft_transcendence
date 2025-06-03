/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   MenuHalfButton.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/02 12:00:00 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/03 15:56:54 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Container, Text, FederatedPointerEvent } from 'pixi.js';
import { Entity } from '../engine/Entity';
import { RenderComponent } from '../components/RenderComponent';
import { AnimationComponent } from '../components/AnimationComponent';
import { GAME_COLORS } from '../utils/Types';
import { Menu } from './Menu';
import { getHalfButtonPoints, MenuButtonConfig } from '../utils/MenuUtils';
import { MenuOrnaments } from './MenuOrnaments';
import { isMenuOrnaments, isMenuPostProcessingLayer } from '../utils/Guards';

export class MenuHalfButton extends Entity {
    private buttonContainer: Container;
    private buttonPolygon: Graphics;
    private buttonText: Text;
    private isHovered: boolean = false;
	isClicked: boolean = false;
    private config: MenuButtonConfig;
    private menu: Menu;
    
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
                fill: { color: config.color, alpha: config.text.includes('ON') ? 1 : 0.3 },
                fontSize: 16,
                fontFamily: 'monospace',
                fontWeight: 'bold',
                fontStyle: 'italic',
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
            color = { color: GAME_COLORS.white, alpha: 1};
        } else {
            if (this.config.text.includes('ON')) {
                color = { color: this.config.color, alpha: 1};
            } else {
                color = { color: this.config.color, alpha: 0.3};
            }
        }

        this.buttonText.style.fill = isHovered ? GAME_COLORS.black : color;
		if (!isClicked) {
			this.buttonText.anchor.set(0.5);
			this.buttonText.x = this.menu.halfButtonWidth / 2;
			this.buttonText.y = this.menu.halfButtonHeight / 2;
		}

        this.makeButtonPolygon(color, isHovered, isClicked);
    }

    private makeButtonPolygon(color: { color: number, alpha: number} , filled: boolean, isClicked: boolean = false): void { 

		const points = getHalfButtonPoints(this.menu, this);

        if (this.originalButtonPolygonPoints.length === 0) {
            this.originalButtonPolygonPoints = [...points!];
        }

        this.buttonPolygon.poly(points!);
        
        if (filled) {
            this.buttonPolygon.fill(color);
        } else {
            this.buttonPolygon.fill(GAME_COLORS.black);
            this.buttonPolygon.stroke({color: color.color, width: 3, alpha: this.getText().includes('ON') ? 1 : 0.3});
        }
    }

    private setupEventHandlers(): void {
        this.buttonContainer.on('pointerdown', (event: FederatedPointerEvent) => { 
            if (this.getText().includes('FILTER') && this.getText().includes('ON')) {
                this.updateText(this.getText().substring(0, this.getText().indexOf('ON')) + 'OFF');
                this.menu.visualRoot.filters = [];
                this.menu.menuContainer.filters = [];
            } else if (this.getText().includes('FILTER') && this.getText().includes('OFF')) {
                this.updateText(this.getText().substring(0, this.getText().indexOf('OFF')) + 'ON');
                this.menu.visualRoot.filters = this.menu.visualRootFilters;
                this.menu.menuContainer.filters = this.menu.menuContainerFilters;
            }

            this.menu.eventQueue.push({
                type: 'PENDING',
                target: this.buttonContainer,
                buttonName: this.config.text
            });
            this.config.onClick();
        });

        this.buttonContainer.on('pointerenter', () => {
            if (!this.isHovered) {
                this.isHovered = true;
                this.updateButtonPolygon(true);
				//this.highlightOrnament(this);
				this.buttonText.style.fill = GAME_COLORS.black;
                this.menu.sounds.menuMove.play();
            }
        });

        this.buttonContainer.on('pointerleave', () => {
				this.isHovered = false;
            	this.updateButtonPolygon(false, this.config.color);
				//this.resetOrnamentColor(this);
				this.buttonText.style.fill = {color: this.config.color, alpha: this.getText().includes('ON') ? 1 : 0.3};
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
        
		const points = getHalfButtonPoints(this.menu, this);
		this.buttonPolygon.poly(points!);
        
        let fillColor: { color: number, alpha: number};
        if (color) {
            if (this.getText().includes('ON')) {
                fillColor = { color, alpha: 1 };
            } else {
                fillColor = { color, alpha: 0.3 };
            }
        } else {
            if (this.isHovered) {
                fillColor = { color: GAME_COLORS.white, alpha: 1 };
            } else {
                fillColor = { color: this.config.color, alpha: 0.3 };
            }
        }

        const shouldFill = filled !== undefined ? filled : this.isHovered;
        
        if (shouldFill) {
            this.buttonPolygon.fill(fillColor);
            this.buttonPolygon.stroke({color: fillColor.color, width: 3, alpha: fillColor.alpha});
        } else {
            this.buttonPolygon.fill(GAME_COLORS.black);
            this.buttonPolygon.stroke({color: fillColor.color, width: 3, alpha: fillColor.alpha});
        }
    }


    public resetPolygon(): void {
        this.createButton(this.isHovered);
    }

	public repositionButtonText(button: MenuHalfButton, factor: number) {
		const text = button.getTextObject();
		text.x -= factor;
	}

	highlightOrnament(button: MenuHalfButton) {
		let ornaments;

		for (const entity of this.menu.entities) {
			if (isMenuOrnaments(entity)) {
				ornaments = entity;
			}
		}

		const render = ornaments!.getComponent('render') as RenderComponent;
		const graphic = render?.graphic;
		let targetChild;

        if (button.id.includes('start')) {
            targetChild = graphic!.children[0] as Graphics;
            targetChild.fill(GAME_COLORS.white);
            targetChild.stroke( {color: GAME_COLORS.white, width: 3} );
        } else if (button.id.includes('options')) {
            targetChild = graphic!.children[2] as Graphics;
            targetChild.fill(GAME_COLORS.white);
            targetChild.stroke( {color: GAME_COLORS.white, width: 3} );
        }
		
		/* switch(button.config.text) {
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
		} */
	}

	resetOrnamentColor(button: MenuHalfButton) {
		let ornaments;

		for (const entity of this.menu.entities) {
			if (isMenuOrnaments(entity)) {
				ornaments = entity;
			}
		}

		const render = ornaments!.getComponent('render') as RenderComponent;
		const graphic = render?.graphic;
		let targetChild;

        if (button.id.includes('start')) {
            targetChild = graphic!.children[0] as Graphics;
            targetChild.fill(GAME_COLORS.menuBlue);
            targetChild.stroke( {color: GAME_COLORS.menuBlue, width: 3} );
        } else if (button.id.includes('options')) {
            targetChild = graphic!.children[2] as Graphics;
            targetChild.fill(GAME_COLORS.menuOrange);
            targetChild.stroke( {color: GAME_COLORS.menuOrange, width: 3} );
        }
		
		/* switch(button.config.text) {
			case ('START'): {
				targetChild = graphic!.children[0] as Graphics;
				targetChild.fill(GAME_COLORS.menuBlue);
				targetChild.stroke( {color: GAME_COLORS.menuBlue, width: 3} );
				break;
			}
			case ('GLOSSARY'): {
				targetChild = graphic!.children[1] as Graphics;
				targetChild.fill(GAME_COLORS.menuGreen);
				targetChild.stroke( {color: GAME_COLORS.menuGreen, width: 3} );
				break;
			}
			case ('OPTIONS'): {
				targetChild = graphic!.children[2] as Graphics;
				targetChild.fill(GAME_COLORS.menuOrange);
				targetChild.stroke( {color: GAME_COLORS.menuOrange, width: 3} );
				break;
			}
			case ('ABOUT'): {
				targetChild = graphic!.children[3] as Graphics;
				targetChild.fill(GAME_COLORS.menuPink);
				targetChild.stroke( {color: GAME_COLORS.menuPink, width: 3} );
				break;
			}
		} */
	}
}