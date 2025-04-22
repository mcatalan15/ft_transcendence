/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   VFXComponent.js                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/10 16:12:18 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/22 12:17:51 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export class VFXComponent {
    constructor() {
        this.type = 'vfx';
        this.flashColor = null;
        this.flashDuration = 0;
        this.flashTimeLeft = 0;
        this.originalTint = 0xFBBF24;
        this.isFlashing = false;
    }
    
    startFlash(color, duration) {
        if (!this.isFlashing) {
            const render = this.entity?.getComponent('render');
            if (render && render.graphic) {
                this.originalTint = render.graphic.tint;
            }
        }

        this.flashColor = color;
        this.flashDuration = duration;
        this.flashTimeLeft = duration;
        this.isFlashing = true;
    }
}