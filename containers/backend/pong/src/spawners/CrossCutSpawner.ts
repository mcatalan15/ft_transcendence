/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   CrossCutSpawner.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/09 16:30:10 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/14 19:54:24 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Point } from 'pixi.js';

import { PongGame } from '../engine/Game';

import { RectangleCrossCut } from '../entities/crossCuts/RectangleCrossCut';
import { TriangleCrossCut } from '../entities/crossCuts/TriangleCrossCut';
import { SawCrossCut } from '../entities/crossCuts/SawCrossCut';
import { EscalatorCrossCut } from '../entities/crossCuts/EscalatorCrossCut';

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
		console.log(spawnPoints);

		switch(spawnPoints) {
			case (3):
				cut = new TriangleCrossCut(`cut-triangleCrossCut-${Date.now()}-${Math.floor(Math.random() * 1000)}`, 'midground', 'triangle', position, spawnPoints, points, x, y);
				break;
			case (5):
				cut = new RectangleCrossCut(`cut-rectangleCrossCut-${Date.now()}-${Math.floor(Math.random() * 1000)}`, 'midground', 'rectangle', position, spawnPoints, points, x, y);
				break;
			case (7):
				cut = new SawCrossCut(`cut-rectangleCrossCut-${Date.now()}-${Math.floor(Math.random() * 1000)}`, 'midground', 'saw', position, spawnPoints, points, x, y);
				break;
			case (16):
				cut = new EscalatorCrossCut(`cut-rectangleCrossCut-${Date.now()}-${Math.floor(Math.random() * 1000)}`, 'midground', 'escalator', position, spawnPoints, points, x, y);
				break;
			default:
				cut = new RectangleCrossCut(`cut-rectangleCut-${Date.now()}-${Math.floor(Math.random() * 1000)}`, 'midground', 'estandard', position, spawnPoints, points, x, y);
				break;
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
		game.renderLayers.midground.addChild(render.graphic);
	}
}