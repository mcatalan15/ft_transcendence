/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   PhysicsUtils.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/20 14:25:00 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/20 18:25:22 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Entity } from '../engine/Entity';

import { PongGame } from '../engine/Game';
import { Paddle } from '../entities/Paddle'
import { Ball } from '../entities/balls/Ball'

import { PhysicsComponent } from '../components/PhysicsComponent';

import { PhysicsSystem } from '../systems/PhysicsSystem';

import { isBall } from '../utils/Guards';
import { BoundingBox } from '../utils/Types';

export function getCurrentBall(game: PongGame): Ball | undefined{
	for (const entity of game.entities.values()) {
		if (isBall(entity)) return entity;
	}
	return undefined;
}

export function getBoundingBox(physics: PhysicsComponent): BoundingBox {
	return {
		left: physics.x - physics.width / 2,
		right: physics.x + physics.width / 2,
		top: physics.y - physics.height / 2,
		bottom: physics.y + physics.height / 2
	};
}

export function isAABBOverlap(a: BoundingBox, b: BoundingBox) {
	return (
		a.left < b.right &&
		a.right > b.left &&
		a.top < b.bottom &&
		a.bottom > b.top
	);
}

export function sweptAABB(
	ballX: number, ballY: number, ballWidth: number, ballHeight: number, ballVx: number, ballVy: number,
	paddleX: number, paddleY: number, paddleWidth: number, paddleHeight: number, paddleVy: number = 0
) {
	const ballHalfW = ballWidth / 2;
	const ballHalfH = ballHeight / 2;
	const paddleHalfW = paddleWidth / 2;
	const paddleHalfH = paddleHeight / 2;
	
	const relVx = ballVx;
	const relVy = ballVy - paddleVy;
	
	const entryDistX = (paddleX - paddleHalfW) - (ballX + ballHalfW);
	const exitDistX = (paddleX + paddleHalfW) - (ballX - ballHalfW);
	
	const entryDistY = (paddleY - paddleHalfH) - (ballY + ballHalfH);
	const exitDistY = (paddleY + paddleHalfH) - (ballY - ballHalfH);
	
	let entryTimeX = relVx !== 0 ? entryDistX / relVx : -Infinity;
	let entryTimeY = relVy !== 0 ? entryDistY / relVy : -Infinity;
	let exitTimeX = relVx !== 0 ? exitDistX / relVx : Infinity;
	let exitTimeY = relVy !== 0 ? exitDistY / relVy : Infinity;
	
	if (entryTimeX > exitTimeX) [entryTimeX, exitTimeX] = [exitTimeX, entryTimeX];
	if (entryTimeY > exitTimeY) [entryTimeY, exitTimeY] = [exitTimeY, entryTimeY];
	
	if (exitTimeX < 0 || exitTimeY < 0) {
		return { hit: false, time: 1, position: { x: ballX + ballVx, y: ballY + ballVy }, normal: { x: 0, y: 0 } };
	}
	
	if (entryTimeX > exitTimeY || entryTimeY > exitTimeX) {
		return { hit: false, time: 1, position: { x: ballX + ballVx, y: ballY + ballVy }, normal: { x: 0, y: 0 } };
	}
	
	const entryTime = Math.max(entryTimeX, entryTimeY);
	
	if (entryTime > 1 || entryTime < 0) {
		return { hit: false, time: 1, position: { x: ballX + ballVx, y: ballY + ballVy }, normal: { x: 0, y: 0 } };
	}
	
	let normalX = 0;
	let normalY = 0;
	
	if (entryTimeX > entryTimeY) {
		normalX = entryDistX < 0 ? 1 : -1;
	} else {
		normalY = entryDistY < 0 ? 1 : -1;
	}
	
	const posX = ballX + ballVx * entryTime;
	const posY = ballY + ballVy * entryTime;
	
	return {
		hit: true,
		time: entryTime,
		position: { x: posX, y: posY },
		normal: { x: normalX, y: normalY }
	};
}

