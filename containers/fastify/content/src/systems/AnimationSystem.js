/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   AnimationSystem.js                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: marvin <marvin@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/16 13:44:38 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/21 16:35:15 by marvin           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { MainBackgroundSpawner } from '../spawners/MainBackgroundSpawner.js';

export class AnimationSystem {
    constructor(game, app, width, height, topWallOffset, bottomWallOffset, wallThickness){
        this.game = game;
        this.app = app;
        this.width = width;
        this.height = height;
        this.topWallOffset = topWallOffset;
        this.bottomWallOffset = bottomWallOffset;
        this.wallThickness = wallThickness;

        this.depthLineCooldown = 20;
        
        // Animation control properties
        this.frameCounter = 0;
        this.depthLineUpdateRate = 1; // Update every X frames
        
        // Track the last line spawn time to identify new lines
        this.lastLineSpawnTime = 0;
    }

    update(entities, delta) {
        const entitiesToRemove = [];
        
        // Increment frame counter
        this.frameCounter = (this.frameCounter + 1) % this.depthLineUpdateRate;

        const unhandledEvents = [];
        
        while (this.game.eventQueue.length > 0) {
            const event = this.game.eventQueue.shift();

            if (event.type === 'ENLARGE_PADDLE' || event.type === 'RESET_PADDLE') {
                const paddle = event.target;
                const render = paddle.getComponent('render');
                const physics = paddle.getComponent('physics');
            
                if (!render || !physics) continue;
            
                if (event.type === 'ENLARGE_PADDLE') {
                    console.log('Received ENLARGE_PADDLE event', event);
                    
                    paddle.originalHeight = physics.height; // current visible height
                    paddle.targetHeight = paddle.baseHeight * 2;
                    paddle.overshootTarget = paddle.targetHeight * 1.2;
                    paddle.overshootPhase = 'expand';
                    
                } else if (event.type === 'RESET_PADDLE') {
                    console.log('Received RESET_PADDLE event', event);
                    
                    paddle.originalHeight = physics.height; // current visible height
                    paddle.targetHeight = paddle.baseHeight;
                    paddle.overshootTarget = paddle.targetHeight * 0.9;
                    paddle.overshootPhase = 'expand';
                }

                paddle.enlargeProgress = 0;
                
            } else {
                unhandledEvents.push(event);
            }
        }

        this.game.eventQueue.push(...unhandledEvents);
    
        // Now animate paddles that are being enlarged
        for (const entity of entities) {
            const render = entity.getComponent('render');
            const physics = entity.getComponent('physics');
            if (!render || !physics) continue;
    
            if (entity.targetHeight && entity.enlargeProgress < 1) {
                entity.enlargeProgress += delta.deltaTime * 0.1;
                let t = Math.min(entity.enlargeProgress, 1);
            
                let targetHeight;
            
                if (entity.overshootPhase === 'expand') {
                    // EASE OUT to overshoot target
                    let easeT = 1 - Math.pow(2, -10 * t); // strong ease-out
                    targetHeight = this.lerp(entity.originalHeight, entity.overshootTarget, easeT);
            
                    if (t >= 1) {
                        // Start settling phase
                        entity.overshootPhase = 'settle';
                        entity.enlargeProgress = 0;
                        entity.originalHeight = entity.overshootTarget;
                    }
                } else if (entity.overshootPhase === 'settle') {
                    // EASE IN to final target
                    let easeT = 1 - Math.pow(2, -10 * t); // cubic ease-in
                    targetHeight = this.lerp(entity.originalHeight, entity.targetHeight, easeT);
            
                    if (t >= 1) {
                        // Done!
                        entity.overshootPhase = null;
                    }
                }
            
                if (targetHeight) {
                    physics.height = targetHeight;
            
                    render.graphic.clear();
                    render.graphic.rect(0, 0, physics.width, targetHeight);
                    render.graphic.fill('#FAF3E0');
                    render.graphic.pivot.set(physics.width / 2, targetHeight / 2);
                }
            }
        }
    
        
        this.depthLineCooldown -= delta.deltaTime;
    
        // Spawn new lines when cooldown expires
        if (this.depthLineCooldown <= 0) {
            this.lastLineSpawnTime = Date.now();
            
            MainBackgroundSpawner.spawnDepthLine(
                this.game, this.width, this.height, this.topWallOffset, 
                this.bottomWallOffset, this.wallThickness, 'top', 
                {movement: 'vertical', direction: 'upwards', fade: 'in'}
            );
            
            MainBackgroundSpawner.spawnDepthLine(
                this.game, this.width, this.height, this.topWallOffset, 
                this.bottomWallOffset, this.wallThickness, 'bottom', 
                {movement: 'vertical', direction: 'downwards', fade: 'in'}
            );
            
            this.depthLineCooldown = 20;
        }
        
        // Identify and initialize newly spawned lines
        // We'll use the timestamp in the ID to find lines created within the last frame
        for (const entity of entities) {
            if (entity.id.startsWith('depthLine')) {
                // Parse the timestamp from the entity ID
                const idParts = entity.id.split('-');
                if (idParts.length >= 2) {
                    const entityTimestamp = parseInt(idParts[1]);
                    
                    // Check if this is a new entity (created in this frame or the last one)
                    // Allow a 100ms buffer to catch entities that might have been created just before
                    if (!entity.initialized && entityTimestamp >= this.lastLineSpawnTime - 100) {
                        const render = entity.getComponent('render');
                        if (render) {
                            entity.initialized = true;
                            entity.initialY = entity.y;
                            entity.alpha = 0; // Start fully transparent
                            render.graphic.alpha = 0;
                        }
                    }
                }
            }
        }
        
        // Process animation updates on appropriate frames
        if (this.frameCounter === 0) {
            for (const entity of entities) {
                if (entity.id.startsWith('depthLine')) {
                    const lifetime = entity.getComponent('lifetime');
                    if (!lifetime) continue;
                    
                    const render = entity.getComponent('render');
                    if (!render) continue;
                    
                    // Ensure initialY is set (in case entity wasn't properly initialized)
                    if (!entity.initialY) {
                        entity.initialY = entity.y;
                        entity.initialized = true;
                    }
                    
                    // Calculate progress toward the limit (0 = start, 1 = at limit)
                    let progress;
                    if (entity.behavior.direction === 'upwards') {
                        progress = 1 - ((entity.y - entity.upperLimit) / (entity.initialY - entity.upperLimit));
                    } else {
                        progress = (entity.y - entity.initialY) / (entity.lowerLimit - entity.initialY);
                    }
                    
                    // Clamp progress between 0 and 1
                    progress = Math.max(0, Math.min(1, progress));
                    
                    // Exponential speed increase
                    const speedMultiplier = Math.pow(progress + 0.5, 2);
                    
                    // Move the entity with the adjusted speed
                    if (entity.behavior.direction === 'upwards') {
                        entity.y -= entity.velocityY * delta.deltaTime * 0.1 * speedMultiplier * this.depthLineUpdateRate;
                    } else if (entity.behavior.direction === 'downwards') {
                        entity.y += entity.velocityY * delta.deltaTime * 0.1 * speedMultiplier * this.depthLineUpdateRate;
                    }
                    
                    // Update the graphic position
                    render.graphic.position.set(entity.x, entity.y);
                    
                    // Set alpha based on position
                    entity.alpha = progress * entity.targetAlpha;
                    render.graphic.alpha = entity.alpha;
                    
                    // Check lifetime based on entity position
                    if (lifetime.despawn === 'position') {
                        if (entity.behavior.direction === 'upwards' && entity.y <= entity.upperLimit) {
                            entitiesToRemove.push(entity.id);
                        } else if (entity.behavior.direction === 'downwards' && entity.y >= entity.lowerLimit) {
                            entitiesToRemove.push(entity.id);
                        }
                    }
                }
            }
        }
    
        // Remove entities marked for removal
        for (const entityId of entitiesToRemove) {
            this.game.removeEntity(entityId);
        }
    }

    lerp(a, b, t) {
        return a + (b - a) * t;
    }
}