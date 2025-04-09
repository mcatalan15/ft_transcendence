/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   RenderComponent.js                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/01 11:26:39 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/08 17:31:48 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export class RenderComponent {
    constructor(graphic) {
        this.type = 'render';
        this.entity = null;
        this.graphic = graphic;
    }
}