/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Guards.ts                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 11:27:17 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/09 15:22:08 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Entity } from '../engine/Entity';
import { System } from '../engine/System';

import { Paddle } from '../entities/Paddle';
import { Ball } from '../entities/balls/Ball';
import { Wall } from '../entities/Wall';
import { DepthLine } from '../entities/background/DepthLine';
import { PyramidDepthLine } from '../entities/background/PyramidDepthLine';
import { RuinDepthLine } from '../entities/background/RuinDepthLine';
import { Particle } from '../entities/Particle'
import { UI } from '../entities/UI'
import { Powerup } from '../entities/powerups/Powerup'
import { CrossCut } from '../entities/crossCuts/crossCut';
import { TriangleCrossCut } from '../entities/crossCuts/TriangleCrossCut';
import { RuinCrossCut } from '../entities/crossCuts/RuinCrossCut';

import { SpinBall } from '../entities/balls/SpinBall';

import { Shield } from '../entities/background/Shield';
import { Bullet } from '../entities/Bullet';

import { RenderSystem } from '../systems/RenderSystem';
import { AnimationSystem } from '../systems/AnimationSystem';

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

export function isPyramidDepthLine(entity: Entity): entity is PyramidDepthLine {
	return entity instanceof PyramidDepthLine;
}

export function isRuinDepthLine(entity: Entity): entity is RuinDepthLine {
	return entity instanceof RuinDepthLine;
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

export function isCrossCut(entity: Entity): entity is CrossCut {
	return entity instanceof CrossCut;
}

export function isTriangleCut(cut: CrossCut): cut is TriangleCrossCut {
	return cut instanceof TriangleCrossCut;
}

export function isRuinCut(cut: CrossCut): cut is RuinCrossCut {
	return cut instanceof RuinCrossCut;
}


export function isAnimationSystem(system: System): system is AnimationSystem {
	return system instanceof AnimationSystem;
}

export function isRenderSystem(system: System): system is RenderSystem {
	return system instanceof RenderSystem;
}