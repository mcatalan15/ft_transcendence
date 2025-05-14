/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   RectangleCrossCut.ts                               :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/06 10:45:35 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/14 15:38:59 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Point } from 'pixi.js';

import { CrossCut } from './CrossCut';

export class RectangleCrossCut extends CrossCut {
	constructor(id: string, layer: string, shape: string, position: string, nPoints: number, points: Point[], x: number, y: number) {
		super(id, layer, shape, position, nPoints, points, x, y);
	}

	createCutGraphic(): Graphics {
		const ruinGraphic = new Graphics();

		ruinGraphic.moveTo(this.points[0].x, this.points[0].y);

		for (let i = 1; i < this.points.length; i++) {
			ruinGraphic.lineTo(this.points[i].x, this.points[i].y);
		}

		ruinGraphic.fill(0xFFFBEB);
		
		return ruinGraphic; 
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
}