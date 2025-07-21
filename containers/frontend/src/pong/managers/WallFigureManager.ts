/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   WallFigureManager.ts                               :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/14 16:39:01 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/21 20:37:09 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { PongGame } from '../engine/Game';

import { WallFiguresSpawner } from '../spawners/WallFiguresSpawner';

export class WallFigureManager {
    private game: PongGame;
    private isSpawningFigures: boolean = false;
    private mustSpawn: boolean = false;
    
    constructor(game: PongGame) {
        this.game = game;
    }
    
    update(worldSystem: any): void {
        if (this.mustSpawn) {
            this.isSpawningFigures = true;
            let depth = 111;
            let idx = Math.floor(Math.random() * 7);

            switch(idx) {
                case (1):
                    this.game.data.walls.pyramids++;    
                WallFiguresSpawner.buildPyramids(worldSystem, depth);
                    break;
                case (2):
                    this.game.data.walls.trenches++;
                    WallFiguresSpawner.buildTrenches(worldSystem, depth);
                    break;
				case (3):
					this.game.data.walls.lightnings++;
                    WallFiguresSpawner.buildLightning(worldSystem, depth);
					break;
                case (4):
                    this.game.data.walls.escalators++;
                    WallFiguresSpawner.buildSteps(worldSystem, depth);
                    break;
                case (5):
                    this.game.data.walls.hourglasses++;
                    WallFiguresSpawner.buildAccelerator(worldSystem, depth);
                    break;
                case (6):
                    this.game.data.walls.maws++;
                    WallFiguresSpawner.buildMaw(worldSystem, depth);
                    break;
                default:
                    this.game.data.walls.rakes++;
                    WallFiguresSpawner.buildRakes(worldSystem, depth);
            }
        }

        this.mustSpawn = false;
    }

    activateSpawning(): void {
        this.mustSpawn = true;
    }
    
    finishedSpawning(): void {
        this.isSpawningFigures = false;
        this.mustSpawn = false;
    }
    
    isSpawning(): boolean {
        return this.isSpawningFigures;
    }
    
    randomOdd(min: number, max: number): number {
        min = min % 2 === 0 ? min + 1 : min;
        
        max = max % 2 === 0 ? max - 1 : max;
        
        const oddNumberCount = Math.floor((max - min) / 2) + 1;
        
        return min + 2 * Math.floor(Math.random() * oddNumberCount);
    }

    cleanup(): void {
        this.isSpawningFigures = false;
        this.mustSpawn = false;
        
        if (this.game.data && this.game.data.walls) {
            this.game.data.walls.pyramids = 0;
            this.game.data.walls.trenches = 0;
            this.game.data.walls.lightnings = 0;
            this.game.data.walls.escalators = 0;
            this.game.data.walls.hourglasses = 0;
            this.game.data.walls.maws = 0;
            this.game.data.walls.rakes = 0;
        }
    }
}