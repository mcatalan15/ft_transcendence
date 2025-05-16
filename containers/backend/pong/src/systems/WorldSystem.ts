/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   WorldSystem.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/25 14:17:16 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/16 12:20:17 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import type { PongGame } from '../engine/Game';
import type { Entity } from '../engine/Entity';
import type { System } from '../engine/System';

import { DepthLineManager } from '../managers/DepthLineManager';
import { WallFigureManager } from '../managers/WallFigureManager';
import { ObstacleManager } from '../managers/ObstacleManager';

import { FrameData, GameEvent, World } from '../utils/Types';
import { isUI } from '../utils/Guards';
import { Obstacle } from '../entities/obstacles/Obstacle';

export class WorldSystem implements System {
    game: PongGame;
    worldTimer: number;
    
    private depthLineManager: DepthLineManager;
    private wallFigureManager: WallFigureManager;
    private obstacleManager: ObstacleManager;

    private spawningMode: number = -1;
    private spawningTimer: number = 200;
    
    constructor(game: PongGame) {
        this.game = game;
        this.worldTimer = 1000;
        
        this.depthLineManager = new DepthLineManager(game, this);
        this.wallFigureManager = new WallFigureManager();
        this.obstacleManager = new ObstacleManager();
        
        this.game.entities.forEach(entity => {
            if (isUI(entity)) {
                entity.setWorldText(game.currentWorld.name);
            }
        });
    }

    update(entities: Entity[], delta: FrameData) {
        this.worldTimer -= delta.deltaTime;
        this.spawningTimer -= delta.deltaTime;

        /* if (this.worldTimer <= 0) {
            this.changeWorld();
            this.worldTimer = 1000;
        } */

        if (this.spawningTimer <= 0) {
            if (this.spawningMode === 1) {
                this.wallFigureManager.activateSpawning();
            } else if (this.spawningMode === -1) {
                this.obstacleManager.activateSpawning();
            }
            this.spawningMode *= -1;
            this.spawningTimer = 1500;
        }

        // Update managers
        this.wallFigureManager.update(this);
        this.depthLineManager.update(delta, entities);
        this.obstacleManager.update(this);
        
        // If wall figure manager has finished spawning, update depth lines
        if (this.wallFigureManager.isSpawning() && this.depthLineManager.getFigureQueue().length === 0) {
            this.wallFigureManager.finishedSpawning();
        }

        // Process events
        this.processEvents(entities);
    }

    changeWorld() {
        const worldKeys = Object.keys(this.game.worldPool) as Array<keyof typeof this.game.worldPool>;
        
        const randomWorldKey = worldKeys[Math.floor(Math.random() * worldKeys.length)];
        
        const randomWorld = this.game.worldPool[randomWorldKey];
        
        const changeWorldEvent: GameEvent = {
            type: "CHANGE_WORLD",
            target: randomWorld
        };
        
        this.game.eventQueue.push(changeWorldEvent);
    }
    
    processEvents(entities: Entity[]): void {
        const unhandledEvents = [];

        while (this.game.eventQueue.length > 0) {
            const event = this.game.eventQueue.shift() as GameEvent;

            if (event.type === 'CHANGE_WORLD') {
                const targetWorld = event.target;

                this.game.currentWorld = targetWorld as World;

                for (const entity of entities) {
                    if (!isUI(entity)) {
                        continue;
                    } else {
                        entity.setWorldText((targetWorld as World).name);
                    }
                }
            } else {
                unhandledEvents.push(event);
            }
        }
        this.game.eventQueue.push(...unhandledEvents);
    }
    
    get depthLineQueue() {
        return this.depthLineManager.getFigureQueue();
    }

    get obstacleQueue() {
        return this.depthLineManager.getObstacleQueue();
    }
    
    spawnFromQueue() {
        this.depthLineManager.spawnFromFigureQueue();
    }
}