/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   PostProcessingComponent.ts                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 17:45:35 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/24 17:59:35 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { PostProcessingOptions } from '../utils/Types';

export class PostProcessingComponent {
    type: string;
    enabled: boolean;
    time: number;
    options: PostProcessingOptions;

    constructor(options: PostProcessingOptions = {}) {
        this.type = 'postProcessing';
        this.enabled = true;
        this.time = 0;
        this.options = options;
    }
}