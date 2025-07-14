/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   PlayChatDisplay.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/25 12:23:14 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/14 20:22:58 by hmunoz-g         ###   ########.fr       */
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
	//! OJO
	instructionsText: Text[] = [];
	
	constructor(menu: Menu, id: string, layer: string) {
		super(id, layer);
		
		this.menu = menu;

		this.header = new HeaderBar(this.menu, 'nextMatchHeader', 'overlays', 'HOW TO PLAY', 1098, 180, 554, 20);
		const headerBar = this.header.getComponent('render') as RenderComponent;
		this.addComponent(headerBar, 'barRender');
		const headerText = this.header.getComponent('text') as RenderComponent;
		this.addComponent(headerText, 'barText');

		this.createInstructionsWindow();
		const chatWindowComponent = new RenderComponent(this.chatWindowGraphic);
		this.addComponent(chatWindowComponent, 'chatWindow');

		this.instructionsText = this.createInstructionsTexts();
		for (let i = 0; i < this.instructionsText.length; i++) {
			const textComponent = new TextComponent(this.instructionsText[i]);
			this.addComponent(textComponent, `placeHolderText${i}`);
		}
	}

	createInstructionsTexts(): Text[] {
		const placeHolderTexts: Text[] = [];

		placeHolderTexts.push({
			text: "Find your side of the screen!\n" +
				"LEFT           RIGHT\n",
			x: 1230,
			y: 260,
			style: {
				fill: { color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue, alpha: 1},
				fontSize: 12,
				fontWeight: 'bold' as const,
				align: 'center' as const,
				fontFamily: '"Roboto Mono", monospace',
				lineHeight: 30,
			},
		} as Text);

		placeHolderTexts.push({
			text: "  W\n" +
				"  S",
			x: 1152,
			y: 405,
			style: {
				fill: { color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue, alpha: 1},
				fontSize: 20,
				fontWeight: 'bold' as const,
				align: 'left' as const,
				fontFamily: '"Roboto Mono", monospace',
				lineHeight: 200,
			},
		} as Text);

		placeHolderTexts.push({
			text: "  ⬆\n" +
				"  ⬇",
			x: 1268,
			y: 405,
			style: {
				fill: { color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue, alpha: 1},
				fontSize: 35,
				fontWeight: 'bold' as const,
				align: 'left' as const,
				fontFamily: '"Roboto Mono", monospace',
				lineHeight: 200,
			},
		} as Text);

		return placeHolderTexts;
	}

	createInstructionsWindow(): void {
		//this.chatWindowGraphic.rect(1100, 215, 550, 305);
		this.chatWindowGraphic.rect(1150, 290, 30, 30);
		this.chatWindowGraphic.rect(1150, 490, 30, 30);
		this.chatWindowGraphic.rect(1275, 290, 30, 30);
		this.chatWindowGraphic.rect(1275, 490, 30, 30);
		this.chatWindowGraphic.stroke({color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue, width: 2});
	}

	redrawDisplay(): void {
		this.header.redrawBar(this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue);

		this.chatWindowGraphic.clear();
		this.createInstructionsWindow();

		const newPlaceHolderTexts = this.createInstructionsTexts();
		for (let i = 0; i < this.instructionsText.length; i++) {
			const placeHolderTextComponent = new TextComponent(newPlaceHolderTexts[i]);
			this.replaceComponent(`text`, placeHolderTextComponent, `placeHolderText${i}`);
		}
	}
}