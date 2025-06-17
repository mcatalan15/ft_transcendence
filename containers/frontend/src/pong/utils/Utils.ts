/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Utils.ts                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 11:06:02 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/17 15:35:44 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Point} from 'pixi.js'

import { PongGame } from '../engine/Game';
import { Entity } from '../engine/Entity';
import { Paddle } from '../entities/Paddle';

import { RenderComponent } from '../components/RenderComponent';
import { TextComponent } from '../components/TextComponent';

import { PowerupSystem } from '../systems/PowerupSystem';

import { GAME_COLORS, GameEvent } from './Types'
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
    
    startAngle = startAngle % (Math.PI * 2);
    if (startAngle < 0) startAngle += Math.PI * 2;
    
    endAngle = endAngle % (Math.PI * 2);
    if (endAngle < 0) endAngle += Math.PI * 2;
    
    if (!clockwise && startAngle <= endAngle) {
        endAngle -= Math.PI * 2;
    } else if (clockwise && endAngle <= startAngle) {
        endAngle += Math.PI * 2;
    }
    
    const totalAngle = clockwise ? endAngle - startAngle : startAngle - endAngle;
    
    const arcSegments = Math.max(2, Math.ceil(segments * Math.abs(totalAngle) / (Math.PI * 2)));
    
    for (let i = 0; i <= arcSegments; i++) {
        const t = i / arcSegments;
        const angle = clockwise 
            ? startAngle + t * (endAngle - startAngle)
            : startAngle - t * (startAngle - endAngle);
        
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        
        points.push(new Point(x, y));
    }
    
    return points;
}

export function generateSnakePoints(positions: {x: number, y: number}[]): Point[] {
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

export function getThemeColors(classicMode: boolean) {
    if (classicMode) {
        return {
            white: GAME_COLORS.white,
            black: GAME_COLORS.black,
            particleGray: GAME_COLORS.white,
            menuBlue: GAME_COLORS.white,
            menuGreen: GAME_COLORS.white,
            menuOrange: GAME_COLORS.white,
            menuPink: GAME_COLORS.white,
        };
    }
    return GAME_COLORS;
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
                            game.renderLayers.powerup.addChild(text.getRenderable());
                            const playerName = text.getRenderable();
                            playerName.label = 'playerName' + game.leftPlayer.name;

                            const render = entity.getComponent('render') as RenderComponent;
                            const graphic = render.graphic;
                            graphic.label = 'paddle';
                            
                            if (entity.currentLayer === 'powerdown') {
                                game.renderLayers.powerupGlitched.addChild(graphic);
                                game.renderLayers.powerupGlitched.addChild(playerName);
                                entity.currentLayer = 'powerupGlitched';
                                entity.redrawFullPaddle(false, 'mixed');
                            } else {
                                game.renderLayers.powerup.addChild(graphic);
                                game.renderLayers.powerup.addChild(playerName);
                                entity.currentLayer = 'powerup';
                                entity.redrawFullPaddle(false, 'powerup');
                            }
                        }
                    }
                } else if (id.includes('powerDown')) {
                    for (const entity of game.entities) {
                        if (isPaddle(entity) && entity.id.includes('paddleL')) {
                            const text = entity.getComponent('text') as TextComponent;
                            text.setText('#@%$&');
                            game.renderLayers.powerdown.addChild(text.getRenderable());
                            const playerName = text.getRenderable();
                            playerName.label = 'playerName' + game.leftPlayer.name;
                            
                            const render = entity.getComponent('render') as RenderComponent;
                            const graphic = render.graphic;
                            graphic.label = 'paddle';

                            if (entity.currentLayer === 'powerup') {
                                game.renderLayers.powerupGlitched.addChild(graphic);
                                game.renderLayers.powerupGlitched.addChild(playerName);
                                entity.currentLayer = 'powerupGlitched';
                                entity.redrawFullPaddle(false, 'mixed');
                            } else {
                                game.renderLayers.powerdown.addChild(graphic);
                                game.renderLayers.powerdown.addChild(playerName);
                                entity.currentLayer = 'powerdown';
                                entity.redrawFullPaddle(false, 'powerdown');
                            }
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
                            
                            const render = entity.getComponent('render') as RenderComponent;
                            const graphic = render.graphic;
                            graphic.label = 'paddle';
                            
                            if (entity.currentLayer === 'powerdown') {
                                game.renderLayers.powerupGlitched.addChild(graphic);
                                game.renderLayers.powerupGlitched.addChild(playerName);
                                entity.currentLayer = 'powerupGlitched';
                            } else {
                                game.renderLayers.powerup.addChild(graphic);
                                game.renderLayers.powerup.addChild(playerName);
                                entity.currentLayer = 'powerup';
                            }

                            entity.redrawFullPaddle(false, 'powerup');
                        }
                    }
                } else if (id.includes('powerDown')) {
                    for (const entity of game.entities) {
                        if (isPaddle(entity) && entity.id.includes('paddleR')) {
                            const text = entity.getComponent('text') as TextComponent;
                            game.renderLayers.powerdown.addChild(text.getRenderable());
                            text.setText('#@%$&');
                            const playerName = text.getRenderable();
                            playerName.label = 'playerName'+ game.rightPlayer.name;
                            
                            const render = entity.getComponent('render') as RenderComponent;
                            const graphic = render.graphic;
                            graphic.label = 'paddle';
                            
                            if (entity.currentLayer === 'powerup') {
                                game.renderLayers.powerupGlitched.addChild(graphic);
                                game.renderLayers.powerupGlitched.addChild(playerName);
                                entity.currentLayer = 'powerupGlitched';
                            } else {
                                game.renderLayers.powerdown.addChild(graphic);
                                game.renderLayers.powerdown.addChild(playerName);
                                entity.currentLayer = 'powerdown';
                            }

                            entity.redrawFullPaddle(false, 'powerdown');
                        }
                    }
                }
            }
            break;
    }
}

