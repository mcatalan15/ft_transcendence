/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   OverlayHeader.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/18 14:06:18 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/19 10:56:53 by hmunoz-g         ###   ########.fr       */
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

		const blocking = this.createBlocking();
		const blockingComponent = new RenderComponent(blocking);
		this.addComponent(blockingComponent);

		const overHead = this.createOverHead();
		const overHeadComponent = new RenderComponent(overHead);
		this.addComponent(overHeadComponent);
	}

	createBlocking(): Graphics {
		const blocking = new Graphics();
		blocking.rect(0, 0, 250, 25);
		blocking.fill(GAME_COLORS.black);
		blocking.x = 1320;
		blocking.y = 112;
		return(blocking);
	}

	createOverHead(): Graphics {
		const overHead = new Graphics();

		overHead.moveTo(0, 0);
		overHead.lineTo(1112, 0);
		overHead.moveTo(1138, 0);
		overHead.lineTo(1173, 0);
		overHead.moveTo(1191, 0);
		overHead.lineTo(1231, 0);
		overHead.moveTo(1258, 0);
		overHead.lineTo(1301, 0);

		overHead.moveTo(0, 5.3);
		overHead.lineTo(1117.8, 5.3);
		overHead.moveTo(1132, 5.3);
		overHead.lineTo(1179, 5.3);
		overHead.moveTo(1191, 5.3);
		overHead.lineTo(1238, 5.3);
		overHead.moveTo(1252, 5.3);
		overHead.lineTo(1301, 5.3);

		overHead.moveTo(0, 10.5);
		overHead.lineTo(1120, 10.5);
		overHead.moveTo(1130, 10.5);
		overHead.lineTo(1181, 10.5);
		overHead.moveTo(1191, 10.5);
		overHead.lineTo(1240, 10.5);
		overHead.moveTo(1250, 10.5);
		overHead.lineTo(1301, 10.5);

		overHead.moveTo(0, 15.80);
		overHead.lineTo(1120, 15.80);
		overHead.moveTo(1129.8, 15.80);
		overHead.lineTo(1180.8, 15.80);
		overHead.moveTo(1191, 15.80);
		overHead.lineTo(1240, 15.80);
		overHead.moveTo(1250, 15.80);
		overHead.lineTo(1301, 15.80);

		overHead.stroke( { color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue, width: 1.3 } );
		overHead.x = 250;
		overHead.y = 113.3;
		return(overHead);
	}

	createHeaderGraphic(): Graphics {
		const graphic = new Graphics();
		//graphic.rect(0, 0, 1300, 32);
		graphic.moveTo(1090, 0);
		graphic.lineTo(0, 0);
		graphic.lineTo(0, 32);
		graphic.lineTo(1090, 32);
		//graphic.stroke( {color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue, width: 2} );
		graphic.fill(this.menu.config.classicMode ? GAME_COLORS.black : GAME_COLORS.menuBlue);
		graphic.pivot.set(650, 12.5);
		graphic.x = this.menu.width / 2;
		graphic.y = 149.33;
		return(graphic);
	}

	createHeaderText(type: string) {
		return {
			text: type,
			x: 300,
			y: 152.5,
			style: {
				fill: GAME_COLORS.black,
				fontSize: 12,
				fontWeight: 'bold' as const,
				align: 'left' as const,
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
				fontFamily: 'anatol-mn',
			},
		};
	}
}