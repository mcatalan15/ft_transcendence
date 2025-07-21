/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   WorldSystem.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/25 14:17:16 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/21 21:31:08 by hmunoz-g         ###   ########.fr       */
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
import { isUI, isDepthLine, isObstacle } from '../utils/Guards';
import { Obstacle } from '../entities/obstacles/Obstacle';

export class WorldSystem implements System {
    private static readonly DEPTH_LINE_COOLDOWN = 8;
    private static readonly SPAWNING_TIMER = 200;
    private static readonly MODE_SWITCH_TIMER = {
        WALL_FIGURES: 2000,
        OBSTACLES: 1500
    };

    game: PongGame;
    private depthLineCooldown: number = 10;
    private lastLineSpawnTime: number = 0;
    figureQueue: DepthLine[] = [];
    obstacleQueue: Obstacle[] = [];
        
    wallFigureManager: WallFigureManager;
    obstacleManager: ObstacleManager;
    worldManager: WorldManager;

    private spawningMode: number = 1;
    private spawningTimer: number = WorldSystem.SPAWNING_TIMER;
    
    constructor(game: PongGame) {
        this.game = game;
        
        this.wallFigureManager = new WallFigureManager(game);
        this.obstacleManager = new ObstacleManager(game);
        this.worldManager = new WorldManager(this.game);

        this.initializeWorld();
    }

    private initializeWorld(): void {
        this.worldManager.populateWorlds(this.game.worldPool);
        this.game.currentWorld = this.game.worldPool[0];
        
        this.updateUIWorldText();
    }

    private updateUIWorldText(): void {
        this.game.entities.forEach(entity => {
            if (isUI(entity) && !this.game.config.classicMode) {
                entity.setWorldText(this.game.currentWorld.name);
            }
        });
    }

    update(entities: Entity[], delta: FrameData) {
        this.updateTimers(delta.deltaTime);
        this.handleDepthLineSpawning();
        this.handleModeSwitching();
        this.updateManagers();
        this.processEvents(entities);
        this.initializeDepthLines(entities);
    }

    private updateTimers(deltaTime: number): void {
        this.spawningTimer -= deltaTime;
        this.depthLineCooldown -= deltaTime;
    }

    private handleDepthLineSpawning(): void {
        if (this.depthLineCooldown > 0) return;

        if (this.figureQueue.length > 0) {
            this.spawnFromFigureQueue();
        } else {
            this.spawnDepthLines();
            if (this.obstacleQueue.length > 0) {
                this.spawnFromObstacleQueue();
            }
        }
        this.depthLineCooldown = WorldSystem.DEPTH_LINE_COOLDOWN;
    }

    private handleModeSwitching(): void {
        if (this.game.hasEnded) return;
        
        if (this.spawningTimer > 0) return;

        if (this.spawningMode === 1) {
            this.wallFigureManager.activateSpawning();
            this.spawningTimer = WorldSystem.MODE_SWITCH_TIMER.WALL_FIGURES;
        } else {
            this.obstacleManager.activateSpawning();
            this.spawningTimer = WorldSystem.MODE_SWITCH_TIMER.OBSTACLES;
        }
        this.spawningMode *= -1;
    }

    private updateManagers(): void {
        this.wallFigureManager.update(this);
        this.obstacleManager.update(this);
        
        if (this.wallFigureManager.isSpawning() && this.figureQueue.length === 0) {
            this.wallFigureManager.finishedSpawning();
        }

        if (this.obstacleManager.isSpawning() && this.figureQueue.length === 0) {
            this.obstacleManager.finishedSpawning();
        }
    }
    
    processEvents(entities: Entity[]): void {
        const unhandledEvents: GameEvent[] = [];

        while (this.game.eventQueue.length > 0) {
            const event = this.game.eventQueue.shift() as GameEvent;

            if (event.type === 'CHANGE_WORLD') {
                this.handleWorldChange(event, entities);
            } else {
                unhandledEvents.push(event);
            }
        }
        this.game.eventQueue.push(...unhandledEvents);
    }

