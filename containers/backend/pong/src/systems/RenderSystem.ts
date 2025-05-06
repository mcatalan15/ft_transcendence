/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   RenderSystem.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 09:55:06 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/06 16:40:36 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { PongGame } from '../engine/Game';
import type { Entity } from '../engine/Entity';
import type { System } from '../engine/System'

import { cutTriangle } from '../entities/background/cutTriangle';
import { PyramidDepthLine } from '../entities/background/PyramidDepthLine';

import type { RenderComponent } from '../components/RenderComponent';
import type { PhysicsComponent } from '../components/PhysicsComponent';
import type { TextComponent } from '../components/TextComponent';

import { isAnimationSystem } from '../utils/Guards';

export class RenderSystem implements System {
	game: PongGame;
	nextCutTriangles: cutTriangle[] = []; // Array to store multiple pending triangles
	activeTriangles: cutTriangle[] = []; // Array to track currently active triangles
	pendingRemoval: string[] = []; // List of entities to remove later
	lastCutId: string | null = null;

	constructor (game: PongGame) {
		this.game = game;
	}
	
	update(entities: Entity[]): void {
		// Handle any entity removals from previous frame (after new entities are added)
		this.processPendingRemovals();
		
		// Process all pending triangle cuts
		this.processTriangleTransitions();
		
		entities.forEach((entity) => {
			const renderComponent = entity.getComponent('render') as RenderComponent;
			const physicsComponent = entity.getComponent('physics') as PhysicsComponent;

			if (renderComponent && physicsComponent && renderComponent.graphic) {
				renderComponent.graphic.x = physicsComponent.x;
				renderComponent.graphic.y = physicsComponent.y;
			}

			if (
				entity.hasComponent('text') &&
				physicsComponent &&
				(entity.id === 'paddleL' || entity.id === 'paddleR')
			) {
				const textComponent = entity.getComponent('text') as TextComponent;
				const textObject = textComponent.getRenderable();

				if (textObject) {
					if (entity.id === 'paddleL') {
						textObject.x = physicsComponent.x - 25;
						textObject.y = physicsComponent.y;
					} else {
						textObject.x = physicsComponent.x + 25;
						textObject.y = physicsComponent.y;
					}
				}
			}
		});

		// Avoid double-removal from Animation system
		for (const system of this.game.systems) {
			if (isAnimationSystem(system)) {
				system.lastCutId = null; // Let RenderSystem handle cleanup exclusively
			}
		}
	}

	// Process all triangles in the queue
	processTriangleTransitions() {
		// Track if we added any new triangles this frame
		let addedNewTriangles = false;
		const trianglesAddedThisFrame = [];
		
		// Process all pending triangles
		while (this.nextCutTriangles.length > 0) {
			const nextTriangle = this.nextCutTriangles.shift();
			if (!nextTriangle) continue;
			
			// Add the new triangle entity to the game
			this.game.addEntity(nextTriangle);
			
			// Get the render component from the triangle
			const render = nextTriangle.getComponent('render') as RenderComponent;
			
			// Only add to render layer if the graphic is valid
			if (render && render.graphic) {
				this.game.renderLayers.foreground.addChild(render.graphic);
				
				// Add to active triangles and track the ID for later cleanup
				this.activeTriangles.push(nextTriangle);
				trianglesAddedThisFrame.push(nextTriangle);
				this.lastCutId = nextTriangle.id;
				addedNewTriangles = true;
			}
		}
		
		// Now handle cleanup if we added any new triangles
		if (addedNewTriangles) {
			// Group triangles by their timestamp to identify sets
			const currentTime = Date.now();
			const timeThreshold = 100; // ms - triangles created within this window are considered a set
			
			// Find sets of triangles based on their creation time
			const triangleSets = new Map<string, cutTriangle[]>();
			
			for (const triangle of this.activeTriangles) {
				// Extract timestamp from ID (assuming format: 'cut_TIMESTAMP_RANDOM')
				const idParts = triangle.id.split('_');
				if (idParts.length >= 2) {
					const timestamp = idParts[1];
					const setKey = timestamp.substring(0, timestamp.length - 2); // Group by similar timestamps
					
					if (!triangleSets.has(setKey)) {
						triangleSets.set(setKey, []);
					}
					triangleSets.get(setKey)?.push(triangle);
				}
			}
			
			// If we have more than one set, queue all but the newest set for removal
			if (triangleSets.size > 1) {
				// Sort sets by timestamp (oldest first)
				const sortedSets = Array.from(triangleSets.entries())
					.sort((a, b) => parseInt(a[0]) - parseInt(b[0]));
				
				// Skip the newest set (the last one)
				for (let i = 0; i < sortedSets.length - 1; i++) {
					for (const triangle of sortedSets[i][1]) {
						if (!this.pendingRemoval.includes(triangle.id)) {
							this.pendingRemoval.push(triangle.id);
						}
					}
				}
			}
		}
	}
	
	// Process entity removals at the end of the frame
	processPendingRemovals() {
		// Wait a frame before removing to ensure new triangle is rendered
		if (this.pendingRemoval.length > 0) {
			const idsToRemove = [...this.pendingRemoval];
			this.pendingRemoval = [];
			
			// Remove old entities
			for (const id of idsToRemove) {
				this.game.removeEntity(id);
				
				// Also remove from our active triangles array
				this.activeTriangles = this.activeTriangles.filter(triangle => triangle.id !== id);
			}
		}
	}

	generatePyramidCut(entity: PyramidDepthLine) {
		if (!entity || !entity.points || entity.points.length < 4) {
			console.warn("Invalid pyramid depth line or points for cut triangle");
			return;
		}
		
		try {
			// Use the same timestamp for all triangles generated at once
			// This helps us identify triangles that belong to the same set
			const timestamp = Date.now();
			
			// Create a unique ID with shared timestamp to identify sets
			const uniqueId = 'cut_' + timestamp + '_' + Math.floor(Math.random() * 1000);
			
			// Create the new triangle
			const pyramidCut = new cutTriangle(uniqueId, 'foreground', entity.x, entity.y, entity.points);
			console.log(`Pyramidcut created: ${pyramidCut.id}`);
			
			// Queue it for rendering
			this.nextCutTriangles.push(pyramidCut);
		} catch (error) {
			console.error("Error generating pyramid cut:", error);
		}
	}
}