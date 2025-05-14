/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   CrossCutSpawner.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/09 16:30:10 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/14 13:52:35 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Point } from 'pixi.js';

import { PongGame } from '../engine/Game';

import { RuinCrossCut } from '../entities/crossCuts/RuinCrossCut';
import { TriangleCrossCut } from '../entities/crossCuts/TriangleCrossCut';

import { RenderComponent } from '../components/RenderComponent';
import { PhysicsComponent } from '../components/PhysicsComponent';

export class CrossCutSpawner {
	static spawnCrossCut(
		game: PongGame,
		points: Point[],
		position: string,
		x: number,
		y: number
	) {
		let cut;

		const spawnPoints = points.length;
		switch(spawnPoints) {
			case (3):
				cut = new TriangleCrossCut(`triangleCrossCut-${Date.now()}-${Math.floor(Math.random() * 1000)}`, 'foreground', 'triangle', position, spawnPoints, points, x, y);
				break;
			default:
				cut = new RuinCrossCut(`ruinCrossCut-${Date.now()}-${Math.floor(Math.random() * 1000)}`, 'foreground', 'ruin', position, spawnPoints, points, x, y);
		}
		
		// Add entity to game
		game.addEntity(cut);
		
		// Get render component
		const render = cut.getComponent('render') as RenderComponent;
		
		// IMPORTANT: Set the graphic position explicitly before adding to render layer
		// This ensures it starts at the correct position immediately
		if (render && render.graphic) {
			// Explicitly set the position of the graphic immediately
			render.graphic.position.set(x, y);
			
			// You can also update the physics component to ensure consistency
			const physics = cut.getComponent('physics') as PhysicsComponent;
			if (physics) {
				physics.x = x;
				physics.y = y;
			}
		}
		
		// Add to render layer
		game.renderLayers.foreground.addChild(render.graphic);
	}
}