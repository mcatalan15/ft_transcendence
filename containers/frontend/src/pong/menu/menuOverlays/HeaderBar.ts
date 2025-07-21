/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   HeaderBar.ts                                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/19 14:00:26 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/21 21:03:34 by hmunoz-g         ###   ########.fr       */
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

	constructor(menu: Menu,	id: string, layer: string, overlayBase: string, x: number, y: number, width: number, height: number) {
		super(id, layer);

		this.menu = menu;
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;

		const overlay = this.getActualOverlay(overlayBase);
		
		const color = this.getColor();
		this.color = color;

		const bar = this.createBar(color, x, y, width, height);
		this.bar = bar;
		const renderComponent = new RenderComponent(bar);
		this.addComponent(renderComponent, 'render');

		const text = this.createText(overlay, x, y);
		const textComponent = new TextComponent(text);
		this.addComponent(textComponent, 'text');
	}

	getColor(): number {
		let color;

		if (this.menu.config.classicMode) {
			color = GAME_COLORS.white;
		} else {
			if (this.id.includes('glossary')) {
				color = GAME_COLORS.menuOrange
			} else if (this.id.includes('info')) {
				color = GAME_COLORS.menuPink;
			} else {
				color = GAME_COLORS.menuBlue;
			}
		}

		if (this.menu.tournamentManager.getHasActiveTournament() && this.menu.tournamentManager.getTournamentConfig()!.isFinished) {
			color = GAME_COLORS.orange;
		}

		return (color);
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

					case ('POWER-UPS'): {
						return ('POWER-UPS');
					}

					case ('POWER-DOWNS'): {
						return ('POWER-DOWNS');
					}

					case ('BALL-CHANGES'): {
						return ('CAMBIOS DE PELOTA');
					}

					case ('AFFECTATIONS'): {
						return ('AFECTACIONES DE PALAS');
					}

					case ('WALL FIGURES'): {
						return ('FIGURAS DE MURO');
					}

					case ('TEAM'):{
						return ('EQUIPO');
					}

					case ('PROJECT'): {
						return ('PROYECTO');
					}

					case ('chat'): {
						return ('chat');
					}

					case ('tournament winner'): {
						return ('GANADOR DEL TORNEO');
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

					case ('POWER-UPS'): {
						return ('POWER-UPS');
					}

					case ('POWER-DOWNS'): {
						return ('POWER-DOWNS');
					}

					case ('BALL-CHANGES'): {
						return ('CHANGEMENTS DE BALLE');
					}

					case ('AFFECTATIONS'): {
						return ('AFFECTATIONS DES RAQUETTES');
					}

					case ('WALL FIGURES'): {
						return ('FIGURES DE MUR');
					}

					case ('TEAM'):{
						return ('ÉQUIPE');
					}

					case ('PROJECT'): {
						return ('PROJET');
					}

					case ('chat'): {
						return ('chat');
					}

					case ('tournament winner'): {
						return ('GAGNANT DU TOURNOI');
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

					case ('POWER-UPS'): {
						return ('POWER-UPS');
					}

					case ('POWER-DOWNS'): {
						return ('POWER-DOWNS');
					}

					case ('BALL-CHANGES'): {
						return ('CANVIS DE PILOTA');
					}

					case ('AFFECTATIONS'): {
						return ('AFECTACIONS DE PALES');
					}

					case ('WALL FIGURES'): {
						return ('FIGURES DE PARET');
					}

					case ('TEAM'):{
						return ('EQUIP');
					}

					case ('PROJECT'): {
						return ('PROJECTE');
					}

					case ('chat'): {
						return ('xat');
					}

					case ('tournament winner'): {
						return ('GUANYADOR DEL TORNEIG');
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
			y: y + 1,
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