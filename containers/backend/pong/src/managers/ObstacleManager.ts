/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   ObstacleManager.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/14 16:36:12 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/15 17:54:18 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { PongGame } from '../engine/Game';
import { Entity } from '../engine/Entity';
import { Obstacle } from '../entities/obstacles/Obstacle';
import { RenderComponent } from '../components/RenderComponent';
import { DepthLineFactory } from '../factories/DepthLineFactory';

import { WorldSystem } from '../systems/WorldSystem';

import { ObstacleBehavior, FrameData } from '../utils/Types';
import { isObstacle } from '../utils/Guards';

export class ObstacleManager {
    private game: PongGame;
	private worldSystem: WorldSystem;
    private obstacleCooldown: number = 10;
    private lastObstacleSpawnTime: number = 0;
    private obstacleQueue: Obstacle[] = [];


    constructor(game: PongGame, worldSystem: WorldSystem) {
        this.game = game;
		this.worldSystem = worldSystem;
    }
    
    update(delta: FrameData, entities: Entity[]): void {
        this.obstacleCooldown -= delta.deltaTime;
        
        if (this.obstacleCooldown <= 0) {
            if (this.obstacleQueue.length > 0) {
                this.spawnFromQueue();
                this.spawnFromQueue();
            } else {
                return ;
            }
            this.obstacleCooldown = 8;
        }
        
        this.initializeObstacles(entities);
    }

    spawnFromQueue(): void {
        let obstacle = this.obstacleQueue.pop();

        if (obstacle) {
            this.game.addEntity(obstacle);

            const render = obstacle.getComponent('render') as RenderComponent;
            if (render) {
                this.game.renderLayers.background.addChild(render.graphic);
            }
        }
    }
    
    private initializeObstacles(entities: Entity[]): void {
        for (const entity of entities) {
            if (isObstacle(entity)) {
                const idParts = entity.id.split('-');
                const timestamp = parseInt(idParts[1]);
                if (!entity.initialized && timestamp >= this.lastObstacleSpawnTime - 100) {
                    const render = entity.getComponent('render') as RenderComponent;
                    if (render) {
                        entity.initialized = true;
                        entity.initialY = entity.y;
                        entity.alpha = 0;
                        render.graphic.alpha = 0;
                    }
                }
            }
        }
    }
    
    addToQueue(obstacle: Obstacle): void {
        this.obstacleQueue.push(obstacle);
    }
    
    getQueue(): Obstacle[] {
        return this.obstacleQueue;
    }

	// Utils
	private generateObstacleBehavior(animation: string, fade: string): ObstacleBehavior {
		return {
			animation: animation,
			fade: fade,
		}
	}
}