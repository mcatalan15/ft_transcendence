/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   PowerupComponent.js                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: marvin <marvin@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/20 12:29:06 by marvin            #+#    #+#             */
/*   Updated: 2025/04/20 12:29:06 by marvin           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export class PowerupComponent {
    constructor (game) {
        this.game = game;
        this.type = 'powerup';
    }

    enlargePaddle(paddle) {
        if (paddle.isEnlarged) {
			paddle.enlargeTimer = 500
			return;
		}
    
        paddle.isEnlarged = true;
        paddle.enlargeTimer = 500;
		paddle.overshootTarget = paddle._targetHeight * 1.2;
		paddle.overshootPhase = 'settle';
		paddle.enlargeProgress = 0
    
        this.game.eventQueue.push({
            type: 'ENLARGE_PADDLE',
            target: paddle,
        });
    }
}