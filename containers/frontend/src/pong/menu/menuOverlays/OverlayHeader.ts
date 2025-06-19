/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   OverlayHeader.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/18 14:06:18 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/19 18:53:07 by hmunoz-g         ###   ########.fr       */
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

		const color = this.getColor(type);

		const headerGraphic = this.createHeaderGraphic(color);
		const renderComponent = new RenderComponent(headerGraphic);
		this.addComponent(renderComponent);
		
		const headerText = this.createHeaderText(type);
		const textComponent = new TextComponent(headerText);
		this.addComponent(textComponent);

		const logoText = this.createLogoText(color);
		const logoTextComponent = new TextComponent(logoText);
		this.addComponent(logoTextComponent);

		const blocking = this.createBlocking();
		const blockingComponent = new RenderComponent(blocking);
		this.addComponent(blockingComponent);

		const overHead = this.createOverHead(color);
		const overHeadComponent = new RenderComponent(overHead);
		this.addComponent(overHeadComponent);
	}

	getColor(overlay: string) {
		if (overlay === 'glossary' || overlay === 'glossaire' || overlay === 'glosario' || overlay === 'glossari') {
			if (this.menu.config.classicMode) {
				return (GAME_COLORS.white) as number;
			}
			return (GAME_COLORS.menuOrange) as number;
		} else if (overlay === 'play' || overlay === 'jouer' || overlay === 'jugar' || overlay === 'tournament' || overlay === 'torneo' || overlay === 'tornoi' || overlay === 'torneig') {
			if (this.menu.config.classicMode) {
				return (GAME_COLORS.white) as number;
			}
			return (GAME_COLORS.menuBlue) as number;
		} else if (overlay === 'info') {
			if (this.menu.config.classicMode) {
				return (GAME_COLORS.white) as number;
			}
			return (GAME_COLORS.menuPink) as number;
		}

		return (GAME_COLORS.white) as number;
	}

	createBlocking(): Graphics {
		const blocking = new Graphics();
		blocking.rect(0, 0, 250, 25);
		blocking.fill(GAME_COLORS.black);
		blocking.x = 1380;
		blocking.y = 65;
		return(blocking);
	}

	createOverHead(color: number): Graphics {
		const offset = 239;
		const overHead = new Graphics();

		overHead.moveTo(0, 0);
		overHead.lineTo(1112 + offset, 0);
		overHead.moveTo(1138 + offset, 0);
		overHead.lineTo(1173 + offset, 0);
		overHead.moveTo(1191 + offset, 0);
		overHead.lineTo(1231 + offset, 0);
		overHead.moveTo(1258 + offset, 0);
		overHead.lineTo(1398 + offset, 0);

		overHead.moveTo(0, 5.3);
		overHead.lineTo(1117.8 + offset, 5.3);
		overHead.moveTo(1132 + offset, 5.3);
		overHead.lineTo(1179 + offset, 5.3);
		overHead.moveTo(1191 + offset, 5.3);
		overHead.lineTo(1238 + offset, 5.3);
		overHead.moveTo(1252 + offset, 5.3);
		overHead.lineTo(1398 + offset, 5.3);

		overHead.moveTo(0, 10.5);
		overHead.lineTo(1120 + offset, 10.5);
		overHead.moveTo(1130 + offset, 10.5);
		overHead.lineTo(1181 + offset, 10.5);
		overHead.moveTo(1191 + offset, 10.5);
		overHead.lineTo(1240 + offset, 10.5);
		overHead.moveTo(1250 + offset, 10.5);
		overHead.lineTo(1398 + offset, 10.5);

		overHead.moveTo(0, 15.80);
		overHead.lineTo(1120 + offset, 15.80);
		overHead.moveTo(1129.8 + offset, 15.80);
		overHead.lineTo(1180.8 + offset, 15.80);
		overHead.moveTo(1191 + offset, 15.80);
		overHead.lineTo(1240 + offset, 15.80);
		overHead.moveTo(1250 + offset, 15.80);
		overHead.lineTo(1398 + offset, 15.80);

		overHead.stroke( { color: this.menu.config.classicMode ? GAME_COLORS.white : color, width: 1.5 } );
		overHead.x = 73.5;
		overHead.y = 66;
		return(overHead);
	}

	createHeaderGraphic(color: number): Graphics {
		const graphic = new Graphics();
		graphic.rect(0, 0, 1330, 32);
		graphic.rect(1520, 0, 116, 32)
		graphic.stroke( {color: this.menu.config.classicMode ? GAME_COLORS.white : color, width: 2} );
		graphic.fill(this.menu.config.classicMode ? GAME_COLORS.black : color);
		graphic.x = 74.5;
		graphic.y = 91.5;
		return(graphic);
	}

	createHeaderText(type: string) {
		return {
			text: type.toUpperCase(),
			x: 140,
			y: 107.5,
			style: {
				fill: GAME_COLORS.black,
				fontSize: 15,
				fontWeight: 'bold' as const,
				align: 'left' as const,
			},
		};
	}

	createLogoText(color: number) {
		return {
			text: "PONG",
			x: 1498,
			y: 93.2,
			style: {
				fill: this.menu.config.classicMode ? GAME_COLORS.white : color,
				fontSize: 110,
				fontFamily: 'anatol-mn',
			},
		};
	}
}