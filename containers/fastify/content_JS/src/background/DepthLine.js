/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   DepthLine.js                                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/16 11:34:42 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/22 12:14:50 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Entity } from "../engine/Entity.js";
import { RenderComponent } from "../components/RenderComponent.js";
import { LifetimeComponent } from "../components/LifetimeComponent.js";
import { AnimationComponent } from "../components/AnimationComponent.js";

export class DepthLine extends Entity {
	constructor(id, layer, options = {}) {
		super(id, layer);
	
		const {
			velocityX = 0,
			velocityY = 0,
			width = 0, 
			height = 0,
			upperLimit = 0,
			lowerLimit = 0,
			alpha = 1,
			alphaDecay = 0,
			alphaIncrease = 0,
			lifetime = 90,
			type = '',
			despawn = '',
			behavior = { movement: 'vertical', direction: 'upwards', fade: 'in'},
		} = options;
	
		this.width = width;
		this.height = height;
		
		this.x = width / 2;
		this.y = type === 'top' ? height / 2 - height / 10 : height / 2 + height / 10;
		
		this.upperLimit = upperLimit;
		this.lowerLimit = lowerLimit;
		this.velocityX = velocityX;
		this.velocityY = velocityY;
		this.behavior = behavior;
		
		this.alpha = 0;
		this.targetAlpha = options.alpha || 1;
		this.alphaIncrease = this.targetAlpha / 50;
		
		const graphic = this.generateLine(width);
		const render = new RenderComponent(graphic);
		this.addComponent(render);
		
		render.graphic.position.set(this.x, this.y);
	
		const lifetimeComp = new LifetimeComponent(lifetime, despawn);
		this.addComponent(lifetimeComp);
	
		const animationComp = new AnimationComponent();
		this.addComponent(animationComp);
	}
	
	generateLine(width) {
		const line = new PIXI.Graphics();
		
		line.rect(-width/2, 0, width, 0.5);
		line.fill({color: 0xF43F5E, alpha: 1});
		
		return line;
	}
	
	setPosition(x, y) {
		this.x = x;
		this.y = y;
		
		const render = this.getComponent('render');
		if (render && render.graphic) {
			render.graphic.position.set(this.x, this.y);
		}
	}
}