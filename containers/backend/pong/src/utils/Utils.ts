/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Utils.ts                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 11:06:02 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/23 19:01:37 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Point} from 'pixi.js'

import { PongGame } from '../engine/Game';
import { Entity } from '../engine/Entity';

import { RenderComponent } from '../components/RenderComponent';
import { TextComponent } from '../components/TextComponent';

import { GameEvent } from './Types'
import { isPaddle } from './Guards';

export function createEntitiesMap(entities: Entity[]): Map<string, Entity> {
	const map = new Map<string, Entity>();
	for (const entity of entities) {
		map.set(entity.id, entity);
	}
	return map;
}

export function drawPointPath(graphic: Graphics, points: Point[], color: number, fill: boolean = false): void {
    if (points.length < 2) return;
    
    graphic.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
        graphic.lineTo(points[i].x, points[i].y);
    }
    
    if (points[0].x !== points[points.length - 1].x || points[0].y !== points[points.length - 1].y) {
        graphic.lineTo(points[0].x, points[0].y);
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

export function drawPointOpenPath(graphic: Graphics, points: Point[], color: number, fill: boolean = false): void {
    if (points.length < 2) return;
    
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

export function generateCirclePoints(
    centerX: number, 
    centerY: number, 
    radius: number, 
    segments: number = 32,
    startAngle: number = 0,
    endAngle: number = Math.PI * 2,
    clockwise: boolean = true
): Point[] {
    const points: Point[] = [];
    
    // Normalize angles to be within 0 to 2π
    startAngle = startAngle % (Math.PI * 2);
    if (startAngle < 0) startAngle += Math.PI * 2;
    
    endAngle = endAngle % (Math.PI * 2);
    if (endAngle < 0) endAngle += Math.PI * 2;
    
    // Ensure endAngle is greater than startAngle for calculations
    if (!clockwise && startAngle <= endAngle) {
        endAngle -= Math.PI * 2;
    } else if (clockwise && endAngle <= startAngle) {
        endAngle += Math.PI * 2;
    }
    
    // Calculate total angle to cover
    const totalAngle = clockwise ? endAngle - startAngle : startAngle - endAngle;
    
    // Adjust segments based on the arc length
    const arcSegments = Math.max(2, Math.ceil(segments * Math.abs(totalAngle) / (Math.PI * 2)));
    
    // Generate points along the circumference
    for (let i = 0; i <= arcSegments; i++) {
        // Calculate the angle for this segment
        const t = i / arcSegments;
        const angle = clockwise 
            ? startAngle + t * (endAngle - startAngle)
            : startAngle - t * (startAngle - endAngle);
        
        // Calculate x and y using the parametric equation of a circle
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        
        points.push(new Point(x, y));
    }
    
    return points;
}

export function generateWindmillPoints(positions: {x: number, y: number}[]): Point[] {
    const points: Point[] = [];
    
    for (const position of positions) {
        points.push(new Point(position.x, position.y));
    }
    
    return points;
}

export function generateLedgePoints(positions: {x: number, y: number}[]): Point[] {
    const points: Point[] = [];
    
    for (const position of positions) {
        points.push(new Point(position.x, position.y));
    }
    
    return points;
}

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

export function changePaddleLayer(game: PongGame, side: string, id: string) {
    switch (side) {
        case ('left'):
            {
                if (id.includes('powerUp'))
                {
                    for (const entity of game.entities) {
                        if (isPaddle(entity) && entity.id.includes('paddleL')) {
                            const text = entity.getComponent('text') as TextComponent;
                            const playerName = text.getRenderable();
                            playerName.label = 'playerName' + game.leftPlayer.name;
                            game.renderLayers.powerup.addChild(playerName);

                            const render = entity.getComponent('render') as RenderComponent;
                            const graphic = render.graphic;
                            graphic.label = 'paddle';
                            game.renderLayers.powerup.addChild(graphic);
                        }
                    }
                } else if (id.includes('powerDown')) {
                    for (const entity of game.entities) {
                        if (isPaddle(entity) && entity.id.includes('paddleL')) {
                            const text = entity.getComponent('text') as TextComponent;
                            text.setText('#@%$&');
                            const playerName = text.getRenderable();
                            playerName.label = 'playerName' + game.leftPlayer.name;
                            game.renderLayers.powerup.addChild(playerName);
                            game.renderLayers.powerdown.addChild(playerName);
                            
                            const render = entity.getComponent('render') as RenderComponent;
                            const graphic = render.graphic;
                            graphic.label = 'paddle';
                            game.renderLayers.powerdown.addChild(graphic);
                        }
                    }
                }
            }
            break;

        case ('right'):
            {
                if (id.includes('powerUp'))
                {
                    for (const entity of game.entities) {
                        if (isPaddle(entity) && entity.id.includes('paddleR')) {
                            const text = entity.getComponent('text') as TextComponent;
                            game.renderLayers.powerup.addChild(text.getRenderable());
                            const playerName = text.getRenderable();
                            playerName.label = 'playerName' + game.rightPlayer.name;
                            game.renderLayers.powerup.addChild(playerName);
                            
                            const render = entity.getComponent('render') as RenderComponent;
                            const graphic = render.graphic;
                            graphic.label = 'paddle';
                            game.renderLayers.powerup.addChild(graphic);
                        }
                    }
                } else if (id.includes('powerDown')) {
                    for (const entity of game.entities) {
                        if (isPaddle(entity) && entity.id.includes('paddleR')) {
                            const text = entity.getComponent('text') as TextComponent;
                            text.setText('#@%$&');
                            const playerName = text.getRenderable();
                            playerName.label = 'playerName'+ game.rightPlayer.name;
                            game.renderLayers.powerup.addChild(playerName);
                            game.renderLayers.powerdown.addChild(playerName);
                            
                            const render = entity.getComponent('render') as RenderComponent;
                            const graphic = render.graphic;
                            graphic.label = 'paddle';
                            game.renderLayers.powerdown.addChild(graphic);
                        }
                    }
                }
            }
            break;
    }
    
    
}

export function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
}

export function randomInRange(min: number, max: number): number {
	return Math.random() * (max - min) + min;
}