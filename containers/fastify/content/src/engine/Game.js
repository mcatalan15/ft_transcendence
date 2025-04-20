/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Game.js                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: marvin <marvin@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/09 16:16:07 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/20 12:46:10 by marvin           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { RenderSystem } from '../systems/RenderSystem.js';
import { PhysicsSystem } from '../systems/PhysicsSystem.js';
import { InputSystem } from '../systems/InputSystem.js';
import { VFXSystem } from '../systems/VFXSystem.js';
import { ParticleSystem } from '../systems/ParticleSystem.js';
import { UISystem } from '../systems/UISystem.js';
import { AnimationSystem} from '../systems/AnimationSystem.js'
import { PowerupSystem} from '../systems/PowerupSystem.js'
import { PostProcessingSystem} from '../systems/PostProcessingSystem.js'
import { Ball } from '../entities/Ball.js'
import { Paddle } from '../entities/Paddle.js'
import { Wall } from '../entities/Wall.js'
import { UI } from '../entities/UI.js'
import { PostProcessingLayer } from '../entities/PostProcessingLayer.js'

export class PongGame {
	constructor (){
		this.width = 1500; //1500
		this.height = 500; //500
		this.app = null;
		this.entities = [];
		this.systems = [];
		this.eventQueue = [];
		this.topWallOffset = 40;
		this.bottomWallOffset = 60;
		this.wallThickness = 20;
	}

	async init() {
		// Initialize PIXI app and Canvas
		console.log("Initilizing PongGame...");
		this.app = new PIXI.Application();
		await this.app.init({
			background: '#131010',
			width: this.width,
			height: this.height,
			antialias: true,
			resolution: 2,
			autoDensity: true,
		});

		const gameContainer = document.getElementById('game-container');
		if (!gameContainer) {
			throw new Error("Game container not found!");
		}
		gameContainer.appendChild(this.app.canvas);
		console.log("Canvas added to game container.");

		// Setup render layers
		this.renderLayers = {
			background: new PIXI.Container(),
			midground: new PIXI.Container(),
			foreground: new PIXI.Container(),
			ui: new PIXI.Container(),
			pp: new PIXI.Container(),
		};

		// Create parent container for postProcessing
		this.visualRoot = new PIXI.Container();
		this.visualRoot.sortableChildren = true;
		
		// zIndex sorted
		this.app.stage.addChild(this.renderLayers.background);
		this.app.stage.addChild(this.visualRoot);

		//this.visualRoot.addChild(this.renderLayers.background); //Off because the depth lines with scanlines is giving me a headache
		this.visualRoot.addChild(this.renderLayers.midground);
		this.visualRoot.addChild(this.renderLayers.foreground);
		//this.visualRoot.addChild(this.renderLayers.ui);
		this.visualRoot.addChild(this.renderLayers.pp);

		this.app.stage.addChild(this.renderLayers.ui);
		//this.app.stage.addChild(this.renderLayers.background);
		

		// Initialize systems
		this.initSystems();

		// Create entities
		await this.createEntities();

		// Start game loop
		this.app.ticker.add(this.gameLoop.bind(this));
	}

	// Helper function to initialize all existing game systems
	initSystems() {
		const renderSystem = new RenderSystem(this, this.app);
		const physicsSystem = new PhysicsSystem(this, this.width, this.height);
		const inputSystem = new InputSystem();
		const vfxSystem = new VFXSystem(this, this.width, this.height);
		const particleSystem = new ParticleSystem(this);
		const uiSystem = new UISystem(this, this.app);
		const animationSystem = new AnimationSystem(this, this.app, this.width, this.height, this.topWallOffset, this.bottomWallOffset, this.wallThickness);
		const postProcessingSystem = new PostProcessingSystem();
		const powerupSystem = new PowerupSystem(this, this.app, this.width, this.height)

		this.systems.push(renderSystem);
		this.systems.push(physicsSystem);
		this.systems.push(inputSystem);
		this.systems.push(vfxSystem);
		this.systems.push(particleSystem);
		this.systems.push(uiSystem);
		this.systems.push(animationSystem);
		this.systems.push(postProcessingSystem);
		this.systems.push(powerupSystem);
	}

