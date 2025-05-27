/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   ObstacleManager.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/15 18:37:41 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/27 17:58:54 by hmunoz-g         ###   ########.fr       */
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
            let depth = 141;
            let idx = Math.floor(Math.random() * 3);

            switch(idx) {
                case (0):
                    ObstacleSpawner.buildLedge(worldSystem, depth);
                    break;
                case (1):
                    const pachinkoPattern = Math.floor(Math.random() * 3);
                    ObstacleSpawner.buildPachinko(worldSystem, depth, pachinkoPattern);
                    break;
                default:
                    const windmillPattern = Math.floor(Math.random() * 2)
                    ObstacleSpawner.buildWindmills(worldSystem, depth, windmillPattern);
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