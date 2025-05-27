/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   WallFigureManager.ts                               :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/14 16:39:01 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/27 12:39:05 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { WallFiguresSpawner } from '../spawners/WallFiguresSpawner';

export class WallFigureManager {
    private isSpawningFigures: boolean = false;
    private mustSpawn: boolean = false;
    
    constructor() {
    }
    
    update(worldSystem: any): void {
        if (this.mustSpawn) {
            this.isSpawningFigures = true;
            let depth = 111;
            let idx = Math.floor(Math.random() * 7);

            switch(idx) {
                case (1):
                    console.log('Spawning pyramids obstacle');    
                    WallFiguresSpawner.buildPyramids(worldSystem, depth);
                    break;
                case (2):
                    console.log('Spawning parapets obstacle');    
                    WallFiguresSpawner.buildTrenches(worldSystem, depth);
                    break;
				case (3):
					console.log('Spawning sawedge obstacle');
                    WallFiguresSpawner.buildLightning(worldSystem, depth);
					break;
                case (4):
                    console.log('Spawning escalator obstacle');
                    WallFiguresSpawner.buildSteps(worldSystem, depth);
                    break;
                case (5):
                    console.log('Spawning accelerator obstacle');
                    WallFiguresSpawner.buildAccelerator(worldSystem, depth);
                    break;
                case (6):
                    console.log('Spawning maw obstacle');
                    WallFiguresSpawner.buildMaw(worldSystem, depth);
                    break;
                default:
                    console.log('Spawning rakes obstacle');
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
}