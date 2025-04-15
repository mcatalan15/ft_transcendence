/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   UI.js                                              :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/15 09:50:04 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/15 10:45:46 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Entity } from "../engine/Entity.js";
import { TextComponent } from '../components/TextComponent.js'

export class UI extends Entity {
	constructor (id, width, height) {
		super (id);

		const leftScoreText = this.setLeftScore(width, height);
		const leftScoreComponent = new TextComponent(leftScoreText);
		this.addComponent(leftScoreComponent);
		
		const rightScoreText = this.setRightScore(width, height);
		const rightScoreComponent = new TextComponent(rightScoreText);
		this.addComponent(rightScoreComponent);
	}

	setLeftScore(width, height){
		return {
			tag: 'leftScore',
			text: '0 - 0',
			x: 0,
			y: 0,
			style: {
				fill: 0xFAF3E0,
				fontSize: 10,
				fontWeight: 'bold',
			},
			anchor: { x: 0.5, y: 0.5 },
		};
	}

	setRightScore(width, height){
		return {
			tag: 'rightScore',
			text: '0 - 0',
			x: 0,
			y: 0,
			style: {
				fill: 0xFAF3E0,
				fontSize: 20,
				fontWeight: 'bold',
			},
			anchor: { x: 0.5, y: 0.5 },
		};
	}
}