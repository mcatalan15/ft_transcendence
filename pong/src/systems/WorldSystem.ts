/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   WorldSystem.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: marvin <marvin@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/25 14:17:16 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/12 11:08:00 by marvin           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import type { PongGame } from '../engine/Game';
import type { Entity } from '../engine/Entity';
import type { System } from '../engine/System'

import { DepthLine } from '../entities/background/DepthLine';

import { RenderComponent } from '../components/RenderComponent';

import { MainBackgroundSpawner } from '../spawners/MainBackgroundSpawner';
import { DesertBackgroundSpawner } from '../spawners/DesertBackgroundSpawner';
import { RuinBackgroundSpawner } from '../spawners/RuinBackgroundSpawner';
import { WaveBackgroundSpawner} from '../spawners/WaveBackgroundSpawner';

import { FrameData, GameEvent, World, DepthLineBehavior } from '../utils/Types';
import { isUI, isDepthLine } from '../utils/Guards';


export class WorldSystem implements System {
	game: PongGame;
	worldTimer: number;

	isSpawningFigures: boolean;
	figureTimer: number;
	
	// New properties for depth line spawning
	private depthLineCooldown: number = 10;
	private lastLineSpawnTime: number = 0;
	private width: number;
	private height: number;
	private topWallOffset: number;
	private bottomWallOffset: number;
	private wallThickness: number;

	depthLineQueue: DepthLine[];
	
	constructor(
		game: PongGame, 
	) {
		this.game = game;
		this.worldTimer = 1000;
		this.width = game.width;
		this.height = game.height;
		this.topWallOffset = game.topWallOffset;
		this.bottomWallOffset = game.bottomWallOffset;
		this.wallThickness = game.wallThickness;
		this.isSpawningFigures = false;
		this.figureTimer = 200;

		this.depthLineQueue = [];
		
		this.game.entities.forEach(entity => {
			if (isUI(entity)) {
				entity.setWorldText(game.currentWorld.name);
			}
		});
	}

	update(entities: Entity[], delta: FrameData){
		// Handle World and Figure timer
		this.worldTimer -= delta.deltaTime;
		this.figureTimer -= delta.deltaTime;

		if (this.worldTimer <= 0){
			//this.changeWorld();
			this.worldTimer = 1000;
		}

		if (this.figureTimer <= 0 && !this.isSpawningFigures) {
			this.isSpawningFigures = true;
			let depth = this.randomOdd(35, 49);
			let idx = Math.floor(Math.random() * 5);
			
			if (this.game.currentWorld.theme === 'desert') {
				switch (idx) {
					case (0):
						DesertBackgroundSpawner.buildTopPyramid(this, depth);
						break;
					case (1):
						DesertBackgroundSpawner.buildBottomPyramid(this, depth);
						break;
					default:
						DesertBackgroundSpawner.buildTopAndBottomPyramid(this, depth);
						break;
				} 
			} else if (this.game.currentWorld.theme === 'ruins') {
				// Use smaller depth for ruin patterns to keep them manageable
				depth = this.randomOdd(50, 60);
				let ruinDivisions = Math.floor(Math.random() * (5 - 3 + 1) + 6);
				
				for (let i = 0; i < ruinDivisions; i++) {
					let innerPosition;
					if (i == 0) {
						innerPosition = 'first';
					} else if (i == ruinDivisions - 1) {
						innerPosition = 'last';
					} else {
						innerPosition = 'middle';
					}
					
					switch (idx) {
						case (0):
							RuinBackgroundSpawner.buildTopRuin(this, depth / ruinDivisions, innerPosition);
							break;
						case (1):
							RuinBackgroundSpawner.buildBottomRuin(this, depth / ruinDivisions, innerPosition);
							break;
						default:
							RuinBackgroundSpawner.buildTopAndBottomRuin(this, depth / ruinDivisions, innerPosition);
							break;
					}
					/* RuinBackgroundSpawner.buildTopAndBottomRuin(this, depth / ruinDivisions, innerPosition); */
				}
			} else if (this.game.currentWorld.theme = 'ocean') {
				depth = this.randomOdd(50, 60);
				WaveBackgroundSpawner.buildWaveBundle(this, depth, {
					    useHeightRamping: true,
						useHorizontalShifting: true,
						heightRampingFactor: 1,
    					horizontalShiftFactor: Math.PI / (depth) // More gentle shifting
				}); 
			}
		}

		// Handle depth line spawning
		this.depthLineCooldown -= delta.deltaTime;
		
		if (this.depthLineCooldown <= 0) {
			if (this.depthLineQueue.length > 0) {
				this.spawnFromQueue();
				this.spawnFromQueue();
			} else {
				this.spawnDepthLines();
			}
			this.depthLineCooldown = 8;
		}
		
		// Initialize depth lines
		this.initializeDepthLines(entities);

		// Catch and handle world change events
		const unhandledEvents = [];

		while (this.game.eventQueue.length > 0) {
			const event = this.game.eventQueue.shift() as GameEvent;

			if (event.type === 'CHANGE_WORLD') {
				const targetWorld = event.target;

				this.game.currentWorld = targetWorld as World;

				for (const entity of entities) {
					if (!isUI(entity)) {
						continue ;
					} else {
						entity.setWorldText((targetWorld as World).name);
					}
				}
			} else {
				unhandledEvents.push(event);
			}
		}
		this.game.eventQueue.push(...unhandledEvents);
	}

