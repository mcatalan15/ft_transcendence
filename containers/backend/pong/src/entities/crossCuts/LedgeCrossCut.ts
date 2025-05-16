/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   LedgeCrossCut.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/06 10:45:35 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/15 13:50:15 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Point } from 'pixi.js';

import { CrossCut } from './CrossCut';

export class LedgeCrossCut extends CrossCut {
    constructor(id: string, layer: string, shape: string, position: string, nPoints: number, points: Point[], x: number, y: number) {
        super(id, layer, shape, position, nPoints, points, x, y);
    }

    createCutGraphic(): Graphics {
        const ledgeGraphic = new Graphics();
        this.redrawGraphic(ledgeGraphic);
        return ledgeGraphic; 
    }
    
    protected redrawGraphic(graphic: Graphics): void {
        graphic.moveTo(this.points[0].x, this.points[0].y);
        
        for (let i = 1; i < this.points.length; i++) {
            graphic.lineTo(this.points[i].x, this.points[i].y);
        }
        
        graphic.fill(0xFFFBEB);
    }
}