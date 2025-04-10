/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   RenderComponent.js                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/09 16:13:02 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/09 17:43:17 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

/*
The render component takes a PIXI graphic, which will be affected by the rener system.
*/
export class RenderComponent {
	constructor(graphic) {
		this.type = 'render';
		this.graphic = graphic;
	}
}