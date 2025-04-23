/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   MainBackgroundSpawner.ts                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/23 16:11:45 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/23 16:20:25 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import type { DepthLine } from '../background/DepthLine';
import type { PongGame } from '../engine/Game'

// Define type for behavior and line type
type LineBehavior = 'static' | 'animated' | 'responsive';
type LineType = 'center' | 'edge' | 'solid' | 'dashed';

export class MainBackgroundSpawner {
    static spawnDepthLine(
        game: PongGame, 
        width: number, 
        height: number, 
        topWallOffset: number, 
        bottomWallOffset: number, 
        wallThickness: number, 
        type: LineType, 
        behavior: LineBehavior
    ): void {
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
            //behavior: behavior,
            type: type,
            despawn: 'position',
        });
        
        game.addEntity(depthLine);
        game.renderLayers.background.addChild(depthLine.getComponent('render').graphic);
    }
}