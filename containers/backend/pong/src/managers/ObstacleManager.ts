/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   ObstacleManager.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/15 18:37:41 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/17 20:55:05 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { ObstacleSpawner } from '../spawners/ObstacleSpawner';

export class ObstacleManager {
    private isSpawningObstacles: boolean = false;
    private mustSpawn: boolean = false;
    
    constructor() {
    }
    
    update(worldSystem: any): void {
        if (this.mustSpawn) {
            this.isSpawningObstacles = true;
            let depth = this.randomOdd(71, 81);
            let idx = Math.floor(Math.random() * 2);

            switch(idx) {
                case (1):
                    console.log('Spawning a ledge obstacle');
                    ObstacleSpawner.buildLedge(worldSystem, depth);
                    break;
                default:
                    console.log('Spawning a pachinko obstacle');
                    const pattern = Math.floor(Math.random() * 3);
                    ObstacleSpawner.buildPachinko(worldSystem, depth, pattern);
            }
        }

        this.mustSpawn = false;
    }
    
    activateSpawning(): void {
        this.mustSpawn = true;
    }

    finishedSpawning(): void {
        this.isSpawningObstacles = false;
        this.mustSpawn = false;
    }
    
    isSpawning(): boolean {
        return this.isSpawningObstacles;
    }
    
    randomOdd(min: number, max: number): number {
        min = min % 2 === 0 ? min + 1 : min;
        
        max = max % 2 === 0 ? max - 1 : max;
        
        const oddNumberCount = Math.floor((max - min) / 2) + 1;
        
        return min + 2 * Math.floor(Math.random() * oddNumberCount);
    }
}