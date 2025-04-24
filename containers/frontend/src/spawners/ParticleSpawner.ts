/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   ParticleSpawner.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 12:39:10 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/24 13:00:05 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// Import Engine elements (ECS)
import { PongGame } from '../engine/Game';

// Import built components
import { Particle } from '../entities/Particle';

// Import built components
import { RenderComponent } from '../components/RenderComponent';

export class ParticleSpawner {
	static spawnBasicExplosion(game: PongGame, x: number, y: number, color: number): void {
		for (let i = 0; i < 5; i++) {
			const angle = Math.random() * Math.PI * 2;
			const speed = Math.random() * 5 + 3;

			const startX = x + (Math.random() * 6 - 3);
			const startY = y + (Math.random() * 6 - 3);

			const alpha = Math.random() * 0.8 + 0.2;

			const particle = new Particle(`explosionParticle-${Date.now()}-${i}`, 'foreground', startX, startY, {
				type: 'square',
				velocityX: Math.cos(angle) * speed,
				velocityY: Math.sin(angle) * speed,
				lifetime: Math.random() * 10 + 15,
				size: Math.random() * 10 + 5,
				shrink: true,
				rotate: true,
				color,
				alpha,
				alphaDecay: alpha / 50,
				fadeOut: true,
			});

			game.addEntity(particle);
			const particleRender = particle.getComponent('render') as RenderComponent;
			game.app.stage.addChild(particleRender.graphic);
			//game.renderLayers.foreground.addChild(particle.getComponent('render')!.graphic);
		}
	}

	static spawnBurst(
		game: PongGame,
		x: number,
		y: number,
		size: number = 5,
		velocityX: number = 0,
		velocityY: number = 0,
		color: number
	): void {
		const baseAngle = Math.atan2(-velocityY, -velocityX);

		for (let i = 0; i < size; i++) {
			const spread = 0.5;
			const angle = baseAngle + (Math.random() * spread - spread / 2);
			const distance = Math.random() * 20 + 10;

			const startX = x + (Math.random() * 6 - 3);
			const startY = y + (Math.random() * 6 - 3);

			const alpha = Math.random() * 0.8 + 0.2;

			const particle = new Particle(`burstParticle-${Date.now()}-${i}`, 'midground', startX, startY, {
				type: 'triangle',
				velocityX: Math.cos(angle) * distance / 1.5,
				velocityY: Math.sin(angle) * distance / 1.5,
				lifetime: Math.random() * 10 + 35,
				size: Math.random() * 3 + 3,
				shrink: true,
				rotate: true,
				color,
				alpha,
				alphaDecay: alpha / 120,
				fadeOut: true,
			});

			game.addEntity(particle);
			const particleRender = particle.getComponent('render') as RenderComponent;
			game.app.stage.addChild(particleRender.graphic);
			//game.renderLayers.midground.addChild(particle.getComponent('render')!.graphic);
		}
	}

	static spawnEnvironmentDust(): void {
		// Placeholder for future dust logic
	}
}