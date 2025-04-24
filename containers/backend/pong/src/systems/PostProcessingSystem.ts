/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   PostProcessingSystem.ts                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 18:11:49 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/24 18:11:49 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Entity } from "../engine/Entity";
import { PostProcessingComponent } from "../components/PostProcessingComponent";

export class PostProcessingSystem {
    time: number;

    constructor() {
        this.time = 0;
    }

    update(entities: Entity[], delta: { deltaTime: number }) {
        this.time += delta.deltaTime * 0.3;

        entities.forEach(entity => {
            if (!entity.hasComponent('postProcessing')) return;

            const postProcessing = entity.getComponent('postProcessing') as PostProcessingComponent;
            const options = postProcessing.options;

            if (options.crtFilter) {
                options.crtFilter.time = this.time;
                options.crtFilter.seed = Math.sin(this.time) * 10000 % 1;
            }
        });
    }
}