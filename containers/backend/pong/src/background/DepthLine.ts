/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   DepthLine.ts                                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/23 16:07:19 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/23 16:19:18 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics } from 'pixi.js';
import { Entity } from "../engine/Entity.ts";
import { RenderComponent } from "../components/RenderComponent.ts";
import { LifetimeComponent } from "../components/LifetimeComponent.ts";
import { AnimationComponent } from "../components/AnimationComponent.ts";

type DepthLineOptions = {
    velocityX?: number;
    velocityY?: number;
    width?: number;
    height?: number;
    upperLimit?: number;
    lowerLimit?: number;
    alpha?: number;
    alphaDecay?: number;
    alphaIncrease?: number;
    lifetime?: number;
    type?: string;
    despawn?: boolean | string;
    behavior?: {
        movement: string;
        direction: string;
        fade: string;
    };
};

export class DepthLine extends Entity {
    width: number;
    height: number;
    x: number;
    y: number;
    upperLimit: number;
    lowerLimit: number;
    velocityX: number;
    velocityY: number;
    behavior: {
        movement: string;
        direction: string;
        fade: string;
    };
    alpha: number;
    targetAlpha: number;
    alphaIncrease: number;

    constructor(id: string, layer: string, options: DepthLineOptions = {}) {
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
    
        const lifetimeComp = new LifetimeComponent(lifetime, despawn as any);
        this.addComponent(lifetimeComp);
    
        const animationComp = new AnimationComponent();
        this.addComponent(animationComp);
    }
    
    generateLine(width: number): Graphics {
        const line = new Graphics();
        
        line.rect(-width/2, 0, width, 0.5);
        line.fill({color: 0xF43F5E, alpha: 1});
        
        return line;
    }
    
    setPosition(x: number, y: number): void {
        this.x = x;
        this.y = y;
        
        const render = this.getComponent('render') as RenderComponent | null;
        if (render && render.graphic) {
            render.graphic.position.set(this.x, this.y);
        }
    }
}
