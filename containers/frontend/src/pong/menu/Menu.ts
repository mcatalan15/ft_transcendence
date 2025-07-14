/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Menu.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/02 18:04:50 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/11 12:55:10 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// Import Pixi and Howler stuff
import { Application, Container, Graphics, Assets, Sprite } from 'pixi.js';
import { Howl, Howler } from 'howler';

// Import G A M E
import { GameConfig, Preconfiguration, PlayerData } from '../utils/GameConfig';

// Import Engine elements (ECS)
import { Entity } from '../engine/Entity';
import { System } from '../engine/System';
import { Paddle } from '../entities/Paddle';
import { Title } from './menuEntities/Title';
import { Subtitle } from './menuEntities/Subtitle';
import { ClassicO } from './menuEntities/ClassicO';

import { MenuPostProcessingLayer } from './menuEntities/MenuPostProcessingLayer';
import { MenuButton } from './menuButtons/MenuButton';
import { MenuHalfButton } from './menuButtons/MenuHalfButton';
import { MenuXButton } from './menuButtons/MenuXButton';
import { BallButton } from './menuButtons/BallButton';
import { Powerup } from '../entities/powerups/Powerup';
import { MenuImageManager } from './menuManagers/MenuImageManager';

import { MenuOrnament } from './menuEntities/MenuOrnaments';
import { OverlayBackground } from './menuOverlays/OverlayBackground';
import { GlossaryTexts } from './menuOverlays/GlossaryTexts';
import { AboutTexts } from './menuOverlays/AboutTexts';

// Import components
import { RenderComponent } from '../components/RenderComponent';
import { TextComponent } from '../components/TextComponent';

// Import spawners and Managers
import { MenuParticleSpawner } from './menuSpawners/MenuParticleSpawner';
import { ButtonManager } from './menuManagers/MenuButtonManager';
import { MenuPowerupManager } from './menuManagers/MenuPowerupManager';

// Import Implemented Systems
import { MenuRenderSystem } from './menuSystems/MenuRenderSystem';
import { MenuAnimationSystem } from './menuSystems/MenuAnimationSystem';
import { MenuParticleSystem } from './menuSystems/MenuParticleSystem';
import { MenuPostProcessingSystem } from './menuSystems/MenuPostProcessingSystem';
import { SecretCodeSystem } from './menuSystems/MenuSecretCodeSystem';

import { MenuPhysicsSystem } from './menuSystems/MenuPhysicsSystem';
import { MenuVFXSystem } from './menuSystems/MenuVFXSystem';
import { MenuLineSystem } from './menuSystems/MenuLineSystem';
import { MenuButtonSystem } from './menuSystems/MenuButtonSystem';

import { FrameData, MenuSounds, GameEvent } from '../utils/Types';
import * as menuUtils from '../utils/MenuUtils'
import { getThemeColors } from '../utils/Utils';
import { isRenderComponent } from '../utils/Guards';
import { InvertPowerDown } from '../entities/powerups/InvertPowerDown';
import { GlossaryOverlay } from './menuOverlays/GlossaryOverlay';
import { AboutOverlay } from './menuOverlays/AboutOverlay';
import { PlayOverlay } from './menuOverlays/PlayOverlay';
import { TournamentOverlay } from './menuOverlays/TournamentOverlay';
import { getApiUrl } from '../../config/api';


declare global {
    interface Window {
        gc?: () => void;
    }
}

export class Menu{
	config: GameConfig;
	preconfiguration!: Preconfiguration;
	hasPreconfig: boolean = false;
	language: string;
	app: Application;
	width: number;
	height: number;
	ballAmount: number = 0;
	maxBalls: number = 50;
	entities: Entity[] = [];
    systems: System[] = [];
	eventQueue: GameEvent[] = [];
	title!: Title;
	titleO!: ClassicO;

	// Visual layers
	menuContainer: Container;
	menuHidden: Container;
	renderLayers: {
		blackEnd: Container;
		logo: Container;
		midground: Container;
		subtitle: Container;
		background: Container;
		foreground: Container;
		dust: Container;
		overlays: Container;
		overlayQuits: Container;
		pp: Container;
		powerups: Container;
		powerdowns: Container;
		ballchanges: Container;
	};
	visualRoot: Container;
	baseFilters: any[] = [];
	overlayFilters: any[] = [];
	powerupFilters: any[] = [];
	powerdownFilters: any[] = [];
	ballchangeFilters: any[] = [];
	powerupClassicFilters: any[] = [];
	overlayQuitsFilters: any[] = [];

	// Sound stuff
	sounds!: MenuSounds;
	private audioInitialized: boolean = false;
	private pendingAudio: (() => void)[] = [];

	// Button related values
	buttonWidth: number = 200;
	buttonHeight:number = 60;
	buttonVerticalOffset: number = 20;
	buttonSlant: number = 20;
	buttonXWidth: number = 20;
	halfButtonWidth = this.buttonWidth + 11;
	halfButtonHeight = 25;
	halfButtonOffset = 35;
	halfButtonSlant = this.buttonSlant * (25 / 60) + 0.5;
	ornamentOffset: number = 25;
	ornamentGap: number = 80;
	readyButtonWidth: number = 350;
	readyButtonHeight: number = 75;
	tournamentOverlayButtonWidth: number = 190;
	tournamentOverlayButtonHeight: number = 32.5;

