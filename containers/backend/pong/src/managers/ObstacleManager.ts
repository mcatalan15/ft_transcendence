/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   ObstacleManager.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/15 18:37:41 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/15 18:41:41 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { ObstacleSpawner } from '../spawners/ObstacleSpawner';
import { FrameData } from '../utils/Types';

export class ObstacleManager {
    private isSpawningObstacles: boolean = false;
    private obstacleTimer: number = 200;
    
    constructor() {
    }
    
    update(delta: FrameData, worldSystem: any): void {
        this.obstacleTimer -= delta.deltaTime;

        if (this.obstacleTimer <= 0 && !this.isSpawningObstacles) {
            this.isSpawningObstacles = true;
            let depth = this.randomOdd(101, 111);
            
            ObstacleSpawner.buildLedge(worldSystem, depth);
        }
    }
    
    finishedSpawning(): void {
        this.isSpawningObstacles = false;
        this.obstacleTimer = 200 + (Math.random() * 200);
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