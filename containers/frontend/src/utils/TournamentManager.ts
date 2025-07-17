/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   TournamentManager.ts                               :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/17 20:47:52 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/17 21:23:39 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Application } from 'pixi.js';
import { TournamentConfig } from '../pong/utils/GameConfig';

export class TournamentManager {
	private hasActiveTournament: boolean = false;
	private activeTournament: TournamentConfig | null = null;
	private containerId: string | null = null;

	constructor(app: Application) {
		this.containerId = app.view.id;
	}

	public startTournament(containerId: string, config: TournamentConfig): void {
		this.hasActiveTournament = true;
		this.activeTournament = config;
		this.containerId = containerId;
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
	}

	public getHasActiveTournament(): boolean {
		return this.hasActiveTournament;
	}

	public getTournamentConfig(): TournamentConfig | null {
		return this.activeTournament;
	}
}