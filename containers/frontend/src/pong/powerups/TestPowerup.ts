/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   TestPowerup.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 16:28:56 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/25 18:43:43 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Container } from 'pixi.js'

import { Entity } from '../engine/Entity.js';

import { RenderComponent } from '../components/RenderComponent';
import { PhysicsComponent } from '../components/PhysicsComponent';
import { AnimationComponent } from '../components/AnimationComponent';
import { LifetimeComponent } from '../components/LifetimeComponent';
import { PowerupComponent } from '../components/PowerupComponent';

import { AnimationOptions } from '../utils/Types.js'

interface PowerupOptions {
    lifetime?: number;
    despawn?: string;
    effect?: string;
}

export class Powerup extends Entity {
    effect: string;
    lifetime: number;

    constructor(id: string, layer: string, game: any, x: number, y: number, options: PowerupOptions = {}) {
        super(id, layer);

        const {
            lifetime = 500,
            despawn = 'time',  // Make sure LifetimeComponent handles this appropriately
            effect = 'enlargePaddle',  // Corrected typo here
        } = options;

        this.effect = effect;
        this.lifetime = lifetime;

        const powerupGraphic = this.createPowerupGraphic();
        //const powerupOrnament = this.createPowerupOrnament();
        const renderComponentBase = new RenderComponent(powerupGraphic);
        //const renderComponentOrnament = new RenderComponent(powerupOrnament);
        //this.addComponent(renderComponentOrnament);
        this.addComponent(renderComponentBase);
        

        const physicsData = this.initPowerupPhysicsData(x, y);
        const physicsComponent = new PhysicsComponent(physicsData);
        this.addComponent(physicsComponent);

        const lifetimeComp = new LifetimeComponent(lifetime, despawn);
        this.addComponent(lifetimeComp);

        const powerupComp = new PowerupComponent(game);
        this.addComponent(powerupComp);

        const animationOptions = this.defineAnimationOptions(physicsComponent);
        const animationComp = new AnimationComponent(animationOptions);
		this.addComponent(animationComp);
    }

    createPowerupGraphic(): Container {
        const container = new Container;

        const powerupGraphic = new Graphics();
        powerupGraphic.rect(-10, -10, 20 , 20);
        powerupGraphic.fill(0xFFFBEB);
        //powerupGraphic.pivot.set(15, 15);
        container.addChild(powerupGraphic);

        const powerupOrnament = new Graphics();
        powerupOrnament.rect(-15, -15, 30, 30);
        powerupOrnament.stroke(0xFFFBEB);
        //powerupGraphic.pivot.set(17.5, 17.5);
        container.addChild(powerupOrnament);

        return container;
    }

    createPowerupOrnament(): Graphics {
        const powerupOrnament = new Graphics();
        powerupOrnament.rect(0, 0, 35 , 35);
        powerupOrnament.stroke(0xFF0000);
        return powerupOrnament;
    }

    initPowerupPhysicsData(x: number, y: number) {
        return {
            x,
            y,
            width: 30,
            height: 30,
            velocityX: 0,
            velocityY: 0,
            isStatic: true,
            behaviour: 'trigger' as const,
            restitution: 1.0,
            mass: 0,
            speed: 0,
        };
    }

    defineAnimationOptions(physics: PhysicsComponent): AnimationOptions {
        return {
            initialY: physics.y,
			floatAmplitude: 5, // How many pixels up/down
			floatSpeed: 2, // Adjust speed of floating
			floatOffset: Math.random() * Math.PI * 2, // Random starting point in the cycle
			initialized: true,
        } as AnimationOptions;
    }
}
