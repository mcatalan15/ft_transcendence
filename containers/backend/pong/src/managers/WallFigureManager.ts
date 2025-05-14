/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   WallFigureManager.ts                               :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/14 16:39:01 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/14 19:55:08 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { PongGame } from '../engine/Game';
import { WallFiguresSpawner } from '../spawners/WallFiguresSpawner';
import { FrameData } from '../utils/Types';

export class WallFigureManager {
    private game: PongGame;
    private isSpawningFigures: boolean = false;
    private figureTimer: number = 200;
    
    constructor(game: PongGame) {
        this.game = game;
    }
    
    update(delta: FrameData, worldSystem: any): void {
        this.figureTimer -= delta.deltaTime;

        if (this.figureTimer <= 0 && !this.isSpawningFigures) {
            this.isSpawningFigures = true;
            let depth = this.randomOdd(101, 111);
            let idx = Math.floor(Math.random() * 4);
            
            switch(idx) {
                case (1):
                    WallFiguresSpawner.buildPyramids(worldSystem, depth);
                    break;
                case (2):
                    WallFiguresSpawner.buildParapets(worldSystem, depth);
                    break;
				case (3):
					WallFiguresSpawner.buildSawEdges(worldSystem, depth);
					break;
                default:
                    WallFiguresSpawner.buildEscalator(worldSystem, depth);
            }
        }
    }
    
    finishedSpawning(): void {
        this.isSpawningFigures = false;
        this.figureTimer = 200 + (Math.random() * 200);
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