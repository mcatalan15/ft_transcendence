/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   CrossCutSystem.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 09:55:06 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/04 14:47:21 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Point } from 'pixi.js';

import { PongGame } from '../engine/Game';
import type { System } from '../engine/System';
import { CrossCut } from '../entities/crossCuts/CrossCut';

import { CrossCutFactory, CrossCutPosition } from '../factories/CrossCutFactory';
import { GameEvent } from '../utils/Types';

export class CrossCutSystem implements System {
    game: PongGame;

    constructor(game: PongGame) {
        this.game = game;
    }
    
    update(): void {
        const unhandledEvents: GameEvent[] = [];
        
        while (this.game.eventQueue.length > 0) {
            const event = this.game.eventQueue.shift() as GameEvent;
            
            if (event.type.endsWith("CrossCut")) {
                this.handleCrossCutEvent(event);
            } else {
                unhandledEvents.push(event);
            }
        }

        this.game.eventQueue.push(...unhandledEvents);
    }
    
    private handleCrossCutEvent(event: GameEvent): void {

        if (!event.points) {
            console.warn('Cross-cut event missing points:', event);
            return;
        }
        
        // Parse the event type to determine the action
        if (event.type.startsWith('spawn')) {
            this.handleSpawnEvent(event);
        } else if (event.type.startsWith('transform')) {
            this.handleTransformEvent(event);
        } else if (event.type.startsWith('despawn')) {
            if (event.type.includes('Pachinko') || event.type.includes('Ledge') || event.type.includes('Windmill')) {
                let crossCut;

                for (const entity of this.game.entities) {
                    if (entity.id.includes('obstacle')) {
                        crossCut = entity as CrossCut;
                    }
                }

                const despawnCrossCutEvent: GameEvent = {
                    type: 'DESPAWN_CROSSCUT',
                    target: crossCut,
                };

                this.game.eventQueue.push(despawnCrossCutEvent);
            } else {
                CrossCutFactory.despawnAllCrossCuts(this.game);
            }
        }
    }
    
    private handleSpawnEvent(event: GameEvent): void {
        if (event.x === undefined || event.y === undefined) {
            console.warn('Spawn event missing position coordinates:', event);
            return;
        }

        const position: CrossCutPosition = event.type.includes('Top') ? 'top' : 'bottom';

        const cutType = this.detectCutType(event.type);

        CrossCutFactory.createCrossCut(
            this.game,
            event.points as Point[],
            position,
            cutType,
            event.x,
            event.y
        );
    }

    private detectCutType(name: string): string {
        if (name.includes('Triangle')) {
            return ('triangle')
        } else if (name.includes('Parapet')) {
            return ('parapet');
        } else if (name.includes('Saw')) {
            return ('saw');
        } else if (name.includes('Accelerator')) {
            return ('accelerator');
        } else if (name.includes('Maw')) {
            return ('maw');
        } else if (name.includes('Escalator')) {
            return ('escalator');
        } else if (name.includes('Rake')) {
            return ('rake');
        } else if (name.includes('Ledge')) {
            return ('ledge');
        } else if (name.includes('Pachinko')) {
            return ('pachinko');
        } else if (name.includes('Windmill')) {
            return ('windmill');
        }else {
            return ('unknown');
        }
    }
    
    private handleTransformEvent(event: GameEvent): void {
        const position: CrossCutPosition = event.type.includes('Top') ? 'top' : 'bottom';
        
        CrossCutFactory.transformCrossCuts(
            this.game,
            position,
            event.points as Point[]
        );
    }

    cleanup(): void {
        CrossCutFactory.despawnAllCrossCuts(this.game);
        
        console.log('CrossCutSystem cleanup completed');
    }
}