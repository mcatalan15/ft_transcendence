/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   GameManager.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/11 10:24:43 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/21 21:35:25 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Assets } from 'pixi.js'; 

class GameManager {
	private static instance: GameManager;
	private activeGames: Map<string, { game: any, networkManager: any, app?: any }> = new Map();
	private isDestroying: boolean = false;

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

	public async destroyGame(containerId: string): Promise<void> {
		const gameData = this.activeGames.get(containerId);
		if (!gameData) return;
		
		try {
			if (gameData.networkManager?.disconnect) {
				try {
					gameData.networkManager.disconnect();
				} catch (error) {
					console.warn('Error disconnecting network manager:', error);
				}
			}
	
			if (gameData.game?.cleanup) {
				try {
					await gameData.game.cleanup();
				} catch (error) {
					console.warn('Error during game/menu cleanup:', error);
				}
			}
	
			if (gameData.app && !gameData.app.destroyed) {
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
					
					await new Promise(resolve => setTimeout(resolve, 50));
				} catch (error) {
					console.error('Error destroying PIXI app:', error);
				}
			}
	
			this.activeGames.delete(containerId);
		} catch (error) {
			console.error('Error during game destruction:', error);
			this.activeGames.delete(containerId);
		}
	}

	public async destroyAllGames(): Promise<void> {
		if (this.isDestroying) {
			while (this.isDestroying) {
				await new Promise(resolve => setTimeout(resolve, 10));
			}
			return;
		}

		this.isDestroying = true;
		
		try {
			const containerIds = Array.from(this.activeGames.keys());
			
			for (const containerId of containerIds) {
				await this.destroyGame(containerId);
			}
		} finally {
			this.isDestroying = false;
		}
	}
}

export const gameManager = GameManager.getInstance();