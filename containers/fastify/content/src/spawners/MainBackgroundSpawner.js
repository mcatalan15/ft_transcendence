/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   MainBackgroundSpawner.js                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/16 11:31:33 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/17 17:15:58 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { DepthLine } from '../Background/DepthLine.js';

export class MainBackgroundSpawner {
	static spawnDepthLine(game, width, height, topWallOffset, bottomWallOffset, wallThickness, type, behavior) {
		const uniqueId = `depthLine-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

		let upperLimit = topWallOffset + wallThickness;
		let lowerLimit = height - bottomWallOffset;

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
		game.renderLayers.background.addChild(depthLine.getComponent('render').graphic);
	}
}