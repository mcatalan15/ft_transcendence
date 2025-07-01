/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   endGameOverlay.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/01 15:09:48 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/01 15:18:24 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics } from "pixi.js";

import { PongGame } from "../../engine/Game";

import { Entity } from "../../engine/Entity";
import { GAME_COLORS } from "../../utils/Types";
import { RenderComponent } from "../../components/RenderComponent";


export class EndgameOverlay extends Entity {
	frame: Graphics = new Graphics();
	
	constructor (game: PongGame, id: string, layer: string, x: number, y: number, width: number = 1000, height: number = 400) {
		super(id, layer);

		this.frame = this.createOverlayFrame(game, x, y, width, height);
		const renderComponent = new RenderComponent(this.frame);
		this.addComponent(renderComponent);
	}

	private createOverlayFrame(game: PongGame, x: number, y: number, width: number, height: number): Graphics {
		const frame = new Graphics();
		frame.stroke ( { color: GAME_COLORS.white, width: 3 } )
		frame.rect(x, y, width, height);
		return frame;
	}
}