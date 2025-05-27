/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   FigureFactory.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/14 16:53:37 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/27 17:57:00 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { PongGame } from '../engine/Game';

import { DepthLine } from '../entities/background/DepthLine';
import { PyramidDepthLine } from '../entities/background/PyramidDepthLine';
import { TrenchesDepthLine } from '../entities/background/TrenchesDepthLine';
import { LightningDepthLine } from '../entities/background/LightningDepthLine';
import { EscalatorDepthLine } from '../entities/background/EscalatorDepthLine';
import { HourglassDepthLine } from '../entities/background/HourglassDepthLine';
import { MawDepthLine } from '../entities/background/MawDepthLine';
import { RakeDepthLine } from '../entities/background/RakeDepthLine';

import { DepthLineBehavior } from '../utils/Types';

export class FigureFactory {
    static createDepthLine(
        type: 'standard' |
            'pyramid' |
            'trenches' |
            'lightning' |
            'steps' |
            'hourglass' |
            'maw'|
            'rake'|
            string,
        game: PongGame,
        id: string,
        width: number,
        height: number,
        topWallOffset: number,
        bottomWallOffset: number,
        wallThickness: number,
        position: 'top' | 'bot' | string,
        behavior: DepthLineBehavior,
        flip?: number,
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
            flip: flip,
        };
        
        switch (type) {
            case ('pyramid'):
                return new PyramidDepthLine(id, 'background', game, options);
            case ('trenches'):
                return new TrenchesDepthLine(id, 'background', game, options, flip!);
			case ('lightning'):
                return new LightningDepthLine(id, 'background', game, options, flip!);
			case ('steps'):
				return new EscalatorDepthLine(id, 'background', game, options);
            case ('hourglass'):
                return new HourglassDepthLine(id, 'background', game, options);
            case ('maw'):
                return new MawDepthLine(id, 'background', game, options);
            case ('rake'):
                return new RakeDepthLine(id, 'background', game, options);
            default:
                return new DepthLine(id, 'background', game, options);
        }
    }
}
