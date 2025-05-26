/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   CrossCut.ts                                        :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/07 12:42:10 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/26 12:01:52 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Container, Point } from 'pixi.js';

import { Entity } from '../../engine/Entity';

import { RenderComponent } from '../../components/RenderComponent';
import { PhysicsComponent } from '../../components/PhysicsComponent';
import { AnimationComponent } from '../../components/AnimationComponent';

import { PhysicsData, AnimationOptions, GameEvent } from '../../utils/Types.js';

export abstract class CrossCut extends Entity {
    shape: string;
    nPoints: number;
    points: Point[];
    position: string = '';
    
    constructor (id: string, layer: string, shape: string, position:string, nPoints: number, points: Point[], x: number, y: number) {
        super(id, layer);
        
        this.shape = shape;
        this.nPoints = nPoints;
        this.points = points;
        this.position = position;

        const cutGraphic = this.createCutGraphic();
        const renderComponent = new RenderComponent(cutGraphic);
        this.addComponent(renderComponent);
        
        let physicsComponent = this.getComponent('physics') as PhysicsComponent;
        if (!physicsComponent) {
            const physicsData = this.initCutPhysicsData(x, y);
            physicsComponent = new PhysicsComponent(physicsData);
            this.addComponent(physicsComponent);
        }

        const animationOptions = this.defineAnimationOptions(physicsComponent);
        this.addComponent(new AnimationComponent(animationOptions));
    }

    abstract createCutGraphic(): Graphics | Container;
    
    initCutPhysicsData(x: number, y: number): PhysicsData {
        let nPolygons = 1;
        let polygons: Point[][] = []

        polygons.push(this.points);

        return {
            x: x || 0,
            y: y || 0,
            width: 0,
            height: 0,
            velocityX: 0,
            velocityY: 0,
            isStatic: true,
            behaviour: 'bounce' as const,
            restitution: 1.0,
            mass: 1,
            speed: 10,

            isPolygonal: true,
            nPolygons: nPolygons,
            physicsPoints: polygons,
        };
    }

    transformCrossCut(transformPoints: Point[]): void {    
        if (transformPoints.length !== this.nPoints) {
            return;
        }
        
        const renderComponent = this.getComponent('render') as RenderComponent;
        if (renderComponent && renderComponent.graphic instanceof Graphics) {
            const graphic = renderComponent.graphic;
            
            // Update all points
            for (let i = 0; i < this.nPoints; i++) {
                this.points[i].x = transformPoints[i].x;
                this.points[i].y = transformPoints[i].y;
            }
            
            graphic.clear();
            this.redrawGraphic(graphic);
        }
    }

    protected defineAnimationOptions(physics: PhysicsComponent): AnimationOptions {
        return {
            initialY: physics.y,
            floatAmplitude: 5,
            floatSpeed: 2,
            floatOffset: Math.random() * Math.PI * 2,
            initialized: true,
        };
    }

    protected addPolygonalPhysics(physicsData: PhysicsData): void {
        this.removeComponent('physics');
        const physicsComponent = new PhysicsComponent(physicsData);
        this.addComponent(physicsComponent);
    }
    
    protected abstract redrawGraphic(graphic: Graphics): void;
}