	changeWorld() {
		const worldKeys = Object.keys(this.game.worldPool) as Array<keyof typeof this.game.worldPool>;
		
		const randomWorldKey = worldKeys[Math.floor(Math.random() * worldKeys.length)];
		
		const randomWorld = this.game.worldPool[randomWorldKey];
		
		const changeWorldEvent: GameEvent = {
		  type: "CHANGE_WORLD",
		  target: randomWorld
		};
		
		this.game.eventQueue.push(changeWorldEvent);
	}
	
	// New method to spawn depth lines
	private spawnDepthLines(): void {
		this.lastLineSpawnTime = Date.now();

		// Create behavior objects for top and bottom lines
		const behaviorTop: DepthLineBehavior = {
			movement: 'vertical',
			direction: 'upwards',
			fade: 'in',
			// Pyramid specific properties
			pyramidBaseHeight: 0,
			pyramidBaseWidth: this.width / 8,
			pyramidPeakHeight: this.height / 3 - this.game.topWallOffset - this.game.wallThickness,
			pyramidPeakOffset: this.width / 4,
		};
		
		const behaviorBottom: DepthLineBehavior = {
			movement: 'vertical',
			direction: 'downwards',
			fade: 'in',
			// Pyramid specific properties
			pyramidBaseHeight: 0,
			pyramidBaseWidth: this.width / 8,
			pyramidPeakHeight: this.height / 3 - this.game.topWallOffset - this.game.wallThickness,
			pyramidPeakOffset: -this.width / 4,
		};
		
		MainBackgroundSpawner.spawnDepthLine(
			this.game, 
			this.width, 
			this.height, 
			this.topWallOffset, 
			this.bottomWallOffset, 
			this.wallThickness, 
			'top', 
			behaviorTop
		);
		
		MainBackgroundSpawner.spawnDepthLine(
			this.game, 
			this.width, 
			this.height, 
			this.topWallOffset, 
			this.bottomWallOffset, 
			this.wallThickness, 
			'bot', 
			behaviorBottom
		);

		if (this.isSpawningFigures) {
			this.isSpawningFigures = false;
			this.figureTimer = 200 + (Math.random() * 200);
		}
	}

	spawnFromQueue() {
		let line = this.depthLineQueue.pop();

		if (line) {
			this.game.addEntity(line);

			const render = line.getComponent('render') as RenderComponent;
			if (render) {
				this.game.renderLayers.background.addChild(render.graphic);
			}
		}
	}
	
	// New method to initialize depth lines
	private initializeDepthLines(entities: Entity[]): void {
		for (const entity of entities) {
			if (isDepthLine(entity)) {
				const idParts = entity.id.split('-');
				const timestamp = parseInt(idParts[1]);
				if (!entity.initialized && timestamp >= this.lastLineSpawnTime - 100) {
					const render = entity.getComponent('render') as RenderComponent;
					if (render) {
						entity.initialized = true;
						entity.initialY = entity.y;
						entity.alpha = 0;
						render.graphic.alpha = 0;
					}
				}
			}
		}
	}

	randomOdd(min: number, max: number) {
		// Make sure min is odd
		min = min % 2 === 0 ? min + 1 : min;
		
		// Make sure max is odd
		max = max % 2 === 0 ? max - 1 : max;
		
		// Count how many odd numbers are in range
		const oddNumberCount = Math.floor((max - min) / 2) + 1;
		
		// Generate random odd number
		return min + 2 * Math.floor(Math.random() * oddNumberCount);
	  }
	  
}