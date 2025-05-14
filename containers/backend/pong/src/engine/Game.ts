/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Game.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 09:43:00 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/14 20:11:59 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// Import Pixi and Howler stuff
import { Application, Container, Graphics } from 'pixi.js';
import { Howl } from 'howler';

// Import Engine elements (ECS)
import { Entity } from '../engine/Entity';
import { System } from '../engine/System';

// Import defined entities
import { Wall } from '../entities/Wall';
import { Paddle } from '../entities/Paddle'
import { UI } from '../entities/UI'
import { PostProcessingLayer } from '../entities/PostProcessingLayer'

// Import built components
import { RenderComponent } from '../components/RenderComponent';
import { TextComponent } from '../components/TextComponent';

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
import { CrossCutSystem } from '../systems/CrossCutSystem';

// Import spawners
import { BallSpawner } from '../spawners/BallSpawner'

// Import exported types and utils
import { FrameData, GameEvent, GameSounds, World, WORLD_COLORS, Player } from '../utils/Types'
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
	paddleOffset: number;
	renderLayers: {
		bounding: Container;
		background: Container;
		midground: Container;
		foreground: Container;
		powerup: Container;
		powerdown: Container;
		ballChange: Container;
		crossCut: Container;
		ui: Container;
		pp: Container;
	};
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
		this.paddleOffset = 50;

		this.renderLayers = {
			bounding: new Container(),
			background: new Container(),
			midground: new Container(),
			foreground: new Container(),
			powerup: new Container(),
			powerdown: new Container(),
			ballChange: new Container(),
			crossCut: new Container(),
			ui: new Container(),
			pp: new Container()
		};
		this.visualRoot = new Container();
		this.visualRoot.sortableChildren = true;

		this.app.stage.addChild(this.renderLayers.background);
		this.app.stage.addChild(this.renderLayers.powerup);
		this.app.stage.addChild(this.renderLayers.powerdown);
		this.app.stage.addChild(this.renderLayers.ballChange);
		this.app.stage.addChild(this.renderLayers.crossCut);
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
		console.log('Sounds loaded');

		this.app.ticker.add((ticker) => {
			//!DEBUG
			/* console.log("Current entities:", Array.from(this.entities.entries()).map(([id, entity]) => ({
				id,
				type: entity.constructor.name
			}))); */
			
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
		const worldSystem = new WorldSystem(this);
		const animationSystem = new AnimationSystem(this);
		const vfxSystem = new VFXSystem();
		const particleSystem = new ParticleSystem(this);
		const uiSystem = new UISystem(this);
		const powerupSystem = new PowerupSystem(this, this.width, this.height);
		const postProcessingSystem = new PostProcessingSystem();
		const crossCutSystem = new CrossCutSystem(this);
		
		this.systems.push(renderSystem);
		this.systems.push(inputSystem);
		this.systems.push(crossCutSystem);
		this.systems.push(physicsSystem);
		this.systems.push(worldSystem);
		this.systems.push(animationSystem);
		this.systems.push(vfxSystem);
		this.systems.push(particleSystem);
		this.systems.push(uiSystem);
		this.systems.push(powerupSystem);
		this.systems.push(postProcessingSystem);
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
			powerdown: new Howl({ 
				src: ['src/assets/sfx/powerdown.wav'],
				preload: true 
			}),
			ballchange: new Howl({ 
				src: ['src/assets/sfx/ballchange.wav'],
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
			const response = await fetch('../../data/players.json');
			playerData = await response.json();
		} catch (error) {
			console.error("Failed to fetch player data, using mock data:", error);
		}

		console.log(playerData.type);

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
		const paddleL = new Paddle('paddleL', 'foreground', this, this.paddleOffset, this.height / 2, true, leftPlayer.name);
		const paddleLRender = paddleL.getComponent('render') as RenderComponent;
		const paddleLText = paddleL.getComponent('text') as TextComponent;
		this.renderLayers.foreground.addChild(paddleLRender.graphic);
		this.renderLayers.foreground.addChild(paddleLText.getRenderable());
		this.entities.push(paddleL);
		console.log("Left paddle created");
		
		const paddleR = new Paddle('paddleR', 'foreground', this, this.width - this.paddleOffset, this.height / 2, false, rightPlayer.name);
		const paddleRRender = paddleR.getComponent('render') as RenderComponent;
		const paddleRText = paddleR.getComponent('text') as TextComponent;
		this.renderLayers.foreground.addChild(paddleRRender.graphic);
		this.renderLayers.foreground.addChild(paddleRText.getRenderable());
		this.entities.push(paddleR);
		console.log("Right paddle created");

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

		// Spawn Ball
		BallSpawner.spawnDefaultBall(this);
	}

	populateWorlds() {
		this.worldPool = {
			desertWorld: createWorld('desert', 'Desert of Spiked Reflections', WORLD_COLORS.marine),
			cityWorld: createWorld('ruins', 'Ruins of Yonder', WORLD_COLORS.marine),
			abyssWorld: createWorld('abyss', 'Pelagic Netherscape', WORLD_COLORS.marine),
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
		boundingBox.stroke({width: 0.1, color: '#171717'});
		this.renderLayers.bounding.addChild(boundingBox);
		
	}
}