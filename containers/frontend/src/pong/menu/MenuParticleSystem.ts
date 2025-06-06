/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   MenuParticleSystem.ts                              :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 15:33:21 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/04 19:10:10 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import type { Menu } from './Menu';
import type { Entity } from '../engine/Entity';
import type { System } from '../engine/System';

import { PhysicsComponent } from '../components/PhysicsComponent';
import { RenderComponent } from '../components/RenderComponent';
import { ParticleBehaviorComponent } from '../components/ParticleBehaviorComponent';
import { LifetimeComponent } from '../components/LifetimeComponent';

import { MenuParticleSpawner } from './MenuParticleSpawner';

import type { FrameData } from '../utils/Types';
import { isParticle } from '../utils/Guards'

export class MenuParticleSystem implements System {
	private menu: Menu;

	constructor(menu: Menu) {
		this.menu = menu;
	}

	update(entities: Entity[], delta: FrameData): void {
		const particlesToRemove: string[] = [];
		if (!this.menu.config.classicMode) {
			MenuParticleSpawner.updateAmbientDust(
				this.menu,
				delta.deltaTime, 
				this.menu.width,
				this.menu.height,
			);

			for (const entity of entities) {
				if (!isParticle(entity)) {
					continue;
				} else {
					const lifetime = entity.getComponent('lifetime') as LifetimeComponent;
					if (!lifetime) continue;

					const behavior = entity.getComponent('particleBehavior') as ParticleBehaviorComponent;
					const physics = entity.getComponent('physics') as PhysicsComponent;
					const render = entity.getComponent('render') as RenderComponent;

					if (!render) continue;

					if (lifetime.despawn === 'time') {
						lifetime.remaining -= delta.deltaTime;

						if (lifetime.remaining <= 0) {
							particlesToRemove.push(entity.id);
							continue;
						}
					}

					if (entity.growShrink) {
						this.updateGrowShrinkParticle(entity, lifetime, render);
					} else {
						render.graphic.alpha = entity.alpha;
						if (entity.fadeOut) {
							entity.alpha -= entity.alphaDecay * delta.deltaTime;
							if (entity.alpha < 0) {
								entity.alpha = 0;
							}
						}
					}

					if (physics) {
						physics.x += physics.velocityX * delta.deltaTime * 0.1;
						physics.y += physics.velocityY * delta.deltaTime * 0.1;
						render.graphic.x = physics.x;
						render.graphic.y = physics.y;
					}

					if (behavior?.shrink && !entity.growShrink && lifetime.initial > 0) {
						const scale = lifetime.remaining / lifetime.initial;
						render.graphic.scale.set(scale);
					}
					
					if (behavior?.rotate && lifetime.initial > 0) {
						if (entity.id.includes('ambientDust')) {
							render.graphic.rotation += entity.rotationSpeed * delta.deltaTime;
						} else {
							render.graphic.rotation += behavior.rotationSpeed * delta.deltaTime;
						}
					}
				}
			}
		} else {
			for (const entity of this.menu.entities) {
				if (isParticle(entity)) {
					particlesToRemove.push(entity.id);
				}
			}
		}

		for (const entityId of particlesToRemove) {
			this.menu.removeEntity(entityId);
		}
	}

	private updateGrowShrinkParticle(entity: any, lifetime: LifetimeComponent, render: RenderComponent): void {
		const totalLifetime = lifetime.initial;
		const remainingLifetime = lifetime.remaining;
		const progress = 1 - (remainingLifetime / totalLifetime);

		let scale: number;
		let alpha: number;

		if (progress <= 0.5) {
			const growProgress = progress * 2;
			scale = this.easeInCubic(growProgress);
    		alpha = this.easeInCubic(growProgress) * entity.targetAlpha;
		} else {
			const shrinkProgress = (progress - 0.5) * 2;
			scale = this.easeOutCubic(1 - shrinkProgress);
    		alpha = this.easeOutCubic(1 - shrinkProgress) * entity.targetAlpha;
		}

		entity.currentScale = scale;
		entity.alpha = alpha;
		render.graphic.scale.set(scale);
		render.graphic.alpha = alpha;
	}

	private easeOutCubic(t: number): number {
		return 1 - Math.pow(1 - t, 3);
	}

	private easeInCubic(t: number): number {
		return t * t * t;
	}
}