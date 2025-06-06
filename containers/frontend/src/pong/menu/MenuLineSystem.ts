/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   MenuLineSystem.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/30 15:26:14 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/05 09:23:26 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics } from "pixi.js";
import { Entity } from "../engine/Entity";
import { System } from "../engine/System";
import { FrameData, GAME_COLORS } from "../utils/Types";
import { Menu } from "./Menu";
import { MenuLine } from "./MenuLine";
import { RenderComponent } from "../components/RenderComponent";
import { isMenuLine } from "../utils/Guards";

export class MenuLineSystem implements System {
	menu: Menu;
	private depthLineCooldown: number = 15;
	private lastLineSpawnTime: number = 0;

	constructor(menu: Menu) {
		this.menu = menu;
	}

	update(entities: Entity[], delta: FrameData) {
		if (!this.menu.config.classicMode) {
			this.depthLineCooldown -= delta.deltaTime;

			if (this.depthLineCooldown <= 0) {
				this.handleLineSpawning();
			}
		}else {
			const particlesToRemove: string[] = [];

			for (const entity of this.menu.entities) {
				if (isMenuLine(entity)) {
					particlesToRemove.push(entity.id);
				}
			}

			for (const entityId of particlesToRemove) {
				this.menu.removeEntity(entityId);
			}
		}
	}

	private handleLineSpawning(): void {
        this.lastLineSpawnTime = Date.now();
        const uniqueId = `StandardDepthLine-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const line = new MenuLine(uniqueId, 'foreground', this.menu);

        this.menu.addEntity(line);
		
        this.depthLineCooldown = 50;
    }
}