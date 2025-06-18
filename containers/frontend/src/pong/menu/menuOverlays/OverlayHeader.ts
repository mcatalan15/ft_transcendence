/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   OverlayHeader.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/18 14:06:18 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/18 16:43:26 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Text } from "pixi.js";

import { Menu } from "../Menu";

import { Entity } from "../../engine/Entity";

import { RenderComponent } from "../../components/RenderComponent";
import { TextComponent } from "../../components/TextComponent";

import { GAME_COLORS } from "../../utils/Types";

export class OverlayHeader extends Entity {
	menu: Menu;
	headerGraphic!: Graphics;
	headerText!: Text;

	constructor(menu: Menu, id: string, layer: string, type: string) {
		super(id, layer);
		
		this.menu = menu;

		const headerGraphic = this.createHeaderGraphic();
		const renderComponent = new RenderComponent(headerGraphic);
		this.addComponent(renderComponent);
		
		const headerText = this.createHeaderText(type);
		const textComponent = new TextComponent(headerText);
		this.addComponent(textComponent);

		const logoText = this.createLogoText();
		const logoTextComponent = new TextComponent(logoText);
		this.addComponent(logoTextComponent);
	}

	createHeaderGraphic(): Graphics {
		const graphic = new Graphics();
		//graphic.rect(0, 0, 1300, 32);
		graphic.moveTo(1300, 0);
		graphic.lineTo(0, 0);
		graphic.lineTo(0, 32);
		graphic.lineTo(1100, 32);
		graphic.stroke( {color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue, width: 2} );
		graphic.pivot.set(650, 12.5);
		graphic.x = this.menu.width / 2;
		graphic.y = 150;
		return(graphic);
	}

	createHeaderText(type: string) {
		return {
			text: type,
			x: 300,
			y: 152.5,
			style: {
				fill: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue,
				fontSize: 12,
				fontWeight: 'bold' as const,
			},
		};
	}

	createLogoText() {
		return {
			text: "PONG",
			x: 1436,
			y: 138.5,
			style: {
				fill: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue,
				fontSize: 110,
				fontWeight: 'lighter' as const,
				fontFamily: 'anatol-mn',
			},
		};
	}
}