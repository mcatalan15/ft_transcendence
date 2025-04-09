/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   VFXComponent.js                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/08 16:57:44 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/08 17:57:40 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export class VFXComponent {
    constructor() {
        this.type = 'vfx';  // Important! This must match what's used in getComponent
        this.currentScale = { x: 1, y: 1 };
        this.targetScale = { x: 1, y: 1 };
        this.baseScale = { x: 1, y: 1 };  // Base scale to return to
        this.damping = 0.3;              // Smoothing factor for scale changes
        this.returnSpeed = 0.1;          // Speed to return to base scale
        this.scaleOnMove = { x: 0.2, y: 1.9 }; // Squash/stretch effect values
    }
}