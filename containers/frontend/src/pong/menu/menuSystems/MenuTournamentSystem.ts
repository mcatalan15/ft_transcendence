/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   MenuTournamentSystem.ts                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/17 17:14:56 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/17 19:40:58 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { System } from "../../engine/System";
import { GameEvent } from "../../utils/Types";
import { Menu } from "../Menu";
import { MenuImageManager } from "../menuManagers/MenuImageManager";

export class MenuTournamentSystem implements System {
	menu: Menu;

	constructor(menu: Menu) {
		this.menu = menu;
	}

	update() {
		const unhandledEvents = [];

		while (this.menu.eventQueue.length > 0) {
			const event = this.menu.eventQueue.shift() as GameEvent;

			if (event.type === 'START_TOURNAMENT') {
				this.startTournament();
			} else {
				unhandledEvents.push(event);
			}

			this.menu.eventQueue.push(...unhandledEvents);
		}
	}


	startTournament() {
		console.log('Starting tournament...');
		if (this.menu.readyButton.getIsClickable() === false) {
			this.menu.readyButton.setClickable(true);
		}

		this.menu.tournamentConfig!.nextMatch.matchOrder = 1;

		this.prepareNextMatch(this.menu.tournamentConfig!.nextMatch.matchOrder);
	}

	prepareNextMatch(order: number) {
		const nextPlayers = this.getNextTournamentPlayers(order);
		this.menu.tournamentConfig!.nextMatch.leftPlayerName = nextPlayers.player1;
		this.menu.tournamentConfig!.nextMatch.rightPlayerName = nextPlayers.player2;
	
		console.log(`Preparing next match: ${nextPlayers.player1} vs ${nextPlayers.player2}`);
		
		const leftPlayerData = this.getPlayerDataByName(nextPlayers.player1!);
		const rightPlayerData = this.getPlayerDataByName(nextPlayers.player2!);
		
		if (this.menu.tournamentOverlay?.nextMatchDisplay) {
			this.menu.tournamentOverlay.nextMatchDisplay.eraseTournamentPlayerInfo();
			this.menu.tournamentOverlay.nextMatchDisplay.updateLeftPlayerInfo(leftPlayerData, this.menu.tournamentConfig!.nextMatch.leftPlayerName!);
			this.menu.tournamentOverlay.nextMatchDisplay.updateRightPlayerInfo(rightPlayerData, this.menu.tournamentConfig!.nextMatch.rightPlayerName!);
			
			MenuImageManager.updateTournamentPlayerAvatars(
				this.menu, 
				leftPlayerData, 
				rightPlayerData
			);
		}
	}

	private getPlayerDataByName(playerName: string): any {
		if (!playerName || !this.menu.tournamentConfig) return null;
		
		const playerData = this.menu.tournamentConfig.registeredPlayerData;
		
		// Find which player this name belongs to
		for (let i = 1; i <= 8; i++) {
			const player = playerData[`player${i}Data` as keyof typeof playerData];
			if (player && player.name === playerName) {
				return player;
			}
		}
		
		return null;
	}

	getNextTournamentPlayers(order: number) {
		switch(order) {
			case (1): {
				return ({
					player1: this.menu.tournamentConfig!.firstRoundPlayers.player1,
					player2: this.menu.tournamentConfig!.firstRoundPlayers.player2
				});
			}

			case (2): {
				return ({
					player1: this.menu.tournamentConfig!.firstRoundPlayers.player3,
					player2: this.menu.tournamentConfig!.firstRoundPlayers.player4
				});
			}

			case (3): {
				return ({
					player1: this.menu.tournamentConfig!.firstRoundPlayers.player5,
					player2: this.menu.tournamentConfig!.firstRoundPlayers.player6
				});
			}

			case (4): {
				return ({
					player1: this.menu.tournamentConfig!.firstRoundPlayers.player7,
					player2: this.menu.tournamentConfig!.firstRoundPlayers.player8
				});
			}

			case (5): {
				return ({
					player1: this.menu.tournamentConfig!.secondRoundPlayers.player1,
					player2: this.menu.tournamentConfig!.secondRoundPlayers.player2
				});
			}

			case (6): {
				return ({
					player1: this.menu.tournamentConfig!.secondRoundPlayers.player3,
					player2: this.menu.tournamentConfig!.secondRoundPlayers.player4
				});
			}

			default: {
				return ({
					player1: this.menu.tournamentConfig!.thirdRoundPlayers.player1,
					player2: this.menu.tournamentConfig!.thirdRoundPlayers.player2
				});
			}
		}
	}
}