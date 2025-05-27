/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   ObstacleFactory.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/14 16:53:37 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/27 17:15:26 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { PongGame } from '../engine/Game';

import { Obstacle } from '../entities/obstacles/Obstacle';
import { LedgeSegment } from '../entities/obstacles/LedgeSegment';
import { PachinkoSegment } from '../entities/obstacles/PachinkoSegment';
import { SnakeSegment } from '../entities/obstacles/SnakeSegment';

import { ObstacleBehavior, ObstacleOptions } from '../utils/Types';

export class ObstacleFactory {
    static createObstacle(game: PongGame, behavior: ObstacleBehavior, type: string, id: string, pattern?: number, position?: number): Obstacle {
		let options = {
			initialized: false,
			initialY: 0,
			width: game.width,
			height: game.height,
			alpha: 0,
			targetAlpha: 1.0,
			initialScale: 0.5,
			targetScale: 1.0,
			lifetime: 200,
			type: type,
			despawn: 'time',
			behavior: behavior,
		}
		
		if (type.includes('Pachinko')) {
			return new PachinkoSegment(game, options, type, id, 'background', pattern!);
		} else if (type.includes('ledge')) {
			return new LedgeSegment(game, options, type, id, 'background');
		} else {
			return new SnakeSegment(game, options, type, id, 'background', pattern!, position!);
		} 
	}
}