	// Button Containers
	startButton!: MenuButton;
	optionsButton!: MenuButton;
	glossaryButton!: MenuButton;
	aboutButton!: MenuButton;
	playButton!: MenuButton;
	localButton!: MenuHalfButton;
	onlineButton!: MenuHalfButton;
	duelButton!: MenuHalfButton;
	IAButton!: MenuHalfButton;
	tournamentButton!: MenuHalfButton;
	filtersButton!: MenuHalfButton;
	classicButton!: MenuHalfButton;
	startXButton!: MenuXButton;
	optionsXButton!: MenuXButton;
	ballButton!: BallButton;
	glossaryQuitButton!: MenuButton;
	aboutQuitButton!: MenuButton;
	playQuitButton!: MenuButton;
	readyButton!: MenuButton;
	tournamentGlossaryButton!: MenuButton;
	tournamentFiltersButton!: MenuButton;

	// Ornaments
	frame!: Graphics;
	subframe!: Graphics;
	startOrnament!: MenuOrnament;
	playOrnament!: MenuOrnament;
	optionsOrnament!: MenuOrnament;
	optionsClickedOrnament!: MenuOrnament;
	glossaryOrnament!: MenuOrnament;
	glossaryClickedOrnament!: MenuOrnament;
	aboutOrnament!: MenuOrnament;
	aboutClickedOrnament!: MenuOrnament;

	// Overlay items
	glossaryOverlay!: GlossaryOverlay;
	aboutOverlay!: AboutOverlay;
	playOverlay!: PlayOverlay;
	tournamentOverlay!: TournamentOverlay;
	overlayBackground!: OverlayBackground;
	glossaryES!: GlossaryTexts;
	aboutES!: AboutTexts;
	enlargePowerup!: Powerup;
	magnetizePowerup!: Powerup;
	shieldPowerup!: Powerup;
	shootPowerup!: Powerup;
	shrinkPowerdown!: Powerup;
	invertPowerdown!: InvertPowerDown;
	flattenPowerdown!: Powerup;
	slowPowerdown!: Powerup;
	curveBallChange!: Powerup;
	spinBallChange!: Powerup;
	burstBallChange!: Powerup;
	multiplyBallChange!: Powerup;
	paddleL!: Paddle;
	paddleR!: Paddle;
	paddleOffset: number = 50;
	paddleWidth: number = 10;
	paddleHeight: number = 80;

	// Images
	wallPyramids!: Sprite;
	wallSteps!: Sprite;
	wallTrenches!: Sprite;
	wallHourglass!: Sprite;
	wallLightning!: Sprite;
	wallFangs!: Sprite;
	wallWaystones!: Sprite;
	wallSnakes!: Sprite;
	wallVipers!: Sprite;
	wallKite!: Sprite;
	wallBowtie!: Sprite;
	wallHoneycomb!: Sprite;

	// Player Data
	playerData: PlayerData | null = null;

	//Browser data
	isFirefox: boolean = false;

	// Tournament
	tournamentController!: TournamentController;

	constructor(app: Application, language: string, isFirefox?: boolean, hasPreConfiguration?: boolean, preconfiguration?: Preconfiguration) {
		this.language = language;
		this.app = app;
		this.width = app.screen.width;
		this.height = app.screen.height;
		this.isFirefox = isFirefox || false;
		this.tournamentController = new TournamentController(this);

		this.preconfiguration = preconfiguration || {
			mode: 'local',
			variant: '1v1',
			classicMode: false,
			hasInvitationContext: false,
			invitationData: null
		};
		
		console.log('🎯 Menu Preconfiguration Status:');
		console.log('Has invitation context:', this.preconfiguration.hasInvitationContext);
		
		if (this.preconfiguration.hasInvitationContext && this.preconfiguration.invitationData) {
			console.log('📧 Invitation Data:');
			console.log('  - Invite ID:', this.preconfiguration.invitationData.inviteId);
			console.log('  - Current Player:', this.preconfiguration.invitationData.currentPlayer);
			console.log('  - Timestamp:', this.preconfiguration.invitationData.timestamp);
			console.log('  - Mode will be set to:', this.preconfiguration.mode);
			this.hasPreconfig = true;
		} else {
			console.log('📝 No invitation context - standard menu initialization');
			this.hasPreconfig = false;
		}
		
		this.menuContainer = new Container();
		this.menuHidden = new Container();

		this.renderLayers = {
			blackEnd: new Container(),
			background: new Container(),
			logo: new Container(),
			subtitle: new Container(),
			overlays: new Container(),
			overlayQuits: new Container(),
			midground: new Container(),
			foreground: new Container(),
			dust: new Container(),
			powerups: new Container(),
			powerdowns: new Container(),
			ballchanges: new Container(),
			pp: new Container(),
		};
		this.visualRoot = new Container();
		this.visualRoot.sortableChildren = true;

		this.app.stage.addChild(this.renderLayers.blackEnd);

		this.app.stage.addChild(this.menuContainer);
		this.app.stage.addChild(this.renderLayers.background);
		this.app.stage.addChild(this.visualRoot);
		this.app.stage.addChild(this.menuContainer);
		this.app.stage.addChild(this.renderLayers.overlays);
		this.app.stage.addChild(this.renderLayers.overlayQuits);
		this.app.stage.addChild(this.renderLayers.powerups);
		this.app.stage.addChild(this.renderLayers.powerdowns);
		this.app.stage.addChild(this.renderLayers.ballchanges);
		this.app.stage.addChild(this.renderLayers.pp);
	
		this.visualRoot.addChild(this.renderLayers.background);
		this.visualRoot.addChild(this.renderLayers.logo);
		this.visualRoot.addChild(this.renderLayers.midground);
		this.visualRoot.addChild(this.renderLayers.subtitle);
		this.visualRoot.addChild(this.renderLayers.foreground);
		this.visualRoot.addChild(this.renderLayers.dust);
		this.visualRoot.addChild(this.renderLayers.pp);

		this.renderLayers.blackEnd.addChild(menuUtils.setMenuBackground(app));
		this.initSounds();

		//! GAME CONFIGURATION TO BE FED IN MENU, SENT TO BACKEND
		this.config = {
			mode: 'local',
			variant: '1v1',
			classicMode: false,
			filters: true,
			players: [
				{ name: 'Player 1', type: 'human', side: 'left' },
				{ name: 'Player 2', type: 'human', side: 'right' }
			]
		};
		
		if (hasPreConfiguration) {
			this.hasPreconfig = true;
			this.preconfiguration = preconfiguration!;
		}
	}

