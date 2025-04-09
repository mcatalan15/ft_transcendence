/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Game.js                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/01 11:26:23 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/09 10:05:13 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { RenderSystem } from '../systems/RenderSystem.js';
import { PhysicsSystem } from '../systems/PhysicsSystem.js';
import { InputSystem } from '../systems/InputSystem.js';
import { VFXSystem } from '../systems/VFXSystem.js';
import { Borders } from '../entities/Borders.js'
import { Paddle } from '../entities/Paddle.js'
import { Ball } from '../entities/Ball.js'

export class PongGame {
	constructor() {
		this.width = 1920;
		this.height = 1080;
		this.app = null;
		this.entities = [];
		this.systems = [];
	}

	async init() {
		console.log("Initializing PongGame...");
		this.app = new PIXI.Application();
		await this.app.init({ background: 'black', width: this.width, height: this.height });

		const gameContainer = document.getElementById('game-container');
		if (!gameContainer) {
			throw new Error("Game container not found!");
		}

		gameContainer.appendChild(this.app.canvas);
		console.log("Canvas added to game container");

		// Initialize systems
		this.initSystems();

		// Fetch and create entities
		await this.createEntities();

		// Start game loop
		this.app.ticker.add(this.gameLoop.bind(this));
	}

	initSystems() {
		// Import and initialize all game systems
		const renderSystem = new RenderSystem(this.app);
		const physicsSystem = new PhysicsSystem(this.width, this.height);
		const inputSystem = new InputSystem();
		const vfxSystem = new VFXSystem();

		this.systems.push(renderSystem);
		this.systems.push(physicsSystem);
		this.systems.push(inputSystem);
		this.systems.push(vfxSystem);
	}

	async createEntities() {
		// Fetch player data
		let playerData;
		try {
			const response = await fetch('../../data/players.json'); // If using an actual JSON file
			playerData = await response.json();
		} catch (error) {
			console.error("Failed to fetch player data, using mock data:", error);
			playerData = mockPlayerData; // Fallback to local mock data
		}

		// Create borders
		const borders = new Borders(this.width, this.height, 400);
		borders.getEntities().forEach(entity => {
			const render = entity.getComponent('render');
			const physics = entity.getComponent('physics');
			
			console.log(`Entity ${entity.id} components:`, {
				render: !!render,
				physics: !!physics,
				physicsData: physics ? { x: physics.x, y: physics.y } : null
			});
    
	    		if (render) {
        		this.app.stage.addChild(render.graphic);
    		}
    		this.entities.push(entity);
		});

		// Find paddle data
		const leftPlayer = playerData.players.find(p => p.id === "paddleL") || { name: "Player 1" };
		const rightPlayer = playerData.players.find(p => p.id === "paddleR") || { name: "Player 2" };

		// Create paddles with fetched names
		const paddleL = new Paddle('paddleL', 40, this.height / 2 - 50, true, leftPlayer.name);
		this.app.stage.addChild(paddleL.getComponent('render').graphic);
		this.app.stage.addChild(paddleL.getComponent('text').textObject);
		this.entities.push(paddleL);

		const paddleR = new Paddle('paddleR', this.width - 50, this.height / 2 - 50, false, rightPlayer.name);
		this.app.stage.addChild(paddleR.getComponent('render').graphic);
		this.app.stage.addChild(paddleR.getComponent('text').textObject);
		this.entities.push(paddleR);

		// Create ball
		const ball = new Ball('ball', this.width / 2, this.height / 2);
		this.app.stage.addChild(ball.getComponent('render').graphic);
		this.entities.push(ball);
	}

	gameLoop(delta) {
		// Update all systems
		this.systems.forEach(system => {
			if (system instanceof VFXSystem) {
				// Always update VFX (optional if troubleshooting)
				console.log("Updating VFX system");
			}
			system.update(this.entities, delta);
		});
	}
}