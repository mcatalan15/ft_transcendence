import { Application } from 'pixi.js';
import { Container } from 'pixi.js';

export class PongGame {
	app: Application;
	width: number;
	height: number;

	constructor(app: Application) {
		this.app = app;
		this.width = app.screen.width;
		this.height = app.screen.height;
	}

	async init(): Promise<void> {
		console.log("Initializing PongGame...");
		// use this.app normally
	}
}