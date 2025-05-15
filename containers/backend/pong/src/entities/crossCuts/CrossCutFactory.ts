/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   CrossCutFactory.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/15 12:00:00 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/15 09:31:15 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Point } from 'pixi.js';

import { PongGame } from '../../engine/Game';

import { CrossCut } from '../../entities/crossCuts/CrossCut';
import { TriangleCrossCut } from '../../entities/crossCuts/TriangleCrossCut';
import { RectangleCrossCut } from '../../entities/crossCuts/RectangleCrossCut';
import { SawCrossCut } from '../../entities/crossCuts/SawCrossCut';
import { EscalatorCrossCut } from '../../entities/crossCuts/EscalatorCrossCut';

import { RenderComponent } from '../../components/RenderComponent';
import { PhysicsComponent } from '../../components/PhysicsComponent';

export type CrossCutType = 'Triangle' | 'Parapet' | 'Saw' | 'Escalator';

export type CrossCutPosition = 'top' | 'bottom';

export type CrossCutAction = 'spawn' | 'transform' | 'despawn';

export class CrossCutFactory {
    static createCrossCut(
        game: PongGame,
        points: Point[],
        position: CrossCutPosition,
        x: number,
        y: number
    ): CrossCut | null {
        let cut: CrossCut | null = null;
        const numPoints = points.length;
        
        switch(numPoints) {
            case (3):
                cut = new TriangleCrossCut(
                    `cut-triangle-${Date.now()}-${Math.floor(Math.random() * 1000)}`, 
                    'midground', 
                    'triangle', 
                    position, 
                    numPoints, 
                    points, 
                    x, 
                    y
                );
                break;
            case (5):
                cut = new RectangleCrossCut(
                    `cut-rectangle-${Date.now()}-${Math.floor(Math.random() * 1000)}`, 
                    'midground', 
                    'rectangle', 
                    position, 
                    numPoints, 
                    points, 
                    x, 
                    y
                );
                break;
            case (7):
                cut = new SawCrossCut(
                    `cut-saw-${Date.now()}-${Math.floor(Math.random() * 1000)}`, 
                    'midground', 
                    'saw', 
                    position, 
                    numPoints, 
                    points, 
                    x, 
                    y
                );
                break;
            case (16):
                cut = new EscalatorCrossCut(
                    `cut-escalator-${Date.now()}-${Math.floor(Math.random() * 1000)}`, 
                    'midground', 
                    'escalator', 
                    position, 
                    numPoints, 
                    points, 
                    x, 
                    y
                );
                break;
            default:
                console.warn(`Unknown cross-cut type with ${numPoints} points`);
                return null;
        }
        
        game.addEntity(cut);
        
        const render = cut.getComponent('render') as RenderComponent;
        if (render && render.graphic) {
            render.graphic.position.set(x, y);
            
            const physics = cut.getComponent('physics') as PhysicsComponent;
            if (physics) {
                physics.x = x;
                physics.y = y;
            }
            
            game.renderLayers.midground.addChild(render.graphic);
        }
        
        return cut;
    }
    
    static transformCrossCuts(
        game: PongGame,
        position: CrossCutPosition,
        points: Point[]
    ): void {
        for (const entity of game.entities) {
            if (
                entity instanceof CrossCut && 
                entity.position === position
            ) {
                entity.transformCrossCut(points);
            }
        }
    }
    
    static despawnAllCrossCuts(game: PongGame): void {
        const crossCutsToRemove = game.entities.filter(
            entity => entity instanceof CrossCut
        );
        
        for (const entity of crossCutsToRemove) {
            game.removeEntity(entity.id);
        }
    }
    
    static generateEventName(
        action: CrossCutAction,
        position: CrossCutPosition | null,
        type: CrossCutType
    ): string {
        if (action === 'despawn') {
            return `despawn${type}CrossCut`;
        }
        
        return `${action}${position === 'top' ? 'Top' : 'Bottom'}${type}CrossCut`;
    }
    
    static getCrossCutTypeFromId(id: string): CrossCutType | null {
        if (id.includes('triangle')) return 'Triangle';
        if (id.includes('rectangle')) return 'Parapet';
        if (id.includes('saw')) return 'Saw';
        if (id.includes('escalator')) return 'Escalator';
        return null;
    }
}