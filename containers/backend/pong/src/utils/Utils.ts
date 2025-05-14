/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Utils.ts                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 11:06:02 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/14 17:03:02 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Point} from 'pixi.js'

import { PongGame } from '../engine/Game';
import { Entity } from '../engine/Entity';

import { World, GameEvent } from './Types'

export function createEntitiesMap(entities: Entity[]): Map<string, Entity> {
	const map = new Map<string, Entity>();
	for (const entity of entities) {
		map.set(entity.id, entity);
	}
	return map;
}

export function createWorld(theme: string, name: string, color: number): World {
	return { theme, name, color };
}

export function drawPointPath(graphic: Graphics, points: Point[], color: number, fill: boolean = false): void {
    graphic.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
        graphic.lineTo(points[i].x, points[i].y);
    }
    
    if (fill) {
        graphic.fill({ color, alpha: 1 });
    } else {
        graphic.stroke({
            width: 2,
            color: color,
            alpha: 1,
            alignment: 0.5,
            cap: 'round',
            join: 'round',
            miterLimit: 10
        });
    }
}

/**
 * Process events from the game's event queue based on a matcher function
 * and handle them with provided handlers
 * 
 * @param game The game instance with the event queue
 * @param handlers Object mapping event types to handler functions
 * @param matcher Function to determine if an event should be processed
 */
export function processEvents<T extends GameEvent>(
    game: PongGame,
    handlers: Record<string, (event: T) => void>,
    matcher: (event: GameEvent) => boolean
): void {
    const unhandledEvents = [];
    
    while (game.eventQueue.length > 0) {
        const event = game.eventQueue.shift() as GameEvent;
        
        if (matcher(event)) {
            // Find the right handler
            const handlerKey = Object.keys(handlers).find(key => event.type.startsWith(key));
            
            if (handlerKey) {
                handlers[handlerKey](event as T);
            } else {
                unhandledEvents.push(event);
            }
        } else {
            unhandledEvents.push(event);
        }
    }
    
    game.eventQueue.push(...unhandledEvents);
}