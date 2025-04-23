/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Game.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/09 16:16:07 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/23 16:31:05 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Application, Container, Graphics } from 'pixi.js';
import { RenderSystem } from '../systems/RenderSystem.ts';
import { PhysicsSystem } from '../systems/PhysicsSystem.ts';
import { InputSystem } from '../systems/InputSystem.ts';
/*import { VFXSystem } from '../systems/VFXSystem.ts';
import { ParticleSystem } from '../systems/ParticleSystem.ts';
import { UISystem } from '../systems/UISystem.ts';
import { AnimationSystem } from '../systems/AnimationSystem.ts';
import { PowerupSystem } from '../systems/PowerupSystem.ts';
import { PostProcessingSystem } from '../systems/PostProcessingSystem.ts';*/
import { Ball } from '../entities/Ball.ts';
import { Paddle } from '../entities/Paddle.ts';
import { Wall } from '../entities/Wall.ts';
import { UI } from '../entities/UI.ts';
import { PostProcessingLayer } from '../entities/PostProcessingLayer.ts';
import { Entity } from '../engine/Entity.ts';
import { TextComponent } from '../components/TextComponent.ts';
import { RenderComponent } from '../components/RenderComponent.ts';
import {Howl, Howler} from 'howler';

type PlayerData = {
    players: Array<{
        id: string;
        name: string;
    }>;
};

type Sound = {
    play: () => void;
};

type RenderLayers = {
    background: Container;
    midground: Container;
    foreground: Container;
    ui: Container;
    pp: Container;
};

type System = {
    update: (entities: Entity[], delta: number) => void;
};

export class PongGame {
    width: number;
    height: number;
    app: Application | null;
    entities: Entity[];
    systems: System[];
    eventQueue: any[];
    topWallOffset: number;
    bottomWallOffset: number;
    wallThickness: number;
    renderLayers: RenderLayers;
    visualRoot: Container;
    sounds: Record<string, Sound>;

    constructor() {
        this.width = 1920; // 1500
        this.height = 800; // 500
        this.app = null;
        this.entities = [];
        this.systems = [];
        this.eventQueue = [];
        this.topWallOffset = 40;
        this.bottomWallOffset = 60;
        this.wallThickness = 20;
        this.renderLayers = {} as RenderLayers;
        this.visualRoot = new Container();
        this.sounds = {};
    }

