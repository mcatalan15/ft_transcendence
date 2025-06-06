/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   BallButton.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/30 12:00:00 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/05 19:50:27 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Container, FederatedPointerEvent } from 'pixi.js';
import { Entity } from '../engine/Entity';
import { RenderComponent } from '../components/RenderComponent';
import { AnimationComponent } from '../components/AnimationComponent';
import { VFXComponent } from '../components/VFXComponent';
import { GAME_COLORS } from '../utils/Types';
import { getThemeColors } from '../utils/Utils';
import { Menu } from './Menu';

export class BallButton extends Entity {
    private menu: Menu;
    private buttonContainer: Container;
    private ballGraphic: Graphics;
    private isHovered: boolean = false;
    private onClick: () => void;
    public isAnimating: boolean = false;
    public isStateChanging: boolean = false;
    public isUpdating: boolean = false;

    constructor(id: string, layer: string, menu: Menu, onClick: () => void) {
        super(id, layer);
        this.menu = menu;
        this.onClick = onClick;

        this.buttonContainer = new Container();
        this.buttonContainer.eventMode = 'static';
        this.buttonContainer.cursor = 'pointer';

        this.ballGraphic = new Graphics();
        this.createBall();
        
        this.buttonContainer.addChild(this.ballGraphic);
        this.setupEventHandlers();
        this.setupComponents(menu);

        const vfxComponent = new VFXComponent();
		this.addComponent(vfxComponent);

    }

    private createBall(isHovered: boolean = false): void {
        this.ballGraphic.clear();
        const radius = isHovered ? 80 : 75;
        const color = getThemeColors(this.menu.config.classicMode).white;
        
        this.ballGraphic.circle(0, 0, radius);
        this.ballGraphic.fill(color);
    }

    private setupEventHandlers(): void {
        this.buttonContainer.on('pointerdown', (event: FederatedPointerEvent) => {
            this.onClick();
        });

        this.buttonContainer.on('pointerenter', () => {
            this.isHovered = true;
            this.createBall(true);
        });

        this.buttonContainer.on('pointerleave', () => {
            this.isHovered = false;
            this.createBall(false);
        });
    }

    private setupComponents(menu: Menu): void {
        const renderComponent = new RenderComponent(this.buttonContainer);
        this.addComponent(renderComponent, 'ballButton');

        const animationComponent = new AnimationComponent({
            floatSpeed: 1.5,
            floatAmplitude: 8,
            floatOffset: 0,
            initialized: false,
            initialX: 0,
            initialY: 0
        });
        this.addComponent(animationComponent, 'ballFloat');
    }

    public setPosition(x: number, y: number): void {
        this.buttonContainer.position.set(x, y);
    }

    public getContainer(): Container {
        return this.buttonContainer;
    }

    public getBallGraphic(): Graphics {
        return this.ballGraphic;
    }

    public getIsHovered(): boolean {
        return this.isHovered;
    }
}