/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   PhysicsComponent.js                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/01 11:27:20 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/09 10:04:17 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export class PhysicsComponent {
    constructor(configOrVelocityX = 0, velocityY = 0, width, height) {
        this.type = 'physics';
        this.entity = null;
        
        // Check if first parameter is a config object
        if (typeof configOrVelocityX === 'object') {
            const config = configOrVelocityX;
            this.x = config.x || 0;
            this.y = config.y || 0;
            this.velocityX = config.velocityX || 0;
            this.velocityY = config.velocityY || 0;
            this.width = config.width;
            this.height = config.height;
            this.static = config.static || false;
            this.bounce = config.bounce || false;
        } else {
            // Default behavior
            this.x = 0;
            this.y = 0;
            this.velocityX = configOrVelocityX;
            this.velocityY = velocityY;
            this.width = width;
            this.height = height;
            this.static = false;
            this.bounce = false;
        }
        
        this.previousX = this.x;
        this.previousY = this.y;
        this.rotation = 0;
    }
}