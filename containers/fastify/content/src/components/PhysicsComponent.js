/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   PhysicsComponent.js                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/09 16:01:40 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/10 12:21:43 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

/*
Physics component contains all the necesary data to handle physics interaction.
It is a reusable component, which can be added to any entity of the game. 
*/
export class PhysicsComponent {
	constructor ({ x, y, width, height, velocityX = 0, velocityY = 0, isStatic = false, behaviour = 'bounce', restitution = 0, mass = 0, speed = 5 }) {
		this.type = 'physics';
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.velocityX = velocityX;
		this.velocityY = velocityY;
		this.isStatic = isStatic;
		this.behaviour = behaviour;
		this.restitution = restitution;
		this.mass = mass;
		this.speed = speed;
	}
}