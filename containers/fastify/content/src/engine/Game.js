/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Game.js                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/09 16:16:07 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/11 17:48:26 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { RenderSystem } from '../systems/RenderSystem.js';
import { PhysicsSystem } from '../systems/PhysicsSystem.js';
import { InputSystem } from '../systems/InputSystem.js';
import { VFXSystem } from '../systems/VFXSystem.js';
import { Background } from '../entities/Background.js'
import { Ball } from '../entities/Ball.js'
import { Paddle } from '../entities/Paddle.js'
import { Wall } from '../entities/Wall.js'

export class PongGame {
	constructor (){
		this.width = 1500;
		this.height = 800;
		this.app = null;
		this.entities = [];
		this.systems = [];
	}

	async init() {
		// Initialize PIXI app and Canvas
		console.log("Initilizing PongGame...");
		this.app = new PIXI.Application();
		await this.app.init({
			background: 'black',
			width: this.width,
			height: this.height,
			antialias: true,
		});

		const gameContainer = document.getElementById('game-container');
		if (!gameContainer) {
			throw new Error("Game container not found!");
		}
		gameContainer.appendChild(this.app.canvas);
		console.log("Canvas added to game container.");

		// Initialize systems
		this.initSystems();

		// Create entities
		await this.createEntities();

		// Start game loop
		this.app.ticker.add(this.gameLoop.bind(this));
	}

	// Helper function to initialize all existing game systems
	initSystems() {
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
		// Create Background
		const background = new Background('background', this.width, this.height);
		this.app.stage.addChild(background.getComponent('render').graphic);
		this.entities.push(background);
		console.log("Background created.");

		// Create Top Wall
		const wallT = new Wall('wallT', this.width, this.height, 15, 60);
		this.app.stage.addChild(wallT.getComponent('render').graphic);
		this.entities.push(wallT);
		console.log("wallT created.");

		//Create Bottom Wall
		const wallB = new Wall('wallB', this.width, this.height, 15, this.height - 80);
		this.app.stage.addChild(wallB.getComponent('render').graphic);
		this.entities.push(wallB);
		console.log("wallB created.");
		
		// Create Ball
		const ball = new Ball('ball', this.width / 2, this.height / 2);
		this.app.stage.addChild(ball.getComponent('render').graphic);
		this.entities.push(ball);
		console.log("Ball created.");

		//Create left paddle
		const paddleL = new Paddle('paddleL', 40, this.height / 2, true);
		this.app.stage.addChild(paddleL.getComponent('render'). graphic);
		if (paddleL.getComponent('text')) {
			this.app.stage.addChild(paddleL.getComponent('text').getRenderable());
		}
		this.entities.push(paddleL);
		console.log("PaddleL created.");

		//Create right paddle
		const paddleR = new Paddle('paddleR', this.width - 40, this.height / 2, false);
		this.app.stage.addChild(paddleR.getComponent('render'). graphic);
		if (paddleR.getComponent('text')) {
			this.app.stage.addChild(paddleR.getComponent('text').getRenderable());
		}
		this.entities.push(paddleR);
		console.log("PaddleR created.");
	}

	gameLoop(delta) {
		this.systems.forEach(system => {
			system.update(this.entities, delta);
		});
	}
}