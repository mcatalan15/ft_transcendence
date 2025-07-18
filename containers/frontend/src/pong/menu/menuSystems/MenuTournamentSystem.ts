/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   MenuTournamentSystem.ts                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/17 17:14:56 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/18 11:57:39 by hmunoz-g         ###   ########.fr       */
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

		// Push unhandled events back to queue
		this.menu.eventQueue.push(...unhandledEvents);
	}

	startTournament() {
		console.log('Starting tournament...');
		if (this.menu.readyButton.getIsClickable() === false) {
			this.menu.readyButton.setClickable(true);
		}

		this.menu.tournamentManager.startTournament(this.menu.app.view.id, this.menu.tournamentConfig!);

		this.menu.tournamentConfig!.nextMatch.matchOrder = 1;

		this.prepareNextMatch(this.menu.tournamentConfig!.nextMatch.matchOrder);
	}

	/**
	 * Prepares the current match display based on the tournament's current state
	 */
	prepareCurrentMatch() {
		if (!this.menu.tournamentManager.getHasActiveTournament() || !this.menu.tournamentConfig) {
			console.log('No active tournament to prepare match for');
			return;
		}

		const currentMatchOrder = this.menu.tournamentConfig.nextMatch.matchOrder;
		console.log(`Preparing current match with order: ${currentMatchOrder}`);
		
		this.prepareNextMatch(currentMatchOrder);
	}

	/**
	 * Prepares the next match display for the given match order
	 */
	prepareNextMatch(order: number) {
		const nextPlayers = this.getNextTournamentPlayers(order);
		
		// Update the tournament config with next match info
		this.menu.tournamentConfig!.nextMatch.leftPlayerName = nextPlayers.player1;
		this.menu.tournamentConfig!.nextMatch.rightPlayerName = nextPlayers.player2;
	
		console.log(`Preparing match ${order}: ${nextPlayers.player1} vs ${nextPlayers.player2}`);
		
		// Get player data for both players
		const leftPlayerData = this.getPlayerDataByName(nextPlayers.player1!);
		const rightPlayerData = this.getPlayerDataByName(nextPlayers.player2!);
		
		// Update the display if it exists
		if (this.menu.tournamentOverlay?.nextMatchDisplay) {
			this.menu.tournamentOverlay.nextMatchDisplay.eraseTournamentPlayerInfo();
			this.menu.tournamentOverlay.nextMatchDisplay.updateLeftPlayerInfo(leftPlayerData, this.menu.tournamentConfig!.nextMatch.leftPlayerName!);
			this.menu.tournamentOverlay.nextMatchDisplay.updateRightPlayerInfo(rightPlayerData, this.menu.tournamentConfig!.nextMatch.rightPlayerName!);
			
			// Update avatars
			MenuImageManager.updateTournamentPlayerAvatars(
				this.menu, 
				leftPlayerData, 
				rightPlayerData
			);
		}
	}

	/**
	 * Advances to the next match in the tournament
	 */
	advanceToNextMatch() {
		if (!this.menu.tournamentConfig) return;

		const currentOrder = this.menu.tournamentConfig.nextMatch.matchOrder;
		const nextOrder = currentOrder + 1;
		
		// Check if tournament is complete
		if (nextOrder > 7) { // Assuming 7 total matches in 8-player tournament
			console.log('Tournament complete!');
			this.menu.tournamentConfig.isFinished = true;
			return;
		}

		// Update match order and prepare next match
		this.menu.tournamentConfig.nextMatch.matchOrder = nextOrder;
		this.prepareNextMatch(nextOrder);
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