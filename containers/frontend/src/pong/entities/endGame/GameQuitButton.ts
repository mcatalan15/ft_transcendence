/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   GameQuitButton.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/04 12:00:00 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/19 22:37:55 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Container, Text } from 'pixi.js';
import { Entity } from '../../engine/Entity';
import { RenderComponent } from '../../components/RenderComponent';
import { PongGame } from '../../engine/Game';
import { GAME_COLORS } from '../../utils/Types';
import { isPlayerWinner } from '../../utils/Utils';

export class GameQuitButton extends Entity {
    private game: PongGame;
    private buttonContainer!: Container;
    private buttonGraphic!: Graphics;
    private buttonText!: Text;
    private isHovered: boolean = false;
    private isClickable: boolean = true;
    
    private buttonWidth: number = 150;
    private buttonHeight: number = 40;
    private buttonSlant: number = 0;

    constructor(game: PongGame, id: string, layer: string) {
        super(id, layer);
        this.game = game;
        
        this.initializeContainer();
        this.initializeGraphics();
        this.initializeText();
        this.createButton();
        this.setupEventHandlers();
        this.setupComponents();
        
        this.setPosition();
    }

    private initializeContainer(): void {
        this.buttonContainer = new Container();
        
        if (this.isClickable) {
            this.buttonContainer.eventMode = 'static';
            this.buttonContainer.cursor = 'pointer';
        } else {
            this.buttonContainer.eventMode = 'none';
            this.buttonContainer.cursor = 'default';
        }
    }

    private initializeGraphics(): void {
        this.buttonGraphic = new Graphics();
        this.buttonContainer.addChild(this.buttonGraphic);
    }

    private initializeText(): void {
        let color;

		if (this.game.config.classicMode) {
			color = GAME_COLORS.white;
		} else {
			if (this.game.data.generalResult === 'draw') {
				color = GAME_COLORS.orange;
			} else {
				color = isPlayerWinner(this.game) ? GAME_COLORS.green : GAME_COLORS.red;
			}
		}
        
        const textStyle = {
            fill: { 
                color: this.game.config.classicMode ? GAME_COLORS.white : color, 
                alpha: 1 
            },
            fontSize: 24,
            fontFamily: 'monospace',
            fontWeight: 'bold' as const,
        };

        this.buttonText = new Text({
            text: 'MENU',
            style: textStyle
        });
        
        this.buttonContainer.addChild(this.buttonText);
        this.updateTextPosition();
    }

    private setupEventHandlers(): void {
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

    private setupComponents(): void {
        const renderComponent = new RenderComponent(this.buttonContainer);
        this.addComponent(renderComponent, 'gameQuitButton');
    }

    private getButtonPoints(): number[] {
        return [
            this.buttonSlant, 0,
            this.buttonWidth, 0,
            this.buttonWidth - this.buttonSlant, this.buttonHeight,
            0, this.buttonHeight
        ];
    }

    private createButton(): void {
        this.buttonGraphic.clear();
        
        const points = this.getButtonPoints();
        this.buttonGraphic.poly(points);
        
        const strokeColor = this.getStrokeColor();
        
        if (this.isHovered) {
            this.buttonGraphic.fill({ 
                color: GAME_COLORS.white, 
                alpha: 1 
            });
            this.buttonGraphic.stroke({ 
                color: GAME_COLORS.white, 
                width: 5, 
                alpha: 1 
            });
        } else {
            this.buttonGraphic.fill({ color: GAME_COLORS.black, alpha: 1 });
            this.buttonGraphic.stroke(strokeColor);
        }
    }

    private getStrokeColor(): { color: number, alpha: number, width: number } {
        let color;

		if (this.game.config.classicMode) {
			color = GAME_COLORS.white;
		} else {
			if (this.game.data.generalResult === 'draw') {
				color = GAME_COLORS.orange;
			} else {
				color = isPlayerWinner(this.game) ? GAME_COLORS.green : GAME_COLORS.red;
			}
		}

        return {
            color: color,
            alpha: this.isClickable ? 1 : 0.3,
            width: 5
        };
    }

    private updateTextPosition(): void {
        if (!this.buttonText) return;
        
        this.buttonText.anchor.set(0.5);
        this.buttonText.x = this.buttonWidth / 2;
        this.buttonText.y = this.buttonHeight / 2;
    }

    private handleClick(): void {
        console.log("Game quit button clicked");
        
        this.game.eventQueue.push({
            type: 'GAME_QUIT',
            target: this.buttonContainer,
            buttonName: 'gameQuitButton'
        });
    }

    private handlePointerEnter(): void {
        if (!this.isClickable) return;
        
        this.isHovered = true;
        
        this.createButton();
        
        if (this.buttonText) {
            this.buttonText.style.fill = { color: GAME_COLORS.black, alpha: 1 };
        }
    }

    private handlePointerLeave(): void {
        if (!this.isClickable) return;
        
        let color;

		if (this.game.config.classicMode) {
			color = GAME_COLORS.white;
		} else {
			if (this.game.data.generalResult === 'draw') {
				color = GAME_COLORS.orange;
			} else {
				color = GAME_COLORS.orange;
			}
		}

        this.isHovered = false;
        
        this.createButton();
        
        if (this.buttonText) {
            const textColor = this.game.config.classicMode ? GAME_COLORS.white : color;
            this.buttonText.style.fill = { 
                color: textColor, 
                alpha: this.isClickable ? 1 : 0.3 
            };
        }
    }

    public setPosition(): void {
        this.buttonContainer.position.set(this.game.width / 2 - (this.buttonWidth / 2), 575);
        this.buttonContainer.alpha = 0;
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
        
        this.createButton();
        
        if (this.buttonText) {
            const textColor = this.game.config.classicMode ? GAME_COLORS.white : GAME_COLORS.green;
            this.buttonText.style.fill = { 
                color: textColor, 
                alpha: this.isClickable ? 1 : 0.3 
            };
        }
    }

    public getContainer(): Container {
        return this.buttonContainer;
    }

    public cleanup(): void {
        if (this.buttonContainer) {
            this.buttonContainer.removeAllListeners();
            
            if (this.buttonContainer.parent) {
                this.buttonContainer.parent.removeChild(this.buttonContainer);
            }
            
            this.buttonContainer.destroy({ children: true });
        }
    }
}