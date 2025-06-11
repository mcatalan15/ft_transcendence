/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Game.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: nponchon <nponchon@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 09:43:00 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/11 10:55:30 by nponchon         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// Import Pixi and Howler stuff
import { Application, Container, Graphics } from 'pixi.js';
import { Howl } from 'howler';

// Import GameConfig
import { GameConfig } from '../menu/GameConfig';

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

// Import pertinent spawners
import { ParticleSpawner } from '../spawners/ParticleSpawner';

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
import { SoundManager } from '../managers/SoundManager';

// Import exported types and utils
import { FrameData, GameEvent, GameSounds, World, Player, GAME_COLORS } from '../utils/Types'

export interface GameConfig {
  classicMode: boolean;
  isOnline?: boolean;
  gameId?: string;
  opponent?: string;
}

export class PongGame {
	config: GameConfig;
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
	paddleWidth: number;
	paddleHeight: number;
	renderLayers: {
		bounding: Container;
		background: Container;
		midground: Container;
		foreground: Container;
		powerup: Container;
		powerupGlitched: Container;
		powerdown: Container;
		ballChange: Container;
		crossCut: Container;
		ui: Container;
		pp: Container;
	};
	visualRoot: Container;
	sounds!: GameSounds;
	soundManager: SoundManager;
	worldPool: World[] = [];
	currentWorld!: World;
	leftPlayer: any = '';
	rightPlayer: any = '';

	isOnline: boolean = false;
	gameId?: string;
	localPlayerNumber?: number;
	networkManager?: any;

