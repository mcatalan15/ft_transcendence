/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Powerup.ts                                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/29 12:40:30 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/29 16:03:56 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Container } from 'pixi.js';

import { Entity } from '../../engine/Entity.js';

import { RenderComponent } from '../../components/RenderComponent';
import { PhysicsComponent } from '../../components/PhysicsComponent';
import { AnimationComponent } from '../../components/AnimationComponent';
import { LifetimeComponent } from '../../components/LifetimeComponent';
import { PowerupComponent } from '../../components/PowerupComponent';

import { AnimationOptions, GameEvent } from '../../utils/Types.js';

export type AffectationType = 'powerUp' | 'powerDown' | 'ballChange';

export interface PowerupOptions {
    lifetime?: number;
    despawn?: string;
    effect?: string;
    affectation?: AffectationType;
    event?: GameEvent;
}

export abstract class Powerup extends Entity {
    effect: string;
    lifetime: number;
    affectation: AffectationType;
    event: GameEvent;

    constructor(id: string, layer: string, game: any, x: number, y: number, options: PowerupOptions = {}) {
        super(id, layer);

        const {
            lifetime = 1000,
            despawn = 'time',
            effect = 'unknownEffect',
            affectation = 'powerUp',
            event = { type: 'undefined'},
        } = options;

        this.effect = effect;
        this.lifetime = lifetime;
        this.affectation = affectation;
        this.event = event;

        const graphic = this.createPowerupGraphic();
        this.addComponent(new RenderComponent(graphic));

        const physicsData = this.initPowerupPhysicsData(x, y);
        const physicsComponent = new PhysicsComponent(physicsData);
        this.addComponent(physicsComponent);

        this.addComponent(new LifetimeComponent(lifetime, despawn));
        this.addComponent(new PowerupComponent(game));

        const animationOptions = this.defineAnimationOptions(physicsComponent);
        this.addComponent(new AnimationComponent(animationOptions));
    }

    abstract createPowerupGraphic(): Container;
    abstract sendPowerupEvent(entitiesMap: Map<string, Entity>): void;

    protected initPowerupPhysicsData(x: number, y: number) {
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

    protected defineAnimationOptions(physics: PhysicsComponent): AnimationOptions {
        return {
            initialY: physics.y,
            floatAmplitude: 5,
            floatSpeed: 2,
            floatOffset: Math.random() * Math.PI * 2,
            initialized: true,
        };
    }
}