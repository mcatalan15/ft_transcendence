/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   CrossCut.ts                                        :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/07 12:42:10 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/14 15:27:35 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Point } from 'pixi.js';

import { Entity } from '../../engine/Entity';

import { RenderComponent } from '../../components/RenderComponent';
import { PhysicsComponent } from '../../components/PhysicsComponent';

import { RectangleCrossCut } from './RectangleCrossCut';

import { isTriangleCut, isRectangleCut } from '../../utils/Guards';

export abstract class CrossCut extends Entity {
	shape: string;
	nPoints: number;
	points: Point[];
	position: string = '';
	
	constructor (id: string, layer: string, shape: string, position:string, nPoints: number, points: Point[], x: number, y: number) {
		super(id, layer);

		this.shape = shape;
		this.nPoints = nPoints;
		this.points = points;
		this.position = position;

		const cutGraphic = this.createCutGraphic();
		const renderComponent = new RenderComponent(cutGraphic);
		this.addComponent(renderComponent);

		const physicsData = this.initCutPhysicsData(x, y);
		const physicsComponent = new PhysicsComponent(physicsData);
		this.addComponent(physicsComponent);

	}

	abstract createCutGraphic(): Graphics;
	abstract initCutPhysicsData(x: number, y: number): any;

	transformCrossCut(cut: CrossCut, transformPoints: Point[]): void {    
		if (transformPoints.length !== this.nPoints) {
			return;
		}
		const renderComponent = cut.getComponent('render') as RenderComponent;
		if (renderComponent && renderComponent.graphic instanceof Graphics) {
			const graphic = renderComponent.graphic;
			
			// Update all points
			for (let i = 0; i < this.nPoints; i++) {
				cut.points[i].x = transformPoints[i].x;
				cut.points[i].y = transformPoints[i].y;
			}
			
			graphic.clear();
			
			if (isTriangleCut(cut)) {
				const tip = cut.points[1];
				const left = cut.points[0];
				const right = cut.points[2];
				
				graphic.poly([tip, right, left], true);
				graphic.fill(0xFFFBEB);
			} else if (isRectangleCut(cut)) {
				const rectangleCut = cut as RectangleCrossCut;
				
				// Implement the same drawing logic as in RuinCrossCut.createCutGraphic()
				graphic.moveTo(rectangleCut.points[0].x, rectangleCut.points[0].y);
				
				for (let i = 1; i < rectangleCut.points.length; i++) {
					graphic.lineTo(rectangleCut.points[i].x, rectangleCut.points[i].y);
				}
				
				graphic.fill(0xFFFBEB);
			}
		}
	}
}