	async init(classic: boolean, filters: boolean): Promise<void> {
		this.applyFirefoxOptimizations();
		
		//! TEST DEBUG
		await this.testApiCall();

		await this.clearConflictingAssets();
		await this.loadImages();

		await ButtonManager.createMainButtons(this);
		await ButtonManager.createHalfButtons(this);
		await ButtonManager.createXButtons(this);
		await ButtonManager.createBallButton(this);
		await ButtonManager.createOverlayQuitButtons(this);
		await ButtonManager.createReadyButton(this);
		await ButtonManager.createTournamentOverlayButtons(this);
		await this.createOrnaments();
		await this.createEntities();
		await this.createTitle();
		await this.createOverlays();
		await this.createPowerups();
		await this.initSystems();
		await this.initDust();
		await MenuImageManager.createHeaderImages(this);

		this.playSound('menuBGM');

		this.app.ticker.add((ticker) => {
			const frameData: FrameData = {
				deltaTime: ticker.deltaTime
			};
		
			this.systems.forEach(system => {
				system.update(this.entities, frameData);
			});
		});

		this.applyInitialConfiguration(classic, filters);
		/* if (this.preconfiguration) {
			this.manageOnlineInvitationGame();
		} */
	}

	manageOnlineInvitationGame() {
		// Test stuff to check if things happen. THIS IS NOT ONLINE YET.
		
		this.eventQueue.push({
			type: 'FILTERS_CLICK',
			target: this.filtersButton,
			buttonName: 'FILTERS'
		});

		this.eventQueue.push({
			type: 'CLASSIC_CLICK',
			target: this.classicButton,
			buttonName: 'CLASSIC'
		});

		this.eventQueue.push({
			type: 'READY_CLICK',
			target: this.playButton,
			buttonName: 'READY'
		});
	}

	private applyInitialConfiguration(classic: boolean, filters: boolean): void {
		console.log('Applying initial configuration...');
		console.log('Current config:', this.config);
		
		if (classic) {
			if (!this.classicButton.getIsClicked()) {
				console.log('Classic mode should be ON, simulating click to turn it ON');
				const buttonSystem = this.systems.find(s => s instanceof MenuButtonSystem) as MenuButtonSystem;
				if (buttonSystem) {
					buttonSystem.handleClassicClicked();
				}
			} else {
				console.log('Classic mode already correctly set to ON');
			}
		} else {
			if (this.classicButton.getIsClicked()) {
				console.log('Classic mode should be OFF, simulating click to turn it OFF');
				const buttonSystem = this.systems.find(s => s instanceof MenuButtonSystem) as MenuButtonSystem;
				if (buttonSystem) {
					buttonSystem.handleClassicClicked();
				}
			} else {
				console.log('Classic mode already correctly set to OFF');
			}
		}
		
		if (filters) {
			if (!this.filtersButton.getIsClicked()) {
				console.log('Filters should be OFF, simulating click to turn them OFF');
				const buttonSystem = this.systems.find(s => s instanceof MenuButtonSystem) as MenuButtonSystem;
				if (buttonSystem) {
					buttonSystem.handleFiltersClicked();
				}
			} else {
				console.log('Filters already correctly set to OFF');
			}
		} else {
			if (this.filtersButton.getIsClicked()) {
				console.log('Filters should be ON, simulating click to turn them ON');
				const buttonSystem = this.systems.find(s => s instanceof MenuButtonSystem) as MenuButtonSystem;
				if (buttonSystem) {
					buttonSystem.handleFiltersClicked();
				}
			} else {
				console.log('Filters already correctly set to ON');
			}
		}
	}

	createTitle(){
		const title = new Title("title", "menuContainer", this);
		let titleBackdrop;
		let titleText;
		let titleBlock;
		
		for (const [key, component] of title.components) {
			if (isRenderComponent(component)) {
				if (component.instanceId === 'backDrop') titleBackdrop = component;
				else if (component.instanceId === 'textRender') titleText = component;
				else if (component.instanceId === 'block') titleBlock = component;
			}
		}
	
		this.renderLayers.background.addChild(titleBackdrop!.graphic);
		this.renderLayers.logo.addChild(titleText!.graphic);
		this.renderLayers.logo.addChild(titleBlock!.graphic);
		
		this.entities.push(title);
		
		this.title = title;

		const titleO = new ClassicO("titleO", "menuContainer", this);
		let titleORender = titleO.getComponent('render') as RenderComponent;
		this.menuHidden.addChild(titleORender.graphic);
		this.entities.push(titleO);
		this.titleO = titleO;
	}

