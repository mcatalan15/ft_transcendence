/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   MainBackgroundSpawner.ts                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 13:40:54 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/24 15:12:43 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { DepthLine } from '../background/DepthLine';
import { PongGame } from '../engine/Game';
import { RenderComponent } from '../components/RenderComponent.ts'
import { DepthLineBehavior } from '../utils/Types.ts'

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

		const upperLimit = topWallOffset + wallThickness;
		const lowerLimit = height - bottomWallOffset;

		const depthLine = new DepthLine(uniqueId, 'background', {
			velocityX: 10,
			velocityY: 10,
			width: width,
			height: height,
			upperLimit: upperLimit,
			lowerLimit: lowerLimit,
			alpha: 0,
			behavior: behavior,
			type: type,
			despawn: 'position',
		});

		game.addEntity(depthLine);

		const render = depthLine.getComponent('render') as RenderComponent;
		if (render && render.graphic) {
			game.renderLayers.background.addChild(render.graphic);
		}
	}
}
