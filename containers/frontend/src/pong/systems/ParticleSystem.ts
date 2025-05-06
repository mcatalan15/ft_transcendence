/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   ParticleSystem.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 15:33:21 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/25 16:00:34 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import type { PongGame } from '../engine/Game';
import type { Entity } from '../engine/Entity';
import type { System } from '../engine/System';

import { PhysicsComponent } from '../components/PhysicsComponent';
import { RenderComponent } from '../components/RenderComponent';
import { ParticleBehaviorComponent } from '../components/ParticleBehaviorComponent';
import { LifetimeComponent } from '../components/LifetimeComponent';

import type { FrameData } from '../utils/Types';
import { isParticle } from '../utils/Guards'

export class ParticleSystem implements System {
	private game: PongGame;

	constructor(game: PongGame) {
		this.game = game;
	}

	update(entities: Entity[], delta: FrameData): void {
		const particlesToRemove: string[] = [];

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

				// Handle despawn by time
				if (lifetime.despawn === 'time') {
					lifetime.remaining -= delta.deltaTime;

					if (lifetime.remaining <= 0) {
						particlesToRemove.push(entity.id);
						continue;
					}
				}

				// Handle alpha fade
				render.graphic.alpha = entity.alpha;
				if (entity.fadeOut) {
					entity.alpha -= entity.alphaDecay * delta.deltaTime;
					if (entity.alpha < 0) {
						entity.alpha = 0;
					}
				}

				// Update position
				if (physics) {
					physics.x += physics.velocityX * delta.deltaTime * 0.1;
					physics.y += physics.velocityY * delta.deltaTime * 0.1;
					render.graphic.x = physics.x;
					render.graphic.y = physics.y;
				}

				// Shrinking effect
				if (behavior?.shrink && lifetime.initial > 0) {
					const scale = lifetime.remaining / lifetime.initial;
					render.graphic.scale.set(scale);
				}

				// Rotation effect
				if (behavior?.rotate && lifetime.initial > 0) {
					render.graphic.rotation += behavior.rotationSpeed * delta.deltaTime;
				}
			}
		}

		// Remove expired particles
		for (const entityId of particlesToRemove) {
			this.game.removeEntity(entityId);
		}
	}
}
