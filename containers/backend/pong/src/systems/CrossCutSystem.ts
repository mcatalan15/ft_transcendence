/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   CrossCutSystem.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 09:55:06 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/15 09:32:33 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Point } from 'pixi.js';
import { PongGame } from '../engine/Game';
import type { System } from '../engine/System';

import { CrossCutFactory, CrossCutPosition } from '../entities/crossCuts/CrossCutFactory';
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
    
    /**
     * Process a cross-cut event from the event queue
     */
    private handleCrossCutEvent(event: GameEvent): void {
        // Check if we have the required properties
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
            // Handle despawn event
            CrossCutFactory.despawnAllCrossCuts(this.game);
        }
    }
    
    /**
     * Handle spawn events for cross-cuts
     */
    private handleSpawnEvent(event: GameEvent): void {
        if (event.x === undefined || event.y === undefined) {
            console.warn('Spawn event missing position coordinates:', event);
            return;
        }
        
        // Determine position from event type
        const position: CrossCutPosition = event.type.includes('Top') ? 'top' : 'bottom';
        
        // Create the cross-cut
        CrossCutFactory.createCrossCut(
            this.game,
            event.points as Point[],
            position,
            event.x,
            event.y
        );
    }
    
    /**
     * Handle transform events for cross-cuts
     */
    private handleTransformEvent(event: GameEvent): void {
        // Determine position from event type
        const position: CrossCutPosition = event.type.includes('Top') ? 'top' : 'bottom';
        
        // Transform the cross-cuts
        CrossCutFactory.transformCrossCuts(
            this.game,
            position,
            event.points as Point[]
        );
    }
}