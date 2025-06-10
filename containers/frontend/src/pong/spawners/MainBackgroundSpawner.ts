/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   MainBackgroundSpawner.ts                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 13:40:54 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/14 15:21:40 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { PongGame } from '../engine/Game';
import { DepthLine } from '../entities/background/DepthLine';

import { RenderComponent } from '../components/RenderComponent'

import { DepthLineBehavior } from '../utils/Types'

export class MainBackgroundSpawner {
	static spawnDepthLine(
		game: PongGame,
		width: number,
		height: number,
		topWallOffset: number,
		bottomWallOffset: number,
		wallThickness: number,
		type: 'top' | 'bottom' | string,
		behavior: DepthLineBehavior
	): void {
		const uniqueId = `depthLine-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
		const addedOffset = 10;

		const upperLimit = topWallOffset + wallThickness - addedOffset;
		const lowerLimit = height - bottomWallOffset + addedOffset;

		const depthLine = new DepthLine(uniqueId, 'background', game, {
			velocityX: 10,
			velocityY: 10,
			width,
			height,
			upperLimit,
			lowerLimit,
			alpha: 0,
			behavior,
			type,
			despawn: 'position',
		});
		
		game.addEntity(depthLine);

		const render = depthLine.getComponent('render') as RenderComponent;
		if (render && render.graphic) {
			game.renderLayers.background.addChild(render.graphic);
		}
	}
}

