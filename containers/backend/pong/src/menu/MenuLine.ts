/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   MenuLine.ts                                        :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/30 16:47:33 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/05 09:22:59 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Point } from 'pixi.js';

import { Entity } from '../engine/Entity';
import { RenderComponent } from '../components/RenderComponent';
import { LifetimeComponent } from '../components/LifetimeComponent';
import { AnimationComponent } from '../components/AnimationComponent';
import { FrameData, GAME_COLORS } from '../utils/Types';
import * as Utils from '../utils/Utils';
import { Menu } from './Menu';

export class MenuLine extends Entity {
	menu: Menu;
	despawn: string = 'position';
	lifetime: number = 180;
	
	initialPoints: Point[] = [
		new Point(0, 1),
		new Point(113, 1),
		new Point(298, 1),
		new Point(410, 1),
		new Point(430, 1),
		new Point(546, 1),
	];
	
	targetPoints: Point[] = [
		new Point(0, 290),
		new Point(93, 290),
		new Point(298, 290),
		new Point(390, 290),
		new Point(450, 290),
		new Point(546, 290),
	];

	animationProgress: number = 0;
	animationSpeed: number = 0.003;
	startY: number = 292;
	targetY: number = -43;
	totalDistance: number;

	constructor(id: string, layer: string, menu: Menu) {
		super(id, layer);

		this.menu = menu;
		this.totalDistance = this.startY - this.targetY;

		const graphic = this.generateLine();
		const render = new RenderComponent(graphic);
		this.addComponent(render);

		render.graphic.position.set(1127, this.startY);

		const lifetimeComp = new LifetimeComponent(this.lifetime, this.despawn);
		this.addComponent(lifetimeComp);

		const animationComp = new AnimationComponent();
		this.addComponent(animationComp);
	}

	private generateLine(): Graphics {
		const line = new Graphics();
		
		line.moveTo(this.initialPoints[0].x, this.initialPoints[0].y);
		line.lineTo(this.initialPoints[1].x, this.initialPoints[1].y);
		line.moveTo(this.initialPoints[2].x, this.initialPoints[2].y);
		line.lineTo(this.initialPoints[3].x, this.initialPoints[3].y);
		line.moveTo(this.initialPoints[4].x, this.initialPoints[4].y);
		line.lineTo(this.initialPoints[5].x, this.initialPoints[5].y);
		
		line.stroke({ color: GAME_COLORS.white, width: 3 });
		return line;
	}

	updateLineGraphics(progress: number): void {
		const render = this.getComponent('render') as RenderComponent;
		if (!render) return;

		const graphic = render.graphic as Graphics;
		graphic.clear();

		const currentY = Utils.lerp(this.startY, this.targetY, progress);

		const currentPoints: Point[] = [];
		for (let i = 0; i < this.initialPoints.length; i++) {
			const initialX = this.initialPoints[i].x;
			const targetX = this.targetPoints[i].x;
			
			const easedProgress = Utils.easeInStrong(progress);
			const x = Utils.lerp(initialX, targetX, easedProgress);
			
			const y = Utils.lerp(this.initialPoints[i].y, this.targetPoints[i].y, progress);
			
			currentPoints.push(new Point(x, y));
		}

		graphic.moveTo(currentPoints[0].x, currentPoints[0].y);
		graphic.lineTo(currentPoints[1].x, currentPoints[1].y);
		graphic.moveTo(currentPoints[2].x, currentPoints[2].y);
		graphic.lineTo(currentPoints[3].x, currentPoints[3].y);
		graphic.moveTo(currentPoints[4].x, currentPoints[4].y);
		graphic.lineTo(currentPoints[5].x, currentPoints[5].y);

		graphic.stroke({ color: GAME_COLORS.white, width: 3 });
		
		render.graphic.y = currentY;
		
		render.graphic.alpha = 1 - progress;
	}

	isAnimationComplete(): boolean {
		return this.animationProgress >= 1.0;
	}

	updateAnimation(deltaTime: number): void {
		this.animationProgress += this.animationSpeed * deltaTime;
		this.animationProgress = Math.min(this.animationProgress, 1.0);
		this.updateLineGraphics(this.animationProgress);
	}
}