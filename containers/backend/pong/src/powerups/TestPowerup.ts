/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   TestPowerup.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/23 16:17:14 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/23 16:18:49 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics } from 'pixi.js';
import { Entity } from '../engine/Entity.ts';
import { RenderComponent } from '../components/RenderComponent.ts';
import { PhysicsComponent } from '../components/PhysicsComponent.ts';
import { VFXComponent } from '../components/VFXComponent.ts';
import { LifetimeComponent } from '../components/LifetimeComponent.ts';
import { PowerupComponent } from '../components/PowerupComponent.ts';

type PowerupOptions = {
    lifetime?: number;
    despawn?: boolean | string;
    effect?: string;
};

type PhysicsData = {
    x: number;
    y: number;
    width: number;
    height: number;
    velocityX: number;
    velocityY: number;
    isStatic: boolean;
    behaviour: 'bounce' | 'block' | 'trigger' | 'none';
    restitution: number;
    mass: number;
    speed: number;
};

type Game = {
    eventQueue: any[];
};

export class TestPowerup extends Entity {
    effect: string;
    lifetime: number;

    constructor(id: string, layer: string, game: Game, x: number, y: number, options: PowerupOptions = {}) {
        super(id, layer);

        const {
            lifetime = 500,
            despawn = 'time',
            effect = 'enlargePadle',
        } = options;
        
        this.effect = effect;
        this.lifetime = lifetime;

        const powerupGraphic = this.createPowerupGraphic();
        const renderComponent = new RenderComponent(powerupGraphic);
        this.addComponent(renderComponent);

        const physicsData = this.initPowerupPhysicsData(x, y);
        const physicsComponent = new PhysicsComponent(physicsData);
        this.addComponent(physicsComponent);

        const lifetimeComp = new LifetimeComponent(lifetime, despawn as any);
        this.addComponent(lifetimeComp);

        const powerupComp = new PowerupComponent(game);
        this.addComponent(powerupComp);
    }

    createPowerupGraphic(): Graphics {
        const powerupGraphic = new Graphics();
        powerupGraphic.rect(0, 0, 30, 300);
        powerupGraphic.fill('#FFFBEB');
        powerupGraphic.pivot.set(15, 150);
        return powerupGraphic;
    }

    initPowerupPhysicsData(x: number, y: number): PhysicsData {
        const data: PhysicsData = {
            x: x,
            y: y,
            width: 30,
            height: 300,
            velocityX: 0,
            velocityY: 0,
            isStatic: true,
            behaviour: 'trigger',
            restitution: 1.0,
            mass: 0,
            speed: 0,
        };

        return data;
    }
}