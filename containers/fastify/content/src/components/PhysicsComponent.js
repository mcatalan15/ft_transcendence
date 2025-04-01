/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   PhysicsComponent.js                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/01 11:27:20 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/01 11:40:56 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export class PhysicsComponent {
    constructor(velocityX = 0, velocityY = 0, width, height) {
        this.type = 'physics';
        this.entity = null;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.previousX = 0;
        this.previousY = 0;
        this.width = width;
        this.height = height;
    }
}