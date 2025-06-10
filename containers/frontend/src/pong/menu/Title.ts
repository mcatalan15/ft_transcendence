/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Title.ts                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/29 11:39:09 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/10 11:19:03 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Text } from "pixi.js"
import { Menu } from "./Menu"
import { Entity } from "../engine/Entity"
import { RenderComponent } from "../components/RenderComponent"
import { PhysicsComponent } from "../components/PhysicsComponent"
import { AnimationComponent } from "../components/AnimationComponent"
import { GAME_COLORS, PhysicsData, AnimationOptions } from "../utils/Types"

export class Title extends Entity {
	menu: Menu;
    width: number;
    height: number;
	blocking: Graphics;
    
    constructor(id: string, layer: string, menu: Menu) {
        super(id, layer);

        this.menu = menu;
        this.width = menu.width;
        this.height = menu.height;

        const backDrop = this.createBackdrop();
        const backDropRenderComponent = new RenderComponent(backDrop);
        this.addComponent(backDropRenderComponent, 'backDrop');

        const titleText = this.createTitleText();
        const textRenderComponent = new RenderComponent(titleText);
        this.addComponent(textRenderComponent, 'textRender');

        const blocking = this.createBlocking();
        const blockingRenderComponent = new RenderComponent(blocking);
        this.addComponent(blockingRenderComponent, 'block');
		this.blocking = blocking;

        const titleBall = this.createTitleBall();
        const ballRenderComponent = new RenderComponent(titleBall);
        this.addComponent(ballRenderComponent, 'ballRender');
        
        const animationOptions = this.defineAnimationOptions();
        this.addComponent(new AnimationComponent(animationOptions));
    }

	private createBackdrop(): Graphics {
		const backDrop = new Graphics();
		backDrop.rect(0, 0, this.width, this.height);
		backDrop.x = 0;
		backDrop.y = 0;
		backDrop.fill(0x151515);
		return (backDrop);
	}

	private createTitleText(): Text {
		const titleText = this.fetchTitle();	
		return (titleText);
	}

	private createTitleBall(): Graphics {
		const ball = new Graphics();
		ball.circle(0, 0, 75);
		ball.x = 0;
		ball.y = this.height / 8;
		ball.fill(GAME_COLORS.orange);
		return (ball);
	}

	private createBlocking(): Graphics {
        const block = new Graphics();
        
        if (!this.menu.config.classicMode) {
            block.rect(0, 0, this.width, 80);
            block.x = 0;
            block.y = this.height / 3 - 30;
            block.fill(0x151515);
        }
        
        return block;
    }

	private fetchTitle(): Text {
		const titleText = new Text({
			text: 'P   NG',
			style: {
			fill: GAME_COLORS.white,
			fontSize: 250,
			fontFamily: 'anatol-mn',
			}
		});
		
		// Set anchor and position immediately
		titleText.anchor.set(0.5);
		titleText.position.set(
			1400,
			310,
		);
		
		return (titleText);
	}

	private defineAnimationOptions(): AnimationOptions {
		return {
			initialY: 0,
			initialX: 0,  // Add this
			floatAmplitude: 5,
			floatSpeed: 2,
			floatOffset: Math.random() * Math.PI * 2,
			initialized: false,
		};
	}

	public updateBlockingVisibility(): void {
        const blocking = this.blocking;

        blocking.clear();

        if (!this.menu.config.classicMode) {
            // Show blocking when NOT in classic mode
            blocking.rect(0, 0, this.width, 80);
            blocking.x = 0;
            blocking.y = this.height / 3 - 30;
            blocking.fill(0x151515);
        }
    }
}