/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   ParticleSpawner.js                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/14 10:18:43 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/14 16:53:57 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Particle } from '../entities/Particle.js'

export class ParticleSpawner {
	static spawnBasicExplosion(game, x, y) {
		// Define some particle colors
		//const colors = [0xFFAC1C, 0xAC1CFF, 0x1CFFAC];
		
		for (let i = 0; i < 5; i++) {
			const angle = Math.random() * Math.PI * 2;
			const speed = Math.random() * 5 + 3;
	
			const startX = x + (Math.random() * 6 - 3); // +/- 3 pixels
        	const startY = y + (Math.random() * 6 - 3); // +/- 3 pixels

			const particle = new Particle(`explosionParticle-${i}`, startX, startY, {
				type: 'square',
				velocityX: Math.cos(angle) * speed,
				velocityY: Math.sin(angle) * speed,
				lifetime: Math.random() * 10 + 15,
				size: Math.random() * 10 + 5,
				shrink: true,
				rotate: true,
				color: 0xFFAC1C,
				rotationSpeed: Math.random() * 0.2 - 0.1,
			});
			
			game.addEntity(particle);
			game.app.stage.addChild(particle.getComponent('render').graphic);
		}
	}

	static spawnBurst(game, x, y, size = 5, velocityX = 0, velocityY = 0) {
		// Calculate inverse direction of ball movement
		const baseAngle = Math.atan2(-velocityY, -velocityX);  // Opposite direction of movement
	
		for (let i = 0; i < size; i++) {
			const spread = 0.5; // Radians, ~28° spread
			const angle = baseAngle + (Math.random() * spread - spread / 2);
			const distance = Math.random() * 20 + 10;
	
			const startX = x + (Math.random() * 6 - 3);
			const startY = y + (Math.random() * 6 - 3);
	
			const particle = new Particle(`burstParticle-${i}`, startX, startY, {
				type: 'triangle',
				velocityX: Math.cos(angle) * distance,
				velocityY: Math.sin(angle) * distance,
				lifetime: Math.random() * 10 + 15,
				size: Math.random() * 3 + 2,
				shrink: true,
				rotate: true,
				color: 0x1CFFAC,
				rotationSpeed: Math.random() * 0.2 - 0.1,
			});
	
			game.addEntity(particle);
			game.app.stage.addChild(particle.getComponent('render').graphic);
		}
	}

	static spawnEnvironmentDust(){
		
	}
}