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
    constructor () {
        this.type = 'powerup';
        this.paddleOriginalWidth = 10;
        this.paddleOriginalHeight = 80;
    }

    enlargePaddle(paddle) {
        const render = paddle.getComponent('render');
        const physics = paddle.getComponent('physics');
    
        // Double the height in both the render and physics components
        const scaleFactor = 2;
    
        // Update physics dimensions
        if (!paddle.isEnlarged) {
            physics.height *= scaleFactor;
            paddle.isEnlarged = true;
        }
        paddle.enlargeTimer = 600;
    
        // Update render graphic
        const graphic = render.graphic;
        graphic.clear(); // clear previous drawing
        graphic.rect(0, 0, physics.width, physics.height);
        graphic.fill('#FAF3E0');
        graphic.pivot.set(physics.width / 2, physics.height / 2); // keep it centered
    }
}