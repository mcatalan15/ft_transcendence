/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   MenuHalfButton.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/02 12:00:00 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/05 19:50:11 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Container, Text } from 'pixi.js';
import { Entity } from '../engine/Entity';
import { RenderComponent } from '../components/RenderComponent';
import { AnimationComponent } from '../components/AnimationComponent';
import { Menu } from './Menu';
import { getHalfButtonPoints, MenuButtonConfig } from '../utils/MenuUtils';
import { getThemeColors } from '../utils/Utils';
import { isMenuOrnaments } from '../utils/Guards';

export class MenuHalfButton extends Entity {
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
        if (config.isClicked) this.isClicked = config.isClicked;

        this.buttonContainer = new Container();
        this.buttonContainer.eventMode = 'static';
        this.buttonContainer.cursor = 'pointer';

        this.buttonPolygon = new Graphics();
        this.buttonText = new Text({
            text: config.text,
            style: {
                fill: { color: config.color, alpha: this.isClicked ? 1 : 0.3 },
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
            color = { color: getThemeColors(this.menu.config.classicMode).white, alpha: 1};
        } else {
            if (this.isClicked) {
                color = { color: this.config.color, alpha: 1};
            } else {
                color = { color: this.config.color, alpha: 0.3};
            }
        }

        this.buttonText.style.fill = isHovered ? getThemeColors(this.menu.config.classicMode).black : color;
		if (!isClicked) {
			this.buttonText.anchor.set(0.5);
			this.buttonText.x = this.menu.halfButtonWidth / 2;
			this.buttonText.y = this.menu.halfButtonHeight / 2;
		}

        this.makeButtonPolygon(color, isHovered);
    }

    private makeButtonPolygon(color: { color: number, alpha: number}, filled: boolean): void { 
		const points = getHalfButtonPoints(this.menu, this);

        if (this.originalButtonPolygonPoints.length === 0) {
            this.originalButtonPolygonPoints = [...points!];
        }

        this.buttonPolygon.poly(points!);
        
        if (filled) {
            this.buttonPolygon.fill(color);
        } else {
            this.buttonPolygon.fill(getThemeColors(this.menu.config.classicMode).black);
            this.buttonPolygon.stroke({color: color.color, width: 3, alpha: this.isClicked ? 1 : 0.3});
        }
    }

    private setupEventHandlers(): void {
        this.buttonContainer.on('pointerdown', () => { 
            if (this.getText().includes('FILTER') && this.getText().includes('ON')) {
                this.updateText(this.getText().substring(0, this.getText().indexOf('ON')) + 'OFF');
                this.menu.visualRoot.filters = [];
                this.menu.menuContainer.filters = [];
                this.menu.config.filters = false;
            } else if (this.getText().includes('FILTER') && this.getText().includes('OFF')) {
                this.updateText(this.getText().substring(0, this.getText().indexOf('OFF')) + 'ON');
                this.menu.visualRoot.filters = this.menu.visualRootFilters;
                this.menu.menuContainer.filters = this.menu.menuContainerFilters;
                this.menu.config.filters = true;
            } else if (this.getText().includes('CLASSIC') && this.getText().includes('ON')) {
                this.updateText(this.getText().substring(0, this.getText().indexOf('ON')) + 'OFF');
                this.menu.config.classicMode = false;
            } else if (this.getText().includes('CLASSIC') && this.getText().includes('OFF')) {
                this.updateText(this.getText().substring(0, this.getText().indexOf('OFF')) + 'ON');
                this.menu.config.classicMode = true;
            }

            this.isClicked = !this.isClicked;

            if ((this.getText().includes('LOCAL') || this.getText().includes('ONLINE')) && this.isClicked) {
                this.menu.eventQueue.push({
                    type: 'CHANGE_START_OPTIONS',
                    target: this.buttonContainer,
                    buttonName: this.config.text
                });
            }

            this.toggleStartValues(this.getText(), this.isClicked);
            //this.toggleOptionValues(this.getText(), this.isClicked); //!OJO

            // ! OJO
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
				this.updateButtonText(getThemeColors(this.menu.config.classicMode).black);;
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

    public updateButtonText(color?: number) {
        if (color) {
            this.buttonText.style.fill = {color: color, alpha: 1};
        } else {
            this.buttonText.style.fill = {color: color? color : this.config.color, alpha: this.isClicked ? 1 : 0.3};
        }
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
            if (this.isClicked) {
                fillColor = { color, alpha: 1 };
            } else {
                fillColor = { color, alpha: 0.3 };
            }
        } else {
            if (this.isHovered) {
                fillColor = { color: getThemeColors(this.menu.config.classicMode).white, alpha: 1 };
            } else {
                fillColor = { color: this.config.color, alpha: 0.3 };
            }
        }

        const shouldFill = filled !== undefined ? filled : this.isHovered;
        
        if (shouldFill) {
            this.buttonPolygon.fill(fillColor);
            this.buttonPolygon.stroke({color: fillColor.color, width: 3, alpha: fillColor.alpha});
        } else {
            this.buttonPolygon.fill(getThemeColors(this.menu.config.classicMode).black);
            this.buttonPolygon.stroke({color: fillColor.color, width: 3, alpha: fillColor.alpha});
        }
    }

    public updateButtonTextColor(filled?: boolean, color?: number): void {
        let fillColor: { color: number, alpha: number};
        
        if (color) {
            if (this.isClicked) {
                fillColor = { color, alpha: 1 };
            } else {
                fillColor = { color, alpha: 0.3 };
            }
        } else {
            if (this.isHovered) {
                fillColor = { color: getThemeColors(this.menu.config.classicMode).black, alpha: 1 };
            } else {
                fillColor = { color: this.config.color, alpha: 0.3 };
            }
        }
    
        const shouldFill = filled !== undefined ? filled : this.isHovered;
        
        if (shouldFill) {
            this.buttonText.style.fill = getThemeColors(this.menu.config.classicMode).black;
        } else {
            this.buttonText.style.fill = fillColor;
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
            targetChild.fill(getThemeColors(this.menu.config.classicMode).white);
            targetChild.stroke( {color: getThemeColors(this.menu.config.classicMode).white, width: 3} );
        } else if (button.id.includes('options')) {
            targetChild = graphic!.children[2] as Graphics;
            targetChild.fill(getThemeColors(this.menu.config.classicMode).white);
            targetChild.stroke( {color: getThemeColors(this.menu.config.classicMode).white, width: 3} );
        }
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
            targetChild.fill(getThemeColors(this.menu.config.classicMode).menuBlue);
            targetChild.stroke( {color: getThemeColors(this.menu.config.classicMode).menuBlue, width: 3} );
        } else if (button.id.includes('options')) {
            targetChild = graphic!.children[2] as Graphics;
            targetChild.fill(getThemeColors(this.menu.config.classicMode).menuOrange);
            targetChild.stroke( {color: getThemeColors(this.menu.config.classicMode).menuOrange, width: 3} );
        }
	}

    toggleStartValues(value: string, isClicked: boolean) {
        switch (value) {
            case ("LOCAL"): {
                if (isClicked && this.menu.onlineButton.isClicked) {
                    this.menu.onlineButton.isClicked = false;
                    this.menu.onlineButton.updateButtonPolygon();
                    this.menu.onlineButton.updateButtonText();
                }
                break;
            }
            case ("ONLINE"): {
                if (isClicked && this.menu.localButton.isClicked) {
                    this.menu.localButton.isClicked = false;
                    this.menu.localButton.updateButtonPolygon();
                    this.menu.localButton.updateButtonText();
                }
                break;
            }
            case ("1 vs 1"): {
                if (isClicked && (this.menu.IAButton.isClicked)) {
                    this.menu.IAButton.isClicked = false;
                    this.menu.tournamentButton.isClicked = false;
                    this.menu.IAButton.updateButtonPolygon();
                    this.menu.IAButton.updateButtonText();
                } else if (isClicked && this.menu.tournamentButton.isClicked) {
                    this.menu.tournamentButton.isClicked = false;
                    this.menu.tournamentButton.isClicked = false;
                    this.menu.tournamentButton.updateButtonPolygon();
                    this.menu.tournamentButton.updateButtonText();
                }
                break;
            }
            case ("1 vs IA"): {
                if (isClicked && this.menu.duelButton.isClicked) {
                    this.menu.duelButton.isClicked = false;
                    this.menu.duelButton.updateButtonPolygon();
                    this.menu.duelButton.updateButtonText();
                }
                break;
            }
            case ("TOURNAMENT"): {
                if (isClicked && this.menu.duelButton.isClicked) {
                    this.menu.duelButton.isClicked = false;
                    this.menu.duelButton.updateButtonPolygon();
                    this.menu.duelButton.updateButtonText();
                }
            }
        }
	}

    toggleOptionValues(value: string, isClicked: boolean) {
        if (value.includes('FILTER')) {
            if (isClicked && this.menu.classicButton.isClicked) {
                this.menu.classicButton.isClicked = false;
                this.menu.classicButton.updateButtonPolygon();
                this.menu.classicButton.updateButtonText();
                this.menu.classicButton.updateText('CLASSIC: OFF')
            }
        } else if (value.includes("CLASSIC")) {
            if (isClicked && this.menu.filtersButton.isClicked) {
                this.menu.filtersButton.isClicked = false;
                this.menu.filtersButton.updateButtonPolygon();
                this.menu.filtersButton.updateButtonText();
                this.menu.filtersButton.updateText('FILTERS: OFF')
            }
        }
	}
}