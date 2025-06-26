/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   TournamentNextMatchDisplay.ts                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/25 12:23:14 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/26 09:54:42 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Graphics, Text } from "pixi.js";

import { Menu } from "../Menu";

import { Entity } from "../../engine/Entity";
import { HeaderBar } from "./HeaderBar";

import { RenderComponent } from "../../components/RenderComponent";
import { TextComponent } from "../../components/TextComponent";

import { GAME_COLORS } from "../../utils/Types";


export class TournamentNextMatchDisplay extends Entity {
	menu: Menu;
	header: HeaderBar;
	vsText: Text[] = [];
	avatarFrames: Graphics = new Graphics();
	statsContainer: Graphics = new Graphics();
	statsTexts: Text[] = [];
	
	constructor(menu: Menu, id: string, layer: string) {
		super(id, layer);
		
		this.menu = menu;

		this.header = new HeaderBar(this.menu, 'nextMatchHeader', 'overlays', 'next match', 1098, 180, 554, 20);
		const headerBar = this.header.getComponent('render') as RenderComponent;
		this.addComponent(headerBar, 'barRender');
		const headerText = this.header.getComponent('text') as RenderComponent;
		this.addComponent(headerText, 'barText');

		this.createAvatarFrames();
		const avatarFramesComponent = new RenderComponent(this.avatarFrames);
		this.addComponent(avatarFramesComponent, 'avatarFrames');

		this.vsText = this.createVsTexts();
		for (let i = 0; i < this.vsText.length; i++) {
			const vsTextComponent = new TextComponent(this.vsText[i]);
			this.addComponent(vsTextComponent, `vsText${i}`);
		}

		this.statsTexts = this.createStatsTexts();
		for (let i = 0; i < this.statsTexts.length; i++) {
			const statsTextComponent = new TextComponent(this.statsTexts[i]);
			this.addComponent(statsTextComponent, `statsText${i}`);
		}

		/* this.statsContainer = this.createStatsContainer();
		const statsContainerComponent = new RenderComponent(this.statsContainer);
		this.addComponent(statsContainerComponent, 'statsContainer'); */
	}

	createStatsTexts(): Text[] {
		const statsTexts: Text[] = [];

		statsTexts.push({
			text: "TOURNAMENTS   GOALSSCORED   GOALSCONCEDED   \nWINS   LOSSES   DRAWS   W-LRATIO     RANK   ", 
			x: 1225.5,
			y: 517.5,
			style: {
				fill: { color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue, alpha: 1},
				fontSize: 8,
				fontWeight: '900' as const,
				align: 'center' as const,
				fontFamily: '"Roboto Mono", monospace',
			},
		} as Text);

		statsTexts.push({
			text: "           000           000             000\n    000      000     000        0.000    000", 
			x: 1225.5,
			y: 517.5,
			style: {
				fill: { color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue, alpha: 0.5},
				fontSize: 8,
				fontWeight: 'lighter' as const,
				align: 'center' as const,
				fontFamily: '"Roboto Mono", monospace',
			},
		} as Text);

		statsTexts.push({
			text: "TOURNAMENTS   GOALSSCORED   GOALSCONCEDED   \nWINS   LOSSES   DRAWS   W-LRATIO     RANK   ", 
			x: 1523,
			y: 517.5,
			style: {
				fill: { color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue, alpha: 1},
				fontSize: 8,
				fontWeight: '900' as const,
				align: 'center' as const,
				fontFamily: '"Roboto Mono", monospace',
			},
		} as Text);
		
		statsTexts.push({
			text: "           000           000             000\n    000      000     000        0.000    000", 
			x: 1523,
			y: 517.5,
			style: {
				fill: { color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue, alpha: 0.5},
				fontSize: 8,
				fontWeight: 'lighter' as const,
				align: 'center' as const,
				fontFamily: '"Roboto Mono", monospace',
			},
		} as Text);

		return (statsTexts);
	}

	createStatsContainer(): Graphics{
		const container = new Graphics();
		
		container.moveTo(1140, 485.5);
		container.lineTo(1100, 485.5);
		container.lineTo(1100, 510);
		container.moveTo(1100, 520);
		container.lineTo(1100, 544.5);
		container.lineTo(1350, 544.5);
		container.lineTo(1350, 520);
		container.moveTo(1350, 510);
		container.lineTo(1350, 485.5);
		container.lineTo(1310, 485.5);
		container.stroke( {color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue, width: 2, alpha: 1} );
		return (container);
	}

	createAvatarFrames() {
		const color = this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue;

		this.avatarFrames.rect(1100, 215, 250, 250);
		this.avatarFrames.stroke( {color: color, width: 2.5, alpha: 1} )

		this.avatarFrames.rect(1400, 215, 250, 250);
		this.avatarFrames.stroke( {color: color, width: 2.5, alpha: 1} )

	}

	createVsTexts(): Text[] {
        const vsTexts: Text[] = [];
        
        vsTexts.push({
            text: "-----------    ------------------", 
            x: 1375,
            y: 370,
            style: {
                fill: { color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue, alpha: 0.3},
                fontSize: 14,
                fontWeight: 'bold' as const,
                align: 'left' as const,
                fontFamily: 'monospace',
                letterSpacing: 1.2,
            },
        } as Text);

        vsTexts[0].rotation = 1.5708;

		vsTexts.push({
			text: "vs", 
			x: 1375,
			y: 335,
			style: {
				fill: { color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue, alpha: 1},
				fontSize: 26,
				fontWeight: 'lighter' as const,
				align: 'left' as const,
				fontFamily: 'anatol-mn',
			},
		} as Text);

		vsTexts.push({
			text: "HMUNOZ-G", 
			x: 1225,
			y: 487.5,
			style: {
				fill: { color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue, alpha: 1},
				fontSize: 30,
				fontWeight: 'bold' as const,
				align: 'center' as const,
				fontFamily: '"Roboto Mono", monospace',
			},
		} as Text);

		vsTexts.push({
			text: "PSHCHERB", 
			x: 1525,
			y: 490,
			style: {
				fill: { color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue, alpha: 1},
				fontSize: 30,
				fontWeight: 'bold' as const,
				align: 'center' as const,
				fontFamily: '"Roboto Mono", monospace',
			},
		} as Text);

        return vsTexts;
    }

	redrawDisplay(): void {
		this.header.redrawBar(this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue);

		const newVsTexts = this.createVsTexts();
		for (let i = 0; i < this.vsText.length; i++) {
			const vsTextComponent = new TextComponent(newVsTexts[i]);
			this.replaceComponent(`text`, vsTextComponent, `vsText${i}`);
		}

		const newStatsTexts = this.createStatsTexts();
		for (let i = 0; i < this.statsTexts.length; i++) {
			const statsTextComponent = new TextComponent(newStatsTexts[i]);
			this.replaceComponent(`text`, statsTextComponent, `statsText${i}`);
		}
		
		this.avatarFrames.clear();
		this.createAvatarFrames();
	}
}