/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   TriangleCrossCut.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/06 10:45:35 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/14 16:40:56 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Point } from 'pixi.js';

import { CrossCut } from './CrossCut';

export class TriangleCrossCut extends CrossCut {
    constructor(id: string, layer: string, shape: string, position: string, nPoints: number, points: Point[], x: number, y: number) {
        super(id, layer, shape, position, nPoints, points, x, y);
    }

    createCutGraphic(): Graphics {
        const triangleGraphic = new Graphics();
        this.redrawGraphic(triangleGraphic);
        return triangleGraphic; 
    }
    
    protected redrawGraphic(graphic: Graphics): void {
        const tip = this.points[1];
        const left = this.points[0];
        const right = this.points[2];
        
        graphic.poly([tip, right, left], true);
        graphic.fill(0xFFFBEB);
    }
}