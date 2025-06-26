/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   PhysicsComponent.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: nponchon <nponchon@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 09:54:45 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/11 14:12:05 by nponchon         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Point } from 'pixi.js';

import type { Component } from '../engine/Component';

import type { PhysicsData } from '../utils/Types';

type PhysicsBehaviour = 'bounce' | 'block' | 'trigger' | 'none';

export class PhysicsComponent implements Component {
	type = 'physics';
	instanceId?: string;
	enabled: boolean = true;

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
	speed?: number;
	isPolygonal?: boolean;
	nPolygons?: number;
	physicsPoints?: Point[][];

	constructor(physicsData: PhysicsData){
		this.x = physicsData.x;
		this.y = physicsData.y;
		this.width = physicsData.width;
		this.height = physicsData.height;
		this.velocityX = physicsData.velocityX;
		this.velocityY = physicsData.velocityY;
		this.isStatic = physicsData.isStatic;
		this.behaviour = physicsData.behaviour;
		this.restitution = physicsData.restitution;
		this.mass = physicsData.mass;
		this.speed = physicsData.speed;
		this.isPolygonal = physicsData.isPolygonal;
		this.nPolygons = physicsData.nPolygons;
		this.physicsPoints = physicsData.physicsPoints;
	}
}