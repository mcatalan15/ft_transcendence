/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Game.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: nponchon <nponchon@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 09:43:00 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/28 10:45:44 by nponchon         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// Import Pixi and Howler stuff
import { Application, Container, Graphics } from 'pixi.js';
import { Howl } from 'howler';

// Import Engine elements (ECS)
import { Entity } from '../engine/Entity';
import { Component } from '../engine/Component';
import { System } from '../engine/System';

// Import defined entities
import { Wall } from '../entities/Wall';
import { Paddle } from '../entities/Paddle'
import { Ball } from '../entities/Ball'
import { UI } from '../entities/UI'
import { PostProcessingLayer } from '../entities/PostProcessingLayer'

// Import built components
import { RenderComponent } from '../components/RenderComponent';
import { TextComponent } from '../components/TextComponent';
import { PhysicsComponent } from '../components/PhysicsComponent';

// Import Implemented Systems
import { RenderSystem } from '../systems/RenderSystem';
import { InputSystem } from '../systems/InputSystem';
import { PhysicsSystem } from '../systems/PhysicsSystem';
import { AnimationSystem } from '../systems/AnimationSystem';
import { VFXSystem } from '../systems/VFXSystem';
import { ParticleSystem } from '../systems/ParticleSystem';
import { UISystem } from '../systems/UISystem';
import { PowerupSystem } from '../systems/PowerupSystem';
import { PostProcessingSystem } from '../systems/PostProcessingSystem';
import { WorldSystem } from '../systems/WorldSystem';

// Import exported types and utils
import { FrameData, GameEvent, GameSounds, World, WORLD_COLORS, Player, PlayerData } from '../utils/Types'
import { createWorld } from '../utils/Utils'

export class PongGame {
	app: Application;
	width: number;
	height: number;
	entities: Entity[];
    systems: System[];
    eventQueue: GameEvent[];
    topWallOffset: number;
    bottomWallOffset: number;
    wallThickness: number;
	renderLayers: {
		bounding: Container;
		background: Container;
		midground: Container;
		foreground: Container;
		powerup: Container;
		ui: Container;
		pp: Container;
	};
	backgroundLayer: Container;
	powerupLayer: Container;
	visualRoot: Container;
	sounds!: GameSounds;
	worldPool!: {
		desertWorld: World,
		cityWorld: World,
		abyssWorld: World,
	};
	currentWorld!: World;

	constructor(app: Application) {
		this.app = app;
		this.width = app.screen.width;
		this.height = app.screen.height;
		this.entities = [];
        this.systems = [];
        this.eventQueue = [];
        this.topWallOffset = 60;
        this.bottomWallOffset = 80;
        this.wallThickness = 20;

		this.renderLayers = {
			bounding: new Container(),
			background: new Container(),
			midground: new Container(),
			foreground: new Container(),
			powerup: new Container(),
			ui: new Container(),
			pp: new Container()
		};
		this.backgroundLayer = new Container();
		this.powerupLayer = new Container();
		this.visualRoot = new Container();
		this.visualRoot.sortableChildren = true;
			
		this.backgroundLayer.addChild(this.renderLayers.background);
		this.powerupLayer.addChild(this.renderLayers.powerup);
		this.app.stage.addChild(this.backgroundLayer);
		this.app.stage.addChild(this.powerupLayer);
		this.app.stage.addChild(this.visualRoot);

		this.visualRoot.addChild(this.renderLayers.bounding);
		this.visualRoot.addChild(this.renderLayers.midground);
		this.visualRoot.addChild(this.renderLayers.foreground);
		this.visualRoot.addChild(this.renderLayers.pp);

		this.visualRoot.addChild(this.renderLayers.ui);
	}

	async init(): Promise<void> {
		console.log("Initializing PongGame...");
		
		await this.createEntities();
		console.log('All Entities created');

		this.populateWorlds();
		this.currentWorld = this.worldPool.desertWorld;

		this.initSystems();
		console.log('All Systems initialiazed');

		this.initSounds();
		console.log('Sounds lodaded');

		this.app.ticker.add((ticker) => {
			//!DEBUG
			/*console.log("Current entities:", Array.from(this.entities.entries()).map(([id, entity]) => ({
				id,
				type: entity.constructor.name
			})));*/
			
			const frameData: FrameData = {
				deltaTime: ticker.deltaTime
			};
		
			this.systems.forEach(system => {
				system.update(this.entities, frameData);
			});
		});
	}

	initSystems(): void {
		const renderSystem = new RenderSystem();
		const inputSystem = new InputSystem();
		const physicsSystem = new PhysicsSystem(this, this.width, this.height);
		const animationSystem = new AnimationSystem(this, this.app, this.width, this.height, this.topWallOffset, this.bottomWallOffset, this.wallThickness);
		const vfxSystem = new VFXSystem(this, this.width, this.height);
		const particleSystem = new ParticleSystem(this);
		const uiSystem = new UISystem(this, this.app);
		const powerupSystem = new PowerupSystem(this, this.app, this.width, this.height);
		const postProcessingSystem = new PostProcessingSystem();
		const worldSystem = new WorldSystem(this, this.app);

		this.systems.push(renderSystem);
		this.systems.push(inputSystem);
		this.systems.push(physicsSystem);
		this.systems.push(animationSystem);
		this.systems.push(vfxSystem);
		this.systems.push(particleSystem);
		this.systems.push(uiSystem);
		this.systems.push(powerupSystem);
		this.systems.push(postProcessingSystem);
		this.systems.push(worldSystem);
	}

