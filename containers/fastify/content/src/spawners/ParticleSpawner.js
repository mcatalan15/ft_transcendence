/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   ParticleSpawner.js                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/14 10:18:43 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/22 09:19:45 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Particle } from '../entities/Particle.js'

export class ParticleSpawner {
	static spawnBasicExplosion(game, x, y, color) {		
		for (let i = 0; i < 5; i++) {
			const angle = Math.random() * Math.PI * 2;
			const speed = Math.random() * 5 + 3;
	
			const startX = x + (Math.random() * 6 - 3); // +/- 3 pixels
        	const startY = y + (Math.random() * 6 - 3); // +/- 3 pixels

			const alpha = Math.random() * 0.8 + 0.2;

			const particle = new Particle(`explosionParticle-${i}`, 'foreground', startX, startY, {
				type: 'square',
				velocityX: Math.cos(angle) * speed,
				velocityY: Math.sin(angle) * speed,
				lifetime: Math.random() * 10 + 15,
				size: Math.random() * 10 + 5,
				shrink: true,
				rotate: true,
				color: color,
				rotationSpeed: Math.random() * 0.2 - 0.1,
				alpha: alpha,
				alphaDecay: alpha / 50,
				fadeOut: true,
			});
			
			game.addEntity(particle);
			game.renderLayers.foreground.addChild(particle.getComponent('render').graphic);
		}
	}

	static spawnBurst(game, x, y, size = 5, velocityX = 0, velocityY = 0, color) {
		const baseAngle = Math.atan2(-velocityY, -velocityX);  // Opposite direction of movement
	
		for (let i = 0; i < size; i++) {
			const spread = 0.5; // Radians, ~28° spread
			const angle = baseAngle + (Math.random() * spread - spread / 2);
			const distance = Math.random() * 20 + 10;
	
			const startX = x + (Math.random() * 6 - 3);
			const startY = y + (Math.random() * 6 - 3);

			const alpha = Math.random() * 0.8 + 0.2;
	
			const particle = new Particle(`burstParticle-${i}`, 'midground', startX, startY, {
				type: 'triangle',
				velocityX: Math.cos(angle) * distance / 1.5,
				velocityY: Math.sin(angle) * distance / 1.5,
				lifetime: Math.random() * 10 + 35,
				size: Math.random() * 3 + 3,
				shrink: true,
				rotate: true,
				color: color,
				rotationSpeed: Math.random() * 0.2 - 0.1,
				alpha: alpha,
				alphaDecay: alpha / 120,
				fadeOut: true,
			});
	
			game.addEntity(particle);
			game.renderLayers.background.addChild(particle.getComponent('render').graphic);
		}
	}

	static spawnEnvironmentDust(){
		
	}
}