/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Guards.ts                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 11:27:17 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/02 18:11:27 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Entity } from '../engine/Entity';

import { Paddle } from '../entities/Paddle';
import { Ball } from '../entities/balls/Ball';
import { Wall } from '../entities/Wall';
import { DepthLine } from '../entities/background/DepthLine';
import { Particle } from '../entities/Particle'
import { UI } from '../entities/UI'
import { Powerup } from '../entities/powerups/Powerup'

import { SpinBall } from '../entities/balls/SpinBall';

import { Shield } from '../entities/background/Shield';
import { Bullet } from '../entities/Bullet';

export function isPaddle(entity: Entity): entity is Paddle {
	return entity instanceof Paddle;
}

export function isBall(entity: Entity): entity is Ball {
	return entity instanceof Ball;
}

export function isSpinBall(entity: Entity): entity is SpinBall {
	return entity instanceof SpinBall;
}

export function isShield(entity: Entity): entity is Shield {
	return entity instanceof Shield;
}

export function isBullet(entity: Entity): entity is Bullet {
	return entity instanceof Bullet;
}

export function isWall(entity: Entity): entity is Wall {
	return entity instanceof Wall;
}

export function isDepthLine(entity: Entity): entity is DepthLine {
	return entity instanceof DepthLine;
}

export function isParticle(entity: Entity): entity is Particle {
	return entity instanceof Particle;
}

export function isUI(entity: Entity): entity is UI {
	return entity instanceof UI;
}

export function isPowerup(entity: Entity): entity is Powerup {
	return entity instanceof Powerup;
}