/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Game.js                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/01 11:26:23 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/01 13:55:48 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { RenderSystem } from '../systems/RenderSystem.js';
import { PhysicsSystem } from '../systems/PhysicsSystem.js';
import { InputSystem } from '../systems/InputSystem.js';
import { Border } from '../entities/Border.js'
import { Paddle } from '../entities/Paddle.js'
import { Ball } from '../entities/Ball.js'

export class PongGame {
    constructor() {
        this.width = 1920;
        this.height = 1080;
        this.app = null;
        this.entities = [];
        this.systems = [];
    }
    
    async init() {
        console.log("Initializing PongGame...");
        this.app = new PIXI.Application();
        
        await this.app.init({ background: 'black', width: this.width, height: this.height });
        
        const gameContainer = document.getElementById('game-container');
        if (!gameContainer) {
            throw new Error("Game container not found!");
        }
        
        gameContainer.appendChild(this.app.canvas);
        console.log("Canvas added to game container");
        
        // Initialize systems
        this.initSystems();
        
        // Create game entities
        this.createEntities();
        
        // Start game loop
        this.app.ticker.add(this.gameLoop.bind(this));
    }
    
    initSystems() {
        // Import and initialize all game systems
        const renderSystem = new RenderSystem(this.app);
        const physicsSystem = new PhysicsSystem(this.width, this.height);
        const inputSystem = new InputSystem();
        
        this.systems.push(renderSystem);
        this.systems.push(physicsSystem);
        this.systems.push(inputSystem);
    }
    
    createEntities() {
        // Create border
        const border = new Border('border', this.width, this.height);
        this.app.stage.addChild(border.getComponent('render').graphic);
        this.entities.push(border);
        
        // Create paddles
        const paddleL = new Paddle('paddleL', 20, this.height / 2 - 50, true);
        this.app.stage.addChild(paddleL.getComponent('render').graphic);
        this.entities.push(paddleL);
        
        const paddleR = new Paddle('paddleR', this.width - 30, this.height / 2 - 50, false);
        this.app.stage.addChild(paddleR.getComponent('render').graphic);
        this.entities.push(paddleR);
        
        // Create ball
        const ball = new Ball('ball', this.width / 2, this.height / 2);
        this.app.stage.addChild(ball.getComponent('render').graphic);
        this.entities.push(ball);
    }
    
    gameLoop(delta) {
        // Update all systems
        this.systems.forEach(system => {
            system.update(this.entities, delta);
        });
    }
}