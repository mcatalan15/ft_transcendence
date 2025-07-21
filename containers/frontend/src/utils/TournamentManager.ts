/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   TournamentManager.ts                               :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/17 20:47:52 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/21 12:39:22 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Application } from 'pixi.js';
import { TournamentConfig } from '../pong/utils/GameConfig';

export class TournamentManager {
	private hasActiveTournament: boolean = false;
	private activeTournament: TournamentConfig | null = null;
	private containerId: string | null = null;
	private currentMatch: number = 1;
	private totalMatches: number = 7;

	constructor(app: Application) {
		this.containerId = app.view.id;
	}

	public startTournament(containerId: string, config: TournamentConfig): void {
		this.hasActiveTournament = true;
		this.activeTournament = config;
		this.containerId = containerId;
		this.currentMatch = 1;
		console.log(`Tournament started for container ${containerId}:`, config);
	}

	public getTournament(): TournamentConfig | null {
		return this.activeTournament;
	}

	public updateTournament(config: TournamentConfig): void {
		if (this.activeTournament) {
			this.activeTournament = config;
			console.log(`Tournament updated for container ${this.containerId}:`, config);
		}
	}

	public completeTournament(): void {
		console.log(`Tournament completed for container ${this.containerId}`);
		this.activeTournament = null;
		this.containerId = null;
		this.hasActiveTournament = false;
		this.currentMatch = 0;
	}

	public hasTournament(): boolean {
		return this.activeTournament !== null;
	}

	public getCurrentContainerId(): string | null {
		return this.containerId;
	}

	public clearTournament(): void {
		this.hasActiveTournament = false;
		this.activeTournament = null;
		this.containerId = null;
		this.currentMatch = 0;
		console.log('Tournament state completely cleared');
	}

	public getHasActiveTournament(): boolean {
		return this.hasActiveTournament;
	}

	public getTournamentConfig(): TournamentConfig | null {
		return this.activeTournament;
	}

	public startMatch(): void {
		if (this.currentMatch >= this.totalMatches) {
			console.error('Cannot start match - tournament already complete');
			return;
		}
		
		this.currentMatch++;
		console.log(`Starting match ${this.currentMatch} of ${this.totalMatches}`);
	}
	
	public isTournamentComplete(): boolean {
		return this.currentMatch >= this.totalMatches;
	}

	public getCurrentMatch(): number {
		return this.currentMatch;
	}

	public getTotalMatches(): number {
		return this.totalMatches;
	}

	public advanceMatch(): boolean {
		if (this.currentMatch < this.totalMatches) {
			this.currentMatch++;
			console.log(`Advanced to match ${this.currentMatch} of ${this.totalMatches}`);
			
			// Update the tournament config if it exists
			if (this.activeTournament) {
				this.activeTournament.nextMatch.matchOrder = this.currentMatch;
			}
			
			return true;
		}
		return false;
	}

	public getCurrentMatchOrder(): number {
		return this.activeTournament?.nextMatch?.matchOrder || 1;
	}

	public synchronizeWithConfig(config: TournamentConfig): void {
		if (this.activeTournament) {
			this.activeTournament = config;
			this.currentMatch = config.nextMatch.matchOrder;
			console.log(`Synchronized tournament manager with config. Current match: ${this.currentMatch}`);
		}
	}
}