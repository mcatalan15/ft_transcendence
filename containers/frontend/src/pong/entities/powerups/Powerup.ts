/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Powerup.ts                                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/29 12:40:30 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/12 10:48:31 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Container } from 'pixi.js';

import { PongGame } from '../../engine/Game.js';
import { Menu } from '../../menu/Menu.js';

import { Entity } from '../../engine/Entity.js';

import { RenderComponent } from '../../components/RenderComponent';
import { PhysicsComponent } from '../../components/PhysicsComponent';
import { AnimationComponent } from '../../components/AnimationComponent';
import { LifetimeComponent } from '../../components/LifetimeComponent';
import { PowerupComponent } from '../../components/PowerupComponent';

import { PhysicsData, AnimationOptions, GameEvent } from '../../utils/Types.js';
import { isPaddle, isGame, isMenu } from '../../utils/Guards.js';

export type AffectationType = 'powerUp' | 'powerDown' | 'ballChange';

export interface PowerupOptions {
    lifetime?: number;
    despawn?: string;
    effect?: string;
    affectation?: AffectationType;
    event?: GameEvent;
}

export abstract class Powerup extends Entity {
    game: PongGame | Menu;
    effect: string;
    lifetime: number;
    affectation: AffectationType;
    event: GameEvent;

    constructor(id: string, layer: string, game: PongGame | Menu, x: number, y: number, options: PowerupOptions = {}) {
        super(id, layer);

        if (isGame(game)) {
            this.game = game as PongGame;
        } else if (isMenu(game)) {
            this.game = game as Menu;
        } else {
            throw new Error('Invalid game type provided to Powerup constructor');
        }

        const {
            lifetime = 1100,
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
    abstract sendPowerupEvent(entitiesMap: Map<string, Entity>, side: string): void;
    abstract initPowerupPhysicsData(x: number, y: number): PhysicsData;

    protected defineAnimationOptions(physics: PhysicsComponent): AnimationOptions {
        return {
            initialY: physics.y,
            floatAmplitude: 5,
            floatSpeed: 2,
            floatOffset: Math.random() * Math.PI * 2,
            initialized: true,
        };
    }

    changePaddleLayer(game: PongGame, side: string, id: string) {
        switch (side) {
            case ('left'):
                {
                    if (id.includes('powerUp'))
                    {
                        for (const entity of game.entities) {
                            if (isPaddle(entity) && entity.id.includes('paddleL')) {
                                const render = entity.getComponent('render') as RenderComponent;
                                const graphic = render.graphic;
                                graphic.label = 'paddle';
                                game.renderLayers.powerup.addChild(graphic);
                            }
                        }
                    } else if (id.includes('powerDown')) {
                        for (const entity of game.entities) {
                            if (isPaddle(entity) && entity.id.includes('paddleL')) {
                                const render = entity.getComponent('render') as RenderComponent;
                                const graphic = render.graphic;
                                graphic.label = 'paddle';
                                game.renderLayers.powerdown.addChild(graphic);
                            }
                        }
                    }
                }
                break;

            case ('right'):
                {
                    if (id.includes('powerUp'))
                    {
                        for (const entity of game.entities) {
                            if (isPaddle(entity) && entity.id.includes('paddleR')) {
                                const render = entity.getComponent('render') as RenderComponent;
                                const graphic = render.graphic;
                                graphic.label = 'paddle';
                                game.renderLayers.powerup.addChild(graphic);
                            }
                        }
                    } else if (id.includes('powerDown')) {
                        for (const entity of game.entities) {
                            if (isPaddle(entity) && entity.id.includes('paddleR')) {
                                const render = entity.getComponent('render') as RenderComponent;
                                const graphic = render.graphic;
                                graphic.label = 'paddle';
                                game.renderLayers.powerdown.addChild(graphic);
                            }
                        }
                    }
                }
                break;
        }
        
        
    }
}