	async createEntities(): Promise<void>  {
		this.createBoundingBoxes();

		// Create subtitle
		const subtitle = new Subtitle("subtitle", "menuContainer", this);
		let line1;
		let line2;
		let line3;
		let line4;
		for (const [key, component] of subtitle.components) {
			if (isRenderComponent(component)) {
				if (component.instanceId === 'line1') line1 = component;
				if (component.instanceId === 'line2') line2 = component;
				if (component.instanceId === 'line3') line3 = component;
				if (component.instanceId === 'line4') line4 = component;
			}
		}
		this.renderLayers.subtitle.addChild(line1!.graphic);
		this.renderLayers.subtitle.addChild(line2!.graphic);
		this.renderLayers.subtitle.addChild(line3!.graphic);
		this.renderLayers.subtitle.addChild(line4!.graphic);
		this.entities.push(subtitle);


		// Create Postprocessing Layer
		this.createPostProcessingLayer();

		// Create frame
		this.createFrame();
	}

	createPostProcessingLayer() {
		const postProcessingLayer = new MenuPostProcessingLayer('postProcessing', 'pp', this);
		const ppRender = postProcessingLayer.getComponent('render') as RenderComponent;
		this.renderLayers.pp.addChild(ppRender.graphic);
		this.entities.push(postProcessingLayer);
	}

	initSystems(): void {
		const buttonSystem = new MenuButtonSystem(this);
		const VFXSystem = new MenuVFXSystem();
		const animationSystem = new MenuAnimationSystem(this);
		const renderSystem = new MenuRenderSystem();
		const particleSystem = new MenuParticleSystem(this);
		const postProcessingSystem = new MenuPostProcessingSystem();
		const physicsSystem = new MenuPhysicsSystem(this);
		const lineSystem = new MenuLineSystem(this);
		const secretCodeSystem = new SecretCodeSystem(this);
		
		this.systems.push(buttonSystem);
		this.systems.push(VFXSystem);
		this.systems.push(animationSystem);
		this.systems.push(renderSystem);
		this.systems.push(particleSystem);
		this.systems.push(postProcessingSystem);
		this.systems.push(physicsSystem);
		this.systems.push(lineSystem);
		this.systems.push(secretCodeSystem);

		if (buttonSystem) {
            buttonSystem.updatePlayButtonState();
			// Deactivate filters by default
			buttonSystem.handleFiltersClicked();
        }
	}

