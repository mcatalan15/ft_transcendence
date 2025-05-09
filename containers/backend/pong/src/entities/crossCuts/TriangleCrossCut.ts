/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   TriangleCrossCut.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/06 10:45:35 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/09 15:06:55 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Point } from 'pixi.js';

import { CrossCut } from './crossCut';

export class TriangleCrossCut extends CrossCut {
	constructor(id: string, layer: string, shape: string, position: string, nPoints: number, points: Point[], x: number, y: number) {
		super(id, layer, shape, position, nPoints, points, x, y);
	}

	createCutGraphic(): Graphics {
		const triangleGraphic = new Graphics();

		const left = this.points[0];
		const tip = this.points[1];
		const right = this.points[2];
		
		triangleGraphic.poly([tip, right, left], true);
		triangleGraphic.fill(0xFFFBEB);
		
		return triangleGraphic; 
	}

	initCutPhysicsData(x: number, y: number): any {
		//! PENDING: polygonal colliders, not important right now
		const data = {
			x: x || 0,  // Ensure we never pass undefined values
			y: y || 0,
			width: 0,
			height: 0,
			velocityX: 0,
			velocityY: 0,
			isStatic: true,  // Changed to static since this is a visual element
			behaviour: 'bounce' as const,
			restitution: 1.0,
			mass: 1,
			speed: 10,
		};

		return data;
	}

	/* generateCutTriangleGraphic(points: Point[]): Graphics {
		const triangleGraphic = new Graphics();
		
		if (!points || points.length < 4) {
			console.warn("Invalid points passed to cutTriangle:", points);
			// Draw a fallback simple triangle
			triangleGraphic.poly([
				new Point(0, -10),
				new Point(10, 10),
				new Point(-10, 10)
			], true);
			triangleGraphic.fill(0xFFFBEB);
			return triangleGraphic;
		}
	
		try {
			const tip = points[2];
			const left = points[1];
			const right = points[3];
			
			if (tip && left && right) {
				triangleGraphic.poly([tip, right, left], true);
				triangleGraphic.fill(0xFFFBEB);
			} else {
				console.warn("Some points are undefined:", { tip, left, right });
				// Draw a fallback simple triangle
				triangleGraphic.poly([
					new Point(0, -10),
					new Point(10, 10),
					new Point(-10, 10)
				], true);
				triangleGraphic.fill(0xFFFBEB);
			}
		} catch (error) {
			console.error("Error drawing triangle:", error);
			// Draw a fallback simple triangle
			triangleGraphic.poly([
				new Point(0, -10),
				new Point(10, 10),
				new Point(-10, 10)
			], true);
			triangleGraphic.fill(0xFFFBEB);
		}
		
		return triangleGraphic;
	}

	initTrianglePhysicsData(x: number, y: number) {
		const data = {
			x: x || 0,  // Ensure we never pass undefined values
			y: y || 0,
			width: 10,
			height: 20,
			velocityX: 0,
			velocityY: 0,
			isStatic: true,  // Changed to static since this is a visual element
			behaviour: 'bounce' as const,
			restitution: 1.0,
			mass: 1,
			speed: 10,
		};

		return data;
	} */
}