/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   MenuTournamentSystem.ts                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/17 17:14:56 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/21 21:12:13 by hmunoz-g         ###   ########.fr       */
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
			} else if (event.type === 'PREPARE_NEXT_MATCH') {
				this.prepareCurrentMatch();
			} else {
				unhandledEvents.push(event);
			}
		}

		this.menu.eventQueue.push(...unhandledEvents);
	}

	startTournament() {
		if (this.menu.readyButton.getIsClickable() === false) {
			this.menu.readyButton.setClickable(true);
		}

		this.menu.tournamentManager.startTournament(this.menu.app.view.id, this.menu.tournamentConfig!);

		this.menu.tournamentConfig!.nextMatch.matchOrder = 1;

		this.prepareNextMatch(this.menu.tournamentConfig!.nextMatch.matchOrder);
	}

	prepareCurrentMatch() {
		if (!this.menu.tournamentManager.getHasActiveTournament() || !this.menu.tournamentConfig) {
			return;
		}
	
		const currentMatchOrder = this.menu.tournamentConfig.nextMatch.matchOrder;
		
		if (currentMatchOrder > 7) {
			this.menu.tournamentConfig.isFinished = true;
			return;
		}
		
		this.prepareNextMatch(currentMatchOrder);
	}

	prepareNextMatch(order: number) {
		const nextPlayers = this.getNextTournamentPlayers(order);
		
		this.menu.tournamentConfig!.nextMatch.leftPlayerName = nextPlayers.player1;
		this.menu.tournamentConfig!.nextMatch.rightPlayerName = nextPlayers.player2;

		
		if (this.menu.tournamentOverlay?.nextMatchDisplay) {
			this.menu.tournamentOverlay.nextMatchDisplay.updateMatchDisplay();

			const leftPlayerData = this.getPlayerDataByName(nextPlayers.player1!);
			const rightPlayerData = this.getPlayerDataByName(nextPlayers.player2!);
			
			MenuImageManager.updateTournamentPlayerAvatars(
				this.menu, 
				leftPlayerData, 
				rightPlayerData
			);
		}
	}

	completeCurrentMatch(winnerName: string) {
		if (!this.menu.tournamentConfig || !this.menu.tournamentManager.getHasActiveTournament()) {
			return;
		}
	
		const currentMatchOrder = this.menu.tournamentConfig.nextMatch.matchOrder;
	
		this.updateTournamentResults(currentMatchOrder, winnerName);
	
		if (currentMatchOrder >= 7) {
			this.menu.tournamentConfig.isFinished = true;
			this.menu.tournamentManager.completeTournament();
		} else {
			const hasNextMatch = this.menu.tournamentManager.advanceMatch();
			
			if (hasNextMatch) {
				const nextMatchOrder = currentMatchOrder + 1;
				this.menu.tournamentConfig.nextMatch.matchOrder = nextMatchOrder;
				
				this.prepareNextMatch(nextMatchOrder);
			}
		}
	}

	private updateTournamentResults(matchOrder: number, winnerName: string) {
		if (!this.menu.tournamentConfig) return;
	
		if (matchOrder <= 4) {
			const playerKey = `player${matchOrder}` as keyof typeof this.menu.tournamentConfig.secondRoundPlayers;
			this.menu.tournamentConfig.secondRoundPlayers[playerKey] = winnerName;
		} else if (matchOrder <= 6) {
			const roundPosition = matchOrder - 4;
			const playerKey = `player${roundPosition}` as keyof typeof this.menu.tournamentConfig.thirdRoundPlayers;
			this.menu.tournamentConfig.thirdRoundPlayers[playerKey] = winnerName;
		} else {
			this.menu.tournamentConfig.tournamentWinner = winnerName;
		}
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

	getNextTournamentPlayers(order: number) {	
		switch(order) {
			case (1): {
				const players = {
					player1: this.menu.tournamentConfig!.firstRoundPlayers.player1,
					player2: this.menu.tournamentConfig!.firstRoundPlayers.player2
				};
				return players;
			}
	
			case (2): {
				const players = {
					player1: this.menu.tournamentConfig!.firstRoundPlayers.player3,
					player2: this.menu.tournamentConfig!.firstRoundPlayers.player4
				};
				return players;
			}
	
			case (3): {
				const players = {
					player1: this.menu.tournamentConfig!.firstRoundPlayers.player5,
					player2: this.menu.tournamentConfig!.firstRoundPlayers.player6
				};
				return players;
			}
	
			case (4): {
				const players = {
					player1: this.menu.tournamentConfig!.firstRoundPlayers.player7,
					player2: this.menu.tournamentConfig!.firstRoundPlayers.player8
				};
				return players;
			}

			case (5): {
				const players = {
					player1: this.menu.tournamentConfig!.secondRoundPlayers.player1,
					player2: this.menu.tournamentConfig!.secondRoundPlayers.player2
				};
				return players;
			}
	
			case (6): {
				const players = {
					player1: this.menu.tournamentConfig!.secondRoundPlayers.player3,
					player2: this.menu.tournamentConfig!.secondRoundPlayers.player4
				};
				return players;
			}
	
			case (7):
			default: {
				const players = {
					player1: this.menu.tournamentConfig!.thirdRoundPlayers.player1,
					player2: this.menu.tournamentConfig!.thirdRoundPlayers.player2
				};
				return players;
			}
		}
	}
}