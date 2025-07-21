/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   ParticleSystem.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 15:33:21 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/21 21:28:53 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import type { PongGame } from '../engine/Game';
import type { Entity } from '../engine/Entity';
import type { System } from '../engine/System';

import { PhysicsComponent } from '../components/PhysicsComponent';
import { RenderComponent } from '../components/RenderComponent';
import { ParticleBehaviorComponent } from '../components/ParticleBehaviorComponent';
import { LifetimeComponent } from '../components/LifetimeComponent';

import { ParticleSpawner } from '../spawners/ParticleSpawner';

import type { FrameData } from '../utils/Types';
import { isParticle } from '../utils/Guards'

export class ParticleSystem implements System {
	private game: PongGame;

	constructor(game: PongGame) {
		this.game = game;
	}

	update(entities: Entity[], delta: FrameData): void {
		const particlesToRemove: string[] = [];

		ParticleSpawner.updateAmbientDust(
			this.game,
			delta.deltaTime, 
			this.game.width,
			this.game.height - 300,
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

		for (const entityId of particlesToRemove) {
			this.game.removeEntity(entityId);
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

	cleanup(): void {
		const particlesToRemove: string[] = [];
		for (const entity of this.game.entities) {
			if (isParticle(entity)) {
				particlesToRemove.push(entity.id);
			}
		}
		
		for (const entityId of particlesToRemove) {
			this.game.removeEntity(entityId);
		}
		
		if (ParticleSpawner && typeof (ParticleSpawner as any).cleanup === 'function') {
			(ParticleSpawner as any).cleanup();
		}
	}
}