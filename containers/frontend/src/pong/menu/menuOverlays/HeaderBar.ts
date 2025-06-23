/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   HeaderBar.ts                                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/19 14:00:26 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/23 16:14:11 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics } from "pixi.js";

import { Menu } from "../Menu";

import { Entity } from "../../engine/Entity";

import { RenderComponent } from "../../components/RenderComponent";
import { TextComponent } from "../../components/TextComponent";

import { GAME_COLORS } from "../../utils/Types";

export class HeaderBar extends Entity {
	menu: Menu;
	bar!: Graphics;
	color!: number;
	x: number;
	y: number;
	width: number;
	height: number;

	constructor(menu: Menu,	id: string, layer: string, overlayBase:string, x: number, y: number, width: number, height: number) {
		super(id, layer);

		this.menu = menu;
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;

		const overlay = this.getActualOverlay(overlayBase);
		
		const color = this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue;
		this.color = color;

		const bar = this.createBar(color, x, y, width, height);
		this.bar = bar;
		const renderComponent = new RenderComponent(bar);
		this.addComponent(renderComponent);

		const text = this.createText(overlay, x, y);
		const textComponent = new TextComponent(text);
		this.addComponent(textComponent);
	}
	
	getActualOverlay(overlayBase: string): string{
		if (this.menu.language === 'en') {
			return (overlayBase);
		}

		switch (this.menu.language) {
			case('es'): {
				switch (overlayBase) {
					case ('profile'): {
						return ('perfil');
					}
					
					case ('next match'): {
						return ('próximo partido');
					}
				}
				break;
			}

			case ('fr'): {
				switch (overlayBase) {
					case ('profile'): {
						return ('profil');
					}
					
					case ('next match'): {
						return ('prochain match');
					}
				}
				break;
			}

			case ('cat'): {
				switch (overlayBase) {
					case ('profile'): {
						return ('perfil');
					}
					
					case ('next match'): {
						return ('pròxim partit');
					}
				}
				break;
			}
		}

		return ('unknown');
	}	

	createBar(color: number, x: number, y: number, width: number, height: number): Graphics {
		const bar = new Graphics();
		bar.rect(x, y, width, height);
		bar.fill(color);

		return bar;
	}

	createText(overlay: string, x: number, y: number){
		return {
			tag: overlay,
			text: overlay.toUpperCase(),
			x: x + 10,
			y: y + 2,
			style: {
				fill: GAME_COLORS.black,
				fontSize: 15,
				fontWeight: 'bolder' as const,
				align: 'left' as const,
				fontFamily: '"Roboto Mono", monospace',
				letterSpacing: 0.5,
			},
			anchor: { x: 0, y: 0 },
			rotation: 0,
		}
	}

	redrawBar(color?: number) {
		this.bar.clear();
		this.bar.rect(this.x, this.y, this.width, this.height);
		if (color !== undefined) {
			this.bar.fill(color);
		} else {
			this.bar.fill(this.menu.config.classicMode ? GAME_COLORS.white : this.color);
		}
	}
}