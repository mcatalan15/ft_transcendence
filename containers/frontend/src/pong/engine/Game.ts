/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Game.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: nponchon <nponchon@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 09:43:00 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/26 12:21:34 by nponchon         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// Import Pixi and Howler stuff
import { Application, Container, Graphics, Text } from 'pixi.js';
import { Howl } from 'howler';

// Import GameConfig
//import { GameConfig } from '../menu/GameConfig';
export interface GameConfig {
	classicMode: boolean;
	isOnline?: boolean;
	gameId?: string;
	opponent?: string;
}

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
import { PhysicsComponent } from '../components/PhysicsComponent';

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

export class PongGame {
	config: GameConfig;
	language: string;
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
	soundManager!: SoundManager;
	worldPool: World[] = [];
	currentWorld!: World;
	leftPlayer: any = '';
	rightPlayer: any = '';

	isOnline: boolean = false;
	gameId?: string;
	localPlayerNumber?: number;
	networkManager?: any;

	serverBallPosition: { x: number, y: number } = { x: 0, y: 0 };
	serverPaddle1Position: number = 0;
	serverPaddle2Position: number = 0;

	constructor(app: Application, config: GameConfig, language: string) {
		this.config = config;
		this.language = language;
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
		if (!this.app.ticker.started) {
			this.app.ticker.start();
		}

		await this.createEntities();
		this.initSystems();
		this.initDust();
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
		if (!this.isOnline) this.systems.push(inputSystem);
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

	async createEntities(): Promise<void> {

		//TODO: Update to match online game player names consistently
		this.leftPlayer = { name: sessionStorage.getItem('username') || "Player 1" };
		this.rightPlayer = { name: this.config.opponent || "Player 2" };

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
		if (this.config.classicMode) {
			this.renderLayers.background.addChild(uiText.getRenderable());
		} else {
			this.renderLayers.ui.addChild(uiText.getRenderable());
		}

		if (!this.config.classicMode) {
			const bars = ui.getComponent('render') as RenderComponent;
			this.renderLayers.ui.addChild(bars.graphic);
			this.renderLayers.ui.addChild(uiText.getRenderable());
		} else {
			this.createDashedMiddleLine();
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
			switch (entity.layer) {
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

	private createDashedMiddleLine(): void {
		const dashSize = 17;
		const gapSize = 10;
		const segmentSize = dashSize + gapSize;
		
		const startY = this.topWallOffset + this.wallThickness / 2;
		const endY = this.height - this.bottomWallOffset + this.wallThickness / 2;
		const totalHeight = endY - startY;
		const centerX = this.width / 2;
		
		const middleLine = new Graphics();
		
		// Calculate how many complete segments we can fit
		const numSegments = Math.floor(totalHeight / segmentSize);
		
		for (let i = 0; i < numSegments; i++) {
			const dashStartY = startY + (i * segmentSize);
			const dashEndY = dashStartY + dashSize;
			
			// Only draw if the dash end doesn't exceed our boundary
			if (dashEndY <= endY) {
				middleLine.moveTo(centerX, dashStartY);
				middleLine.lineTo(centerX, dashEndY);
			}
		}
		
		// Handle any remaining space with a partial dash
		const remainingSpace = totalHeight - (numSegments * segmentSize);
		if (remainingSpace > 0) {
			const lastDashStart = startY + (numSegments * segmentSize);
			const lastDashEnd = Math.min(lastDashStart + dashSize, endY);
			
			if (lastDashEnd > lastDashStart) {
				middleLine.moveTo(centerX, lastDashStart);
				middleLine.lineTo(centerX, lastDashEnd);
			}
		}
		
		middleLine.stroke({ color: GAME_COLORS.white, width: 5, alpha: 0.5 });
		this.renderLayers.ui.addChild(middleLine);
	}

	createBoundingBoxes() {
		const boundingBoxA = new Graphics();
		boundingBoxA.rect(0, 0, this.width, this.height);
		boundingBoxA.stroke({ width: 0.1, color: GAME_COLORS.black });

		const boundingBoxB = new Graphics();
		boundingBoxB.rect(0, 0, this.width, this.height);
		boundingBoxB.stroke({ width: 0.1, color: GAME_COLORS.black });

		const boundingBoxC = new Graphics();
		boundingBoxC.rect(0, 0, this.width, this.height);
		boundingBoxC.stroke({ width: 0.1, color: GAME_COLORS.black });

		const boundingBoxD = new Graphics();
		boundingBoxD.rect(0, 0, this.width, this.height);
		boundingBoxD.stroke({ width: 0.1, color: GAME_COLORS.black });

		const boundingBoxE = new Graphics();
		boundingBoxE.rect(0, 0, this.width, this.height);
		boundingBoxE.stroke({ width: 0.1, color: GAME_COLORS.black });

		const boundingBoxF = new Graphics();
		boundingBoxF.rect(0, 0, this.width, this.height);
		boundingBoxF.stroke({ width: 0.1, color: GAME_COLORS.black });

		this.renderLayers.bounding.addChild(boundingBoxA);
		this.renderLayers.powerup.addChild(boundingBoxB);
		this.renderLayers.powerupGlitched.addChild(boundingBoxC);
		this.renderLayers.powerdown.addChild(boundingBoxD);
		this.renderLayers.ballChange.addChild(boundingBoxE);
		this.renderLayers.pp.addChild(boundingBoxF);

	}

	// Add detailed debugging to the updateFromServer method:
	updateFromServer(gameState: any) {
		if (!this.isOnline || !gameState) return;

		console.log('=== UPDATE FROM SERVER ===');
		console.log('Game state received:', gameState);
		console.log('Available entities:', this.entities.map(e => ({
			id: e.id,
			hasPhysics: !!e.getComponent('physics'),
			hasRender: !!e.getComponent('render'),
			physicsPos: e.getComponent('physics') ? { x: e.getComponent('physics').x, y: e.getComponent('physics').y } : null
		})));

		try {
			// Find entities by their IDs/types
			const ballEntity = this.entities.find(e => e.id === 'defaultBall');
			const paddle1Entity = this.entities.find(e => e.id === 'paddleL');
			const paddle2Entity = this.entities.find(e => e.id === 'paddleR');

			console.log('Entity search results:', {
				ballFound: !!ballEntity,
				paddle1Found: !!paddle1Entity,
				paddle2Found: !!paddle2Entity
			});

			// Update ball position using PhysicsComponent
			if (ballEntity && gameState.ball) {
				const ballPhysics = ballEntity.getComponent('physics') as PhysicsComponent;
				const ballRender = ballEntity.getComponent('render') as RenderComponent;

				ballPhysics.x = gameState.ball.x;
				ballPhysics.y = gameState.ball.y;
				ballPhysics.velocityX = gameState.ball.vx || 0;
				ballPhysics.velocityY = gameState.ball.vy || 0;
				ballRender.graphic.x = gameState.ball.x;
				ballRender.graphic.y = gameState.ball.y;

			} else {
				console.warn('❌ Ball entity or gameState.ball missing');
				if (!ballEntity) console.warn('  - Ball entity not found in entities array');
				if (!gameState.ball) console.warn('  - gameState.ball is missing from server data');
			}

			// Update paddle positions with similar detailed logging
			if (paddle1Entity && gameState.paddle1) {
				const paddle1Physics = paddle1Entity.getComponent('physics') as PhysicsComponent;
				if (paddle1Physics) {
					paddle1Physics.x = gameState.paddle1.x;
					paddle1Physics.y = gameState.paddle1.y;

					const paddle1Render = paddle1Entity.getComponent('render') as RenderComponent;
					if (paddle1Render && paddle1Render.graphic) {
						paddle1Render.graphic.x = gameState.paddle1.x;
						paddle1Render.graphic.y = gameState.paddle1.y;
					}
				}
			}

			if (paddle2Entity && gameState.paddle2) {
				const paddle2Physics = paddle2Entity.getComponent('physics') as PhysicsComponent;
				if (paddle2Physics) {
					paddle2Physics.x = gameState.paddle2.x;
					paddle2Physics.y = gameState.paddle2.y;

					const paddle2Render = paddle2Entity.getComponent('render') as RenderComponent;
					if (paddle2Render && paddle2Render.graphic) {
						paddle2Render.graphic.x = gameState.paddle2.x;
						paddle2Render.graphic.y = gameState.paddle2.y;
					}
				}
			}

			if (gameState.score1 !== undefined || gameState.score2 !== undefined) {
				this.updateScoreDisplay(gameState.score1 || 0, gameState.score2 || 0);
			}
		} catch (error) {
			console.error('Error updating from server state:', error);
		}
	}

	private updateScoreDisplay(score1: number, score2: number): void {
		// Find the UI entity which contains the score
		const uiEntity = this.entities.find(e => e.id === 'UI') as UI;

		if (uiEntity) {
			if (uiEntity.leftScore !== undefined && uiEntity.rightScore !== undefined) {
				uiEntity.leftScore = score1;
				uiEntity.rightScore = score2;
			}

			const textComponent = uiEntity.getComponent('text') as TextComponent;
			if (textComponent) {
				textComponent.setText(`${score1} - ${score2}`);
			}
		}
		console.log(`Score display updated: ${score1} - ${score2}`);
	}

	private disableLocalGameplayForOnline(): void {
		console.log('Disabling local gameplay for online mode...');

		let disabledCount = 0;

		this.entities.forEach(entity => {
			const physics = entity.getComponent('physics') as PhysicsComponent;

			// Mark ball and paddles as server-controlled
			if (physics && (entity.id === 'defaultBall' || entity.id === 'paddleL' || entity.id === 'paddleR')) {
				(physics as any).isServerControlled = true;
				console.log(`Marked entity ${entity.id} as server-controlled`);
				disabledCount++;
			}

			// Remove input components from paddles (network manager handles input)
			if (entity.id === 'paddleL' || entity.id === 'paddleR') {
				const input = entity.getComponent('input');
				if (input) {
					entity.removeComponent('input');
					console.log(`Removed input component from ${entity.id}`);
				}
			}
		});

		console.log(`Local gameplay disabled for online mode. ${disabledCount} entities marked as server-controlled.`);
	}

	start() {
		if (!this.isOnline) return;
		console.log('Starting online Pong game');
		this.disableLocalGameplayForOnline();
	}
}