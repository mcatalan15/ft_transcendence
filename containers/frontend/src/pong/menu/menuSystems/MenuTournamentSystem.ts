/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   MenuTournamentSystem.ts                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/17 17:14:56 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/18 14:16:45 by hmunoz-g         ###   ########.fr       */
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
		console.log('Starting tournament...');
		if (this.menu.readyButton.getIsClickable() === false) {
			this.menu.readyButton.setClickable(true);
		}

		this.menu.tournamentManager.startTournament(this.menu.app.view.id, this.menu.tournamentConfig!);

		this.menu.tournamentConfig!.nextMatch.matchOrder = 1;

		this.prepareNextMatch(this.menu.tournamentConfig!.nextMatch.matchOrder);
	}

	prepareCurrentMatch() {
		if (!this.menu.tournamentManager.getHasActiveTournament() || !this.menu.tournamentConfig) {
			console.log('No active tournament to prepare match for');
			return;
		}
	
		const currentMatchOrder = this.menu.tournamentConfig.nextMatch.matchOrder;
		console.log(`Preparing match with order: ${currentMatchOrder}`);
		
		// Check if tournament is complete
		if (currentMatchOrder > 7) {
			console.log('Tournament complete!');
			this.menu.tournamentConfig.isFinished = true;
			return;
		}
		
		// Don't increment here - just prepare the current match
		this.prepareNextMatch(currentMatchOrder);
	}

	prepareNextMatch(order: number) {
		const nextPlayers = this.getNextTournamentPlayers(order);
		
		this.menu.tournamentConfig!.nextMatch.leftPlayerName = nextPlayers.player1;
		this.menu.tournamentConfig!.nextMatch.rightPlayerName = nextPlayers.player2;
	
		console.log(`Preparing match ${order}: ${nextPlayers.player1} vs ${nextPlayers.player2}`);
		
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
			console.log('No active tournament to complete match for');
			return;
		}
	
		const currentMatchOrder = this.menu.tournamentConfig.nextMatch.matchOrder;
		console.log(`Completing match ${currentMatchOrder}, winner: ${winnerName}`);
	
		// Update tournament results
		this.updateTournamentResults(currentMatchOrder, winnerName);
	
		// Check if tournament is finished
		if (currentMatchOrder >= 7) {
			console.log('Tournament finished!');
			this.menu.tournamentConfig.isFinished = true;
			this.menu.tournamentManager.completeTournament();
		} else {
			// Advance to next match
			const hasNextMatch = this.menu.tournamentManager.advanceMatch();
			
			if (hasNextMatch) {
				const nextMatchOrder = currentMatchOrder + 1;
				this.menu.tournamentConfig.nextMatch.matchOrder = nextMatchOrder;
				console.log(`Tournament continues with match ${nextMatchOrder}`);
				
				// Prepare the next match
				this.prepareNextMatch(nextMatchOrder);
			}
		}
	}

	private updateTournamentResults(matchOrder: number, winnerName: string) {
		if (!this.menu.tournamentConfig) return;
	
		console.log(`Updating tournament results for match ${matchOrder}, winner: ${winnerName}`);
	
		if (matchOrder <= 4) {
			// Round 1 matches (1-4) -> Winners go to secondRoundPlayers
			// Match 1 -> player1, Match 2 -> player2, Match 3 -> player3, Match 4 -> player4
			const playerKey = `player${matchOrder}` as keyof typeof this.menu.tournamentConfig.secondRoundPlayers;
			this.menu.tournamentConfig.secondRoundPlayers[playerKey] = winnerName;
			console.log(`Updated secondRoundPlayers.${playerKey} = ${winnerName}`);
		} else if (matchOrder <= 6) {
			// Round 2 matches (5-6) -> Winners go to thirdRoundPlayers  
			const roundPosition = matchOrder - 4; // Match 5 -> position 1, Match 6 -> position 2
			const playerKey = `player${roundPosition}` as keyof typeof this.menu.tournamentConfig.thirdRoundPlayers;
			this.menu.tournamentConfig.thirdRoundPlayers[playerKey] = winnerName;
			console.log(`Updated thirdRoundPlayers.${playerKey} = ${winnerName}`);
		} else {
			// Round 3 (match 7) -> Tournament winner
			this.menu.tournamentConfig.tournamentWinner = winnerName;
			console.log(`Tournament winner: ${winnerName}`);
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
		console.log(`Getting players for match ${order}`);
		
		switch(order) {
			// Round 1: Original 8 players (matches 1-4)
			case (1): {
				const players = {
					player1: this.menu.tournamentConfig!.firstRoundPlayers.player1,
					player2: this.menu.tournamentConfig!.firstRoundPlayers.player2
				};
				console.log(`Match 1 players:`, players);
				return players;
			}
	
			case (2): {
				const players = {
					player1: this.menu.tournamentConfig!.firstRoundPlayers.player3,
					player2: this.menu.tournamentConfig!.firstRoundPlayers.player4
				};
				console.log(`Match 2 players:`, players);
				return players;
			}
	
			case (3): {
				const players = {
					player1: this.menu.tournamentConfig!.firstRoundPlayers.player5,
					player2: this.menu.tournamentConfig!.firstRoundPlayers.player6
				};
				console.log(`Match 3 players:`, players);
				return players;
			}
	
			case (4): {
				const players = {
					player1: this.menu.tournamentConfig!.firstRoundPlayers.player7,
					player2: this.menu.tournamentConfig!.firstRoundPlayers.player8
				};
				console.log(`Match 4 players:`, players);
				return players;
			}
	
			// Round 2: Winners from round 1 (matches 5-6) - These are the semifinals
			case (5): {
				const players = {
					player1: this.menu.tournamentConfig!.secondRoundPlayers.player1, // Winner of match 1
					player2: this.menu.tournamentConfig!.secondRoundPlayers.player2  // Winner of match 2
				};
				console.log(`Match 5 (Semifinal 1) players:`, players);
				return players;
			}
	
			case (6): {
				const players = {
					player1: this.menu.tournamentConfig!.secondRoundPlayers.player3, // Winner of match 3
					player2: this.menu.tournamentConfig!.secondRoundPlayers.player4  // Winner of match 4
				};
				console.log(`Match 6 (Semifinal 2) players:`, players);
				return players;
			}
	
			// Round 3: Winners from round 2 (match 7) - This is the final
			case (7):
			default: {
				const players = {
					player1: this.menu.tournamentConfig!.thirdRoundPlayers.player1, // Winner of match 5
					player2: this.menu.tournamentConfig!.thirdRoundPlayers.player2  // Winner of match 6
				};
				console.log(`Match 7 (Final) players:`, players);
				return players;
			}
		}
	}
}