	addEntity(entity: Entity): void {
		this.entities.push(entity);
		let targetLayer = this.renderLayers.midground;
	
		if (entity.layer) { //!OJO
			switch(entity.layer) {
				case 'background': targetLayer = this.renderLayers.background; break;
				case 'foreground': targetLayer = this.renderLayers.foreground; break;
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

	initDust() {
		MenuParticleSpawner.setAmbientDustDensity(60, 20);

		MenuParticleSpawner.setAmbientDustColor(getThemeColors(this.config.classicMode).particleGray); 

		MenuParticleSpawner.setAmbientDustSize(5, 12);

		MenuParticleSpawner.setAmbientDustLifetime(200, 260);

		MenuParticleSpawner.setAmbientDustAlpha(0.3, 0.5);

		MenuParticleSpawner.setAmbientDustDriftSpeed(3);

		MenuParticleSpawner.setAmbientDustRotationSpeed(0.001, 0.05);
	}

	createOrnaments() {
		const startOrnament = new MenuOrnament('start-ornament', 'menuContainer', this, 'START');
		const startOrnamentRender = startOrnament.getComponent('render') as RenderComponent;
		this.menuContainer.addChild(startOrnamentRender.graphic);
		this.entities.push(startOrnament);
		this.startOrnament = startOrnament;

		const playOrnament = new MenuOrnament('play-ornament', 'menuContainer', this, 'PLAY');
		const playOrnamentRender = playOrnament.getComponent('render') as RenderComponent;
		this.menuHidden.addChild(playOrnamentRender.graphic);
		this.entities.push(playOrnament);
		this.playOrnament = playOrnament;

		const optionsOrnament = new MenuOrnament('options-ornament', 'menuContainer', this, 'OPTIONS');
		const optionsOrnamentRender = optionsOrnament.getComponent('render') as RenderComponent;
		this.menuContainer.addChild(optionsOrnamentRender.graphic);
		this.entities.push(optionsOrnament);
		this.optionsOrnament = optionsOrnament;

		const optionsClickedOrnament = new MenuOrnament('options-clicked-ornament', 'menuContainer', this, 'OPTIONS_CLICKED');
		const optionsClickedOrnamentRender = optionsClickedOrnament.getComponent('render') as RenderComponent;
		this.menuHidden.addChild(optionsClickedOrnamentRender.graphic);
		this.entities.push(optionsClickedOrnament);
		this.optionsClickedOrnament = optionsClickedOrnament;

		const glossaryOrnament = new MenuOrnament('glossary-ornament', 'menuContainer', this, 'GLOSSARY');
		const glossaryOrnamentRender = glossaryOrnament.getComponent('render') as RenderComponent;
		this.menuContainer.addChild(glossaryOrnamentRender.graphic);
		this.entities.push(glossaryOrnament);
		this.glossaryOrnament = glossaryOrnament;

		const glossaryClickedOrnament = new MenuOrnament('glossary-clicked-ornament', 'menuContainer', this, 'GLOSSARY_CLICKED');
		const glossaryClickedOrnamentRender = glossaryClickedOrnament.getComponent('render') as RenderComponent;
		this.menuHidden.addChild(glossaryClickedOrnamentRender.graphic);
		this.entities.push(glossaryClickedOrnament);
		this.glossaryClickedOrnament = glossaryClickedOrnament;

		const aboutOrnament = new MenuOrnament('about-ornament', 'menuContainer', this, 'ABOUT');
		const aboutOrnamentRender = aboutOrnament.getComponent('render') as RenderComponent;
		this.menuContainer.addChild(aboutOrnamentRender.graphic);
		this.entities.push(aboutOrnament);
		this.aboutOrnament = aboutOrnament;

		const aboutClickedOrnament = new MenuOrnament('about-clicked-ornament', 'menuContainer', this, 'ABOUT_CLICKED');
		const aboutClickedOrnamentRender = aboutClickedOrnament.getComponent('render') as RenderComponent;
		this.menuHidden.addChild(aboutClickedOrnamentRender.graphic);
		this.entities.push(aboutClickedOrnament);
		this.aboutClickedOrnament = aboutClickedOrnament;
	}

	createBoundingBoxes() {
		const boundingBoxA = new Graphics();
		boundingBoxA.rect(0, 0, this.width, this.height);
		boundingBoxA.stroke({width: 0.1, color: getThemeColors(this.config.classicMode).white});

		const boundingBoxB = new Graphics();
		boundingBoxB.rect(0, 0, this.width, this.height);
		boundingBoxB.stroke({width: 0.1, color: getThemeColors(this.config.classicMode).white});

		const boundingBoxC = new Graphics();
		boundingBoxC.rect(0, 0, this.width, this.height);
		boundingBoxC.stroke({width: 0.1, color: getThemeColors(this.config.classicMode).white});

		const boundingBoxD = new Graphics();
		boundingBoxD.rect(0, 0, this.width, this.height);
		boundingBoxD.stroke({width: 0.1, color: getThemeColors(this.config.classicMode).white});

		const boundingBoxE = new Graphics();
		boundingBoxE.rect(0, 0, this.width, this.height);
		boundingBoxE.stroke({width: 0.1, color: getThemeColors(this.config.classicMode).white});

		const boundingBoxF = new Graphics();
		boundingBoxF.rect(0, 0, this.width, this.height);
		boundingBoxF.stroke({width: 0.1, color: getThemeColors(this.config.classicMode).white});

		const boundingBoxG = new Graphics();
		boundingBoxG.rect(0, 0, this.width, this.height);
		boundingBoxG.stroke({width: 0.1, color: getThemeColors(this.config.classicMode).white});

		const boundingBoxH = new Graphics();
		boundingBoxH.rect(0, 0, this.width, this.height);
		boundingBoxH.stroke({width: 0.1, color: getThemeColors(this.config.classicMode).white});

		const boundingBoxI = new Graphics();
		boundingBoxI.rect(0, 0, this.width, this.height);
		boundingBoxI.stroke({width: 0.1, color: getThemeColors(this.config.classicMode).white});

		const boundingBoxJ = new Graphics();
		boundingBoxJ.rect(0, 0, this.width, this.height);
		boundingBoxJ.stroke({width: 0.1, color: getThemeColors(this.config.classicMode).white});

		const boundingBoxK = new Graphics();
		boundingBoxK.rect(0, 0, this.width, this.height);
		boundingBoxK.stroke({width: 0.1, color: getThemeColors(this.config.classicMode).white});

		const boundingBoxL = new Graphics();
		boundingBoxL.rect(0, 0, this.width, this.height);
		boundingBoxL.stroke({width: 0.1, color: getThemeColors(this.config.classicMode).white});
		
		const boundingBoxM = new Graphics();
		boundingBoxM.rect(0, 0, this.width, this.height);
		boundingBoxM.stroke({width: 0.1, color: getThemeColors(this.config.classicMode).white});

		const boundingBoxN = new Graphics();
		boundingBoxN.rect(0, 0, this.width, this.height);
		boundingBoxN.stroke({width: 0.1, color: getThemeColors(this.config.classicMode).white});

		this.renderLayers.blackEnd.addChild(boundingBoxL);
		this.renderLayers.logo.addChild(boundingBoxM);
		this.renderLayers.subtitle.addChild(boundingBoxA);
		this.renderLayers.background.addChild(boundingBoxB);
		this.renderLayers.midground.addChild(boundingBoxC);
		this.renderLayers.foreground.addChild(boundingBoxD);
		this.menuContainer.addChild(boundingBoxN);
		this.renderLayers.dust.addChild(boundingBoxE);
		this.renderLayers.pp.addChild(boundingBoxF);
		this.renderLayers.overlays.addChild(boundingBoxG);
		this.renderLayers.powerups.addChild(boundingBoxH);
		this.renderLayers.powerdowns.addChild(boundingBoxI);
		this.renderLayers.ballchanges.addChild(boundingBoxJ);
		this.renderLayers.overlayQuits.addChild(boundingBoxK);
		renderLayers: {
			blackEnd: Container;
			logo: Container;
			midground: Container;
			subtitle: Container;
			background: Container;
			foreground: Container;
			dust: Container;
			overlays: Container;
			overlayQuits: Container;
			pp: Container;
			powerups: Container;
			powerdowns: Container;
			ballchanges: Container;
		};
	}

	createFrame() {
		const frame = new Graphics();
		frame.rect(0, 0, this.width, this.height);
		frame.stroke({ color: getThemeColors(this.config.classicMode).white, width: 75});
		this.menuContainer.addChild(frame);
		this.frame = frame;

		const subFrame = new Graphics();
		subFrame.rect(0, 0, this.width - 60, this.height - 60);
		subFrame.stroke({ color: getThemeColors(this.config.classicMode).black, width: 5});
		subFrame.x = 30;
		subFrame.y = 30;
		this.menuContainer.addChild(subFrame);
		this.subframe = subFrame;
	}

	redrawFrame() {
		const frame = this.frame;
		frame.clear();
		frame.rect(0, 0, this.width, this.height);
		frame.stroke({ color: getThemeColors(this.config.classicMode).white, width: 75});
		this.menuContainer.addChild(frame);

		const subframe = this.subframe;
		subframe.clear();
		subframe.rect(0, 0, this.width - 60, this.height - 60);
		subframe.stroke({ color: getThemeColors(this.config.classicMode).black, width: 5});
		subframe.x = 30;
		subframe.y = 30;
		this.menuContainer.addChild(subframe);
	}

	private createOverlays(): void {	
		this.glossaryOverlay = new GlossaryOverlay(this);
		this.entities.push(this.glossaryOverlay);
		
		this.aboutOverlay = new AboutOverlay(this);
		this.entities.push(this.aboutOverlay);

		this.playOverlay = new PlayOverlay(this);
		this.entities.push(this.playOverlay);

		this.tournamentOverlay = new TournamentOverlay(this);
		this.entities.push(this.tournamentOverlay);
	}

	createPowerups() {
		MenuPowerupManager.createPowerups(this);
		MenuPowerupManager.createPowerdowns(this);
		MenuPowerupManager.createBallchanges(this);
	}

	async loadImages() {
		await MenuImageManager.loadAssets([
            // Glossary wall figures
			{ name: 'wallPyramids', url: '/wallFigures/wallPyramids.png' },
			{ name: 'wallSteps', url: '/wallFigures/wallSteps.png' },
			{ name: 'wallTrenches', url: '/wallFigures/wallTrenches.png' },
			{ name: 'wallHourglass', url: '/wallFigures/wallHourglass.png' },
			{ name: 'wallLightning', url: '/wallFigures/wallLightning.png' },
			{ name: 'wallFangs', url: '/wallFigures/wallFangs.png' },
			{ name: 'wallWaystones', url: '/wallFigures/wallWaystones.png' },
			{ name: 'wallSnakes', url: '/wallFigures/wallSnakes.png' },
			{ name: 'wallVipers', url: '/wallFigures/wallVipers.png' },
			{ name: 'wallKite', url: '/wallFigures/wallKite.png' },
			{ name: 'wallBowtie', url: '/wallFigures/wallBowtie.png' },
			{ name: 'wallHoneycomb', url: '/wallFigures/wallHoneycomb.png' },

		    // About avatars
			{ name: 'avatarEva', url: '/avatars/square/square1.png' },
			{ name: 'avatarMarc', url: '/avatars/square/square2.png' },
    		{ name: 'avatarNico', url: '/avatars/square/square3.png' },
		    { name: 'avatarHugo', url: '/avatars/square/square4.png' },

			// About classic avatars
			{ name: 'avatarEvaClassic', url: '/avatars/squareClassic/squareClassic1.png' },
			{ name: 'avatarMarcClassic', url: '/avatars/squareClassic/squareClassic2.png' },
    		{ name: 'avatarNicoClassic', url: '/avatars/squareClassic/squareClassic3.png' },
		    { name: 'avatarHugoClassic', url: '/avatars/squareClassic/squareClassic4.png' },

			// Tournament Avatars
			{ name: 'avatarEvaSquare', url: '/avatars/square/square1.png' },
			{ name: 'avatarMarcSquare', url: '/avatars/square/square2.png' },
			{ name: 'avatarNicoSquare', url: '/avatars/square/square3.png' },
			{ name: 'avatarHugoSquare', url: '/avatars/square/square4.png' },
			{ name: 'avatarBotSquare', url: '/avatars/square/squareBot.png' },
			{ name: 'avatarBotClassic', url: '/avatars/squareClassic/squareBotClassic.png' },
			{ name: 'avatarUnknownSquare', url: '/avatars/square/squareUnknown.png' },
			{ name: 'avatarUnknownClassic', url: '/avatars/squareClassic/squareUnknownClassic.png' },
			
			// About pink logos
			{ name: 'typescriptPink', url: '/logos/pink/logo_typescript.png' },
			{ name: 'pixiPink', url: '/logos/pink/logo_pixi.png' },
			{ name: 'tailwindPink', url: '/logos/pink/logo_tailwind.png' },
			{ name: 'nodejsPink', url: '/logos/pink/logo_nodejs.png' },
			{ name: 'fastifyPink', url: '/logos/pink/logo_fastify.png' },
			{ name: 'SQLitePink', url: '/logos/pink/logo_sqlite.png' },
			{ name: 'dockerPink', url: '/logos/pink/logo_docker.png' },
			{ name: 'prometheusPink', url: '/logos/pink/logo_prometheus.png' },
			{ name: 'grafanaPink', url: '/logos/pink/logo_grafana.png' },
			{ name: 'avalanchePink', url: '/logos/pink/logo_avalanche.png' },
			{ name: 'solidityPink', url: '/logos/pink/logo_solidity.png' },

			// About classic logos
			{ name: 'typescriptClassic', url: '/logos/classic/logo_typescript_classic.png' },
			{ name: 'pixiClassic', url: '/logos/classic/logo_pixi_classic.png' },
			{ name: 'tailwindClassic', url: '/logos/classic/logo_tailwind_classic.png' },
			{ name: 'nodejsClassic', url: '/logos/classic/logo_nodejs_classic.png' },
			{ name: 'fastifyClassic', url: '/logos/classic/logo_fastify_classic.png' },
			{ name: 'SQLiteClassic', url: '/logos/classic/logo_sqlite_classic.png' },
			{ name: 'dockerClassic', url: '/logos/classic/logo_docker_classic.png' },
			{ name: 'prometheusClassic', url: '/logos/classic/logo_prometheus_classic.png' },
			{ name: 'grafanaClassic', url: '/logos/classic/logo_grafana_classic.png' },
			{ name: 'avalancheClassic', url: '/logos/classic/logo_avalanche_classic.png' },
			{ name: 'solidityClassic', url: '/logos/classic/logo_solidity_classic.png' },

			// Menu headers
			{ name: 'pongHeaderWhite', url: '/headers/headers_pong_white.svg' },
			{ name: 'pongHeaderBlue', url: '/headers/headers_pong_blue.svg' },
			{ name: 'pongHeaderOrange', url: '/headers/headers_pong_orange.svg' },
			{ name: 'pongHeaderPink', url: '/headers/headers_pong_pink.svg' },
        ]);
	}

	cleanup(): void {
		console.log("Cleaning up menu...");
		
		// Stop and cleanup sounds FIRST - Complete implementation
		if (this.sounds) {
			console.log('Stopping menu sounds...');
			Object.entries(this.sounds).forEach(([key, sound]) => {
				if (sound && typeof sound.stop === 'function') {
					console.log(`Stopping menu sound: ${key}`);
					sound.stop();
				}
				if (sound && typeof sound.unload === 'function') {
					console.log(`Unloading menu sound: ${key}`);
					sound.unload();
				}
			});
			
			// Clear the sounds object
			this.sounds = {} as MenuSounds;
			console.log('All menu sounds stopped and unloaded');
		}
		
		this.app.ticker.stop();
		
		this.systems.forEach(system => {
			if (system.cleanup) {
				system.cleanup();
			}
		});
		this.systems = [];
		
		this.entities.forEach(entity => {
			const render = entity.getComponent('render') as RenderComponent;
			if (render && render.graphic) {
				if (render.graphic.parent) {
					render.graphic.parent.removeChild(render.graphic);
				}
				render.graphic.destroy({ children: true });
			}
			
			const text = entity.getComponent('text') as TextComponent;
			if (text && text.getRenderable()) {
				const renderable = text.getRenderable();
				if (renderable.parent) {
					renderable.parent.removeChild(renderable);
				}
				renderable.destroy();
			}
		});
		this.entities = [];
	
		Object.values(this.renderLayers).forEach(layer => {
			if (layer.parent) {
				layer.parent.removeChild(layer);
			}
			layer.destroy({ children: true });
		});
		
		[this.menuContainer, this.menuHidden, this.visualRoot].forEach(container => {
			if (container && container.parent) {
				container.parent.removeChild(container);
			}
			if (container) {
				container.destroy({ children: true });
			}
		});
	
		MenuPowerupManager.cleanup();
		
		this.app.stage.removeChildren();
		
		console.log("Menu cleanup complete");
	}

	initSounds(): void {
		this.setupAudioContext();
	}

	private setupAudioContext(): void {
		const initializeAudio = () => {
			if (this.audioInitialized) return;
			
			this.sounds = {
				menuBGM: new Howl({
					src: ['/assets/sfx/music/menuFiltered01.mp3'],
					html5: true,
					preload: true,
					loop: true,
					volume: 1.0,
					onload: () => console.log('menuBGM loaded successfully'),
					onloaderror: (id: number, error: any) => console.error('menuBGM failed to load:', error)
				}),
				menuMove: new Howl({
					src: ['/assets/sfx/used/shieldBreakFiltered01.mp3'],
					html5: true,
					preload: true,
					volume: 1.0,
					onload: () => console.log('menuMove loaded successfully'),
					onloaderror: (id: number, error: any) => console.error('menuMove failed to load:', error)
				}),
				menuSelect: new Howl({ 
					src: ['/assets/sfx/used/menuFiltered01.mp3'],
					html5: true,
					preload: true,
					volume: 0.5,
					onload: () => console.log('menuSelect loaded successfully'),
					onloaderror: (id: number, error: any) => console.error('menuSelect failed to load:', error)
				}),
				menuConfirm: new Howl({ 
					src: ['/assets/sfx/used/menuFiltered02.mp3'],
					html5: true,
					preload: true,
					volume: 0.5,
					onload: () => console.log('menuConfirm loaded successfully'),
					onloaderror: (id: number, error: any) => console.error('menuConfirm failed to load:', error)
				}),
				ballClick: new Howl({ 
					src: ['/assets/sfx/used/pongFiltered02.mp3'],
					html5: true,
					preload: true,
					volume: 0.5,
					onload: () => console.log('ballClick loaded successfully'),
					onloaderror: (id: number, error: any) => console.error('ballClick failed to load:', error)
				}),
			};
			
			this.audioInitialized = true;
			
			this.pendingAudio.forEach(fn => fn());
			this.pendingAudio = [];
		};
	
		const events = ['click', 'keydown', 'touchstart', 'mousedown'];
		events.forEach(event => {
			document.addEventListener(event, initializeAudio, { once: true });
		});
	}
	
	public playSound(soundKey: keyof MenuSounds): void {
		if (this.audioInitialized && this.sounds && this.sounds[soundKey]) {
			console.log(`Playing ${soundKey}...`);
			const soundId = this.sounds[soundKey].play();
			console.log(`${soundKey} play returned ID:`, soundId);
		} else {
			console.log(`Queueing ${soundKey} for later playback`);
			this.pendingAudio.push(() => {
				if (this.sounds && this.sounds[soundKey]) {
					console.log(`Playing queued ${soundKey}...`);
					this.sounds[soundKey].play();
				}
			});
		}
	}

	private async clearConflictingAssets(): Promise<void> {
		const conflictingAssets = [
			'avatarUnknownSquare',
			'avatarUnknownClassic',
			// ... other shared assets
		];
		
		for (const assetName of conflictingAssets) {
			try {
				if (Assets.cache.has(assetName)) {
					await Assets.unload(assetName);
				}
			} catch (error) {
				console.warn(`Failed to clear conflicting asset ${assetName}:`, error);
			}
		}
	}

	private applyFirefoxOptimizations(): void {
		if (!this.isFirefox) return;
		
		console.log('Applying Firefox-specific optimizations...');
		
		// Reduce particle density
		this.maxBalls = Math.floor(this.maxBalls * 0.7);
		
		// Disable some intensive visual effects
		this.app.ticker.maxFPS = 60;
		this.app.ticker.minFPS = 30;
		
		// Force garbage collection more frequently (if available)
		if (window.gc) {
			setInterval(() => {
				window.gc!();
			}, 10000);
		}
	}

	// API CALL
	async getUserData(userId: string, token: string): Promise<PlayerData> {
		try {
			console.log(`Fetching user data for user ${userId} with token ${token}`);
			if (!userId || !token) {
				throw new Error('User ID and token are required to fetch user data');
			}
			
			console.log(`Making API call to /api/games/getUserData for user ${userId}`);
			console.log(getApiUrl('/games/getUserData'));
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
			console.log('User data fetched successfully:', data);
			
			return data.userData as PlayerData;
		} catch (error) {
			console.error('Error fetching user data:', error);
			throw error;
		}
	}

	private async testApiCall(): Promise<void> {
		try {
			console.log('Testing API call with real user data...');
			
			const testUserId = '1'; 
			const testToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InBsYXllcjEiLCJ1c2VybmFtZSI6InRlc3R1c2VyIiwiaWF0IjoxNzUxODgxMjg4LCJleHAiOjE3NTE4ODQ4ODh9._x9yAMOPehBHx3hATN-lXKzJRj2j5_g47cuRn7p4hS8";
			
			const userData = await this.getUserData(testUserId, testToken);
			this.playerData = userData;
			console.log('✅ API call successful! Real user data:', userData);
			console.log('User stats from database:', {
				name: userData.name,
				wins: userData.wins,
				losses: userData.losses,
				draws: userData.draws,
				goalsScored: userData.goalsScored,
				goalsConceded: userData.goalsConceded,
				tournaments: userData.tournaments,
				rank: userData.rank
			});
		} catch (error) {
			console.error('❌ API call failed:', error);
		}
	}
	
	createQuickTournament(): void {
		console.log("🏁 Création d'un tournoi de test...");
		
		const participants = [
			{ name: "Player 1", isAI: false },
			{ name: "Player 2", isAI: false },
			{ name: "AI Easy", isAI: true },
			{ name: "AI Hard", isAI: true }
		];
		
		// Initialiser le tournamentController si ce n'est pas fait
		if (!this.tournamentController) {
			this.tournamentController = new TournamentController(this);
		}
		
		const success = this.tournamentController.startTournament(participants);
		
		if (success) {
			console.log("✅ Tournoi créé avec succès !");
			// SUPPRIMÉ : L'overlay est maintenant affiché par handlePlayClick dans MenuButtonSystem
		} else {
			console.error("❌ Erreur lors de la création du tournoi");
		}
	}
    
    // Méthode pour démarrer le prochain match (à connecter au bouton Ready)
    async startTournamentMatch(): Promise<void> {
        if (this.config.variant === 'tournament' && this.tournamentController.isActiveTournament()) {
            await this.tournamentController.startNextMatch();
        }
    }
}