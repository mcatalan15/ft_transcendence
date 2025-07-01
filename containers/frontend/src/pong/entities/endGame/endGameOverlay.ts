/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   endGameOverlay.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/01 15:09:48 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/01 16:17:33 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics } from "pixi.js";

import { PongGame } from "../../engine/Game";

import { RenderComponent } from "../../components/RenderComponent";
import { TextComponent } from "../../components/TextComponent";

import { Entity } from "../../engine/Entity";
import { GAME_COLORS } from "../../utils/Types";

export class EndgameOverlay extends Entity {
	game: PongGame;
	frame: Graphics = new Graphics();
	resultText: any;
	
	constructor (game: PongGame, id: string, layer: string, x: number, y: number, width: number = 1000, height: number = 400) {
		super(id, layer);
		this.game = game;

		this.frame = this.createOverlayFrame(game, x, y, width, height);
		const renderComponent = new RenderComponent(this.frame);
		this.addComponent(renderComponent, 'render');

		this.resultText = this.getResultText();
		const textComponent = new TextComponent(this.resultText);
		this.addComponent(textComponent, 'text');
	}

	private createOverlayFrame(game: PongGame, x: number, y: number, width: number, height: number): Graphics {
		const frame = new Graphics();
		frame.rect(x, y, width, height);
		frame.stroke ( { color: GAME_COLORS.orange, width: 10 } )
		frame.fill ( { color: GAME_COLORS.black } );
		return frame;
	}

	getResultText(): any {
		return {
			text: "VICTORY",
			x: this.game.width / 2,
			y: this.game.height / 2 - 150,
			style: {
				fill: { color: this.game.config.classicMode ? GAME_COLORS.white : GAME_COLORS.orange }, //! COLORS depend on end status
				fontSize: 75,
				fontWeight: 'lighter' as const,
				fontFamily: 'anatol-mn',
			},
			anchor: { x: 0.5, y: 0.5 },
		};
	}
}