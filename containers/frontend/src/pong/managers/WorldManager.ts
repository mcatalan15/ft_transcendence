/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   WorldManager.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/15 18:37:41 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/04 14:58:39 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { PongGame } from "../engine/Game";

import { GAME_COLORS } from "../utils/Types";

import { World, GameEvent } from "../utils/Types";

export class WorldManager {
	game: PongGame;
	worldColor: number = GAME_COLORS.marine;
	worldTags: string[] = [];
	worldNames: string[] = [];

	

	constructor(game: PongGame) {
		this.game = game;
		this. worldTags = [
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
		];

		this.worldNames = this.createWorldNames();
	}

	createWorldNames(): string[] {
		switch (this.game.language) {
			case ('en'): {
				return [
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
					'The Watchstones',
					'The Kite',
					'The Honeycomb',
					'The Bowtie',
					'The Snakes',
					'The Vipers',
				];
			}

			case ('es'): {
				return [
					'Inicializando',
					'Las Planicies',
					'Las Pirámides',
					'Las Trincheras',
					'Las Trincheras',
					'El Relámpago',
					'El Relámpago',
					'Los Escalones',
					'El Reloj de Arena',
					'Las Fauces',
					'Los Rastrillos',
					'Las Señales',
					'La Cometa',
					'El Panal',
					'La Pajarita',
					'Las Serpientes',
					'Las Víbora',
				];
			}

			case ('fr'): {
				return [
					'Initialisation',
					'Les Plaines',
					'Les Pyramides',
					'Les Tranchées',
					'Les Tranchées',
					'La Foudre',
					'La Foudre',
					'Les Marches',
					'Le Sablier',
					'Les Crocs',
					'Les Râteaux',
					'Les Signes',
					'Le Cerf-Volant',
					'Le Rayon',
					'Le Nœud Papillon',
					'Les Serpents',
					'Les Vipères',
				];
			}

			case ('cat'): {
				return [
					'Inicialitzant',
					'Les Planes',
					'Les Piràmides',
					'Les Trinxeres',
					'Les Trinxeres',
					'El Raig',
					'El Raig',
					'Els Graons',
					'El Rellotge de Sorra',
					'Les Mandíbules',
					'Els Rasclets',
					'Els Senyals',
					'L\'Estel',
					'La Bresca',
					'El Corbatí',
					'Les Serps',
					'Els Escurçons',
				];
			}
		}

		return [];
	}

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

	cleanup(): void {
		this.worldColor = GAME_COLORS.marine;
		this.worldTags = [];
		this.worldNames = [];
		
		this.worldTags = [
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
		];
		
		this.worldNames = this.createWorldNames();
		
		console.log('WorldManager cleanup completed');
	}
}