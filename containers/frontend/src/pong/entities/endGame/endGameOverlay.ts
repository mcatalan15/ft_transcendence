/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   endGameOverlay.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/01 15:09:48 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/01 17:01:56 by hmunoz-g         ###   ########.fr       */
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
	overlayGraphics: Graphics = new Graphics();
	resultText: any;
	
	constructor (game: PongGame, id: string, layer: string, x: number, y: number, width: number = 1000, height: number = 400) {
		super(id, layer);
		this.game = game;

		this.overlayGraphics = this.createOverlayGraphics(game, x, y, width, height, 20);
		const headerRenderComponent = new RenderComponent(this.overlayGraphics);
		this.addComponent(headerRenderComponent, 'headerGraphic');

		this.resultText = this.getResultText();
		const textComponent = new TextComponent(this.resultText);
		this.addComponent(textComponent, 'resultText');
	}

	private createOverlayGraphics(game: PongGame, x: number, y: number, width: number, height: number, headerHeight: number): Graphics {
		const container = new Graphics();

		const frame = new Graphics();
		frame.rect(x, y + 40, width, height - 40);
		frame.stroke ( { color: GAME_COLORS.orange, width: 10 } )
		frame.fill ( { color: GAME_COLORS.black } );
		container.addChild(frame);

		const header = new Graphics();
		header.rect(x, y, width, headerHeight);
		header.fill ( { color: game.config.classicMode ? GAME_COLORS.black : GAME_COLORS.orange } );
		header.stroke ( { color: game.config.classicMode ? GAME_COLORS.white : GAME_COLORS.orange, width: 10 } );
		container.addChild(header);

		return (container);
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