export function removePaddleFromLayer(system: PowerupSystem, paddle: Paddle) {
    const text = paddle.getComponent('text') as TextComponent;
    
    if (paddle.isFlat || paddle.isInverted || paddle.isShrinked || paddle.isSlowed || paddle.isStunned) {
        const powerdownLayer = system.game.renderLayers.powerdown;
        const powerupGlitchedLayer = system.game.renderLayers.powerupGlitched;
        
        let targetChild = powerdownLayer.children.find(child => child.label === "paddle");
        let targetLeftName = powerdownLayer.children.find(child => child.label === ("playerName" + system.game.leftPlayer.name));
        let targetRightName = powerdownLayer.children.find(child => child.label === ("playerName" + system.game.rightPlayer.name));
        
        if (!targetChild) {
            targetChild = powerupGlitchedLayer.children.find(child => child.label === "paddle");
        }
        if (!targetLeftName) {
            targetLeftName = powerupGlitchedLayer.children.find(child => child.label === ("playerName" + system.game.leftPlayer.name));
        }
        if (!targetRightName) {
            targetRightName = powerupGlitchedLayer.children.find(child => child.label === ("playerName" + system.game.rightPlayer.name));
        }

        if (targetChild) {
            system.game.renderLayers.foreground.addChild(targetChild);
            paddle.currentLayer = 'foreground';
        }

        if (targetLeftName) {
            system.game.renderLayers.foreground.addChild(targetLeftName);
            const prefix = "playerName";
            const result = targetLeftName.label.slice(prefix.length);
            
            text.setText(result);
        } else if (targetRightName) {
            system.game.renderLayers.foreground.addChild(targetRightName);
            const prefix = "playerName";
            const result = targetRightName.label.slice(prefix.length);
            
            text.setText(result);
        }
    } else {
        const powerupLayer = system.game.renderLayers.powerup;
        const powerupGlitchedLayer = system.game.renderLayers.powerupGlitched;
        
        // Check powerup layer first
        let targetChild = powerupLayer.children.find(child => child.label === "paddle");
        let targetLeftName = powerupLayer.children.find(child => child.label === ("playerName" + system.game.leftPlayer.name));
        let targetRightName = powerupLayer.children.find(child => child.label === ("playerName" + system.game.rightPlayer.name));
        
        // If not found in powerup, check powerupGlitched layer
        if (!targetChild) {
            targetChild = powerupGlitchedLayer.children.find(child => child.label === "paddle");
        }
        if (!targetLeftName) {
            targetLeftName = powerupGlitchedLayer.children.find(child => child.label === ("playerName" + system.game.leftPlayer.name));
        }
        if (!targetRightName) {
            targetRightName = powerupGlitchedLayer.children.find(child => child.label === ("playerName" + system.game.rightPlayer.name));
        }

        if (targetChild) {
            system.game.renderLayers.foreground.addChild(targetChild);
            paddle.currentLayer = 'foreground';
        }

        if (targetLeftName) {
            system.game.renderLayers.foreground.addChild(targetLeftName);
            const prefix = "playerName";
            const result = targetLeftName.label.slice(prefix.length);
            
            text.setText(result);
        } else if (targetRightName) {
            system.game.renderLayers.foreground.addChild(targetRightName);
            const prefix = "playerName";
            const result = targetRightName.label.slice(prefix.length);
            
            text.setText(result);
        }
    }

    paddle.redrawFullPaddle(false, 'reset');
}

export function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
}

export function randomInRange(min: number, max: number): number {
	return Math.random() * (max - min) + min;
}

export function easeOut(t: number): number {
    return 1 - Math.pow(1 - t, 3);
}

// Easing function for smoother animation (ease-in-out)
export function easeInOut(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Accelerating easing function (ease-in with stronger acceleration)
export function easeInStrong(t: number): number {
    return t * t * t * t; // Quartic ease-in for stronger acceleration
}

// Even stronger acceleration (quintic)
export function easeInVeryStrong(t: number): number {
    return t * t * t * t * t; // Quintic ease-in for very strong acceleration
}

// Custom exponential acceleration
export function easeInExponential(t: number): number {
    return t === 0 ? 0 : Math.pow(2, 10 * (t - 1));
}