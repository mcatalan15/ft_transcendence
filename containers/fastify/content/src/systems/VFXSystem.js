/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   VFXSystem.js                                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/08 17:06:15 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/08 17:22:48 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export class VFXSystem {
    update(entities, delta) {
        for (const entity of entities) {
            const render = entity.getComponent('render');
            const vfx = entity.getComponent('vfx');

            if (!render || !vfx)
                continue;

            // Update current scale with smooth transition
            vfx.currentScale.x += (vfx.targetScale.x - vfx.currentScale.x) * vfx.damping;
            vfx.currentScale.y += (vfx.targetScale.y - vfx.currentScale.y) * vfx.damping;

            // Apply the scale to the rendered graphic
            render.graphic.scale.set(vfx.currentScale.x, vfx.currentScale.y);

            // Gradually return target scale to base scale
            vfx.targetScale.x += (vfx.baseScale.x - vfx.targetScale.x) * vfx.returnSpeed;
            vfx.targetScale.y += (vfx.baseScale.y - vfx.targetScale.y) * vfx.returnSpeed;
        }
    }
}