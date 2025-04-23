/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Particle.ts                                        :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/23 14:50:12 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/23 16:13:01 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Entity } from "../engine/Entity";
import { RenderComponent } from "../components/RenderComponent";
import { PhysicsComponent } from "../components/PhysicsComponent";
import { LifetimeComponent } from "../components/LifetimeComponent";
import { ParticleBehaviorComponent } from "../components/ParticleBehaviorComponent";
import { Graphics } from "pixi.js";

type ParticleType = 'square' | 'circle' | 'triangle';

interface ParticleOptions {
    velocityX?: number;
    velocityY?: number;
    lifetime?: number;
    size?: number;
    type?: ParticleType;
    color?: number;
    shrink?: boolean;
    rotate?: boolean;
    alpha?: number;
    alphaDecay?: number;
    fadeOut?: boolean;
    despawn?: 'time' | string;
    rotationSpeed?: number;
}

export class Particle extends Entity {
    alpha: number;
    fadeOut: boolean;
    alphaDecay: number;

    constructor(id: string, layer: string, x: number, y: number, options: ParticleOptions = {}) {
        super(id, layer);

        const {
            velocityX = 0,
            velocityY = 0,
            lifetime = 30,
            size = 4,
            type = 'square',
            color = 0xFFFBEB,
            shrink = false,
            rotate = false,
            rotationSpeed = 0,
            alpha = 1,
            alphaDecay = 0,
            fadeOut = false,
            despawn = 'time',
        } = options;

        this.alpha = alpha;
        this.fadeOut = fadeOut;
        this.alphaDecay = alphaDecay;

        const graphic = this.generateParticleGraphic(type, size, color, x, y);

        const render = new RenderComponent(graphic);
        this.addComponent(render);
        
        const physics = new PhysicsComponent({
            x: x,
            y: y,
            width: size * 2, // Approximation, as it's not defined in the original JS file
            height: size * 2, // Approximation, as it's not defined in the original JS file
            velocityX: velocityX,
            velocityY: velocityY,
        });
        this.addComponent(physics);

        const lifetimeComp = new LifetimeComponent(lifetime, despawn === 'time');
        this.addComponent(lifetimeComp);

        const behaviour = new ParticleBehaviorComponent({
            rotate: rotate,
            shrink: shrink,
        });
        this.addComponent(behaviour);
    }

    generateParticleGraphic(type: ParticleType, size: number, color: number, x: number, y: number): Graphics {
        const graphic = new Graphics();

        switch (type) {
            case 'square':
                graphic.rect(0, 0, size, size);
                graphic.fill(color);
                graphic.pivot.set(size / 2, size / 2);
                break;
            
            case 'circle':
                graphic.circle(size, size, size);
                graphic.fill(color);
                graphic.pivot.set(size, size);
                break;
            
            case 'triangle':
                graphic.regularPoly(0, 0, size * 2, 3, 0);
                graphic.fill(color);
                graphic.pivot.set(0, 0);
                break;
            
            default:
                console.log("Invalid particle information. Generation failed");
        }
        return graphic;
    }
}