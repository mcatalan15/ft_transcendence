/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   TournamentNextMatchDisplay.ts                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/25 12:23:14 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/18 14:43:11 by hmunoz-g         ###   ########.fr       */
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
	plainStats: string[] = [];
	
	constructor(menu: Menu, id: string, layer: string) {
		super(id, layer);
		
		this.menu = menu;

		this.getPlainStats()

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
	}

	getPlainStats(playerData?: any){
		this.plainStats = [];
		
		const data = playerData || this.menu.playerData;
	
		const tournamentsStat = data?.tournaments || 0;
		this.plainStats.push(this.formatStat(tournamentsStat, 'number'));
	
		const goalsScoredStat = data?.goalsScored || 0;
		this.plainStats.push(this.formatStat(goalsScoredStat, 'number'));
	
		const goalsConcededStat = data?.goalsConceded || 0;
		this.plainStats.push(this.formatStat(goalsConcededStat, 'number'));
	
		const winsStat = data?.wins || 0;
		this.plainStats.push(this.formatStat(winsStat, 'number'));
	
		const lossesStat = data?.losses || 0;
		this.plainStats.push(this.formatStat(lossesStat, 'number'));
	
		const drawsStat = data?.draws || 0;
		this.plainStats.push(this.formatStat(drawsStat, 'number'));
	
		const winLossRatioStat = this.calculateWinLossRatio(data);
		this.plainStats.push(this.formatStat(winLossRatioStat, 'ratio'));
	
		const rankStat = data?.rank || 0;
		this.plainStats.push(this.formatStat(rankStat, 'rank'));
	
		console.log('Formatted stats:', this.plainStats);
	}

	formatStat(stat: number | string, type: 'number' | 'ratio' | 'rank' = 'number'): string {
		if (stat === undefined || stat === null) {
			return "???";
		}
		
		switch (type) {
			case 'ratio':
				if (typeof stat === 'number') {
					if (stat < 10) {
						const formatted = stat.toFixed(2);
						const [integerPart, decimalPart] = formatted.split('.');
						const paddedInteger = integerPart.padStart(2, '0');
						return `${paddedInteger}.${decimalPart}`;
					} else if (stat < 100) {
						return stat.toFixed(2);
					} else {
						return stat.toFixed(1);
					}
				}
				return stat.toString();
				
			case 'rank':
				if (typeof stat === 'number') {
					const formatted = stat.toFixed(1);
					const [integerPart, decimalPart] = formatted.split('.');
					const paddedInteger = integerPart.padStart(3, '0');
					return `${paddedInteger}.${decimalPart}`;
				}
				return stat.toString();
				
			case 'number':
			default:
				if (typeof stat === 'number') {
					return stat.toString().padStart(3, '0');
				}
				return stat.toString().padStart(3, '0');
		}
	}
	
	calculateWinLossRatio(playerData?: any): number {
		const data = playerData || this.menu.playerData;
		const wins = data?.wins || 0;
		const losses = data?.losses || 0;
	
		if (losses === 0) {
			return wins > 0 ? 100 : 0.00;
		}
	
		return parseFloat((wins / losses).toFixed(2));
	}

	createStatsTexts(): Text[] {
		const statsTexts: Text[] = [];

		statsTexts.push({
			text: this.getStatsTextInLanguage(), 
			x: 1225.5,
			y: 517.5,
			style: {
				fill: { color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue, alpha: 1},
				fontSize: 6,
				fontWeight: '900' as const,
				align: 'center' as const,
				fontFamily: '"Roboto Mono", monospace',
			},
		} as Text);

		statsTexts.push({
			text: this.getStatsValuesInLanguage(false), 
			x: 1225.5,
			y: 517.5,
			style: {
				fill: { color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue, alpha: 0.5},
				fontSize: 6,
				fontWeight: '900' as const,
				align: 'center' as const,
				fontFamily: '"Roboto Mono", monospace',
			},
		} as Text);

		statsTexts.push({
			text: this.getStatsTextInLanguage(), 
			x: 1523,
			y: 517.5,
			style: {
				fill: { color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue, alpha: 1},
				fontSize: 6,
				fontWeight: '900' as const,
				align: 'center' as const,
				fontFamily: '"Roboto Mono", monospace',
			},
		} as Text);
		
		statsTexts.push({
			text: this.getStatsValuesInLanguage(false), 
			x: 1523,
			y: 517.5,
			style: {
				fill: { color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue, alpha: 0.5},
				fontSize: 6,
				fontWeight: '900' as const,
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
			text: /* this.menu.playerData!.name.toUpperCase() || */ "WAITING", 
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
			text: /* this.menu.playerData!.name.toUpperCase() ||  */"WAITING", 
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

	getStatsTextInLanguage(): string {
		switch (this.menu.language) {
			case ('es'): {
				return ("TORNEOS   GOLESMARCADOS   GOLESCONCEDIDOS   \nVICTORIAS   DERROTAS   EMPATES   RATIOVD     ELO     ");
			}

			case ('fr'): {
				return "TOURNOIS   BUTSMARQUÉS   BUTSENCAISSÉS   \nVICTOIRES   DÉFAITES   MATCHSNULS   RATIOVD     ELO     ";
			}

			case ('cat'): {
				return "TORNEIGS   GOLSMARCATS   GOLSENCAIXATS   \nVICTÒRIES   DERROTES   EMPATS   RÀTIOVD     ELO     ";
			}

			default: {
				return "TOURNAMENTS   GOALSSCORED   GOALSCONCEDED   \nWINS   LOSSES   DRAWS   WLRATIO     ELO     ";
			}
		}
	};

	getStatsValuesInLanguage(known: boolean): string {
		if (known) {
			switch (this.menu.language) {
				case ('es'): {
					return (`       ${this.plainStats[0]}             ${this.plainStats[1]}               ${this.plainStats[2]}\n         ${this.plainStats[3]}        ${this.plainStats[4]}       ${this.plainStats[5]}       ${this.plainStats[6]}   ${this.plainStats[7]}`);
				}

				case ('fr'): {
					return (`        ${this.plainStats[0]}           ${this.plainStats[1]}             ${this.plainStats[2]}\n         ${this.plainStats[3]}        ${this.plainStats[4]}          ${this.plainStats[5]}       ${this.plainStats[6]}   ${this.plainStats[7]}`);
				}

				case ('cat'): {
					return (`        ${this.plainStats[0]}           ${this.plainStats[1]}             ${this.plainStats[2]}\n         ${this.plainStats[3]}        ${this.plainStats[4]}      ${this.plainStats[5]}       ${this.plainStats[6]}   ${this.plainStats[7]}`);
				}
				
				default: {
					return (`           ${this.plainStats[0]}           ${this.plainStats[1]}             ${this.plainStats[2]}\n    ${this.plainStats[3]}      ${this.plainStats[4]}     ${this.plainStats[5]}       ${this.plainStats[6]}   ${this.plainStats[7]}`);
				}
			}
		} else {
			switch (this.menu.language) {
				case ('es'): {
					return "       ???             ???               ???\n         ???        ???       ???       ?????   ?????";
				}

				case ('fr'): {
					return "        ???           ???             ???\n         ???        ???          ???       ?????   ?????";
				}

				case ('cat'): {
					return "        ???           ???             ???\n         ???        ???      ???       ?????   ?????";
				}

				default: {
					return "           ???           ???             ???\n    ???      ???     ???       ??????  ?????";
				}
			}
		}
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

	public eraseTournamentPlayerInfo(){
		for (let i = this.menu.renderLayers.overlays.children.length - 1; i >= 0; i--) {
			const child = this.menu.renderLayers.overlays.children[i];
			
			if ('text' in child && typeof child.text === 'string' && (child.text.includes('???') || child.text.includes('WAITING'))) {
				this.menu.renderLayers.overlays.removeChild(child);
			}
		}
	}

	public updateLeftPlayerInfo(playerData: any, name: string): void {
		this.vsText[2].text = name.toUpperCase();
		this.vsText[2].style.fill = { color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue, alpha: 1 };
		const leftNameComponent = new TextComponent(this.vsText[2]);
		this.replaceComponent('text', leftNameComponent, 'vsText2');
	
		if (playerData) {
			this.getPlainStats(playerData);
			this.statsTexts[1].text = this.getStatsValuesInLanguage(true);
		} else {
			this.statsTexts[1].text = this.getStatsValuesInLanguage(false);
		}

		this.statsTexts[1].style.fill = { color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue, alpha: 1 };
	
		const leftStatsComponent = new TextComponent(this.statsTexts[1]);
		this.replaceComponent('text', leftStatsComponent, 'statsText1');
	
		for (let i = this.menu.renderLayers.overlays.children.length - 1; i >= 0; i--) {
			const child = this.menu.renderLayers.overlays.children[i];
			
			if ('text' in child && typeof child.text === 'string' && 
				(child.text.includes('???') || child.text === 'WAITING') &&
				child.x >= 1100 && child.x <= 1350) {
				this.menu.renderLayers.overlays.removeChild(child);
			}
		}
	
		this.menu.renderLayers.overlays.addChild(leftNameComponent.getRenderable());
		this.menu.renderLayers.overlays.addChild(leftStatsComponent.getRenderable());
	}
	
	public updateRightPlayerInfo(playerData: any, name: string): void {
		this.vsText[3].text = name.toUpperCase();
		this.vsText[3].style.fill = { color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue, alpha: 1 };
		const rightNameComponent = new TextComponent(this.vsText[3]);
		this.replaceComponent('text', rightNameComponent, 'vsText3');
	
		if (playerData) {
			this.getPlainStats(playerData);
			this.statsTexts[3].text = this.getStatsValuesInLanguage(true);
		} else {
			this.statsTexts[3].text = this.getStatsValuesInLanguage(false);
		}

		this.statsTexts[3].style.fill = { color: this.menu.config.classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue, alpha: 1 };
	
		const rightStatsComponent = new TextComponent(this.statsTexts[3]);
		this.replaceComponent('text', rightStatsComponent, 'statsText3');
	
		for (let i = this.menu.renderLayers.overlays.children.length - 1; i >= 0; i--) {
			const child = this.menu.renderLayers.overlays.children[i];
			
			if ('text' in child && typeof child.text === 'string' && 
				(child.text.includes('???') || child.text === 'WAITING') &&
				child.x >= 1400 && child.x <= 1650) { // Right side bounds
				this.menu.renderLayers.overlays.removeChild(child);
			}
		}
	
		this.menu.renderLayers.overlays.addChild(rightNameComponent.getRenderable());
		this.menu.renderLayers.overlays.addChild(rightStatsComponent.getRenderable());
	}

	public updateMatchDisplay(): void {
		if (!this.menu.tournamentConfig || !this.menu.tournamentManager.getHasActiveTournament()) {
			// Show default/waiting state
			this.showDefaultState();
			return;
		}
	
		const leftPlayerName = this.menu.tournamentConfig.nextMatch.leftPlayerName;
		const rightPlayerName = this.menu.tournamentConfig.nextMatch.rightPlayerName;
	
		console.log(`Updating match display: ${leftPlayerName} vs ${rightPlayerName}`);
	
		// Clear previous info
		this.eraseTournamentPlayerInfo();
	
		if (leftPlayerName && rightPlayerName) {
			// Get player data
			const leftPlayerData = this.getPlayerDataByName(leftPlayerName);
			const rightPlayerData = this.getPlayerDataByName(rightPlayerName);
	
			// Update display
			this.updateLeftPlayerInfo(leftPlayerData, leftPlayerName);
			this.updateRightPlayerInfo(rightPlayerData, rightPlayerName);
		} else {
			// Show waiting state
			this.showDefaultState();
		}
	}

	private showDefaultState(): void {
		this.eraseTournamentPlayerInfo();

		let defaultPlayerName;

		if (this.menu.tournamentManager.getHasActiveTournament() && this.menu.tournamentManager.getTournamentConfig()!.isFinished) {
			defaultPlayerName == 'FINISHED'
		} else {
			defaultPlayerName = 'WAITING';
		}

		this.vsText[2].text = defaultPlayerName!.toUpperCase();
		this.vsText[3].text = defaultPlayerName!.toUpperCase();
		
		this.statsTexts[1].text = this.getStatsValuesInLanguage(false);
		this.statsTexts[3].text = this.getStatsValuesInLanguage(false);
	}

	private getPlayerDataByName(playerName: string): any {
		if (!playerName || !this.menu.tournamentConfig) return null;
		
		const playerData = this.menu.tournamentConfig.registeredPlayerData;
		
		for (let i = 1; i <= 8; i++) {
			const player = playerData[`player${i}Data` as keyof typeof playerData];
			if (player && player.name === playerName) {
				return player;
			}
		}
		
		return null;
	}
}