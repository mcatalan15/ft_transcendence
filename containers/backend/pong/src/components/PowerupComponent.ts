/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   PowerupComponent.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/23 12:59:28 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/23 16:04:36 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import type { Component } from '../engine/Component.ts';
import type { Paddle } from '../entities/Paddle'

type Game = {
	eventQueue: any[];
};

export class PowerupComponent implements Component {
	type = 'powerup';
	instanceId?: string;

	private game: Game;

	constructor(game: Game) {
		this.game = game;
	}

	enlargePaddle(paddle: Paddle): void {
		if (paddle.isEnlarged) {
			paddle.enlargeTimer = 500;
			return;
		}

		paddle.isEnlarged = true;
		paddle.enlargeTimer = 500;
		paddle.overshootTarget = paddle._targetHeight * 1.2;
		paddle.overshootPhase = 'settle';
		paddle.enlargeProgress = 0;

		this.game.eventQueue.push({
			type: 'ENLARGE_PADDLE',
			target: paddle,
		});
	}
}