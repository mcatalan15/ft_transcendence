/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   PowerupSystem.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/25 15:57:01 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/25 16:00:33 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { PongGame } from '../engine/Game';
import { Entity } from '../engine/Entity';
import type { System } from '../engine/System'

import { LifetimeComponent } from '../components/LifetimeComponent';

import { PowerupSpawner } from '../spawners/PowerupSpawner';

import { FrameData } from '../utils/Types'
import { isPaddle } from '../utils/Guards'

export class PowerupSystem implements System {
    game: PongGame;
    app: any;
    width: number;
    height: number;
    cooldown: number;
    lastPowerupSpawn: number;

    constructor(game: PongGame, app: any, width: number, height: number) {
        this.game = game;
        this.app = app;
        this.width = width;
        this.height = height;

        this.cooldown = 100;
        this.lastPowerupSpawn = 0;
    }

    update(entities: Entity[], delta: FrameData): void {
        const powerupsToRemove: string[] = [];

        this.cooldown -= delta.deltaTime;

        if (this.cooldown <= 0) {
            this.lastPowerupSpawn = Date.now();

            PowerupSpawner.spawnPowerup(this.game, this.width, this.height);
            console.log('Powerup Spawned');
            this.cooldown = 1000;   
        }

        for (const entity of entities) {
            if (entity.id.startsWith('powerup')) {
                const lifetime = entity.getComponent('lifetime') as LifetimeComponent;
                if (!lifetime) continue;

                if (lifetime.despawn === 'time') {
                    lifetime.remaining -= delta.deltaTime;

                    if (lifetime.remaining <= 0) {
                        powerupsToRemove.push(entity.id);
                        continue;
                    }
                }
            }

            if (isPaddle(entity)) {
                if (entity.isEnlarged) {
                    entity.enlargeTimer -= delta.deltaTime;
                }

                if (entity.isEnlarged && entity.enlargeTimer <= 0) {
                    console.log('Resetting paddle height');
                    this.game.sounds.paddleReset.play();
                    entity.resetPaddleSize(entity);
                }
            }
        }

        // Remove powerups that have expired
        for (const entityId of powerupsToRemove) {
            this.game.removeEntity(entityId);
        }
    }
}
