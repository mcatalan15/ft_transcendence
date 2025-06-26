/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   OverlayHeader.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/18 14:06:18 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/26 18:25:23 by hmunoz-g         ###   ########.fr       */
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
	overlayType: string;
	headerGraphic!: Graphics;
	blocking!: Graphics;
	overHead!: Graphics;
	headerText!: any;
	logoText!: any;

	constructor(menu: Menu, id: string, layer: string, preType: string) {
		super(id, layer);
		
		this.menu = menu;

		this.overlayType = preType;
		const color = this.getColor(preType);

		this.headerGraphic = new Graphics();
		this.createHeaderGraphic(color);
		const renderComponent = new RenderComponent(this.headerGraphic);
		this.addComponent(renderComponent);

		const type = this.getType(preType);
		
		this.headerText = this.createHeaderText(type);

		this.logoText = this.createLogoText(color);
		const logoTextComponent = new TextComponent(this.logoText);
		this.addComponent(logoTextComponent, 'logoText');

		this.blocking = new Graphics();
		this.createBlocking();
		const blockingComponent = new RenderComponent(this.blocking);
		this.addComponent(blockingComponent);

		this.overHead = new Graphics();
		this.createOverHead(color);
		const overHeadComponent = new RenderComponent(this.overHead);
		this.addComponent(overHeadComponent);
	}

	getType(overlayBase: string): string {
		if (this.menu.language === 'en' || overlayBase === 'info') {
			return (overlayBase);
		}

		switch (this.menu.language) {
			case('es'): {
				switch (overlayBase) {
					case ('glossary'): {
						return ('glosario');
					}
					
					case ('play'): {
						return ('jugar');
					}

					case ('tournament'): {
						return ('torneo');
					}
					
					case ('local'):	{
						return ('local');
					}

					case ('online'):	{
						return ('en línea');
					}
				}
				break;
			}

			case ('fr'): {
				switch (overlayBase) {
					case ('glossary'): {
						return ('glossaire');
					}
					
					case ('play'): {
						return ('jouer');
					}

					case ('tournament'): {
						return ('tournoi');
					}

					case ('local'):	{
						return ('local');
					}

					case ('online'):	{
						return ('en ligne');
					}
				}
				break;
			}

			case ('cat'): {
				switch (overlayBase) {
					case ('glossary'): {
						return ('glossari');
					}
					
					case ('play'): {
						return ('jugar');
					}

					case ('tournament'): {
						return ('torneig');
					}

					case ('local'):	{
						return ('local');
					}

					case ('online'):	{
						return ('en línia');
					}
				}
			}
		}

		return ('unknown');
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

	createBlocking(){
		this.blocking.rect(0, 0, 250, 25);
		this.blocking.fill(GAME_COLORS.black);
		this.blocking.x = 1380;
		this.blocking.y = 65;
	}

	createOverHead(color: number) {
		const offset = 239;

		this.overHead.moveTo(0, 0);
		this.overHead.lineTo(1112 + offset, 0);
		this.overHead.moveTo(1138 + offset, 0);
		this.overHead.lineTo(1173 + offset, 0);
		this.overHead.moveTo(1191 + offset, 0);
		this.overHead.lineTo(1231 + offset, 0);
		this.overHead.moveTo(1258 + offset, 0);
		this.overHead.lineTo(1398 + offset, 0);

		this.overHead.moveTo(0, 5.3);
		this.overHead.lineTo(1117.8 + offset, 5.3);
		this.overHead.moveTo(1132 + offset, 5.3);
		this.overHead.lineTo(1179 + offset, 5.3);
		this.overHead.moveTo(1191 + offset, 5.3);
		this.overHead.lineTo(1238 + offset, 5.3);
		this.overHead.moveTo(1252 + offset, 5.3);
		this.overHead.lineTo(1398 + offset, 5.3);

		this.overHead.moveTo(0, 10.5);
		this.overHead.lineTo(1120 + offset, 10.5);
		this.overHead.moveTo(1130 + offset, 10.5);
		this.overHead.lineTo(1181 + offset, 10.5);
		this.overHead.moveTo(1191 + offset, 10.5);
		this.overHead.lineTo(1240 + offset, 10.5);
		this.overHead.moveTo(1250 + offset, 10.5);
		this.overHead.lineTo(1398 + offset, 10.5);

		this.overHead.moveTo(0, 15.80);
		this.overHead.lineTo(1120 + offset, 15.80);
		this.overHead.moveTo(1129.8 + offset, 15.80);
		this.overHead.lineTo(1180.8 + offset, 15.80);
		this.overHead.moveTo(1191 + offset, 15.80);
		this.overHead.lineTo(1240 + offset, 15.80);
		this.overHead.moveTo(1250 + offset, 15.80);
		this.overHead.lineTo(1398 + offset, 15.80);

		this.overHead.stroke( { color: this.menu.config.classicMode ? GAME_COLORS.white : color, width: 1.5 } );
		this.overHead.x = 73.5;
		this.overHead.y = 66;
	}

	createHeaderGraphic(color: number) {
		this.headerGraphic.rect(0, 0.1, 1309.5, 32);
		this.headerGraphic.rect(1539.5, -0.04, 98.3, 32)
		this.headerGraphic.stroke( {color: this.menu.config.classicMode ? GAME_COLORS.white : color, width: 0.1} );
		this.headerGraphic.fill(this.menu.config.classicMode ? GAME_COLORS.white : color);
		this.headerGraphic.x = 73.5;
		this.headerGraphic.y = 90.6;
	}

	createHeaderText(type: string) {
		// Only God can judge me
		let x = 100 + (type.length - 4) * 5;

		switch (type.length) {

		}
		
		return {
			text: type.toUpperCase(),
			x: x,
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
			y: 93,
			style: {
				fill: this.menu.config.classicMode ? GAME_COLORS.white : color,
				fontSize: 110,
				fontFamily: 'anatol-mn',
			},
		};
	}

	redrawOverlayElements(): void {
		const color = this.menu.config.classicMode ? GAME_COLORS.white : this.getColor(this.overlayType);
	
		this.headerGraphic.clear();
		this.overHead.clear();
	
		this.createHeaderGraphic(color);
		
		let preType;

		if (this.menu.config.mode === 'local') {
			preType = 'local';
		} else if (this.menu.config.mode === 'online') {
			preType = 'online'
		}

		if (this.menu.config.variant === 'tournament') {
			preType = 'tournament';
		} else if (this.overlayType === 'info') {
			preType = 'info';
		} else if (this.overlayType === 'glossary') {
			preType = 'glossary';
		}


		let langType = this.getType(preType!);

		let finalType = langType;

		if (this.overlayType !== 'info' && this.overlayType !== 'glossary') {
			if (this.menu.config.variant === '1v1') {
				finalType += " - 1 vs 1";
			} else if (this.menu.config.variant === '1vAI') {
				finalType += " - 1 vs AI";
			}
		}
		
		const newHeaderText = this.createHeaderText(finalType!);
		const headerTextComponent = new TextComponent(newHeaderText);
		this.replaceComponent('text', headerTextComponent, 'headerText');
	
		const updatedLogoText = this.createLogoText(color);
		const logoTextComponent = new TextComponent(updatedLogoText);
		this.replaceComponent('text', logoTextComponent, 'logoText');
	
		const newBlocking = this.blocking;
		const blockingComponent = new RenderComponent(newBlocking);
		this.replaceComponent('render', blockingComponent, 'blocking');
	
		this.createOverHead(color);
		const newOverHead = this.overHead;
		const overHeadComponent = new RenderComponent(newOverHead);
		this.replaceComponent('render', overHeadComponent, 'overHead');
	}
}