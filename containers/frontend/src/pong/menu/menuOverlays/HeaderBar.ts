/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   HeaderBar.ts                                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/19 14:00:26 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/19 16:13:40 by hmunoz-g         ###   ########.fr       */
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
		
		const color = this.getColor(overlay);
		this.color = color;

		const bar = this.createBar(color, x, y, width, height);
		this.bar = bar;
		const renderComponent = new RenderComponent(bar);
		this.addComponent(renderComponent);

		const text = this.createText(overlay);
		const textComponent = new TextComponent(text);
		this.addComponent(textComponent);
	}
	
	getActualOverlay(overlayBase: string): string{
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
				}
			}
		}

		return ('unknown');
	}	

	getColor(overlay: string) {
		if ( overlay === 'glossary' || overlay === 'glossaire' || overlay === 'glosario' || overlay === 'glossari') {
			if (this.menu.config.classicMode) {
				return (GAME_COLORS.white) as number;
			}
			return (GAME_COLORS.menuOrange) as number;
		} else if (overlay === 'play' || overlay === 'jouer' || overlay === 'jugar') {
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

	createBar(color: number, x: number, y: number, width: number, height: number): Graphics {
		const bar = new Graphics();
		bar.rect(x, y, width, height);
		bar.fill(color);

		return bar;
	}

	createText(overlay: string) {
		return {
			tag: overlay,
			text: overlay.toUpperCase(),
			x: 80,
			y: 80,
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