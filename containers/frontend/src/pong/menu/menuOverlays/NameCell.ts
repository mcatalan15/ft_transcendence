/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   NameCell.ts                                        :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/23 16:07:02 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/23 16:33:02 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics } from "pixi.js";

import { Menu } from "../Menu";

import { Entity } from "../../engine/Entity";

import { RenderComponent } from "../../components/RenderComponent";
import { TextComponent } from "../../components/TextComponent";

import { GAME_COLORS } from "../../utils/Types";

export class NameCell extends Entity {
	menu: Menu;
	name: {};
	color!: number;
	x: number;
	y: number;
	width: number;
	height: number;

	constructor(id: string, layer: string, menu: Menu, name: string, x: number, y: number, width: number, height: number) {
		super(id, layer);

		this.menu = menu;
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;

		const cell = this.createCell();
		const renderComponent = new RenderComponent(cell);
		this.addComponent(renderComponent);

		this.name = this.createName(name, x, y);
		const nameComponent = new TextComponent(this.name);
		this.addComponent(nameComponent);
	}

	private createCell(): Graphics {
		const cell = new Graphics();
		cell.rect(this.x, this.y, this.width, this.height);
		cell.stroke({
			color: GAME_COLORS.menuBlue,
			width: 3,
		});
		return cell;
	}

	createName(name: string, x: number = this.x, y: number = this.y){
		return {
			text: name,
			x: x + this.width / 2,
			y: y + this.height / 2,
			style: {
				fill: GAME_COLORS.menuBlue,
				fontSize: 15,
				fontWeight: 'bolder' as const,
				align: 'center' as const,
				fontFamily: '"Roboto Mono", monospace',
				letterSpacing: 0.5,
			},
			rotation: 0,
		}
	}
}