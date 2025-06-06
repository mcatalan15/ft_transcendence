/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Guards.ts                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 11:27:17 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/03 14:58:57 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Entity } from '../engine/Entity';
import { System } from '../engine/System';

import { Paddle } from '../entities/Paddle';
import { Ball } from '../entities/balls/Ball';
import { Wall } from '../entities/Wall';
import { Particle } from '../entities/Particle'
import { UI } from '../entities/UI'
import { Powerup } from '../entities/powerups/Powerup'

import { DepthLine } from '../entities/background/DepthLine';
import { PyramidDepthLine } from '../entities/background/PyramidDepthLine';
import { TrenchesDepthLine } from '../entities/background/TrenchesDepthLine';
import { LightningDepthLine } from '../entities/background/LightningDepthLine';
import { EscalatorDepthLine } from '../entities/background/EscalatorDepthLine';
import { HourglassDepthLine } from '../entities/background/HourglassDepthLine';
import { MawDepthLine } from '../entities/background/MawDepthLine';
import { RakeDepthLine } from '../entities/background/RakeDepthLine';

import { Obstacle } from '../entities/obstacles/Obstacle';
import { LedgeSegment } from '../entities/obstacles/LedgeSegment';
import { PachinkoSegment } from '../entities/obstacles/PachinkoSegment';
import { SnakeSegment } from '../entities/obstacles/SnakeSegment';

import { CrossCut } from '../entities/crossCuts/CrossCut';
import { TriangleCrossCut } from '../entities/crossCuts/TriangleCrossCut';
import { RectangleCrossCut } from '../entities/crossCuts/TrenchesCrossCut';
import { LightningCrossCut } from '../entities/crossCuts/LightningCrossCut';

import { SpinBall } from '../entities/balls/SpinBall';
import { BurstBall } from '../entities/balls/BurstBall';

import { Shield } from '../entities/background/Shield';
import { Bullet } from '../entities/Bullet';

import { Component } from '../engine/Component';
import { RenderComponent } from '../components/RenderComponent';

import { RenderSystem } from '../systems/RenderSystem';
import { AnimationSystem } from '../systems/AnimationSystem';
import { PowerupSystem } from '../systems/PowerupSystem';

import { MenuPostProcessingLayer } from '../menu/MenuPostProcessingLayer';
import { MenuLine } from '../menu/MenuLine';
import { MenuButton } from '../menu/MenuButton';
import { MenuXButton } from '../menu/MenuXButton';
import { MenuHalfButton } from '../menu/MenuHalfButton';
import { MenuOrnaments } from '../menu/MenuOrnaments';

export function isMenuPostProcessingLayer(entity: Entity): entity is MenuPostProcessingLayer {
	return entity instanceof MenuPostProcessingLayer
}

export function isPaddle(entity: Entity): entity is Paddle {
	return entity instanceof Paddle;
}

export function isBall(entity: Entity): entity is Ball {
	return entity instanceof Ball;
}

export function isSpinBall(entity: Entity): entity is SpinBall {
	return entity instanceof SpinBall;
}

export function isBurstBall(entity: Entity): entity is BurstBall {
	return entity instanceof BurstBall;
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

export function isMenuButton(entity: Entity): entity is MenuButton {
	return entity instanceof MenuButton;
}

export function isMenuXButton(entity: Entity): entity is MenuXButton {
	return entity instanceof MenuXButton;
}

export function isMenuHalfButton(entity: Entity): entity is MenuHalfButton {
	return entity instanceof MenuHalfButton;
}

export function isMenuOrnaments(entity: Entity): entity is MenuOrnaments {
	return entity instanceof MenuOrnaments;
}

export function isMenuLine(entity: Entity): entity is MenuLine {
	return entity instanceof MenuLine;
}

export function isDepthLine(entity: Entity): entity is DepthLine {
	return entity instanceof DepthLine;
}

export function isPyramidDepthLine(entity: Entity): entity is PyramidDepthLine {
	return entity instanceof PyramidDepthLine;
}

export function isParapetDepthLine(entity: Entity): entity is TrenchesDepthLine {
	return entity instanceof TrenchesDepthLine;
}

export function isLightningDepthLine(entity: Entity): entity is LightningDepthLine {
	return entity instanceof LightningDepthLine;
}

export function isEscalatorDepthLine(entity: Entity): entity is EscalatorDepthLine {
	return entity instanceof EscalatorDepthLine;
}

export function isAcceleratorDepthLine(entity: Entity): entity is HourglassDepthLine {
	return entity instanceof HourglassDepthLine;
}

export function isMawDepthLine(entity: Entity): entity is MawDepthLine {
	return entity instanceof MawDepthLine;
}

export function isRakeDepthLine(entity: Entity): entity is RakeDepthLine {
	return entity instanceof RakeDepthLine;
}

export function isObstacle(entity: Entity): entity is Obstacle {
	return entity instanceof Obstacle;
}

export function isLedgeSegment(entity: Entity): entity is LedgeSegment {
	return entity instanceof LedgeSegment;
}

export function isPachinkoSegment(entity: Entity): entity is PachinkoSegment {
	return entity instanceof PachinkoSegment;
}

export function isWindmillSegment(entity: Entity): entity is SnakeSegment {
	return entity instanceof SnakeSegment;
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

export function isRectangleCut(cut: CrossCut): cut is RectangleCrossCut {
	return cut instanceof RectangleCrossCut;
}

export function isSawCut(cut: CrossCut): cut is LightningCrossCut {
	return cut instanceof LightningCrossCut;
}

export function isRenderComponent(component: Component): component is RenderComponent {
	return component instanceof RenderComponent
}

export function isAnimationSystem(system: System): system is AnimationSystem {
	return system instanceof AnimationSystem;
}

export function isRenderSystem(system: System): system is RenderSystem {
	return system instanceof RenderSystem;
}

export function isPowerupSystem(system: System): system is PowerupSystem {
	return system instanceof PowerupSystem;
}
