/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   MenuParticleSpawner.ts                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 12:39:10 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/17 12:04:25 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Menu } from '../Menu';

import { RenderComponent } from '../../components/RenderComponent';

import { Particle } from '../../entities/Particle';

import { GAME_COLORS } from '../../utils/Types';


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

export class MenuParticleSpawner {
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

	static spawnBasicExplosion(menu: Menu, x: number, y: number, color: number, sizeFactor: number): void {
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

			menu.addEntity(particle);
			const particleRender = particle.getComponent('render') as RenderComponent;
			menu.renderLayers.dust.addChild(particleRender.graphic);
		}
	}

	static updateAmbientDust(menu: Menu, deltaTime: number, gameWidth: number, gameHeight: number): void {
		const currentTime = Date.now();
		const config = this.ambientDustConfig;

		this.ambientParticleCount = 0;
		for (const entity of menu.entities) {
			if (entity.id.startsWith('ambientDust-')) {
				this.ambientParticleCount++;
			}
		}

		const timeSinceLastSpawn = currentTime - this.lastAmbientSpawn;
		const spawnInterval = 1000 / config.spawnRate;

		if (this.ambientParticleCount < config.maxParticles && timeSinceLastSpawn >= spawnInterval) {
			this.spawnAmbientDustParticle(menu, gameWidth, gameHeight);
			this.lastAmbientSpawn = currentTime;
		}
	}

	private static spawnAmbientDustParticle(menu: Menu, gameWidth: number, gameHeight: number): void {
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
		menu.addEntity(particle);
		const particleRender = particle.getComponent('render') as RenderComponent;
		menu.renderLayers.background.addChild(particleRender.graphic);
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

	// Secret code stuff

	static spawnFireworksExplosion(menu: Menu, x: number, y: number, color: number, intensity: number = 1.0): void {
		const particleCount = Math.floor(15 * intensity);
		const burstRadius = 80 * intensity;
		
		for (let i = 0; i < particleCount; i++) {
			const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.3;
			const speed = Math.random() * 8 + 6;
			const distance = Math.random() * burstRadius + 20;
			
			const velocityX = Math.cos(angle) * speed;
			const velocityY = Math.sin(angle) * speed;
			
			const startX = x + Math.cos(angle) * (distance * 0.1);
			const startY = y + Math.sin(angle) * (distance * 0.1);
			
			// Main burst particles
			const mainParticle = new Particle(`firework-main-${Date.now()}-${i}`, 'foreground', startX, startY, {
				type: Math.random() > 0.5 ? 'circle' : 'square',
				velocityX: velocityX,
				velocityY: velocityY,
				lifetime: Math.random() * 40 + 30,
				size: (Math.random() * 8 + 4) * intensity,
				shrink: true,
				rotate: true,
				rotationSpeed: (Math.random() - 0.5) * 0.1,
				color: color,
				alpha: Math.random() * 0.4 + 0.6,
				alphaDecay: 0.02,
				fadeOut: true,
				growShrink: true
			});

			menu.addEntity(mainParticle);
			const mainParticleRender = mainParticle.getComponent('render') as RenderComponent;
			menu.renderLayers.dust.addChild(mainParticleRender.graphic);

			setTimeout(() => {
				this.spawnTrailingSparkles(menu, startX + velocityX * 10, startY + velocityY * 10, color, intensity * 0.5);
			}, Math.random() * 500 + 200);
		}
		
		const flashParticle = new Particle(`firework-flash-${Date.now()}`, 'foreground', x, y, {
			type: 'circle',
			velocityX: 0,
			velocityY: 0,
			lifetime: 15,
			size: 30 * intensity,
			shrink: true,
			rotate: false,
			color: color,
			alpha: 0.8,
			alphaDecay: 0.05,
			fadeOut: true,
			growShrink: true
		});
		
		menu.addEntity(flashParticle);
		const flashParticleRender = flashParticle.getComponent('render') as RenderComponent;
    	menu.renderLayers.dust.addChild(flashParticleRender.graphic);

		setTimeout(() => {
			this.spawnSecondaryBursts(menu, x, y, color, intensity * 0.7);
		}, Math.random() * 800 + 400);
	}
	
	private static spawnTrailingSparkles(menu: Menu, x: number, y: number, color: number, intensity: number): void {
		const sparkleCount = Math.floor(Math.random() * 5 + 3);
		
		for (let i = 0; i < sparkleCount; i++) {
			const angle = Math.random() * Math.PI * 2;
			const speed = Math.random() * 3 + 1;
			
			const sparkle = new Particle(`firework-sparkle-${Date.now()}-${i}`, 'foreground', 
				x + (Math.random() - 0.5) * 10, 
				y + (Math.random() - 0.5) * 10, {
				type: 'triangle',
				velocityX: Math.cos(angle) * speed,
				velocityY: Math.sin(angle) * speed,
				lifetime: Math.random() * 20 + 15,
				size: (Math.random() * 4 + 2) * intensity,
				shrink: true,
				rotate: true,
				rotationSpeed: (Math.random() - 0.5) * 0.2,
				color: this.lightenColor(color, 0.3),
				alpha: Math.random() * 0.6 + 0.4,
				alphaDecay: 0.03,
				fadeOut: true,
				growShrink: true
			});
			
			menu.addEntity(sparkle);
			const sparkleRender = sparkle.getComponent('render') as RenderComponent;
        	menu.renderLayers.dust.addChild(sparkleRender.graphic);
		}
	}
	
	private static spawnSecondaryBursts(menu: Menu, x: number, y: number, color: number, intensity: number): void {
		const burstCount = Math.floor(Math.random() * 3 + 2);
		
		for (let burst = 0; burst < burstCount; burst++) {
			const burstX = x + (Math.random() - 0.5) * 100;
			const burstY = y + (Math.random() - 0.5) * 100;
			const particleCount = Math.floor(Math.random() * 8 + 5);
			
			for (let i = 0; i < particleCount; i++) {
				const angle = Math.random() * Math.PI * 2;
				const speed = Math.random() * 4 + 2;
				
				const secondaryParticle = new Particle(`firework-secondary-${Date.now()}-${burst}-${i}`, 'foreground', burstX, burstY, {
					type: 'circle',
					velocityX: Math.cos(angle) * speed,
					velocityY: Math.sin(angle) * speed,
					lifetime: Math.random() * 25 + 20,
					size: (Math.random() * 5 + 3) * intensity,
					shrink: true,
					rotate: true,
					rotationSpeed: (Math.random() - 0.5) * 0.15,
					color: this.darkenColor(color, 0.2),
					alpha: Math.random() * 0.5 + 0.3,
					alphaDecay: 0.025,
					fadeOut: true,
					growShrink: true
				});
				
				menu.addEntity(secondaryParticle);
				const secondaryRender = secondaryParticle.getComponent('render') as RenderComponent;
				menu.renderLayers.dust.addChild(secondaryRender.graphic);
			}
		}
	}

	private static lightenColor(color: number, factor: number): number {
		const r = (color >> 16) & 0xFF;
		const g = (color >> 8) & 0xFF;
		const b = color & 0xFF;
		
		const newR = Math.min(255, Math.floor(r + (255 - r) * factor));
		const newG = Math.min(255, Math.floor(g + (255 - g) * factor));
		const newB = Math.min(255, Math.floor(b + (255 - b) * factor));
		
		return (newR << 16) | (newG << 8) | newB;
	}
	
	private static darkenColor(color: number, factor: number): number {
		const r = (color >> 16) & 0xFF;
		const g = (color >> 8) & 0xFF;
		const b = color & 0xFF;
		
		const newR = Math.floor(r * (1 - factor));
		const newG = Math.floor(g * (1 - factor));
		const newB = Math.floor(b * (1 - factor));
		
		return (newR << 16) | (newG << 8) | newB;
	}
}