	initSounds(): void {
		this.sounds = {
			pong: new Howl({ 
				src: ['src/assets/sfx/pong.wav'],
				preload: true
			}),
			powerup: new Howl({ 
				src: ['src/assets/sfx/powerup.wav'],
				preload: true 
			}),
			death: new Howl({ 
				src: ['src/assets/sfx/death.wav'],
				preload: true
			}),
			paddleReset: new Howl({ 
				src: ['src/assets/sfx/paddleReset.wav'],
				preload: true
			}),
		};
		
		// Create a better warm-up mechanism
		const warmUpAudio = () => {
			// Only attempt warm-up on user interaction
			const silence = new Howl({
				src: ['data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA'],
				volume: 0.01
			});
			silence.play();
		};
		
		// Add the warm-up to a user interaction event
		document.addEventListener('click', warmUpAudio, { once: true });
		document.addEventListener('keydown', warmUpAudio, { once: true });
	}

	async createEntities(): Promise<void>  {
		//Fetch player info from jsons
		let playerData;
		try {
			const response = await fetch('../../players.json');
			playerData = await response.json();
		} catch (error) {
			console.error("Failed to fetch player data, using mock data:", error);
		}

		const leftPlayer = playerData.players.find((p: Player) => p.id === "paddleL") || { name: "Player 1" };
		const rightPlayer = playerData.players.find((p: Player) => p.id === "paddleR") || { name: "Player 2" };

		console.log(`${leftPlayer.name}  vs  ${rightPlayer.name}`);

		
		// Create Bounding Box
		this.createBoundingBox();
		
		// Create Walls
		const wallT = new Wall('wallT', 'foreground', this.width, this.wallThickness, this.topWallOffset);
		const wallTRender = wallT.getComponent('render') as RenderComponent;
		this.renderLayers.foreground.addChild(wallTRender.graphic)
		this.entities.push(wallT);
		console.log("Top Wall created");

		const wallB = new Wall('wallB', 'foreground', this.width, this.wallThickness, this.height - (this.bottomWallOffset - this.wallThickness));
		const wallBRender = wallB.getComponent('render') as RenderComponent;
		this.renderLayers.foreground.addChild(wallBRender.graphic);
		this.entities.push(wallB);
		console.log("Bottom wall created");

		// Create Paddles
		const paddleL = new Paddle('paddleL', 'foreground', this, 40, this.height / 2, true, leftPlayer.name);
		const paddleLRender = paddleL.getComponent('render') as RenderComponent;
		const paddleLText = paddleL.getComponent('text') as TextComponent;
		this.renderLayers.foreground.addChild(paddleLRender.graphic);
		this.renderLayers.foreground.addChild(paddleLText.getRenderable());
		this.entities.push(paddleL);
		console.log("Left paddle created");
		
		const paddleR = new Paddle('paddleR', 'foreground', this, this.width - 40, this.height / 2, false, rightPlayer.name);
		const paddleRRender = paddleR.getComponent('render') as RenderComponent;
		const paddleRText = paddleR.getComponent('text') as TextComponent;
		this.renderLayers.foreground.addChild(paddleRRender.graphic);
		this.renderLayers.foreground.addChild(paddleRText.getRenderable());
		this.entities.push(paddleR);
		console.log("Right paddle created");

		// Create Ball
		const ball = new Ball('ball', 'foreground', this.width / 2, this.height / 2);
		const ballRender = ball.getComponent('render') as RenderComponent;
		this.renderLayers.foreground.addChild(ballRender.graphic);
		this.entities.push(ball);
		console.log("Ball created")

		// Create UI
		const ui = new UI('UI', 'ui', this.width, this.height, this.topWallOffset);
		const uiText = ui.getComponent('text') as TextComponent;
		this.renderLayers.ui.addChild(uiText.getRenderable());
		this.entities.push(ui);
		console.log("UI created")

		// Create Postprocessing Layer
		const postProcessingLayer = new PostProcessingLayer('postProcessing', 'pp', this);
		const ppRender = postProcessingLayer.getComponent('render') as RenderComponent;
		this.renderLayers.pp.addChild(ppRender.graphic);
		this.entities.push(postProcessingLayer);
		console.log("PostProcessing Layer created")
	}

	populateWorlds() {
		this.worldPool = {
			desertWorld: createWorld('Desert of Spiked Reflections', WORLD_COLORS.fire),
			cityWorld: createWorld('Ruins of Yonder', WORLD_COLORS.city),
			abyssWorld: createWorld('Pelagic Netherscape', WORLD_COLORS.void),
		};
	}

	addEntity(entity: Entity): void {
		this.entities.push(entity);
		let targetLayer = this.renderLayers.midground;
	
		if (entity.layer) {
			switch(entity.layer) {
				case 'background': targetLayer = this.renderLayers.background; break;
				case 'foreground': targetLayer = this.renderLayers.foreground; break;
				case 'ui': targetLayer = this.renderLayers.ui; break;
				case 'pp': targetLayer = this.renderLayers.pp; break;
			}
		}
	
		const render = entity.getComponent('render') as RenderComponent;
		if (render?.graphic) {
			targetLayer.addChild(render.graphic);
		}
		
		const text = entity.getComponent('text') as TextComponent;
		if (text?.getRenderable) {
			targetLayer.addChild(text.getRenderable());
		}
	}

	removeEntity(entityId: string): void {
		const index = this.entities.findIndex(e => e.id === entityId);
		if (index !== -1) {
			const entity = this.entities[index];

			const render = entity.getComponent('render') as RenderComponent;
			if (render) {
				render.graphic.destroy();
			}

			const text = entity.getComponent('text') as TextComponent;
			if (text) {
				text.getRenderable().destroy;
			}

			this.entities.splice(index, 1);
		}
	}

	createBoundingBox() {
		const boundingBox = new Graphics();
		boundingBox.rect(0, 0, this.width, this.height);
		boundingBox.stroke('#171717');
		this.renderLayers.bounding.addChild(boundingBox);;
	}
}