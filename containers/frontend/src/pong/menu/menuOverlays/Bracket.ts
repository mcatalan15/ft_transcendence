/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Bracket.ts                                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/18 15:13:31 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/20 12:55:42 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Text } from "pixi.js";

import { Menu } from "../Menu";

import { Entity } from "../../engine/Entity";

import { RenderComponent } from "../../components/RenderComponent";
import { TextComponent } from "../../components/TextComponent";

import { GAME_COLORS } from "../../utils/Types";

export class Bracket extends Entity {
	menu: Menu;
	playerAmount: number = 8;
	bracketGraphic!: Graphics;
	bracketNames: Text[] = [];
	crown: any;

	constructor(menu: Menu, id: string, layer: string, playerAmount: number) {
		super(id, layer);
		
		this.menu = menu;
		this.playerAmount = playerAmount;
		
		this.bracketGraphic = new Graphics();
		this.createBracketGraphic(playerAmount);
		this.bracketGraphic.y += 50;
		const renderComponent = new RenderComponent(this.bracketGraphic);
		this.addComponent(renderComponent);

		this.createBracketNames(playerAmount);
		for (let i = 0; i < this.bracketNames.length; i++) {
			const nameComponent = new TextComponent(this.bracketNames[i]);
			this.addComponent(nameComponent, `braketName_${i}`);
		}

		this.crown = this.createCrown();
		const crownTextComponent = new TextComponent(this.crown);
		this.addComponent(crownTextComponent, 'crown');
		
		/* const readyTags = this.createReadyTags(playerAmount);
		for (let i = 0; i < readyTags.length; i++) {
			const tag = new TextComponent(readyTags[i]);
			this.addComponent(tag);
		} */
	}

	createBracketGraphic(playerAmount: number) {
		this.bracketGraphic.moveTo(135, 130);
		this.bracketGraphic.lineTo(335, 130);
		this.bracketGraphic.moveTo(135, 195);
		this.bracketGraphic.lineTo(335, 195);
		this.bracketGraphic.moveTo(135, 260);
		this.bracketGraphic.lineTo(335, 260);
		this.bracketGraphic.moveTo(135, 325);
		this.bracketGraphic.lineTo(335, 325);
		this.bracketGraphic.moveTo(135, 390);
		this.bracketGraphic.lineTo(335, 390);
		this.bracketGraphic.moveTo(135, 455);
		this.bracketGraphic.lineTo(335, 455);
		this.bracketGraphic.moveTo(135, 520);
		this.bracketGraphic.lineTo(335, 520);
		this.bracketGraphic.moveTo(135, 585);
		this.bracketGraphic.lineTo(335, 585);

		this.bracketGraphic.moveTo(333.5, 129);
		this.bracketGraphic.lineTo(333.5, 196);
		this.bracketGraphic.moveTo(333.5, 259);
		this.bracketGraphic.lineTo(333.5, 326);
		this.bracketGraphic.moveTo(333.5, 389);
		this.bracketGraphic.lineTo(333.5, 456);
		this.bracketGraphic.moveTo(333.5, 519);
		this.bracketGraphic.lineTo(333.5, 586);

		this.bracketGraphic.moveTo(333.5, 162.5);
		this.bracketGraphic.lineTo(533.5, 162.5);
		this.bracketGraphic.moveTo(333.5, 292.5);
		this.bracketGraphic.lineTo(533.5, 292.5);
		this.bracketGraphic.moveTo(333.5, 422.5);
		this.bracketGraphic.lineTo(533.5, 422.5);
		this.bracketGraphic.moveTo(333.5, 552.5);
		this.bracketGraphic.lineTo(533.5, 552.5);

		this.bracketGraphic.moveTo(532.5, 161.5);
		this.bracketGraphic.lineTo(532.5, 293.5);
		this.bracketGraphic.moveTo(532, 423.5);
		this.bracketGraphic.lineTo(532, 554);

		this.bracketGraphic.moveTo(532.5, 227.5);
		this.bracketGraphic.lineTo(732.5, 227.5);
		this.bracketGraphic.moveTo(532.5, 487.5);
		this.bracketGraphic.lineTo(732.5, 487.5);

		this.bracketGraphic.moveTo(732, 226);
		this.bracketGraphic.lineTo(732, 489);

		this.bracketGraphic.moveTo(732.5, 357.5);
		this.bracketGraphic.lineTo(800, 357.5);
		
		this.bracketGraphic.stroke({ color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue, width: 3 });
	}

	createBracketNames(playerAmount: number) {
		for (let i = 0; i < playerAmount; i++) {
			this.bracketNames.push({
				text: `PLAYER ${i + 1}`,
				x: this.getNamePosition(i).x,
				y: this.getNamePosition(i).y,
				style: {
					fill: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue,
					fontSize: 15,
					fontWeight: 'bold' as const,
				},
			} as Text);
		};
	}

	createCrown() {
		return {
			text: "♔", // Crown
			x: this.menu.width / 2 - 10,
			y: this.menu.height/ 2 - 50,
			style: {
				fill: { color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.orange, alpha: 0.5 },
				fontSize: 75,
				fontWeight: 'lighter' as const,
				fontFamily: 'anatol-mn',
			},
			anchor: { x: 0.5, y: 0.5 },
		};
	}

	createReadyTags(playerAmount: number): Text[] {
		let names: Text[] = [];

		for (let i = 0; i < playerAmount; i++) {
			names.push({
				text: `ready`,
				x: this.getNamePosition(i).x,
				y: this.getNamePosition(i).y,
				style: {
					fill: { color:GAME_COLORS.white, alpha: 0.75 },
					fontSize: 15,
					fontWeight: 'bold' as const,
				},
			} as Text);
		};
		
		return (names);
	}

	getNamePosition(index: number): { x: number, y: number } {
		const vOffset = 10;
		
		switch (index) {
			case (0): {
				return {
					x: 175,
					y: 175 - vOffset,
				};
			}

			case (1): {
				return {
					x: 175,
					y: 240 - vOffset,
				};
			}

			case (2): {
				return {
					x: 175,
					y: 305 - vOffset,
				};
			}

			case (3): {
				return {
					x: 175,
					y: 370 - vOffset,
				};
			}

			case (4): {
				return {
					x: 175,
					y: 435 - vOffset,
				};
			}

			case (5): {
				return {
					x: 175,
					y: 500 - vOffset,
				};
			}

			case (6): {
				return {
					x: 175,
					y: 565 - vOffset,
				};
			}

			case (7): {
				return {
					x: 175,
					y: 630 - vOffset,
				};
			}
		}
		
		return ({x: 100, y: 100});
	}

	redrawBracket(): void {
		this.bracketGraphic.clear();
		this.createBracketGraphic(this.playerAmount);
	
		for (let i = 0; i < this.playerAmount; i++) {
			this.removeComponent('text', `bracketName_${i}`);
		}
	
		this.createBracketNames(this.playerAmount);
		for (let i = 0; i < this.bracketNames.length; i++) {
			const nameComponent = new TextComponent(this.bracketNames[i]);
			this.addComponent(nameComponent, `bracketName_${i}`);
		}

		const updatedCrown = this.createCrown();
		const crownComponent = new TextComponent(updatedCrown);
		this.replaceComponent('text', crownComponent, 'crown');
	}
}