    async init(): Promise<void> {
        console.log("Initializing PongGame...");
        this.app = new Application();
        await this.app.init({
            background: '#171717',
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

        this.renderLayers = {
            background: new Container(),
            midground: new Container(),
            foreground: new Container(),
            ui: new Container(),
            pp: new Container(),
        };

        this.visualRoot = new Container();
        this.visualRoot.sortableChildren = true;
        
        this.app.stage.addChild(this.renderLayers.background);
        this.app.stage.addChild(this.visualRoot);

        // this.visualRoot.addChild(this.renderLayers.background); // Off because the depth lines with scanlines is giving me a headache
        this.visualRoot.addChild(this.renderLayers.midground);
        this.visualRoot.addChild(this.renderLayers.foreground);
        // this.visualRoot.addChild(this.renderLayers.ui);
        this.visualRoot.addChild(this.renderLayers.pp);

        this.app.stage.addChild(this.renderLayers.ui);
        // this.app.stage.addChild(this.renderLayers.background);
        
        this.initSystems();
        this.initSounds();
        await this.createEntities();

        this.app.ticker.add(this.gameLoop.bind(this));
    }

    // Helper functions to initialize all existing game systems
    initSystems(): void {
        const renderSystem = new RenderSystem(this, this.app as Application);
        const physicsSystem = new PhysicsSystem(this, this.width, this.height);
        const inputSystem = new InputSystem();
       /* const vfxSystem = new VFXSystem(this, this.width, this.height);
        const particleSystem = new ParticleSystem(this);
        const uiSystem = new UISystem(this, this.app as Application);
        const animationSystem = new AnimationSystem(this, this.app as Application, this.width, this.height, this.topWallOffset, this.bottomWallOffset, this.wallThickness);
        const postProcessingSystem = new PostProcessingSystem();
        const powerupSystem = new PowerupSystem(this, this.app as Application, this.width, this.height);*/

        this.systems.push(renderSystem);
        this.systems.push(physicsSystem);
        this.systems.push(inputSystem);
        /*this.systems.push(vfxSystem);
        this.systems.push(particleSystem);
        this.systems.push(uiSystem);
        this.systems.push(animationSystem);
        this.systems.push(postProcessingSystem);
        this.systems.push(powerupSystem);*/
    }

    initSounds(): void {
        this.sounds = {
            pong: new Howl({ src: ['src/assets/sfx/pong.wav'] }),
            powerup: new Howl({ src: ['src/assets/sfx/powerup.wav'] }),
            death: new Howl({ src: ['src/assets/sfx/death.wav'] }),
            paddleReset: new Howl({ src: ['src/assets/sfx/paddleReset.wav'] }),
        };
        console.log('Howler sounds initialized.');
    }

    async createEntities(): Promise<void> {
        // Fetch player info from jsons
        let playerData: PlayerData;
        const response = await fetch('../../data/players.json'); // If using an actual JSON file
        playerData = await response.json();

        const leftPlayer = playerData.players.find(p => p.id === "paddleL") || { name: "Player 1" };
        const rightPlayer = playerData.players.find(p => p.id === "paddleR") || { name: "Player 2" };

        console.log(`${leftPlayer.name}  vs  ${rightPlayer.name}`);

        // Create Top Wall
        const wallT = new Wall('wallT', 'foreground', this.width, this.height, this.wallThickness, this.topWallOffset);
        const wallTRender = wallT.getComponent('render') as RenderComponent;
        this.renderLayers.foreground.addChild(wallTRender.graphic);
        this.entities.push(wallT);
        console.log("wallT created.");

        // Create Bottom Wall
        const wallB = new Wall('wallB', 'foreground', this.width, this.height, this.wallThickness, this.height - this.bottomWallOffset);
        const wallBRender = wallB.getComponent('render') as RenderComponent;
        this.renderLayers.foreground.addChild(wallBRender.graphic);
        this.entities.push(wallB);
        console.log("wallB created.");
        
        // Create Ball
        const ball = new Ball('ball', 'foreground', this.width / 2, this.height / 2);
        const ballRender = ball.getComponent('render') as RenderComponent;
        this.renderLayers.foreground.addChild(ballRender.graphic);
        this.entities.push(ball);
        console.log("Ball created.");

        // Create left paddle
        const paddleL = new Paddle('paddleL', 'foreground', this, 40, this.height / 2, true, leftPlayer.name);
        const paddleLRender = paddleL.getComponent('render') as RenderComponent;
        this.renderLayers.foreground.addChild(paddleLRender.graphic);
        const paddleLText = paddleL.getComponent('text') as TextComponent | null;
        if (paddleLText) {
            this.renderLayers.foreground.addChild(paddleLText.getRenderable());
        }
        this.entities.push(paddleL);
        console.log("PaddleL created.");

        // Create right paddle
        const paddleR = new Paddle('paddleR', 'foreground', this, this.width - 40, this.height / 2, false, rightPlayer.name);
        const paddleRRender = paddleR.getComponent('render') as RenderComponent;
        this.renderLayers.foreground.addChild(paddleRRender.graphic);
        const paddleRText = paddleR.getComponent('text') as TextComponent | null;
        if (paddleRText) {
            this.renderLayers.foreground.addChild(paddleRText.getRenderable());
        }
        this.entities.push(paddleR);
        console.log("PaddleR created.");

        // Create UI
        const overlay = new UI('UI', 'ui', this.width, this.height, this.topWallOffset - this.wallThickness);
        const overlayText = overlay.getComponent('text') as TextComponent;
        this.renderLayers.ui.addChild(overlayText.getRenderable());
        this.entities.push(overlay);
        console.log("UI created.");

		/*
        // Create Postprocessing Layer
        const postProcessingLayer = new PostProcessingLayer('postProcessing', 'pp', this, this.app as Application, this.renderLayers);
        const postRender = postProcessingLayer.getComponent('render') as RenderComponent;
        this.renderLayers.pp.addChild(postRender.graphic);
        this.entities.push(postProcessingLayer);
        console.log("PostProcessingLayer created.");*/
    }

    addEntity(entity: Entity): void {
        this.entities.push(entity);
        let targetLayer = this.renderLayers.midground;

        if (entity.layer) {
            switch (entity.layer) {
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

        const render = entity.getComponent('render') as RenderComponent | null;
        if (render?.graphic) {
            targetLayer.addChild(render.graphic);
        }
    
        const text = entity.getComponent('text') as TextComponent | null;
        if (text?.getRenderable) {
            targetLayer.addChild(text.getRenderable());
        }
    }
    
    removeEntity(entityId: string): void {
        const index = this.entities.findIndex(e => e.id === entityId);
        if (index !== -1) {
            const entity = this.entities[index];
            const render = entity.getComponent('render') as RenderComponent | null;
            if (render?.graphic?.destroy) {
                render.graphic.destroy();
            }
            const text = entity.getComponent('text') as TextComponent | null;
            if (text?.getRenderable()?.destroy) {
                text.getRenderable().destroy();
            }
            this.entities.splice(index, 1);
        }
    }

    gameLoop(delta: number): void {
        this.systems.forEach(system => {
            system.update(this.entities, delta);
        });
    }
}