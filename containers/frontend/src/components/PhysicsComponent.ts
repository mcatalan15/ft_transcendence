/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   PhysicsComponent.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 09:54:45 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/25 09:51:54 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import type { Component } from '../engine/Component';

type PhysicsBehaviour = 'bounce' | 'block' | 'trigger' | 'none';

export class PhysicsComponent implements Component {
	type = 'physics';
	instanceId?: string;

	x: number;
	y: number;
	width: number;
	height: number;
	velocityX: number;
	velocityY: number;
	isStatic: boolean;
	behaviour: PhysicsBehaviour;
	restitution: number;
	mass: number;
	speed: number;

	constructor({
		x,
		y,
		width,
		height,
		velocityX = 0,
		velocityY = 0,
		isStatic = false,
		behaviour = 'bounce',
		restitution = 0,
		mass = 0,
		speed = 5,
	}: {
		x: number;
		y: number;
		width: number;
		height: number;
		velocityX?: number;
		velocityY?: number;
		isStatic?: boolean;
		behaviour?: PhysicsBehaviour;
		restitution?: number;
		mass?: number;
		speed?: number;
	}) {
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