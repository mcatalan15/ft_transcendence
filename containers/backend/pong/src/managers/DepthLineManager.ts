/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   DepthLineManager.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/14 16:36:12 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/14 17:50:15 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { PongGame } from '../engine/Game';
import { Entity } from '../engine/Entity';
import { DepthLine } from '../entities/background/DepthLine';
import { RenderComponent } from '../components/RenderComponent';
import { MainBackgroundSpawner } from '../spawners/MainBackgroundSpawner';
import { DepthLineFactory } from '../entities/background/DepthLineFactory';

import { WorldSystem } from '../systems/WorldSystem';

import { DepthLineBehavior, FrameData } from '../utils/Types';
import { isDepthLine } from '../utils/Guards';

export class DepthLineManager {
    private game: PongGame;
	private worldSystem: WorldSystem;
    private depthLineCooldown: number = 10;
    private lastLineSpawnTime: number = 0;
    private depthLineQueue: DepthLine[] = [];
    private width: number;
    private height: number;
    private topWallOffset: number;
    private bottomWallOffset: number;
    private wallThickness: number;

    constructor(game: PongGame, worldSystem: WorldSystem) {
        this.game = game;
		this.worldSystem = worldSystem,
        this.width = game.width;
        this.height = game.height;
        this.topWallOffset = game.topWallOffset;
        this.bottomWallOffset = game.bottomWallOffset;
        this.wallThickness = game.wallThickness;
    }
    
    update(delta: FrameData, entities: Entity[]): void {
        this.depthLineCooldown -= delta.deltaTime;
        
        if (this.depthLineCooldown <= 0) {
            if (this.depthLineQueue.length > 0) {
                this.spawnFromQueue();
                this.spawnFromQueue();
            } else {
                this.spawnDepthLines();
            }
            this.depthLineCooldown = 8;
        }
        
        // Initialize depth lines
        this.initializeDepthLines(entities);
    }
    
    private spawnDepthLines(): void {
        this.lastLineSpawnTime = Date.now();

		let uniqueId = `StandardDepthLine-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

		let behaviorBottom = this.generateDepthLineBehavior('vertical', 'downwards', 'in');
		let behaviorTop = this.generateDepthLineBehavior('vertical', 'upwards', 'in');

        let bottomLine = DepthLineFactory.createDepthLine(
			'standard', this.game, uniqueId, this.game.width, this.game.height, this.game.topWallOffset, this.game.bottomWallOffset, this.game.wallThickness, 'bottom', behaviorBottom
		);
		this.worldSystem.depthLineQueue.push(bottomLine);

		let topLine = DepthLineFactory.createDepthLine(
			'standard', this.game, uniqueId, this.game.width, this.game.height, this.game.topWallOffset, this.game.bottomWallOffset, this.game.wallThickness, 'top', behaviorTop
		);
		this.worldSystem.depthLineQueue.push(topLine);
    }

    spawnFromQueue(): void {
        let line = this.depthLineQueue.pop();

        if (line) {
            this.game.addEntity(line);

            const render = line.getComponent('render') as RenderComponent;
            if (render) {
                this.game.renderLayers.background.addChild(render.graphic);
            }
        }
    }
    
    private initializeDepthLines(entities: Entity[]): void {
        for (const entity of entities) {
            if (isDepthLine(entity)) {
                const idParts = entity.id.split('-');
                const timestamp = parseInt(idParts[1]);
                if (!entity.initialized && timestamp >= this.lastLineSpawnTime - 100) {
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
    
    addToQueue(line: DepthLine): void {
        this.depthLineQueue.push(line);
    }
    
    getQueue(): DepthLine[] {
        return this.depthLineQueue;
    }

	// Utils
	private generateDepthLineBehavior(movement: string, direction: string, fade: string): DepthLineBehavior {
		return {
			movement: movement,
			direction: direction,
			fade: fade,
		}
	}
}