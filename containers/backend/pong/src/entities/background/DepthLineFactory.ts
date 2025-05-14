/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   DepthLineFactory.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/14 16:53:37 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/14 19:39:55 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { PongGame } from '../../engine/Game';

import { DepthLineBehavior } from '../../utils/Types';

import { DepthLine } from './DepthLine';
import { PyramidDepthLine } from './PyramidDepthLine';
import { ParapetDepthLine } from './ParapetDepthLine';
import { SawEdgeDepthLine } from './SawEdgeDepthLine';
import { EscalatorDepthLine } from './EscalatorDepthLine';

export class DepthLineFactory {
    static createDepthLine(
        type: 'standard' | 'pyramid' | 'parapet' | 'sawEdge' | 'escalator',
        game: PongGame,
        id: string,
        width: number,
        height: number,
        topWallOffset: number,
        bottomWallOffset: number,
        wallThickness: number,
        position: 'top' | 'bot' | string,
        behavior: DepthLineBehavior,
    ): DepthLine {
        const addedOffset = 10;
        const upperLimit = topWallOffset + wallThickness - addedOffset;
        const lowerLimit = height - bottomWallOffset + addedOffset;
        
        const options = {
            velocityX: 10,
            velocityY: 10,
            width,
            height,
            upperLimit,
            lowerLimit,
            alpha: 0,
            behavior,
            type: position,
            despawn: 'position',
        };
        
        switch (type) {
            case ('pyramid'):
                return new PyramidDepthLine(id, 'background', game, options);
            case ('parapet'):
                return new ParapetDepthLine(id, 'background', game, options);
			case ('sawEdge'):
				return new SawEdgeDepthLine(id, 'background', game, options);
			case ('escalator'):
				return new EscalatorDepthLine(id, 'background', game, options);
            default:
                return new DepthLine(id, 'background', game, options);
        }
    }
}
