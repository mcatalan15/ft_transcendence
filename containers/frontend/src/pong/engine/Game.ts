/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Game.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 09:43:00 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/21 20:30:38 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Application, Container, Graphics } from 'pixi.js';
import { Howl } from 'howler';
import { GameConfig, GameData, PlayerData, TournamentConfig } from '../utils/GameConfig';
import { Entity } from '../engine/Entity';
import { System } from '../engine/System';
import { Wall } from '../entities/Wall';
import { Paddle } from '../entities/Paddle'
import { UI } from '../entities/UI'
import { PostProcessingLayer } from '../entities/PostProcessingLayer'
import { EndgameOverlay } from '../entities/endGame/EndGameOverlay';
import { RenderComponent } from '../components/RenderComponent';
import { TextComponent } from '../components/TextComponent';
import { PhysicsComponent } from '../components/PhysicsComponent';
import { ParticleSpawner } from '../spawners/ParticleSpawner';
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
import { EndingSystem } from '../systems/EndingSystem';
import { AISystem } from '../systems/AISystem';
import { ButtonSystem } from '../systems/ButtonSystem';
import { BallSpawner } from '../spawners/BallSpawner'
import { ImageManager } from '../managers/ImageManager';
import { SoundManager } from '../managers/SoundManager';
import { TournamentManager } from '../../utils/TournamentManager';
import { FrameData, GameEvent, GameSounds, World, GAME_COLORS } from '../utils/Types'
import { getApiUrl } from '../../config/api';

