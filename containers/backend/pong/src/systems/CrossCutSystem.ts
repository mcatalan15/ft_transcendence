/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   CrossCutSystem.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 09:55:06 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/14 18:55:04 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Point } from 'pixi.js';
import { PongGame } from '../engine/Game';
import type { System } from '../engine/System';

import { CrossCutSpawner } from '../spawners/CrossCutSpawner';

import { isCrossCut } from '../utils/Guards';
import { GameEvent } from '../utils/Types';

export class CrossCutSystem implements System {
    game: PongGame;

    constructor(game: PongGame) {
        this.game = game;
    }
    
    update(): void {
        const unhandledEvents: GameEvent[] = [];
        
        // Event handler mapping
        const handlers: Record<string, (event: GameEvent) => void> = {
            'spawnTop': (e) => {
                if (e.points && e.x !== undefined && e.y !== undefined) {
                    CrossCutSpawner.spawnCrossCut(this.game, e.points, "top", e.x, e.y);
                }
            },
            'spawnBottom': (e) => {
                if (e.points && e.x !== undefined && e.y !== undefined) {
                    CrossCutSpawner.spawnCrossCut(this.game, e.points, "bottom", e.x, e.y);
                }
            },
            'transformTop': (e) => {
                if (e.points) {
                    this.transformCutsByPosition('top', e.points);
                }
            },
            'transformBottom': (e) => {
                if (e.points) {
                    this.transformCutsByPosition('bottom', e.points);
                }
            },
            'despawn': () => {
                this.despawnAllCuts();
            }
        };

        while (this.game.eventQueue.length > 0) {
            const event = this.game.eventQueue.shift() as GameEvent;
            
            if (event.type.endsWith("CrossCut")) {
                // Extract the handler key
                const handlerKey = Object.keys(handlers).find(key => event.type.startsWith(key));
                
                if (handlerKey) {
                    handlers[handlerKey](event);
                } else {
                    unhandledEvents.push(event);
                }
            } else {
                unhandledEvents.push(event);
            }
        }

        this.game.eventQueue.push(...unhandledEvents);
    }
    
    private transformCutsByPosition(position: string, points: Point[]): void {
        for (const entity of this.game.entities) {
            if (isCrossCut(entity) && entity.position === position) {
                entity.transformCrossCut(points);
            }
        }
    }
    
    private despawnAllCuts(): void {
        for (const entity of this.game.entities) {
            if (isCrossCut(entity)) {
                this.game.removeEntity(entity.id);
            }
        }
    }
}