/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   PowerupComponent.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 16:35:33 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/02 18:52:39 by hmunoz-g         ###   ########.fr       */
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

    // Powerup effects

    enlargePaddle(paddle: Paddle): void {
        if (paddle.isEnlarged) {
            paddle.affectedTimer = 500;
            return;
        }

        paddle.isEnlarged = true;
        paddle.affectedTimer = 500;
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

    // Powerdown effects

    shrinkPaddle(paddle: Paddle): void {        
        if (paddle.isShrinked) {
            paddle.affectedTimer = 500;
            return;
        }
    
        paddle.isShrinked = true;
        paddle.affectedTimer = 500;
    
        // For shrinking, we want to overshoot by making it even smaller than the target
        paddle.overshootTarget = paddle.targetHeight * 0.4; // Overshoot to 40% of original size
        paddle.overshootPhase = 'expand'; // Start with expand phase first
        paddle.enlargeProgress = 0;
    
        const shrinkEvent: GameEvent = {
            type: 'SHRINK_PADDLE',
            target: paddle,
        };
    
        this.game.eventQueue.push(shrinkEvent);
    }

    invertPaddle(paddle: Paddle): void {
        if (paddle.isInverted) {
            paddle.affectedTimer = 500;
            return;
        }

        paddle.isInverted = true;
        paddle.affectedTimer = 500;

        paddle.inversion = -1;
    }

    slowPaddle(paddle: Paddle): void {
        if (paddle.isSlowed) {
            paddle.affectedTimer = 500;
            return;
        }

        paddle.isSlowed = true;
        paddle.affectedTimer = 500;

        paddle.slowness = 0.2;
    }

    flatPaddle(paddle: Paddle): void {
        if (paddle.isFlat) {
            paddle.affectedTimer = 500;
            return;
        }

        paddle.isFlat = true;
        paddle.affectedTimer = 500;
    }

    magnetizePaddle(paddle: Paddle): void {
        if (paddle.isMagnetized) {
            paddle.affectedTimer = 500;
            return ;
        }

        paddle.isMagnetized = true;
        paddle.affectedTimer = 500;
    }
}