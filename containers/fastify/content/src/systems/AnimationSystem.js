/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   AnimationSystem.js                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: marvin <marvin@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/16 13:44:38 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/17 23:34:22 by marvin           ###   ########.fr       */
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
        this.depthLineUpdateRate = 2; // Update every X frames
        
        // Track the last line spawn time to identify new lines
        this.lastLineSpawnTime = 0;
    }

    update(entities, delta) {
        const entitiesToRemove = [];
        
        // Increment frame counter
        this.frameCounter = (this.frameCounter + 1) % this.depthLineUpdateRate;
        
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
}