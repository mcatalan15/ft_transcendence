/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   WorldSystem.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: marvin <marvin@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/25 14:17:16 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/21 19:30:55 by marvin           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import type { PongGame } from '../engine/Game';
import type { Entity } from '../engine/Entity';
import type { System } from '../engine/System';

import { DepthLine } from '../entities/background/DepthLine';

import { RenderComponent } from '../components/RenderComponent';

import { WallFigureManager } from '../managers/WallFigureManager';
import { ObstacleManager } from '../managers/ObstacleManager';
import { WorldManager } from '../managers/WorldManager';

import { FigureFactory } from '../factories/FigureFactory';

import { DepthLineBehavior, FrameData, GameEvent, World } from '../utils/Types';
import { isUI, isDepthLine } from '../utils/Guards';
import { Obstacle } from '../entities/obstacles/Obstacle';

export class WorldSystem implements System {
    game: PongGame;
    private depthLineCooldown: number = 10;
    private lastLineSpawnTime: number = 0;
    figureQueue: DepthLine[] = [];
    obstacleQueue: Obstacle[] = [];
        
    private wallFigureManager: WallFigureManager;
    private obstacleManager: ObstacleManager;
    private worldManager: WorldManager;

    private spawningMode: number = -1;
    private spawningTimer: number = 200;
    
    constructor(game: PongGame) {
        this.game = game;
        
        this.wallFigureManager = new WallFigureManager();
        this.obstacleManager = new ObstacleManager();
        this.worldManager = new WorldManager();

        this.worldManager.populateWorlds(game.worldPool);
        game.currentWorld = game.worldPool[0];
        
        this.game.entities.forEach(entity => {
            if (isUI(entity)) {
                entity.setWorldText(game.currentWorld.name);
            }
        });
    }

    update(entities: Entity[], delta: FrameData) {
        this.spawningTimer -= delta.deltaTime;
        this.depthLineCooldown -= delta.deltaTime;

        if (this.depthLineCooldown <= 0) {
            if (this.figureQueue.length > 0) {
                this.spawnFromFigureQueue();
            } else {
                this.spawnDepthLines();
                if (this.obstacleQueue.length > 0) {
                    this.spawnFromObstacleQueue();
                }
            }
            this.depthLineCooldown = 8;
        }

        if (this.spawningTimer <= 0) {
            if (this.spawningMode === 1) {
                this.wallFigureManager.activateSpawning();
                this.spawningTimer = 2000;
            } else if (this.spawningMode === -1) {
                this.obstacleManager.activateSpawning();
                this.spawningTimer = 1500;
            }
            this.spawningMode *= -1;
        }

        // Update managers
        this.wallFigureManager.update(this);
        this.obstacleManager.update(this);
        
        if (this.wallFigureManager.isSpawning() && this.figureQueue.length === 0) {
            this.wallFigureManager.finishedSpawning();
        }

        if (this.obstacleManager.isSpawning() && this.figureQueue.length === 0) {
            this.wallFigureManager.finishedSpawning();
        }

        // Process events
        this.processEvents(entities);
        this.initializeDepthLines(entities);
    }

    changeWorld(id: string) {
        const idx = this.worldManager.selectWorld(id);
        const nextWorld = this.game.worldPool[idx];
        const changeWorldEvent: GameEvent = {
            type: "CHANGE_WORLD",
            target: nextWorld
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
    
    private spawnDepthLines(): void {
        this.lastLineSpawnTime = Date.now();

		let uniqueId = `StandardDepthLine-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        this.changeWorld(uniqueId);

		let behaviorBottom = this.generateDepthLineBehavior('vertical', 'downwards', 'in');
		let behaviorTop = this.generateDepthLineBehavior('vertical', 'upwards', 'in');

        let bottomLine = FigureFactory.createDepthLine(
			'standard', this.game, uniqueId, this.game.width, this.game.height, this.game.topWallOffset, this.game.bottomWallOffset, this.game.wallThickness, 'bottom', behaviorBottom
		);

		let topLine = FigureFactory.createDepthLine(
			'standard', this.game, uniqueId, this.game.width, this.game.height, this.game.topWallOffset, this.game.bottomWallOffset, this.game.wallThickness, 'top', behaviorTop
		);

        this.game.addEntity(bottomLine);
        this.game.addEntity(topLine);

        const bottomRender = topLine.getComponent('render') as RenderComponent;
        const topRender = topLine.getComponent('render') as RenderComponent;

        this.game.renderLayers.background.addChild(bottomRender.graphic);
        this.game.renderLayers.background.addChild(topRender.graphic);

    }

    spawnFromFigureQueue() {
        {
            let line = this.figureQueue.pop();
            this.changeWorld(line!.id);
    
            if (line) {
                this.game.addEntity(line);
    
                const render = line.getComponent('render') as RenderComponent;
                if (render) {
                    this.game.renderLayers.background.addChild(render.graphic);
                }
            }
        }
    }

    spawnFromObstacleQueue() {
        {
            let line = this.obstacleQueue.pop();
            this.changeWorld(line!.id);
    
            if (line) {
                this.game.addEntity(line);
    
                const render = line.getComponent('render') as RenderComponent;
                if (render) {
                    this.game.renderLayers.background.addChild(render.graphic);
                }
            }
        }
    }

    private generateDepthLineBehavior(movement: string, direction: string, fade: string): DepthLineBehavior {
		return {
			movement: movement,
			direction: direction,
			fade: fade,
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
}