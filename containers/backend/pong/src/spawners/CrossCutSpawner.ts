/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   CrossCutSpawner.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/07 14:07:52 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/07 19:13:37 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Point } from 'pixi.js';

import { PongGame } from '../engine/Game';
import { TriangleCrossCut } from '../entities/crossCuts/TriangleCrossCut';

import { RenderComponent } from '../components/RenderComponent';

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
			default:
				cut = new TriangleCrossCut(`triangleCrossCut-${Date.now()}-${Math.floor(Math.random() * 1000)}`, 'foreground', 'triangle', position, spawnPoints, points, x, y);;
		}
		game.addEntity(cut);
		const render = cut.getComponent('render') as RenderComponent;
		game.renderLayers.foreground.addChild(render.graphic);
	}
};