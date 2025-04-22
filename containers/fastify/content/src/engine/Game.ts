/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Game.ts                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/22 17:17:01 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/22 17:25:14 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import * as PIXI from 'pixi.js';

export class PongGame {
    private width: number;
    private height: number;
    private app: PIXI.Application;
    private renderLayers: {
        background: PIXI.Container;
        midground: PIXI.Container;
        foreground: PIXI.Container;
        ui: PIXI.Container;
        pp: PIXI.Container;
    };
    private visualRoot: PIXI.Container;

    constructor() {
        this.width = 1920;
        this.height = 800;
        this.app = null;
        this.renderLayers = {
            background: new PIXI.Container(),
            midground: new PIXI.Container(),
            foreground: new PIXI.Container(),
            ui: new PIXI.Container(),
            pp: new PIXI.Container()
        };
        this.visualRoot = new PIXI.Container();
    }

    public async init(): Promise<void> {
        console.log("Initializing PongGame...");
        this.app = new PIXI.Application() as any;
        (this.app as any).init({
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

        // Set up render layers
        this.visualRoot.sortableChildren = true;
        
        this.app.stage.addChild(this.renderLayers.background);
        this.app.stage.addChild(this.visualRoot);

        this.visualRoot.addChild(this.renderLayers.midground);
        this.visualRoot.addChild(this.renderLayers.foreground);
        this.visualRoot.addChild(this.renderLayers.pp);

        this.app.stage.addChild(this.renderLayers.ui);
        
        // Start the game loop
        this.app.ticker.add(this.gameLoop.bind(this));
        
        console.log("Game initialized successfully!");
    }

    private gameLoop(delta: number): void {
        // This will be expanded later with your game systems
        // For now it's just a placeholder
    }
}
Improve
Explain