export function enforceMinimumHorizontalComponent(physicsSystem: PhysicsSystem, physics: PhysicsComponent, speed: number, minHorizontalComponent: number): void {
	const horizontalComponent = Math.abs(physics.velocityX) / speed;
	
	if (horizontalComponent < minHorizontalComponent) {
		const direction = Math.sign(physics.velocityX);
		
		const horizontalDir = direction !== 0 ? direction : 
			(physics.x < physicsSystem.game.width / 2 ? 1 : -1);
		
		physics.velocityX = horizontalDir * minHorizontalComponent * speed;
		
		const maxVertical = Math.sqrt(1 - minHorizontalComponent * minHorizontalComponent);
		
		physics.velocityY = Math.sign(physics.velocityY) * maxVertical * speed;
	}
}

export function circleIntersectsSegment(
    circle: {x: number, y: number}, 
    radius: number, 
    a: {x: number, y: number}, 
    b: {x: number, y: number}
): { intersects: boolean, normal?: {x: number, y: number}, point?: {x: number, y: number} } {
    const ab = { x: b.x - a.x, y: b.y - a.y };
    const ac = { x: circle.x - a.x, y: circle.y - a.y };

    const abLengthSq = ab.x * ab.x + ab.y * ab.y;
    const t = Math.max(0, Math.min(1, (ac.x * ab.x + ac.y * ab.y) / abLengthSq));
    const closest = { x: a.x + ab.x * t, y: a.y + ab.y * t };

    const dx = circle.x - closest.x;
    const dy = circle.y - closest.y;
    const distanceSq = dx * dx + dy * dy;
    
    if (distanceSq <= radius * radius) {
        // Calculate normal (unit vector from closest point to circle center)
        const distance = Math.sqrt(distanceSq);
        const normal = distance > 0 ? { x: dx / distance, y: dy / distance } : { x: 0, y: 0 };
        return { 
            intersects: true,
            normal: normal,
            point: closest
        };
    }
    return { intersects: false };
}
export function lineSegmentsIntersect(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number): boolean {
	const dx1 = x2 - x1;
	const dy1 = y2 - y1;
	const dx2 = x4 - x3;
	const dy2 = y4 - y3;
	
	const denominator = dy2 * dx1 - dx2 * dy1;
	
	if (denominator === 0) {
		return false;
	}
	
	const ua = (dx2 * (y1 - y3) - dy2 * (x1 - x3)) / denominator;

	const ub = (dx1 * (y1 - y3) - dy1 * (x1 - x3)) / denominator;
	
	return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
}

export function pointInPolygon(x: number, y: number, polygon: Array<{x: number, y: number}>, offsetX: number, offsetY: number): boolean {
	let inside = false;
	for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
		const xi = polygon[i].x + offsetX;
		const yi = polygon[i].y + offsetY;
		const xj = polygon[j].x + offsetX;
		const yj = polygon[j].y + offsetY;
		
		const intersect = ((yi > y) !== (yj > y)) && 
			(x < (xj - xi) * (y - yi) / (yj - yi) + xi);
		if (intersect) inside = !inside;
	}
	return inside;
}

export function findExactCollisionPosition(physicsSystem: PhysicsSystem, paddle: Paddle, physics: PhysicsComponent, startY: number, entitiesMap: Map<string, Entity>): void {
	const endY = physics.y;  // Current position (which has a collision)
	const velocityDirection = Math.sign(physics.velocityY);
	
	let low = 0;
	let high = 1;
	const precision = 0.01;  // How precise we want to be (in pixels)
	
	while (high - low > precision) {
		const mid = (low + high) / 2;
		const testY = startY + (endY - startY) * mid;

		physics.y = testY;
		
		const hitsCut = physicsSystem.handlePaddleCutCollisions(physics, entitiesMap, paddle);
		const hitsWall = physicsSystem.constrainPaddleToWalls(physics, entitiesMap);
		
		if (hitsCut || hitsWall) {
			high = mid;
		} else {
			low = mid;
		}
	}
	
	physics.y = startY + (endY - startY) * low;
	physics.velocityY = 0;  // Stop movement
}