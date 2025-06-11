/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   ClassicO.ts                                        :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/29 11:39:09 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/11 18:37:42 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

//! Only God can judge me

import { Graphics, Text } from "pixi.js"
import { Menu } from "./Menu"
import { Entity } from "../engine/Entity"
import { RenderComponent } from "../components/RenderComponent"
import { PhysicsComponent } from "../components/PhysicsComponent"
import { AnimationComponent } from "../components/AnimationComponent"
import { GAME_COLORS, PhysicsData, AnimationOptions } from "../utils/Types"

export class ClassicO extends Entity {
	menu: Menu;
	width: number;
	height: number;
	
	constructor(id: string, layer: string, menu: Menu) {
		super(id, layer);

		this.menu = menu;
		this.width = menu.width;
		this.height = menu.height;

		const titleText = this.createTitleText();
		const textRenderComponent = new RenderComponent(titleText);
		this.addComponent(textRenderComponent, 'textRender');
		
		const animationOptions = this.defineAnimationOptions();
        this.addComponent(new AnimationComponent(animationOptions));
	}

	private createTitleText(): Text {
		const titleText = this.fetchTitle();	
		return (titleText);
	}

	private fetchTitle(): Text {
		const titleText = new Text({
			text: 'O',
			style: {
			fill: GAME_COLORS.white,
			fontSize: 250,
			fontFamily: 'anatol-mn',
			}
		});
		
		// Set anchor and position immediately
		titleText.anchor.set(0.5);
		titleText.position.set(
			1330,
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
}