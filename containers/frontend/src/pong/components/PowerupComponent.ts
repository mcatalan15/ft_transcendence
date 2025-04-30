/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   PowerupComponent.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 16:35:33 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/25 16:00:27 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Paddle } from '../entities/Paddle'

import { GameEvent } from '../utils/Types';

export class PowerupComponent {
    game: any;
    type: string;

    constructor(game: any) {
        this.game = game;
        this.type = 'powerup';
    }

    enlargePaddle(paddle: Paddle): void {
        if (paddle.isEnlarged) {
            paddle.enlargeTimer = 500;
            return;
        }

        paddle.isEnlarged = true;
        paddle.enlargeTimer = 500;
        paddle.overshootTarget = paddle.targetHeight * 1.2;
        paddle.overshootPhase = 'settle';
        paddle.enlargeProgress = 0;

        // Dispatch event to inform game about the powerup effect
        const enlargeEvent: GameEvent = {
            type: 'ENLARGE_PADDLE',
            target: paddle,
        };

        this.game.eventQueue.push(enlargeEvent);
    }
}