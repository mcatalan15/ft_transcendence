/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   WorldManager.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/15 18:37:41 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/27 17:59:33 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { PongGame } from "../engine/Game";

import { GAME_COLORS } from "../utils/Types";

import { World, GameEvent } from "../utils/Types";

export class WorldManager {
	worldColor: number = GAME_COLORS.marine;
	worldTags: string[] = [
		'initialWorld',
		'flatWorld',
		'pyramidWorld',
		'trenchesFlippedWorld',
		'trenchesWorld',
		'lightningWorld',
		'lightningFlippedWorld',
		'stepsWorld',
		'hourglassWorld',
		'mawWorld',
		'rakesWorld',
		'cairnsWorld',
		'kiteWorld',
		'honeycombWorld',
		'bowtieWorld',
		'snakesWorld',
		'vipersWorld',
	]
	worldNames: string[] = [
		'Initializing',
		'The Flatlands',
		'The Pyramids',
		'The Trenches',
		'The Trenches',
		'The Lightning',
		'The Lightning',
		'The Steps',
		'The Hourglass',
		'The Fangs',
		'The Rakes',
		'The Waystones',
		'The Kite',
		'The Honeycomb',
		'The Bowtie',
		'The Snakes',
		'The Vipers',
	]

	populateWorlds(worlds: World[]) {
		for (let i = 0; i < 17; i++ ) {
			const world = this.createWorld(this.worldTags[i], this.worldNames[i], this.worldColor);
			worlds.push(world);
		}
	}

	createWorld(tag: string, name: string, color: number): World {
		return { tag, name, color,};
	}

	selectWorld(id: string): number {
		if (id.includes('pyramid')) return (2);
		if (id.includes('trenches')) {
			if (id.includes('Flipped')) return (3);
			return (4);
		}
		if (id.includes('lightning')) {
			if (id.includes('Flipped')) return (5);
			return (6);
		} 
		if (id.includes('steps')) return (7);
		if (id.includes('hourglass')) return (8);
		if (id.includes('maw')) return (9);
		if (id.includes('rake')) return (10);
		if (id.includes('ledge')) return (11);
		if (id.includes('diamond')) return (12);
		if (id.includes('honeycomb')) return (13);
		if (id.includes('funnel')) return (14);
		if (id.includes('windmills')) return (15);
		if (id.includes('giants')) return (16);
		return (1);
	}

	changeWorld(game: PongGame, id: string) {
		const idx = this.selectWorld(id);
		const nextWorld = game.worldPool[idx];

		const changeWorldEvent: GameEvent = {
			type: "CHANGE_WORLD",
			target: nextWorld,
		};
		game.eventQueue.push(changeWorldEvent);
	}
}