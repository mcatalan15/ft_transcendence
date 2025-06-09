/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Menu.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/02 18:04:50 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/08 21:50:22 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// Import Pixi and Howler stuff
import { Application, Container, Graphics, FederatedPointerEvent } from 'pixi.js';
import { Howl } from 'howler';

// Import G A M E
import { PongGame } from '../engine/Game';
import { GameConfig } from './GameConfig';

// Import Engine elements (ECS)
import { Entity } from '../engine/Entity';
import { System } from '../engine/System';
import { Title } from './Title';
import { Subtitle } from './Subtitle';
import { ClassicO } from './ClassicO';

import { MenuPostProcessingLayer } from './MenuPostProcessingLayer';
import { MenuButton } from './buttons/MenuButton';
import { MenuHalfButton } from './buttons/MenuHalfButton';
import { MenuXButton } from './buttons/MenuXButton';
import { BallButton } from './buttons/BallButton';

import { MenuOrnament } from './MenuOrnaments';

// Import components
import { RenderComponent } from '../components/RenderComponent';
import { TextComponent } from '../components/TextComponent';

// Import spawners and Managers
import { MenuParticleSpawner } from './MenuParticleSpawner';
import { MenuBallSpawner } from './MenuBallSpawner';
import { ButtonManager } from './ButtonManager';

// Import Implemented Systems
import { MenuRenderSystem } from './MenuRenderSystem';
import { MenuAnimationSystem } from './MenuAnimationSystem';
import { MenuParticleSystem } from './MenuParticleSystem';
import { MenuPostProcessingSystem } from './MenuPostProcessingSystem';

import { MenuPhysicsSystem } from './MenuPhysicsSystem';
import { MenuVFXSystem } from './MenuVFXSystem';
import { MenuLineSystem } from './MenuLineSystem';
import { VFXComponent } from '../components/VFXComponent';
import { ButtonSystem } from './MenuButtonSystem';


import { GAME_COLORS , FrameData, MenuSounds, GameEvent } from '../utils/Types';
import * as menuUtils from '../utils/MenuUtils'
import { getThemeColors } from '../utils/Utils';
import { isMenuOrnament, isRenderComponent } from '../utils/Guards';

