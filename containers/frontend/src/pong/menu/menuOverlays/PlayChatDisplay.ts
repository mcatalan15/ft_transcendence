/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   PlayChatDisplay.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/25 12:23:14 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/14 17:57:54 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Text } from "pixi.js";

import { Menu } from "../Menu";

import { Entity } from "../../engine/Entity";
import { HeaderBar } from "./HeaderBar";

import { RenderComponent } from "../../components/RenderComponent";
import { TextComponent } from "../../components/TextComponent";

import { GAME_COLORS } from "../../utils/Types";


export class PlayChatDisplay extends Entity {
	menu: Menu;
	header: HeaderBar;
	chatWindowGraphic: Graphics = new Graphics();
	
	constructor(menu: Menu, id: string, layer: string) {
		super(id, layer);
		
		this.menu = menu;

		this.header = new HeaderBar(this.menu, 'nextMatchHeader', 'overlays', 'HOW TO PLAY', 1098, 180, 554, 20);
		const headerBar = this.header.getComponent('render') as RenderComponent;
		this.addComponent(headerBar, 'barRender');
		const headerText = this.header.getComponent('text') as RenderComponent;
		this.addComponent(headerText, 'barText');

		this.createChatWindow();
		const chatWindowComponent = new RenderComponent(this.chatWindowGraphic);
		this.addComponent(chatWindowComponent, 'chatWindow');

		/* this.placeHolderText = this.createPlaceHolderTexts();
		for (let i = 0; i < this.placeHolderText.length; i++) {
			const textComponent = new TextComponent(this.placeHolderText[i]);
			this.addComponent(textComponent, `placeHolderText${i}`);
		} */
	}

	createPlaceHolderTexts(): Text[] {
		const placeHolderTexts: Text[] = [];

		placeHolderTexts.push({
			text: "PSCHERB: Te voy a destruir\n" + 
				"HMUNOZ-G: No lo creo\n" +
				"PSCHERB: ¡Prepárate!\n" +
				"HMUNOZ-G: ¡Vamos a ver!\n" +
				"PSCHERB: ¡Buena suerte!\n" +
				"HMUNOZ-G: ¡Igualmente!\n", 
			x: 1230,
			y: 425,
			style: {
				fill: { color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue, alpha: 1},
				fontSize: 14,
				fontWeight: 'bold' as const,
				align: 'left' as const,
				fontFamily: '"Roboto Mono", monospace',
				lineHeight: 20,
			},
		} as Text);

		placeHolderTexts.push({
			text: "> Type your message here", 
			x: 1220,
			y: 505,
			style: {
				fill: { color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue, alpha: 1},
				fontSize: 14,
				fontWeight: 'bold' as const,
				align: 'left' as const,
				fontFamily: '"Roboto Mono", monospace',
				lineHeight: 20,
			},
		} as Text);

		return placeHolderTexts;
	}

	createChatWindow(): void {
		this.chatWindowGraphic.rect(1100, 215, 550, 265);
		this.chatWindowGraphic.rect(1100, 490, 550, 40);
		this.chatWindowGraphic.stroke({color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue, width: 3});
	}

	redrawDisplay(): void {
		this.header.redrawBar(this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue);

		this.chatWindowGraphic.clear();
		this.createChatWindow();
	}
}