/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   GameManager.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/11 10:24:43 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/11 12:55:37 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Assets } from 'pixi.js'; // Add this import

class GameManager {
	private static instance: GameManager;
	private activeGames: Map<string, { game: any, networkManager: any, app?: any }> = new Map();

	private constructor() {}

	public static getInstance(): GameManager {
		if (!GameManager.instance) {
			GameManager.instance = new GameManager();
		}
		return GameManager.instance;
	}

	public registerGame(containerId: string, game: any, networkManager?: any, app?: any) {
		this.activeGames.set(containerId, { game, networkManager, app });
	}

	public async destroyGame(containerId: string) {
		const gameData = this.activeGames.get(containerId);
		if (!gameData) return;
	
		console.log(`Destroying game for container ${containerId}...`);
		
		try {
			if (gameData.networkManager?.disconnect) {
				console.log('Disconnecting network manager...');
				try {
					gameData.networkManager.disconnect();
				} catch (error) {
					console.warn('Error disconnecting network manager:', error);
				}
			}
	
			if (gameData.game?.cleanup) {
				console.log('Cleaning up game/menu...');
				try {
					await gameData.game.cleanup();
				} catch (error) {
					console.warn('Error during game/menu cleanup:', error);
				}
			}
	
			if (gameData.app && !gameData.app.destroyed) {
				console.log('Destroying PIXI Application...');
				try {
					if (gameData.app.ticker?.started) {
						gameData.app.ticker.stop();
					}
					
					if (gameData.app.stage) {
						gameData.app.stage.removeChildren();
					}
					
					try {
						await Assets.reset();
					} catch (assetError) {
						console.warn('Error unloading assets:', assetError);
					}
					
					gameData.app.destroy(true, {
						children: true,
						texture: true,
						baseTexture: true
					});
				} catch (error) {
					console.error('Error destroying PIXI app:', error);
				}
			}
	
			this.activeGames.delete(containerId);
			console.log(`Game for container ${containerId} destroyed successfully`);
		} catch (error) {
			console.error('Error during game destruction:', error);
		}
	}

	public destroyAllGames() {
		const promises = Array.from(this.activeGames.keys()).map(containerId => 
			this.destroyGame(containerId)
		);
		return Promise.all(promises);
	}
}

export const gameManager = GameManager.getInstance();