export class Menu{
	config: GameConfig;
	app: Application;
	width: number;
	height: number;
	ballAmount: number = 0;
	maxBalls: number = 20;
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
		pp: Container;
	};
	visualRoot: Container;
	visualRootFilters: any[] = [];
	menuContainerFilters: any[] = [];

	// Sound stuff
	sounds!: MenuSounds;

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

	// Ornaments
	frame!: Graphics;
	startOrnament!: MenuOrnament;
	playOrnament!: MenuOrnament;
	optionsOrnament!: MenuOrnament;
	optionsClickedOrnament!: MenuOrnament;
	glossaryOrnament!: MenuOrnament;
	aboutOrnament!: MenuOrnament;

	constructor(app: Application) {
		this.app = app;
		this.width = app.screen.width;
		this.height = app.screen.height;
		this.menuContainer = new Container();
		this.menuHidden = new Container();

		this.renderLayers = {
			blackEnd: new Container(),
			background: new Container(),
			logo: new Container(),
			subtitle: new Container(),
			midground: new Container(),
			foreground: new Container(),
			pp: new Container(),
		};
		this.visualRoot = new Container();
		this.visualRoot.sortableChildren = true;

		this.app.stage.addChild(this.renderLayers.blackEnd);

		this.app.stage.addChild(this.menuContainer);
		this.app.stage.addChild(this.renderLayers.background);
		this.app.stage.addChild(this.visualRoot);
		this.app.stage.addChild(this.menuContainer);
	
		this.visualRoot.addChild(this.renderLayers.background);
		this.visualRoot.addChild(this.renderLayers.logo);
		this.visualRoot.addChild(this.renderLayers.midground);
		this.visualRoot.addChild(this.renderLayers.subtitle);
		this.visualRoot.addChild(this.renderLayers.foreground);
		this.visualRoot.addChild(this.renderLayers.pp);

		this.renderLayers.blackEnd.addChild(menuUtils.setMenuBackground(app));
		this.initSounds();

		//! GAME CONFIGURATION TO BE FED IN MENU, SENT TO BACKEND
		this.config = {
			mode: 'local',
			variant: '1v1',
			classicMode: false,
			filters: true,
			powerupsEnabled: true,
			players: [
				{ name: 'Player 1', type: 'human', side: 'left' },
				{ name: 'Player 2', type: 'human', side: 'right' }
			]
		};
	}

	async init(): Promise<void> {
		await ButtonManager.createMainButtons(this);
		await ButtonManager.createHalfButtons(this);
		await ButtonManager.createXButtons(this);
		await ButtonManager.createBallButton(this);
		await this.createOrnaments();
		await this.createEntities();
		await this.createTitle();
		await this.initSystems();
		await this.initDust();

		this.sounds.menuBGM.play();

		this.app.ticker.add((ticker) => {
			const frameData: FrameData = {
				deltaTime: ticker.deltaTime
			};
		
			this.systems.forEach(system => {
				system.update(this.entities, frameData);
			});
		});
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
		const buttonSystem = new ButtonSystem(this);
		const VFXSystem = new MenuVFXSystem();
		const animationSystem = new MenuAnimationSystem(this);
		const renderSystem = new MenuRenderSystem();
		const particleSystem = new MenuParticleSystem(this);
		const postProcessingSystem = new MenuPostProcessingSystem();
		const physicsSystem = new MenuPhysicsSystem(this);
		const lineSystem = new MenuLineSystem(this);
		
		this.systems.push(buttonSystem);
		this.systems.push(VFXSystem);
		this.systems.push(animationSystem);
		this.systems.push(renderSystem);
		this.systems.push(particleSystem);
		this.systems.push(postProcessingSystem);
		this.systems.push(physicsSystem);
		this.systems.push(lineSystem);

		if (buttonSystem) {
            buttonSystem.updatePlayButtonState();
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

		const aboutOrnament = new MenuOrnament('about-ornament', 'menuContainer', this, 'ABOUT');
		const aboutOrnamentRender = aboutOrnament.getComponent('render') as RenderComponent;
		this.menuContainer.addChild(aboutOrnamentRender.graphic);
		this.entities.push(aboutOrnament);
		this.aboutOrnament = aboutOrnament;
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

		this.renderLayers.logo.addChild(boundingBoxA);
		this.renderLayers.background.addChild(boundingBoxB);
		this.renderLayers.midground.addChild(boundingBoxC);
		this.renderLayers.foreground.addChild(boundingBoxD);
		this.menuContainer.addChild(boundingBoxE);
		this.renderLayers.pp.addChild(boundingBoxF);
		
	}

	createFrame() {
		const frame = new Graphics();
		frame.rect(0, 0, this.width, this.height);
		frame.stroke({ color: getThemeColors(this.config.classicMode).white, width: 75});
		this.menuContainer.addChild(frame);
		this.frame = frame;
	}

	redrawFrame() {
		const frame = this.frame;
		frame.clear();
		frame.rect(0, 0, this.width, this.height);
		frame.stroke({ color: getThemeColors(this.config.classicMode).white, width: 75});
		this.menuContainer.addChild(frame);
	}

	//! EXPAND THIS TO MAKE A DEEP CLEANUP
	cleanup(): void {
		console.log("Cleaning up menu...");
		
		this.systems.forEach(system => {
			if ('cleanup' in system && typeof system.cleanup === 'function') {
				(system as any).cleanup();
			}
		});
		this.systems = [];
		
		this.entities.forEach(entity => {
			const render = entity.getComponent('render') as RenderComponent;
			if (render && render.graphic) {
				render.graphic.destroy();
			}
			
			const text = entity.getComponent('text') as TextComponent;
			if (text && text.getRenderable()) {
				text.getRenderable().destroy();
			}
		});
		this.entities = [];
		
		Object.values(this.renderLayers).forEach(layer => {
			if (layer.parent) {
				layer.parent.removeChild(layer);
			}
			layer.destroy({ children: true });
		});
		
		if (this.menuContainer.parent) {
			this.menuContainer.parent.removeChild(this.menuContainer);
		}
		this.menuContainer.destroy({ children: true });
		
		if (this.visualRoot.parent) {
			this.visualRoot.parent.removeChild(this.visualRoot);
		}
		this.visualRoot.destroy({ children: true });
		
		this.app.stage.removeChildren();
		
		this.app.stage.children.forEach(child => {
			if (child && child.destroy) {
				child.destroy({ children: true });
			}
		});
		
		console.log("Menu cleanup complete");
	}

	initSounds(): void {
		this.sounds = {
			menuBGM: new Howl({
				src: ['src/assets/sfx/music/menuFiltered01.mp3'],
				preload: true,
				loop: true,
				volume: 0.5
			}),
			menuMove: new Howl({
				src: ['src/assets/sfx/used/shieldBreakFiltered01.mp3'],
				preload: true,
				volume: 0.5
			}),
			menuSelect: new Howl({ 
				src: ['src/assets/sfx/used/menuFiltered01.mp3'],
				preload: true,
				volume: 0.5,	
			}),
			menuConfirm: new Howl({ 
				src: ['src/assets/sfx/used/menuFiltered02.mp3'],
				preload: true,
				volume: 0.5,
			}),
			ballClick: new Howl({ 
				src: ['src/assets/sfx/used/pongFiltered02.mp3'],
				preload: true,
				volume: 0.5,
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
}