	async createEntities() {
		// Create Top Wall
		const wallT = new Wall('wallT', 'foreground', this.width, this.height, this.wallThickness, this.topWallOffset);
		this.renderLayers.foreground.addChild(wallT.getComponent('render').graphic);
		this.entities.push(wallT);
		console.log("wallT created.");

		//Create Bottom Wall
		const wallB = new Wall('wallB', 'foreground', this.width, this.height, this.wallThickness, this.height - this.bottomWallOffset);
		this.renderLayers.foreground.addChild(wallB.getComponent('render').graphic);
		this.entities.push(wallB);
		console.log("wallB created.");
		
		// Create Ball
		const ball = new Ball('ball', 'foreground', this.width / 2, this.height / 2);
		this.renderLayers.foreground.addChild(ball.getComponent('render').graphic);
		this.entities.push(ball);
		console.log("Ball created.");

		//Create left paddle
		const paddleL = new Paddle('paddleL', 'foreground', 40, this.height / 2, true);
		this.renderLayers.foreground.addChild(paddleL.getComponent('render'). graphic);
		if (paddleL.getComponent('text')) {
			this.renderLayers.foreground.addChild(paddleL.getComponent('text').getRenderable());
		}
		this.entities.push(paddleL);
		console.log("PaddleL created.");

		//Create right paddle
		const paddleR = new Paddle('paddleR', 'foreground', this.width - 40, this.height / 2, false);
		this.renderLayers.foreground.addChild(paddleR.getComponent('render'). graphic);
		if (paddleR.getComponent('text')) {
			this.renderLayers.foreground.addChild(paddleR.getComponent('text').getRenderable());
		}
		this.entities.push(paddleR);
		console.log("PaddleR created.");

		// Create UI
		const overlay = new UI('UI', 'ui', this.width, this.height, this.topWallOffset - this.wallThickness);
		this.renderLayers.ui.addChild(overlay.getComponent('text').getRenderable());
		this.entities.push(overlay);
		console.log("UI created.");

		// Create Postprocessing Layer
		const postProcessingLayer = new PostProcessingLayer('postProcessing', 'pp', this, this.app, this.renderLayers);
		this.renderLayers.pp.addChild(postProcessingLayer.getComponent('render').graphic);
		this.entities.push(postProcessingLayer);
		console.log("PostProcessingLayer created.");
	}

	addEntity(entity) {
		this.entities.push(entity);
		let targetLayer = this.renderLayers.midground;

		if (entity.layer) {
			switch(entity.layer) {
				case 'background': 
					targetLayer = this.renderLayers.background; 
					break;
				case 'foreground': 
					targetLayer = this.renderLayers.foreground; 
					break;
				case 'ui': 
					targetLayer = this.renderLayers.ui; 
					break;
				case 'pp': 
					targetLayer = this.renderLayers.pp; 
					break;
			}
		}

		const render = entity.getComponent?.('render');
		if (render?.graphic) {
			targetLayer.addChild(render.graphic);
		}
	
		const text = entity.getComponent?.('text');
		if (text?.getRenderable) {
			targetLayer.addChild(text.getRenderable());
		}
	}
	
	removeEntity(entityId) {
		const index = this.entities.findIndex(e => e.id === entityId);
		if (index !== -1) {
			const entity = this.entities[index];
			const render = entity.getComponent?.('render');
			if (render?.graphic?.destroy) {
				render.graphic.destroy();
			}
			const text = entity.getComponent?.('text');
			if (text?.getRenderable()?.destroy) {
				text.getRenderable().destroy();
			}
			this.entities.splice(index, 1);
		}
	}

	gameLoop(delta) {
		this.systems.forEach(system => {
			system.update(this.entities, delta);
		});
	}
}