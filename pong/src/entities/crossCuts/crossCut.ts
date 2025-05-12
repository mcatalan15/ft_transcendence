/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   crossCut.ts                                        :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/07 12:42:10 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/09 15:29:19 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Point } from 'pixi.js';

import { Entity } from '../../engine/Entity';

import { RenderComponent } from '../../components/RenderComponent';
import { PhysicsComponent } from '../../components/PhysicsComponent';

import { RuinCrossCut } from './RuinCrossCut';

import { isTriangleCut, isRuinCut } from '../../utils/Guards';

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
			} else if (isRuinCut(cut)) {
				const ruinCut = cut as RuinCrossCut;
				
				// Implement the same drawing logic as in RuinCrossCut.createCutGraphic()
				graphic.moveTo(ruinCut.points[0].x, ruinCut.points[0].y);
				
				for (let i = 1; i < ruinCut.points.length; i++) {
					graphic.lineTo(ruinCut.points[i].x, ruinCut.points[i].y);
				}
				
				graphic.fill(0xFFFBEB);
			}
		}
	}
}