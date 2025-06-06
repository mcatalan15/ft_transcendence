/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   ParticleSpawner.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 12:39:10 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/28 17:02:44 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { PongGame } from '../engine/Game';
import { Particle } from '../entities/Particle';
import { RenderComponent } from '../components/RenderComponent';

import { GAME_COLORS } from '../utils/Types';

interface AmbientDustConfig {
	maxParticles: number;
	spawnRate: number; // particles per second
	color: number;
	minSize: number;
	maxSize: number;
	minLifetime: number;
	maxLifetime: number;
	minAlpha: number;
	maxAlpha: number;
	driftSpeed: number; // how fast they drift around
	minRotationSpeed: number;
	maxRotationSpeed: number;
}

export class ParticleSpawner {
	private static ambientDustConfig: AmbientDustConfig = {
		maxParticles: 20,
		spawnRate: 2,
		color: GAME_COLORS.white,
		minSize: 2,
		maxSize: 4,
		minLifetime: 80,
		maxLifetime: 120,
		minAlpha: 0.1,
		maxAlpha: 0.3,
		driftSpeed: 0.5,
		minRotationSpeed: 0.005,
		maxRotationSpeed: 0.02
	};

	private static lastAmbientSpawn: number = 0;
	private static ambientParticleCount: number = 0;

	static spawnBasicExplosion(game: PongGame, x: number, y: number, color: number, sizeFactor: number): void {
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
				size: (Math.random() * 10 + 5) * sizeFactor,
				shrink: true,
				rotate: true,
				color,
				alpha,
				alphaDecay: alpha / 50,
				fadeOut: true,
			});

			game.addEntity(particle);
			const particleRender = particle.getComponent('render') as RenderComponent;
			game.renderLayers.foreground.addChild(particleRender.graphic);
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
			game.renderLayers.midground.addChild(particleRender.graphic);
		}
	}

	static updateAmbientDust(game: PongGame, deltaTime: number, gameWidth: number, gameHeight: number): void {
		const currentTime = Date.now();
		const config = this.ambientDustConfig;

		this.ambientParticleCount = 0;
		for (const entity of game.entities) {
			if (entity.id.startsWith('ambientDust-')) {
				this.ambientParticleCount++;
			}
		}

		const timeSinceLastSpawn = currentTime - this.lastAmbientSpawn;
		const spawnInterval = 1000 / config.spawnRate;

		if (this.ambientParticleCount < config.maxParticles && timeSinceLastSpawn >= spawnInterval) {
			this.spawnAmbientDustParticle(game, gameWidth, gameHeight);
			this.lastAmbientSpawn = currentTime;
		}
	}

	private static spawnAmbientDustParticle(game: PongGame, gameWidth: number, gameHeight: number): void {
		const config = this.ambientDustConfig;
		
		const x = Math.random() * gameWidth;
		const y = Math.random() * gameHeight + 150;
		
		const size = config.minSize + Math.random() * (config.maxSize - config.minSize);
		const lifetime = config.minLifetime + Math.random() * (config.maxLifetime - config.minLifetime);
		const alpha = config.minAlpha + Math.random() * (config.maxAlpha - config.minAlpha);
		const rotationSpeed = config.minRotationSpeed + Math.random() * (config.maxRotationSpeed - config.minRotationSpeed);
		
		const velocityX = (Math.random() - 0.5) * config.driftSpeed * 2;
		const velocityY = (Math.random() - 0.5) * config.driftSpeed * 2;

		const particle = new Particle(`ambientDust-${Date.now()}-${Math.random()}`, 'background', x, y, {
			type: 'square',
			velocityX: velocityX,
			velocityY: velocityY,
			lifetime: lifetime,
			size: size,
			shrink: false,
			rotate: true,
			rotationSpeed: rotationSpeed,
			color: config.color,
			alpha: alpha,
			alphaDecay: alpha / lifetime,
			fadeOut: false,
			growShrink: true,
		});

		game.addEntity(particle);
		const particleRender = particle.getComponent('render') as RenderComponent;
		game.renderLayers.background.addChild(particleRender.graphic);
	}

	// Configuration methods for tweaking dust behavior
	static setAmbientDustDensity(maxParticles: number, spawnRate: number): void {
		this.ambientDustConfig.maxParticles = maxParticles;
		this.ambientDustConfig.spawnRate = spawnRate;
	}

	static setAmbientDustColor(color: number): void {
		this.ambientDustConfig.color = color;
	}

	static setAmbientDustSize(minSize: number, maxSize: number): void {
		this.ambientDustConfig.minSize = minSize;
		this.ambientDustConfig.maxSize = maxSize;
	}

	static setAmbientDustLifetime(minLifetime: number, maxLifetime: number): void {
		this.ambientDustConfig.minLifetime = minLifetime;
		this.ambientDustConfig.maxLifetime = maxLifetime;
	}

	static setAmbientDustAlpha(minAlpha: number, maxAlpha: number): void {
		this.ambientDustConfig.minAlpha = minAlpha;
		this.ambientDustConfig.maxAlpha = maxAlpha;
	}

	static setAmbientDustDriftSpeed(speed: number): void {
		this.ambientDustConfig.driftSpeed = speed;
	}

	static setAmbientDustRotationSpeed(minRotationSpeed: number, maxRotationSpeed: number): void {
		this.ambientDustConfig.minRotationSpeed = minRotationSpeed;
		this.ambientDustConfig.maxRotationSpeed = maxRotationSpeed;
	}
}