export class PongGame {
	config: GameConfig;
	data!: GameData;;
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
		alphaFade: Container;
		fireworks: Container;
		overlays: Container;
		hidden: Container;
	};
	visualRoot: Container;
	sounds!: GameSounds;
	soundManager!: SoundManager;
	worldPool: World[] = [];
	currentWorld!: World;
	leftPlayer: any = '';
	rightPlayer: any = '';

	playerData!: PlayerData;
	opponentData!: PlayerData;

	isOnline: boolean = false;
	gameId?: string;
	localPlayerNumber?: number = 0;
	networkManager?: any;

	serverBallPosition: { x: number, y: number } = { x: 0, y: 0 };
	serverPaddle1Position: number = 0;
	serverPaddle2Position: number = 0;

	hasEnded: boolean = false;
	alphaFade: Graphics = new Graphics();
	endGameOverlay!: EndgameOverlay;

	isFirefox: boolean = false;

	tournamentManager!: TournamentManager;
	tournamentConfig: TournamentConfig | null = null;
	hasSavedResults: boolean = false;

	constructor(app: Application, config: GameConfig, language: string, isFirefox?: boolean) {
		this.config = config;
		this.language = language;
		this.app = app;
		this.width = app.screen.width;
		this.height = app.screen.height;
		this.isFirefox = isFirefox || false;
		this.entities = [];
		this.systems = [];
		this.eventQueue = [];
		this.topWallOffset = 60;
		this.bottomWallOffset = 80;
		this.wallThickness = 20;
		this.paddleOffset = 60;
		this.paddleWidth = 10;
		this.paddleHeight = 80;

		this.isOnline = config.mode === 'online' ? true : false;
		this.gameId = config.gameId;

		this.prepareGameData();

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
			pp: new Container(),
			alphaFade: new Container(),
			fireworks: new Container(),
			overlays: new Container(),
			hidden: new Container(),
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
		this.visualRoot.addChild(this.renderLayers.alphaFade);
		this.visualRoot.addChild(this.renderLayers.fireworks);
		this.visualRoot.addChild(this.renderLayers.overlays);

		if (!this.config.classicMode) {
			this.initSounds();
			this.soundManager = new SoundManager(this.sounds as Record<string, Howl>);
		}

		if (this.isFirefox) {
            this.applyGameFirefoxOptimizations();
        }
	}

	private applyGameFirefoxOptimizations(): void {
    }

	async init(): Promise<void> {
		if (!this.app.ticker.started) {
			this.app.ticker.start();
		}

		await this.apiDataRequest();

		await this.loadImages();
		await this.createEntities();
		await this.initSystems();
		await this.initDust();
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
		const renderSystem = new RenderSystem(this);
		const inputSystem = new InputSystem(this);
		const physicsSystem = new PhysicsSystem(this, this.width, this.height);
		const worldSystem = new WorldSystem(this);
		const animationSystem = new AnimationSystem(this);
		const vfxSystem = new VFXSystem(this);
		const particleSystem = new ParticleSystem(this);
		const uiSystem = new UISystem(this);
		const powerupSystem = new PowerupSystem(this, this.width, this.height);
		const postProcessingSystem = new PostProcessingSystem(this);
		const crossCutSystem = new CrossCutSystem(this);
		const endingSystem = new EndingSystem(this);
		const buttonSystem = new ButtonSystem(this);

		this.systems.push(renderSystem);
		this.systems.push(inputSystem);
		if (!this.config.classicMode) this.systems.push(crossCutSystem);
		if (!this.config.classicMode) this.systems.push(worldSystem);
		this.systems.push(animationSystem);
		if (!this.config.classicMode) this.systems.push(vfxSystem);
		if (!this.config.classicMode) this.systems.push(particleSystem);
		this.systems.push(uiSystem);
		if (!this.config.classicMode) this.systems.push(powerupSystem);
		this.systems.push(postProcessingSystem);
		this.systems.push(endingSystem);
		this.systems.push(buttonSystem);

		if (this.config.variant == '1vAI') {
			const rightPaddle = this.entities.find(e => e.id === 'paddleR') as Paddle;
			if (rightPaddle) {
				rightPaddle.isAI = true;
			}

			setTimeout(() => {
				const aiSystem = new AISystem(this);
				aiSystem.setDifficulty('easy');
				this.systems.push(aiSystem);
			}, 100);
		}

		this.systems.push(physicsSystem);
	}

	prepareGameData() {
		this.data = {
			config: this.config,
			createdAt: new Date().toISOString(),
			endedAt: null,
			generalResult: null,
			winner: null,
			finalScore: {
				leftPlayer: 0,
				rightPlayer: 0
			},

			balls: {
				defaultBalls: 1,
				curveBalls: 0,
				multiplyBalls: 0,
				spinBalls: 0,
				burstBalls: 0,
			},

			specialItems: {
				bullets: 0,
				shields: 0
			},

			walls: {
				pyramids: 0,
				escalators: 0,
				hourglasses: 0,
				lightnings: 0,
				maws: 0,
				rakes: 0,
				trenches: 0,
				kites: 0,
				bowties: 0,
				honeycombs: 0,
				snakes: 0,
				vipers: 0,
				waystones: 0
			},
			
			leftPlayer: {
                id: this.leftPlayer.id || "2",
				name: this.leftPlayer.name || "guest",
				isDisconnected: false,
                score: 0,
                result: null,
				hits: 0,
				goalsInFavor: 0,
				goalsAgainst: 0,
				powerupsPicked: 0,
				powerdownsPicked: 0,
				ballchangesPicked: 0
			},
			rightPlayer: {
                id: this.rightPlayer.id || "2",
				name: this.rightPlayer.name || "guest",
				isDisconnected: false,
                score: 0,
                result: null,
				hits: 0,
				goalsInFavor: 0,
				goalsAgainst: 0,
				powerupsPicked: 0,
				powerdownsPicked: 0,
				ballchangesPicked: 0
			}
		};
	}

	initSounds(): void {
		this.sounds = {
			bgm: new Howl({
				src: this.config.filters ? ['/assets/sfx/music/bgmFiltered01.mp3'] : ['/assets/sfx/music/bgm.mp3'],
				html5: true,
				preload: true,
				loop: true,
				volume: 0.5,
				onloaderror: (error: any) => console.error('bgm failed to load:', error)
			}),
			pong: new Howl({
				src: ['/assets/sfx/used/pongFiltered02.mp3'],
				html5: true,
				preload: true,
				onloaderror: (error: any) => console.error('pong failed to load:', error)
			}),
			thud: new Howl({
				src: ['/assets/sfx/used/thudFiltered01.mp3'],
				html5: true,
				preload: true,
				volume: 0.3,
				onloaderror: (error: any) => console.error('thud failed to load:', error)
			}),
			shoot: new Howl({
				src: ['/assets/sfx/used/shotFiltered01.mp3'],
				html5: true,
				preload: true,
				volume: 0.3,
				onloaderror: (error: any) => console.error('shoot failed to load:', error)
			}),
			hit: new Howl({
				src: ['/assets/sfx/used/hitFiltered01.mp3'],
				html5: true,
				preload: true,
				volume: 0.3,
				onloaderror: (error: any) => console.error('hit failed to load:', error)
			}),
			shieldBreak: new Howl({
				src: ['/assets/sfx/used/shieldBreakFiltered01.mp3'],
				html5: true,
				preload: true,
				volume: 0.3,
				onloaderror: (error: any) => console.error('shieldBreak failed to load:', error)
			}),
			powerup: new Howl({
				src: ['/assets/sfx/used/powerupFiltered01.mp3'],
				html5: true,
				preload: true,
				onloaderror: (error: any) => console.error('powerup failed to load:', error)
			}),
			powerdown: new Howl({
				src: ['/assets/sfx/used/powerdownFiltered01.mp3'],
				html5: true,
				preload: true,
				onloaderror: (error: any) => console.error('powerdown failed to load:', error)
			}),
			ballchange: new Howl({
				src: ['/assets/sfx/used/ballchangeFiltered01.mp3'],
				html5: true,
				preload: true,
				onloaderror: (error: any) => console.error('ballchange failed to load:', error)
			}),
			death: new Howl({
				src: ['/assets/sfx/used/explosionFiltered01.mp3'],
				html5: true,
				preload: true,
				onloaderror: (error: any) => console.error('death failed to load:', error)
			}),
			paddleResetUp: new Howl({
				src: ['/assets/sfx/used/recoverUpFiltered01.mp3'],
				html5: true,
				preload: true,
				onloaderror: (error: any) => console.error('paddleResetUp failed to load:', error)
			}),
			paddleResetDown: new Howl({
				src: ['/assets/sfx/used/recoverDownFiltered01.mp3'],
				html5: true,
				preload: true,
				onloaderror: (error: any) => console.error('paddleResetDown failed to load:', error)
			}),
			endGame: new Howl({
				src: ['/assets/sfx/used/explosion_filtered02.mp3'],
				html5: true,
				preload: true,
				onloaderror: (error: any) => console.error('paddleResetDown failed to load:', error)
			}),
			spawn: new Howl({
				src: ['/assets/sfx/used/spawn_filtered01.mp3'],
				html5: true,
				preload: true,
				onloaderror: (error: any) => console.error('paddleResetDown failed to load:', error)
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
		if (this.config.mode === 'online' || this.config.variant === 'tournament') {
			this.leftPlayer = { name: this.config.hostName || "Host Player" };
			this.rightPlayer = { name: this.config.guestName || "Guest Player" };
		} else {
			this.leftPlayer = { name: sessionStorage.getItem('username') || "Player 1" };
			if (this.config.variant === '1vAI') {
				this.rightPlayer = { name: "BUTIBOT" };
			} else if (this.config.variant === '1v1') {
				this.rightPlayer = { name: this.config.guestName || "GUEST" };
			}
		}
		
		this.data.leftPlayer.name = this.leftPlayer.name;
    	this.data.rightPlayer.name = this.rightPlayer.name;

		this.createBoundingBoxes();

		const wallT = new Wall('wallT', 'foreground', this.width, this.wallThickness, this.topWallOffset);
		const wallTRender = wallT.getComponent('render') as RenderComponent;
		this.renderLayers.foreground.addChild(wallTRender.graphic)
		this.entities.push(wallT);

		const wallB = new Wall('wallB', 'foreground', this.width, this.wallThickness, this.height - (this.bottomWallOffset - this.wallThickness));
		const wallBRender = wallB.getComponent('render') as RenderComponent;
		this.renderLayers.foreground.addChild(wallBRender.graphic);
		this.entities.push(wallB);

		const paddleL = new Paddle('paddleL', 'foreground', this, this.paddleOffset, this.height / 2, true, this.leftPlayer.name.toUpperCase());
		const paddleLRender = paddleL.getComponent('render') as RenderComponent;
		const paddleLText = paddleL.getComponent('text') as TextComponent;
		this.renderLayers.foreground.addChild(paddleLRender.graphic);
		this.renderLayers.foreground.addChild(paddleLText.getRenderable());
		this.entities.push(paddleL);

		const paddleR = new Paddle('paddleR', 'foreground', this, this.width - this.paddleOffset, this.height / 2, false, this.rightPlayer.name.toUpperCase());
		const paddleRRender = paddleR.getComponent('render') as RenderComponent;
		const paddleRText = paddleR.getComponent('text') as TextComponent;
		this.renderLayers.foreground.addChild(paddleRRender.graphic);
		this.renderLayers.foreground.addChild(paddleRText.getRenderable());
		this.entities.push(paddleR);
		if (this.config.variant === '1vAI') {
			paddleR.isAI = true;
		}

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

		if (this.config.filters) {
			const postProcessingLayer = new PostProcessingLayer('postProcessing', 'pp', this);
			const ppRender = postProcessingLayer.getComponent('render') as RenderComponent;
			this.renderLayers.pp.addChild(ppRender.graphic);
			this.entities.push(postProcessingLayer);
		}

		this.alphaFade.rect(0, 0, this.width, this.height);
		this.alphaFade.fill({ color: GAME_COLORS.black, alpha: 0.4 });
		this.renderLayers.hidden.addChild(this.alphaFade);

		this.endGameOverlay = new EndgameOverlay(this, 'EndGameOverlay', 'overlays', this.width / 2 - 500, this.height / 2 - 200, 1000, 400);
		const EndGameOverlayRender = this.endGameOverlay.getComponent('render') as RenderComponent;
		this.renderLayers.hidden.addChild(EndGameOverlayRender.graphic);

		const endGameResultTextComponent = this.endGameOverlay.getComponent('text') as TextComponent;
		this.renderLayers.hidden.addChild(endGameResultTextComponent.getRenderable());

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
		
		const numSegments = Math.floor(totalHeight / segmentSize);
		
		for (let i = 0; i < numSegments; i++) {
			const dashStartY = startY + (i * segmentSize);
			const dashEndY = dashStartY + dashSize;
			
			if (dashEndY <= endY) {
				middleLine.moveTo(centerX, dashStartY);
				middleLine.lineTo(centerX, dashEndY);
			}
		}
		
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

	async loadImages() {
		await ImageManager.loadAssets([
			{ name: 'victoryHeaderENWhite', url: '/headers/headers_victory_en_white.svg' },
			{ name: 'victoryHeaderESWhite', url: '/headers/headers_victory_es_white.svg' },
			{ name: 'victoryHeaderFRWhite', url: '/headers/headers_victory_fr_white.svg' },
			{ name: 'victoryHeaderCATWhite', url: '/headers/headers_victory_cat_white.svg' },

			{ name: 'victoryHeaderENGreen', url: '/headers/headers_victory_en_green.svg' },
			{ name: 'victoryHeaderESGreen', url: '/headers/headers_victory_es_green.svg' },
			{ name: 'victoryHeaderFRGreen', url: '/headers/headers_victory_fr_green.svg' },
			{ name: 'victoryHeaderCATGreen', url: '/headers/headers_victory_cat_green.svg' },

			{ name: 'defeatHeaderENWhite', url: '/headers/headers_defeat_en_white.svg' },
			{ name: 'defeatHeaderESWhite', url: '/headers/headers_defeat_es_white.svg' },
			{ name: 'defeatHeaderFRWhite', url: '/headers/headers_defeat_fr_white.svg' },
			{ name: 'defeatHeaderCATWhite', url: '/headers/headers_defeat_cat_white.svg' },

			{ name: 'defeatHeaderENRed', url: '/headers/headers_defeat_en_red.svg' },
			{ name: 'defeatHeaderESRed', url: '/headers/headers_defeat_es_red.svg' },
			{ name: 'defeatHeaderFRRed', url: '/headers/headers_defeat_fr_red.svg' },
			{ name: 'defeatHeaderCATRed', url: '/headers/headers_defeat_cat_red.svg' },

			{ name: 'drawHeaderENWhite', url: '/headers/headers_draw_en_white.svg' },
			{ name: 'drawHeaderESWhite', url: '/headers/headers_draw_es_white.svg' },
			{ name: 'drawHeaderFRWhite', url: '/headers/headers_draw_fr_white.svg' },
			{ name: 'drawHeaderCATWhite', url: '/headers/headers_draw_cat_white.svg' },

			{ name: 'drawHeaderENYellow', url: '/headers/headers_draw_en_yellow.svg' },
			{ name: 'drawHeaderESYellow', url: '/headers/headers_draw_es_yellow.svg' },
			{ name: 'drawHeaderFRYellow', url: '/headers/headers_draw_fr_yellow.svg' },
			{ name: 'drawHeaderCATYellow', url: '/headers/headers_draw_cat_yellow.svg' },

			{ name: 'resultsHeaderENWhite', url: '/headers/headers_results_en_white.svg' },
			{ name: 'resultsHeaderESWhite', url: '/headers/headers_results_es_white.svg' },
			{ name: 'resultsHeaderFRWhite', url: '/headers/headers_results_fr_white.svg' },
			{ name: 'resultsHeaderCATWhite', url: '/headers/headers_results_cat_white.svg' },

			{ name: 'resultsHeaderENYellow', url: '/headers/headers_results_en_yellow.svg' },
			{ name: 'resultsHeaderESYellow', url: '/headers/headers_results_es_yellow.svg' },
			{ name: 'resultsHeaderFRYellow', url: '/headers/headers_results_fr_yellow.svg' },
			{ name: 'resultsHeaderCATYellow', url: '/headers/headers_results_cat_yellow.svg' },

			{ name: 'avatarUnknownSquare', url: '/avatars/square/squareUnknown.png' },
			{ name: 'avatarUnknownClassic', url: '/avatars/squareClassic/squareUnknownClassic.png' },
			{ name: 'avatarBotSquare', url: '/avatars/square/squareBot.png' },
			{ name: 'avatarBotClassic', url: '/avatars/squareClassic/squareBotClassic.png' },
		]);
	}

	updateFromServer(gameState: any) {
		if (this.hasEnded) {
			return;
		}
		
		if (!this.isOnline || !gameState) return;
	
		try {
			const physicsSystem = this.systems.find(s => s instanceof PhysicsSystem) as PhysicsSystem;
			if (physicsSystem && physicsSystem.updateFromServer) {
				physicsSystem.updateFromServer(gameState);
			}
	
			if (gameState.score1 !== undefined || gameState.score2 !== undefined) {
				this.updateScoreFromServer(gameState.score1, gameState.score2);
			}
	
			if (gameState.gameEnded || gameState.winner || gameState.type === 'GAME_END') {
				this.handleServerGameEnd(gameState);
			}
		} catch (error) {
			console.error('Error updating from server state:', error);
		}
	}

	private handleServerGameEnd(gameState: any): void {
		
		const endingSystem = this.systems.find(s => s.constructor.name === 'EndingSystem') as any;
		if (endingSystem && !this.hasEnded) {
			const uiEntity = this.entities.find(e => e.id === 'UI') as UI;
			if (uiEntity && gameState.finalScore) {
				uiEntity.leftScore = gameState.finalScore.player1;
				uiEntity.rightScore = gameState.finalScore.player2;
			}
			
			(endingSystem as any).ended = true;
			this.hasEnded = true;
		}
	}
	private disableLocalGameplayForOnline(): void {

		let disabledCount = 0;

		this.entities.forEach(entity => {
			const physics = entity.getComponent('physics') as PhysicsComponent;

			if (physics && (entity.id === 'defaultBall' || entity.id === 'paddleL' || entity.id === 'paddleR')) {
				(physics as any).isServerControlled = true;
				disabledCount++;
			}

			if (entity.id === 'paddleL' || entity.id === 'paddleR') {
				const input = entity.getComponent('input');
				if (input) {
					entity.removeComponent('input');
				}
			}
		});

	}

	start() {
		if (!this.isOnline) return;
		this.disableLocalGameplayForOnline();
	}

	async saveGameResults(): Promise<void> {
		if (this.hasSavedResults || this.config.variant !== 'tournament') { return; }
		
		try {
			const token = sessionStorage.getItem('token');
			
			if (!token) {
				return;
			}
	
			const requestBody = {
				gameData: this.data
			};
			
			const gameData = {
				...this.data,
				createdAt: this.data.createdAt instanceof Date ? this.data.createdAt.toISOString() : this.data.createdAt,
				endedAt: this.data.endedAt instanceof Date ? this.data.endedAt.toISOString() : this.data.endedAt
			};
			const response = await fetch(getApiUrl('/games'), {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify({
					gameData: this.data
				}),
				credentials: 'include'
			});
	
			if (response.ok) {
				const gameResult = await response.json();
				this.hasSavedResults = true;

				// Deploy contract
				const deployResponse = await fetch(getApiUrl('/deploy'), {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${token}`
					},
					body: JSON.stringify({
						gameId: gameResult.gameId,
						player1Name: this.data.leftPlayer.name,
						player2Name: this.data.rightPlayer.name,
						player1Score: this.data.finalScore.leftPlayer,
						player2Score: this.data.finalScore.rightPlayer
					}),
					credentials: 'include'
				});

				const deployData = await deployResponse.json();

				if (deployResponse.ok) {
					console.log('Game results saved successfully:', gameResult);
					console.log('Contract deployed successfully:', deployData);
				} else {
					console.error('Failed to deploy contract:', deployData);
				}
			} else {
				const error = await response.text();
				console.error('Failed to save game results:', error);
			}
		} catch (error) {
			console.error('Network error saving game results:', error);
		}
	}

	private updateScoreFromServer(score1: number, score2: number): void {
		if (this.hasEnded) {
			return;
		}
		
		const uiEntity = this.entities.find(e => e.id === 'UI') as UI;
		
		if (uiEntity) {
			uiEntity.leftScore = score1;
			uiEntity.rightScore = score2;
			
			if (this.config.classicMode) {
				uiEntity.setClassicScoreText(score1.toString(), 'left');
				uiEntity.setClassicScoreText(score2.toString(), 'right');
			} else {
				uiEntity.setScoreText(`${score1} - ${score2}`);
			}
		}
	}

	async getUserData(userId: string, token: string): Promise<PlayerData> {
		try {
			if (!userId || !token) {
				throw new Error('User ID and token are required to fetch user data');
			}
			
			const response = await fetch(getApiUrl('/games/getUserData'), {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify({
					userId: userId
				}),
				credentials: 'include'
			});
	
			if (!response.ok) {
				const errorText = await response.text();
				console.error('API error response:', errorText);
				throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
			}
	
			const data = await response.json();
			
			return data.userData as PlayerData;
		} catch (error) {
			console.error('Error fetching user data:', error);
			throw error;
		}
	}

	async getUserId(username: string, token: string): Promise<string> {
		try {
			if (!username || !token) {
				throw new Error('Username and token are required to fetch user ID');
			}
	
			const response = await fetch(getApiUrl('/games/getUserByUsername'), {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify({
					username: username
				}),
				credentials: 'include'
			});
	
			if (!response.ok) {
				const errorText = await response.text();
				console.error('API error response:', errorText);
				throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
			}
	
			const data = await response.json();
			
			console.log('User ID fetched successfully:', data.userData.id);
	
			return data.userData.id as string;
		} catch (error) {
			console.error('Error fetching user ID:', error);
			return ("2");
			throw error;
		}
	}

	private async apiDataRequest(): Promise<void> {
		try {
			const token = sessionStorage.getItem('token');

			const hostUsername = this.config.hostName || sessionStorage.getItem('username');
			const guestUsername = this.config.guestName;

			const hostRes = await fetch(`/api/profile/${hostUsername}`, {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json'
				},
				credentials: 'include'
			});
			const hostProfile = await hostRes.json();

			const guestRes = await fetch(`/api/profile/${guestUsername}`, {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json'
				},
				credentials: 'include'
			});
			const guestProfile = await guestRes.json();

			const hostId = hostProfile.userId;
			const guestId = guestProfile.userId;

			this.playerData = await this.getUserData(hostId!, token!);
			this.opponentData = await this.getUserData(guestId!, token!);
		} catch (error) {
			console.error('❌ API call failed:', error);
		}
	}

	async cleanup(stopTicker: boolean = true): Promise<void> {
		try {            
			
			if (this.soundManager) {
				await this.soundManager.stopAllSounds();
				await this.soundManager.cleanup();
			}
			
			const windowNetworkManager = (window as any).currentNetworkManager;
			if (windowNetworkManager && typeof windowNetworkManager.cancelMatchmaking === 'function') {
				try {
					await windowNetworkManager.cancelMatchmaking();
				} catch (error) {
					console.warn('Error during matchmaking cleanup:', error);
				}
			}
			
			if (this.networkManager) {
				try {
					this.networkManager.close();
				} catch (error) {
					console.warn('Error during WebSocket cleanup:', error);
				}
			}
	
			if (stopTicker && this.app?.ticker?.started) {
				this.app.ticker.stop();
			}
			
			for (const system of this.systems) {
				if (system && typeof (system as any).cleanup === 'function') {
					await (system as any).cleanup();
				}
			}
			this.systems = [];
	
			for (const entity of this.entities) {
				const render = entity.getComponent('render') as RenderComponent;
				if (render?.graphic && render.graphic.parent) {
					render.graphic.parent.removeChild(render.graphic);
					render.graphic.destroy({ children: true });
				}
				
				const text = entity.getComponent('text') as TextComponent;
				if (text?.getRenderable && text.getRenderable().parent) {
					text.getRenderable().parent.removeChild(text.getRenderable());
					text.getRenderable().destroy();
				}
			}
			this.entities = [];
	
			if (ParticleSpawner?.cleanup) {
				ParticleSpawner.cleanup();
			}
	
			for (const layer of Object.values(this.renderLayers)) {
				if (layer?.parent) {
					layer.parent.removeChild(layer);
				}
				layer?.destroy({ children: true });
			}
			
			if ((window as any).currentPongGame === this) {
				(window as any).currentPongGame = null;
			}
			if ((window as any).currentNetworkManager === windowNetworkManager) {
				(window as any).currentNetworkManager = null;
			}	
		} catch (error) {
			console.error('Error during game cleanup:', error);
			throw error;
		}
	}
}