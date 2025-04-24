/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   TestPowerup.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 16:28:56 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/24 16:54:18 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics } from 'pixi.js'
import { Entity } from '../engine/Entity.js';
import { RenderComponent } from '../components/RenderComponent.js';
import { PhysicsComponent } from '../components/PhysicsComponent.js';
import { VFXComponent } from '../components/VFXComponent.js';
import { LifetimeComponent } from '../components/LifetimeComponent.js';
import { PowerupComponent } from '../components/PowerupComponent.js';

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
        const renderComponent = new RenderComponent(powerupGraphic);
        this.addComponent(renderComponent);

        const physicsData = this.initPowerupPhysicsData(x, y);
        const physicsComponent = new PhysicsComponent(physicsData);
        this.addComponent(physicsComponent);

        const lifetimeComp = new LifetimeComponent(lifetime, despawn);
        this.addComponent(lifetimeComp);

        const powerupComp = new PowerupComponent(game);
        this.addComponent(powerupComp);
    }

    createPowerupGraphic(): Graphics {
        const powerupGraphic = new Graphics();
        powerupGraphic.fill(0xFFFBEB);  // Ensure fill color is specified in hex
        powerupGraphic.rect(0, 0, 30 , 300);
        powerupGraphic.fill('#FFFBEB');
        powerupGraphic.pivot.set(15, 150);  // Adjust pivot for rotation if needed
        return powerupGraphic;
    }

    initPowerupPhysicsData(x: number, y: number) {
        return {
            x,
            y,
            width: 30,
            height: 300,
            velocityX: 0,
            velocityY: 0,
            isStatic: true,
            behaviour: 'trigger' as const,
            restitution: 1.0,
            mass: 0,
            speed: 0,
        };
    }
}