	constructor(app: Application, config: GameConfig) {
		this.config = config;
		this.app = app;
		this.width = app.screen.width;
		this.height = app.screen.height;
		this.entities = [];
        this.systems = [];
        this.eventQueue = [];
        this.topWallOffset = 60;
        this.bottomWallOffset = 80;
        this.wallThickness = 20;
		this.paddleOffset = 60;
		this.paddleWidth = 10;
		this.paddleHeight = 80;

		this.isOnline = config.isOnline || false;
		this.gameId = config.gameId;
		
		this.renderLayers = {
			bounding: new Container(),
			background: new Container(),
			midground: new Container(),
			foreground: new Container(),
			powerup: new Container(),
			powerupGlitched: new Container(),
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
		this.app.stage.addChild(this.renderLayers.powerupGlitched);
		this.app.stage.addChild(this.renderLayers.powerdown);
		this.app.stage.addChild(this.renderLayers.ballChange);
		this.app.stage.addChild(this.renderLayers.crossCut);
		this.app.stage.addChild(this.visualRoot);

		this.visualRoot.addChild(this.renderLayers.bounding);
		this.visualRoot.addChild(this.renderLayers.midground);
		this.visualRoot.addChild(this.renderLayers.foreground);
		this.visualRoot.addChild(this.renderLayers.pp);
		this.visualRoot.addChild(this.renderLayers.ui);
		
		if (!this.config.classicMode) {
		this.initSounds();
		this.soundManager = new SoundManager(this.sounds as Record<string, Howl>);
		}
	}

	async init(): Promise<void> {
		console.log(this.config);
		console.log("Initializing PongGame...");
		
		if (!this.app.ticker.started) {
			this.app.ticker.start();
		}
		
		await this.createEntities();
		console.log('All Entities created');
	
		this.initSystems();
		console.log('All Systems initialized');
	
		this.initDust();
		console.log('Sounds loaded');
	
		if (!this.config.classicMode) this.soundManager.startMusic();
	
		this.app.ticker.add((ticker) => {
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
		if (!this.config.classicMode) this.systems.push(crossCutSystem);
		this.systems.push(physicsSystem);
		if (!this.config.classicMode) this.systems.push(worldSystem);
		this.systems.push(animationSystem);
		if (!this.config.classicMode) this.systems.push(vfxSystem);
		if (!this.config.classicMode) this.systems.push(particleSystem);
		this.systems.push(uiSystem);
		if (!this.config.classicMode) this.systems.push(powerupSystem);
		this.systems.push(postProcessingSystem);
	}

	initSounds(): void {
		this.sounds = {
			bgm: new Howl({
				src: this.config.filters ? ['/assets/sfx/music/bgmFiltered01.mp3'] : ['/assets/sfx/music/bgm.mp3'],
				html5: true,
				preload: true,
				loop: true,
				volume: 0.5,
				onload: () => console.log('bgm loaded successfully'),
				onloaderror: (id: number, error: any) => console.error('bgm failed to load:', error)
			}),
			pong: new Howl({ 
				src: ['/assets/sfx/used/pongFiltered02.mp3'],
				html5: true,
				preload: true,
				onload: () => console.log('pong loaded successfully'),
				onloaderror: (id: number, error: any) => console.error('pong failed to load:', error)
			}),
			thud: new Howl({ 
				src: ['/assets/sfx/used/thudFiltered01.mp3'],
				html5: true,
				preload: true,
				volume: 0.3,
				onload: () => console.log('thud loaded successfully'),
				onloaderror: (id: number, error: any) => console.error('thud failed to load:', error)
			}),
			shoot: new Howl({ 
				src: ['/assets/sfx/used/shotFiltered01.mp3'],
				html5: true,
				preload: true,
				volume: 0.3,
				onload: () => console.log('shoot loaded successfully'),
				onloaderror: (id: number, error: any) => console.error('shoot failed to load:', error)
			}),
			hit: new Howl({ 
				src: ['/assets/sfx/used/hitFiltered01.mp3'],
				html5: true,
				preload: true,
				volume: 0.3,
				onload: () => console.log('hit loaded successfully'),
				onloaderror: (id: number, error: any) => console.error('hit failed to load:', error)
			}),
			shieldBreak: new Howl({ 
				src: ['/assets/sfx/used/shieldBreakFiltered01.mp3'],
				html5: true,
				preload: true,
				volume: 0.3,
				onload: () => console.log('shieldBreak loaded successfully'),
				onloaderror: (id: number, error: any) => console.error('shieldBreak failed to load:', error)
			}),
			powerup: new Howl({ 
				src: ['/assets/sfx/used/powerupFiltered01.mp3'],
				html5: true,
				preload: true,
				onload: () => console.log('powerup loaded successfully'),
				onloaderror: (id: number, error: any) => console.error('powerup failed to load:', error)
			}),
			powerdown: new Howl({ 
				src: ['/assets/sfx/used/powerdownFiltered01.mp3'],
				html5: true,
				preload: true,
				onload: () => console.log('powerdown loaded successfully'),
				onloaderror: (id: number, error: any) => console.error('powerdown failed to load:', error)
			}),
			ballchange: new Howl({ 
				src: ['/assets/sfx/used/ballchangeFiltered01.mp3'],
				html5: true,
				preload: true,
				onload: () => console.log('ballchange loaded successfully'),
				onloaderror: (id: number, error: any) => console.error('ballchange failed to load:', error)
			}),
			death: new Howl({ 
				src: ['/assets/sfx/used/explosionFiltered01.mp3'],
				html5: true,
				preload: true,
				onload: () => console.log('death loaded successfully'),
				onloaderror: (id: number, error: any) => console.error('death failed to load:', error)
			}),
			paddleResetUp: new Howl({ 
				src: ['/assets/sfx/recoverUpFiltered01.mp3'],
				html5: true,
				preload: true,
				onload: () => console.log('paddleResetUp loaded successfully'),
				onloaderror: (id: number, error: any) => console.error('paddleResetUp failed to load:', error)
			}),
			paddleResetDown: new Howl({ 
				src: ['/assets/sfx/recoverDownFiltered01.mp3'],
				html5: true,
				preload: true,
				onload: () => console.log('paddleResetDown loaded successfully'),
				onloaderror: (id: number, error: any) => console.error('paddleResetDown failed to load:', error)
			}),
		};
	}

	initDust() {
			ParticleSpawner.setAmbientDustDensity(40, 5);

			ParticleSpawner.setAmbientDustColor(GAME_COLORS.particleGray); 

			ParticleSpawner.setAmbientDustSize(5, 12);

			ParticleSpawner.setAmbientDustLifetime(200, 260);

			ParticleSpawner.setAmbientDustAlpha(0.1, 0.3);

			ParticleSpawner.setAmbientDustDriftSpeed(3);

			ParticleSpawner.setAmbientDustRotationSpeed(0.001, 0.05);
	}

	async createEntities(): Promise<void>  {

		this.leftPlayer = { name: sessionStorage.getItem('username') || "Player 1" };
		this.rightPlayer = { name: "Player 2" };

		console.log(`${this.leftPlayer.name}  vs  ${this.rightPlayer.name}`);

		
		// Create Bounding Box
		this.createBoundingBoxes();
		
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
		const paddleL = new Paddle('paddleL', 'foreground', this, this.paddleOffset, this.height / 2, true, this.leftPlayer.name);
		const paddleLRender = paddleL.getComponent('render') as RenderComponent;
		const paddleLText = paddleL.getComponent('text') as TextComponent;
		this.renderLayers.foreground.addChild(paddleLRender.graphic);
		this.renderLayers.foreground.addChild(paddleLText.getRenderable());
		this.entities.push(paddleL);
		console.log("Left paddle created");
		
		const paddleR = new Paddle('paddleR', 'foreground', this, this.width - this.paddleOffset, this.height / 2, false, this.rightPlayer.name);
		const paddleRRender = paddleR.getComponent('render') as RenderComponent;
		const paddleRText = paddleR.getComponent('text') as TextComponent;
		this.renderLayers.foreground.addChild(paddleRRender.graphic);
		this.renderLayers.foreground.addChild(paddleRText.getRenderable());
		this.entities.push(paddleR);
		console.log("Right paddle created");

		// Create UI
		const ui = new UI(this, 'UI', 'ui', this.width, this.height, this.topWallOffset);

		const uiText = ui.getComponent('text') as TextComponent;
		this.renderLayers.ui.addChild(uiText.getRenderable());

		if (!this.config.classicMode) {
			const bars = ui.getComponent('render') as RenderComponent;
			this.renderLayers.ui.addChild(bars.graphic);
			
			this.renderLayers.ui.addChild(uiText.getRenderable());
		}
		
		this.entities.push(ui);
		console.log("UI created")

		// Create Postprocessing Layer
		if (this.config.filters) {
			const postProcessingLayer = new PostProcessingLayer('postProcessing', 'pp', this);
			const ppRender = postProcessingLayer.getComponent('render') as RenderComponent;
			this.renderLayers.pp.addChild(ppRender.graphic);
			this.entities.push(postProcessingLayer);
			console.log("PostProcessing Layer created")
		}

		// Spawn Ball
		BallSpawner.spawnDefaultBall(this);
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

	createBoundingBoxes() {
		const boundingBoxA = new Graphics();
		boundingBoxA.rect(0, 0, this.width, this.height);
		boundingBoxA.stroke({width: 0.1, color: GAME_COLORS.black});

		const boundingBoxB = new Graphics();
		boundingBoxB.rect(0, 0, this.width, this.height);
		boundingBoxB.stroke({width: 0.1, color: GAME_COLORS.black});

		const boundingBoxC = new Graphics();
		boundingBoxC.rect(0, 0, this.width, this.height);
		boundingBoxC.stroke({width: 0.1, color: GAME_COLORS.black});

		const boundingBoxD = new Graphics();
		boundingBoxD.rect(0, 0, this.width, this.height);
		boundingBoxD.stroke({width: 0.1, color: GAME_COLORS.black});

		const boundingBoxE = new Graphics();
		boundingBoxE.rect(0, 0, this.width, this.height);
		boundingBoxE.stroke({width: 0.1, color: GAME_COLORS.black});

		const boundingBoxF = new Graphics();
		boundingBoxF.rect(0, 0, this.width, this.height);
		boundingBoxF.stroke({width: 0.1, color: GAME_COLORS.black});

		this.renderLayers.bounding.addChild(boundingBoxA);
		this.renderLayers.powerup.addChild(boundingBoxB);
		this.renderLayers.powerupGlitched.addChild(boundingBoxC);
		this.renderLayers.powerdown.addChild(boundingBoxD);
		this.renderLayers.ballChange.addChild(boundingBoxE);
		this.renderLayers.pp.addChild(boundingBoxF);
		
	}

	updateFromServer(gameState: any) {
		// This will be called by the network manager when receiving server updates
		console.log('Updating game state from server:', gameState);

		// Update game entities based on server state
		// This is where we'll handle ball position, paddle positions, etc.
		// For now, just log the received state
	}

	// Add method to start the online game
	start() {
		console.log('Starting online Pong game');
		// Initialize game loop and start rendering
		// This will be called when both players are connected
	}
}