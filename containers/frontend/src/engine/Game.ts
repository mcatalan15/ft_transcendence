/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Game.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 09:43:00 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/24 12:59:40 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// Import Pixi stuff
// import { Application, Container } from 'pixi.js';
import { Application } from 'pixi.js';

// Import Engine elements (ECS)
import { Entity } from '../engine/Entity';
// import { Component } from '../engine/Component.js';
import { System } from '../engine/System';

// Import defined entities
import { Wall } from '../entities/Wall';
import { Paddle } from '../entities/Paddle'
import { Ball } from '../entities/Ball'

// Import built components
import { RenderComponent } from '../components/RenderComponent';
import { TextComponent } from '../components/TextComponent';
// import { PhysicsComponent } from '../components/PhysicsComponent.js';

// Import Implemented Systems
import { RenderSystem } from '../systems/RenderSystem';
import { InputSystem } from '../systems/InputSystem';
import { PhysicsSystem } from '../systems/PhysicsSystem';

export class PongGame {
	app: Application;
	width: number;
	height: number;
	entities: Entity[];
    systems: System[];
    eventQueue: any[];
    topWallOffset: number;
    bottomWallOffset: number;
    wallThickness: number;

	constructor(app: Application) {
		this.app = app;
		this.width = app.screen.width;
		this.height = app.screen.height;
		this.entities = [];
        this.systems = [];
        this.eventQueue = [];
        this.topWallOffset = 40;
        this.bottomWallOffset = 60;
        this.wallThickness = 20;
	}

	async init(): Promise<void> {
		console.log("Initializing PongGame...");
		
		this.initSystems();
		console.log('Systems initialiazed');

		await this.createEntities();
		console.log('Entities created');

		this.app.ticker.add(() => {
			this.systems.forEach(system => {
				system.update(this.entities, );
			});
		  });
	}

	initSystems(): void {
		const renderSystem = new RenderSystem();
		const inputSystem = new InputSystem();
		const physicsSystem = new PhysicsSystem(this, this.width, this.height);

		this.systems.push(renderSystem);
		this.systems.push(inputSystem);
		this.systems.push(physicsSystem);
	}

	async createEntities(): Promise<void>  {
		// Create Walls
		const wallT = new Wall('wallT', 'foreground', this.width, this.wallThickness, this.topWallOffset);
		const wallTRender = wallT.getComponent('render') as RenderComponent;
		this.app.stage.addChild(wallTRender.graphic)
		this.entities.push(wallT);
		console.log("Top Wall created");

		const wallB = new Wall('wallB', 'foreground', this.width, this.wallThickness, this.height - (this.bottomWallOffset - this.wallThickness));
		const wallBRender = wallB.getComponent('render') as RenderComponent;
		this.app.stage.addChild(wallBRender.graphic);
		this.entities.push(wallB);
		console.log("Bottom wall created");

		// Create Paddles
		const paddleL = new Paddle('paddleL', 'foreground', this, 40, this.height / 2, true, 'LeftPlayer');
		const paddleLRender = paddleL.getComponent('render') as RenderComponent;
		const paddleLText = paddleL.getComponent('text') as TextComponent;
		this.app.stage.addChild(paddleLRender.graphic);
		this.app.stage.addChild(paddleLText.getRenderable());
		this.entities.push(paddleL);
		console.log("Left paddle created");
		
		const paddleR = new Paddle('paddleR', 'foreground', this, this.width - 40, this.height / 2, false, 'RightPlayer');
		const paddleRRender = paddleR.getComponent('render') as RenderComponent;
		const paddleRText = paddleR.getComponent('text') as TextComponent;
		this.app.stage.addChild(paddleRRender.graphic);
		this.app.stage.addChild(paddleRText.getRenderable());
		this.entities.push(paddleR);
		console.log("Right paddle created");

		// Create Ball
		const ball = new Ball('ball', 'foreground', this.width / 2, this.height / 2);
		const ballRender = ball.getComponent('render') as RenderComponent;
		this.app.stage.addChild(ballRender.graphic);
		this.entities.push(ball);
		console.log()
	}

	addEntity(entity: Entity): void {
		this.entities.push(entity);

		const render = entity.getComponent('render') as RenderComponent;
		if (render) {
			this.app.stage.addChild(render.graphic);
		}

		const text = entity.getComponent('text') as TextComponent;
		if (text) {
			this.app.stage.addChild(text.getRenderable());
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
}