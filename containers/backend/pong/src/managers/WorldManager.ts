/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   WorldManager.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/15 18:37:41 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/05/21 16:42:39 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics } from "pixi.js";

import { World } from "../utils/Types";

export class WorldManager {
    worldColor: number = 0x204c93;
    worldTags: string[] = [
        'initialWorld',
        'flatWorld',
        'pyramidWorld',
        'trenchesWorld',
        'lightningWorld',
        'stepsWorld',
        'bangWorld',
        'mawWorld',
        'rakesWorld',
        'blocksWorld',
        'diamondWorld',
        'honeycombWorld',
        'funnelWorld',
        'topWindmillsWorld',
        'bottomWindmillsWorld',
    ]
    worldNames: string[] = [
        'Initializing',
        'The Flatlands',
        'The Pyramids',
        'The Trenches',
        'The Lightning',
        'The Steps',
        'The Bang',
        'The Maw',
        'The Rakes',
        'The Blocks',
        'The Diamond',
        'The Honeycomb',
        'The Funnel',
        'The Windmills',
        'The Windmills',
    ]

    populateWorlds(worlds: World[]) {
        for (let i = 0; i < 15; i++ ) {
            const world = this.createWorld(this.worldTags[i], this.worldNames[i], this.worldColor);
            worlds.push(world);
        }
    }

    createWorld(tag: string, name: string, color: number): World {
        return { tag, name, color,};
    }

    selectWorld(id: string): number {
        console.log(id);
        if (id.includes('pyramid')) return (2);
        if (id.includes('trenches')) return (3);
        if (id.includes('lightning')) return (4);
        if (id.includes('steps')) return (5);
        if (id.includes('bang')) return (6);
        if (id.includes('maw')) return (7);
        if (id.includes('rake')) return (8);
        if (id.includes('ledge')) return (9);
        if (id.includes('diamond')) return (10);
        if (id.includes('honeycomb')) return (11);
        if (id.includes('funnel')) return (12);
        if (id.includes('topWindmill')) return (13);
        if (id.includes('bottomWindmill')) return (14);
        return (1);
    }
}