/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   ParticleSystem.js                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/14 10:03:50 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/22 09:26:31 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export class ParticleSystem {
	constructor (game) {
		this.game = game;
	}

	update(entities, delta) {
        const particlesToRemove = [];

        // First pass: process all particles and identify ones to remove
        for (const entity of entities) {
            if (entity.id.startsWith('explosionParticle') || entity.id.startsWith('burstParticle')) {
                const lifetime = entity.getComponent('lifetime');
                if (!lifetime) continue;
                
                const behavior = entity.getComponent('particleBehavior');
                const physics = entity.getComponent('physics');
                const render = entity.getComponent('render');

                if (lifetime.despawn === 'time') {
                    lifetime.remaining -= delta.deltaTime;
                    
                    if (lifetime.remaining <= 0) {
                        particlesToRemove.push(entity.id);
                        continue;
                    }
                }

                // Manage alpha variations
                render.graphic.alpha = entity.alpha;
                if (entity.fadeOut) {
                    entity.alpha -= entity.alphaDecay * delta.deltaTime;
                    if (entity.alpha < 0)
                        entity.alpha = 0;
                }

                // Update position
                if (physics && render) {
                    physics.x += physics.velocityX * delta.deltaTime * 0.1;
                    physics.y += physics.velocityY * delta.deltaTime* 0.1;
                    render.graphic.x = physics.x;
                    render.graphic.y = physics.y;
                }
                
                // Handle particle behaviour
                if (behavior?.shrink && render && lifetime.initial > 0) {
                    const scale = lifetime.remaining / lifetime.initial;
                    render.graphic.scale.set(scale);
                }

                if (behavior?.rotate && render && lifetime.initial > 0) {
                    const currentRotation = render.graphic.rotation;
                    render.graphic.rotation = currentRotation + (behavior.rotationSpeed * delta.deltaTime);
                }
            }

            // Second pass: remove expired particles
            for (const entityId of particlesToRemove) {
                this.game.removeEntity(entityId);
            }
        }
    }
}