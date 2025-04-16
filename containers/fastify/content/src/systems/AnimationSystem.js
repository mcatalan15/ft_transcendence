/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   AnimationSystem.js                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/16 13:44:38 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/16 17:04:40 by hmunoz-g         ###   ########.fr       */
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
	}

	update(entities, delta) {
		const entitiesToRemove = [];
		
		this.depthLineCooldown -= delta.deltaTime;
	
		if (this.depthLineCooldown <= 0) {
			MainBackgroundSpawner.spawnDepthLine(this.game, this.width, this.height, this.topWallOffset, this.bottomWallOffset, this.wallThickness, 'top', {movement: 'vertical', direction: 'upwards', fade: 'in'});
			MainBackgroundSpawner.spawnDepthLine(this.game, this.width, this.height, this.topWallOffset, this.bottomWallOffset, this.wallThickness, 'bottom', {movement: 'vertical', direction: 'downwards', fade: 'in'});
			this.depthLineCooldown = 20;
		}	

		for (const entity of entities) {
			if (entity.id.startsWith('depthLine')) {
				const lifetime = entity.getComponent('lifetime');
				if (!lifetime) continue;
				
				const render = entity.getComponent('render');
				if (!render) continue;
				
				// Calculate how far along the path the line has traveled (0 to 1)
				if (!entity.initialY) {
					entity.initialY = entity.y;
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
				
				// Exponential speed increase - adjust exponent for different curve shapes
				const speedMultiplier = Math.pow(progress + 0.5, 2); // Starts around 0.25, goes to 2.25
				
				// Move the entity with the adjusted speed
				if (entity.behavior.direction === 'upwards') {
					entity.y -= entity.velocityY * delta.deltaTime * 0.1 * speedMultiplier;
				} else if (entity.behavior.direction === 'downwards') {
					entity.y += entity.velocityY * delta.deltaTime * 0.1 * speedMultiplier;
				}
				
				// Update the graphic position to match entity position
				render.graphic.position.set(entity.x, entity.y);
				
				// Set alpha based on position (linear mapping from 0 to targetAlpha)
				entity.alpha = progress * entity.targetAlpha;
				render.graphic.alpha = entity.alpha;
				
				// Log for debugging
				console.log(`Line ${entity.id}: y=${entity.y}, progress=${progress.toFixed(2)}, speed=${speedMultiplier.toFixed(2)}, alpha=${entity.alpha.toFixed(2)}`);
				
				// Check lifetime based on entity position
				if (lifetime.despawn === 'position') {
					if (entity.behavior.direction === 'upwards' && entity.y <= entity.upperLimit) {
						console.log(`Removing upward line ${entity.id} at position ${entity.y}`);
						entitiesToRemove.push(entity.id);
					} else if (entity.behavior.direction === 'downwards' && entity.y >= entity.lowerLimit) {
						console.log(`Removing downward line ${entity.id} at position ${entity.y}`);
						entitiesToRemove.push(entity.id);
					}
				}
			}
		}
	
		for (const entityId of entitiesToRemove) {
			this.game.removeEntity(entityId);
		}
	}
}