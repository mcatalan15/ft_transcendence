/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   PowerupSystem.js                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: marvin <marvin@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/20 12:34:06 by marvin            #+#    #+#             */
/*   Updated: 2025/04/20 12:34:06 by marvin           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { PowerupSpawner } from '../spawners/PowerupSpawner.js';

export class PowerupSystem {
    constructor(game, app, width, height) {
        this.game = game;
        this.app = app;
        this.width = width;
        this.height = height;

        this.cooldown = 100;

        this.lastPowerupSpawn = 0;
    }

    update(entities, delta) {
        const powerupsToRemove = [];

        this.cooldown -= delta.deltaTime;

        if (this.cooldown <= 0) {
            this.lastPowerupSpawn = Date.now();

            PowerupSpawner.spawnPowerup(this.game, this.width, this.height);
            console.log('Powerup Spawned');
            this.cooldown = 1000;   
        }

        for (const entity of entities) {
            if (entity.id.startsWith('powerup')) {
                
                const lifetime = entity.getComponent('lifetime');
                if (!lifetime)
                    continue;

                if (lifetime.despawn === 'time') {
                    lifetime.remaining -= delta.deltaTime;
                    
                    if (lifetime.remaining <= 0) {
                        powerupsToRemove.push(entity.id);
                        continue;
                    }
                }

            }

            if (entity.id.startsWith('paddle')) {
                if (entity.isEnlarged) {
                    entity.enlargeTimer -= delta.deltaTime;
                }

                if (entity.isEnlarged && entity.enlargeTimer <= 0) {
                    console.log('Reseting paddle height');
                    this.game.sounds.paddleReset.play();
                    entity.resetPaddleSize(entity);
                }
            }
        }

        for (const entityId of powerupsToRemove) {
            this.game.removeEntity(entityId);
        }
    }
}