    private handleWorldChange(event: GameEvent, entities: Entity[]): void {
        this.game.currentWorld = event.target as World;
        entities.forEach(entity => {
            if (isUI(entity)) {
                entity.setWorldText((event.target as World).name);
            }
        });
    }
    
    private spawnDepthLines(): void {
        this.lastLineSpawnTime = Date.now();
        const uniqueId = `StandardDepthLine-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        
        this.worldManager.changeWorld(this.game, uniqueId);

        const bottomLine = this.createDepthLine(uniqueId, 'bottom', 'downwards');
        const topLine = this.createDepthLine(uniqueId, 'top', 'upwards');

        this.addEntitiesToGame([bottomLine, topLine]);
    }

    private createDepthLine(id: string, position: 'top' | 'bottom', direction: 'upwards' | 'downwards'): DepthLine {
        const behavior = this.generateDepthLineBehavior('vertical', direction, 'in');
        return FigureFactory.createDepthLine(
            'standard', 
            this.game, 
            id, 
            this.game.width, 
            this.game.height, 
            this.game.topWallOffset, 
            this.game.bottomWallOffset, 
            this.game.wallThickness, 
            position, 
            behavior
        );
    }

    private addEntitiesToGame(entities: Entity[]): void {
        entities.forEach(entity => {
            this.game.addEntity(entity);
            const render = entity.getComponent('render') as RenderComponent;
            if (render) {
                this.game.renderLayers.background.addChild(render.graphic);
            }
        });
    }

    spawnFromFigureQueue() {
        const line = this.figureQueue.pop();
        if (!line) return;

        this.worldManager.changeWorld(this.game, line.id);
        this.addEntitiesToGame([line]);
    }

    spawnFromObstacleQueue() {
        const obstacle = this.obstacleQueue.pop();
        if (!obstacle) return;

        this.worldManager.changeWorld(this.game, obstacle.id);
        this.addEntitiesToGame([obstacle]);
    }

    private generateDepthLineBehavior(
        movement: string, 
        direction: string, 
        fade: string
    ): DepthLineBehavior {
        return { movement, direction, fade };
    }

    private initializeDepthLines(entities: Entity[]): void {
        entities
            .filter(isDepthLine)
            .filter(entity => !entity.initialized)
            .forEach(entity => {
                const idParts = entity.id.split('-');
                const timestamp = parseInt(idParts[1]);
                if (timestamp >= this.lastLineSpawnTime - 100) {
                    const render = entity.getComponent('render') as RenderComponent;
                    if (render) {
                        entity.initialized = true;
                        entity.initialY = entity.y;
                        entity.alpha = 0;
                        render.graphic.alpha = 0;
                    }
                }
            });
    }

    cleanup(): void {
        this.figureQueue = [];
        this.obstacleQueue = [];
        this.depthLineCooldown = 10;
        this.lastLineSpawnTime = 0;
        this.spawningMode = 1;
        this.spawningTimer = WorldSystem.SPAWNING_TIMER;
        
        if (this.wallFigureManager && typeof this.wallFigureManager.cleanup === 'function') {
            this.wallFigureManager.cleanup();
        }
        if (this.obstacleManager && typeof this.obstacleManager.cleanup === 'function') {
            this.obstacleManager.cleanup();
        }
        if (this.worldManager && typeof this.worldManager.cleanup === 'function') {
            this.worldManager.cleanup();
        }
        
        const entitiesToRemove: string[] = [];
        for (const entity of this.game.entities) {
            if (isDepthLine(entity) || isObstacle(entity)) {
                entitiesToRemove.push(entity.id);
            }
        }
        
        for (const entityId of entitiesToRemove) {
            this.game.removeEntity(entityId);
        }
    }
}