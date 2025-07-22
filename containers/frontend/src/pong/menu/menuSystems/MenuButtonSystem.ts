/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   MenuButtonSystem.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/02 09:32:05 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/22 10:56:12 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Menu } from "../Menu";

import { System } from "../../engine/System";

import { Paddle } from "../../entities/Paddle";

import { GAME_COLORS, GameEvent } from "../../utils/Types";
import { PongGame } from "../../engine/Game";
import { RenderComponent } from "../../components/RenderComponent";
import { isBall } from "../../utils/Guards";

import { ShootPowerup } from "../../entities/powerups/ShootPowerup";
import { EnlargePowerup } from "../../entities/powerups/EnlargePowerup";
import { MagnetizePowerup } from "../../entities/powerups/MagnetizePowerup";
import { ShieldPowerup } from "../../entities/powerups/ShieldPowerUp";
import { ShrinkPowerDown } from "../../entities/powerups/ShrinkPowerDown";
import { InvertPowerDown } from "../../entities/powerups/InvertPowerDown";
import { FlatPowerDown } from "../../entities/powerups/FlatPowerDown";
import { SlowPowerDown } from "../../entities/powerups/SlowPowerDown";
import { CurveBallPowerup } from "../../entities/powerups/CurveBallPowerup";
import { SpinBallPowerup } from "../../entities/powerups/SpinBallPowerup";
import { BurstBallPowerup } from "../../entities/powerups/BurstBallPowerup";
import { MultiplyBallPowerup } from "../../entities/powerups/MultiplyBallPowerup";

import { PongNetworkManager } from "../../network/PongNetworkManager";
import { gameManager } from "../../../utils/GameManager";
import { navigate } from "../../../utils/router";
import { MenuImageManager } from "../menuManagers/MenuImageManager";

export class MenuButtonSystem implements System {
	private menu: Menu;
	private overlayStack: string[] = [];
	private glossaryOpenedBy: 'main' | 'overlay' | null = null;
	private networkManager: PongNetworkManager | null = null;

	constructor(menu: Menu) {
		this.menu = menu;
	}

	async update(): Promise<void> {
		const unhandledEvents = [];

		while (this.menu.eventQueue.length > 0) {
			const event = this.menu.eventQueue.shift() as GameEvent;

			if (event.type === 'START_CLICK') {
				this.handleStartClick();
			} else if (event.type === 'OPTIONS_CLICK') {
				this.handleOptionsClick();
			} else if (event.type === 'GLOSSARY_CLICK') {
				this.handleGlossaryClick();
			} else if (event.type === 'ABOUT_CLICK') {
				this.handleAboutClick();
			} else if (event.type === 'PLAY_CLICK') {
				this.handlePlayClick();
			} else if (event.type === 'RANKED_CLICK') {
				this.handleOnlineClick();
			} else if (event.type === 'PRACTICE_CLICK') {
				this.handleLocalClick();
			} else if (event.type === 'IA_CLICK') {
				this.handleIAClick();
			} else if (event.type === 'DUEL_CLICK') {
				this.handleDuelClick();
			} else if (event.type === 'TOURNAMENT_CLICK') {
				this.handleTournamentClick();
			} else if (event.type === 'FILTERS_CLICK') {
				this.handleFiltersClicked();
			} else if (event.type === 'CLASSIC_CLICK') {
				this.handleClassicClicked();
			} else if (event.type === 'GLOSSARY_ESC' || event.type === 'ABOUT_ESC') {
				this.resetLayer(event);
			} else if (event.type.endsWith('BACK')) {
				this.resetLayer(event);
				if (event.type === 'PLAY_BACK') {
					await this.handleCancelMatchmaking();
					this.menu.playOverlay.hide();
				}
			} else if (event.type === 'READY_CLICK') {
				this.handleReadyClick();
			} else if (event.type === 'MATCH_FOUND') {
				this.handleMatchFound();
			} else {
				unhandledEvents.push(event);
			}
		}

		this.menu.eventQueue.push(...unhandledEvents);
	}

	handleStartClick() {
		this.menu.startButton.setHidden(true);
		this.menu.menuHidden.addChild(this.menu.startButton.getContainer());

		this.menu.playButton.setClicked(false);
		this.menu.playButton.setHidden(false);
		this.menu.menuContainer.addChild(this.menu.playButton.getContainer());

		this.menu.onlineButton.setHidden(!this.menu.onlineButton.getIsHidden());
		this.menu.localButton.setHidden(!this.menu.localButton.getIsHidden());
		this.menu.IAButton.setHidden(!this.menu.IAButton.getIsHidden());
		this.menu.duelButton.setHidden(!this.menu.duelButton.getIsHidden());
		this.menu.startXButton.setHidden(!this.menu.startXButton.getIsHidden());
		this.menu.tournamentButton.setHidden(!this.menu.tournamentButton.getIsHidden());

		this.menu.menuContainer.addChild(this.menu.onlineButton.getContainer());
		this.menu.menuContainer.addChild(this.menu.localButton.getContainer());
		this.menu.menuContainer.addChild(this.menu.IAButton.getContainer());
		this.menu.menuContainer.addChild(this.menu.duelButton.getContainer());
		this.menu.menuContainer.addChild(this.menu.startXButton.getContainer());

		this.menu.menuHidden.addChild(this.menu.startOrnament.getGraphic());
		this.menu.menuContainer.addChild(this.menu.playOrnament.getGraphic());
		this.menu.redrawFrame();
	}

	async handlePlayClick() {
		this.menu.playQuitButton.resetButton();
		this.menu.playOverlay.header.redrawOverlayElements();
		this.menu.playOverlay.duel.redrawDuel();
		if (this.menu.tournamentManager.getHasActiveTournament() && this.menu.tournamentManager.getTournamentConfig()!.isFinished) {
			this.menu.tournamentOverlay.tournamentEndDisplay.redrawDisplay();
		} else {
			this.menu.tournamentOverlay.nextMatchDisplay.redrawDisplay();
		}
		this.menu.tournamentOverlay.header.redrawOverlayElements();
		this.menu.tournamentOverlay.bracket.redrawBracket();

		if (this.menu.config.variant === 'tournament') {
			this.menu.playButton.setClicked(true);
			this.menu.tournamentOverlay.show();
			this.overlayStack.push('tournament');
			this.setButtonsClickability(false);
			
			for (const button of this.menu.tournamentInputButtons) {
				button.resetButton();
			}
		} else {
			this.menu.playButton.setClicked(true);
			await this.menu.playOverlay.setAllRenderablesAlpha(0);
			this.menu.playOverlay.show();
			this.overlayStack.push('play');
			this.setButtonsClickability(false);
			this.menu.playInputButton.resetButton();
		}
	}

	async handleReadyClick() {
		this.menu.playSound("menuConfirm");
		if (this.menu.config.mode === 'online' && this.menu.config.variant === '1v1') {
			try {
				this.networkManager = new PongNetworkManager(null, '', this.menu);
				await this.networkManager.startMatchmaking();
				this.menu.readyButton.setClickable(false);
				this.menu.readyButton.setClicked(true);

				const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
				this.menu.readyButton.updateText('');
				while (this.menu.readyButton.getIsClicked()) {
					if (this.menu.readyButton.getText().length < 3) {
						this.menu.readyButton.updateText(this.menu.readyButton.getText() + '∙');
					} else if (this.menu.readyButton.getText().length >= 3) {
						this.menu.readyButton.updateText('');
					}
					await sleep(500);
				}
			} catch (error) {
				console.error('Matchmaking failed:', error);
				alert('Failed to start online matchmaking. Starting local game instead.');
				this.startLocalGame();
			}
		} else {
			this.startLocalGame();
		}
	}

	private async handleCancelMatchmaking() {
		if (this.networkManager) {
			try {
				await this.networkManager.cancelMatchmaking();
				this.networkManager = null;
			} catch (error) {
				console.error('Error cancelling matchmaking:', error);
			}
		}
		this.menu.readyButton.resetButton();
		this.menu.readyButton.setClickable(true);
		this.menu.readyButton.setClicked(false);
		switch (this.menu.language) {
			case ('es'):
				this.menu.readyButton.updateText('LISTO');
				break;
			case ('fr'):
				this.menu.readyButton.updateText('PRÊT');
				break;
			case ('cat'):
				this.menu.readyButton.updateText('PREPARAT');
				break;
			default:
				this.menu.readyButton.updateText('READY');
				break;
		}
	}

	private startLocalGame(): void {

		this.menu.cleanup();

		this.setFinalConfig();

		const game = new PongGame(this.menu.app, this.menu.config, this.menu.language);
		game.tournamentManager = this.menu.tournamentManager;

		gameManager.registerGame(this.menu.app.view.id, game, undefined, this.menu.app);

		game.init();
	}

	handleOptionsClick() {
		this.menu.optionsButton.setHidden(true);
		this.menu.menuHidden.addChild(this.menu.optionsButton.getContainer());

		this.menu.filtersButton.setHidden(false);
		this.menu.menuContainer.addChild(this.menu.filtersButton.getContainer());

		this.menu.classicButton.setHidden(false);
		this.menu.menuContainer.addChild(this.menu.classicButton.getContainer());

		this.menu.optionsXButton.setHidden(false);
		this.menu.menuContainer.addChild(this.menu.optionsXButton.getContainer());

		this.menu.menuHidden.addChild(this.menu.optionsOrnament.getGraphic());
		this.menu.menuContainer.addChild(this.menu.optionsClickedOrnament.getGraphic());

		this.menu.redrawFrame();
	}

	handleGlossaryClick() {
		this.menu.glossaryQuitButton.resetButton();
		this.menu.glossaryOverlay.header.redrawOverlayElements();
		this.menu.glossaryButton.setClicked(true);
		this.menu.tournamentFiltersButton.setClickable(false);
		this.menu.tournamentGlossaryButton.setClickable(false);
		this.menu.readyButton.setClickable(false);
		this.menu.glossaryOverlay.show();
		this.overlayStack.push('glossary');
		this.setButtonsClickability(false);
		this.glossaryOpenedBy = 'main';
	}

	handleOverlayGlossaryClick() {
		this.menu.glossaryQuitButton.resetButton();
		this.menu.glossaryOverlay.header.redrawOverlayElements();
		this.menu.glossaryOverlay.show();
		this.overlayStack.push('glossary');
		this.glossaryOpenedBy = 'overlay';
	}

	handleTournamentGlossaryClick() {
		this.menu.glossaryQuitButton.resetButton();
		this.menu.glossaryOverlay.header.redrawOverlayElements();
		this.menu.glossaryOverlay.show();
		this.overlayStack.push('glossary');
	}

	handleAboutClick() {
		this.menu.aboutQuitButton.resetButton();
		this.menu.aboutOverlay.header.redrawOverlayElements();
		this.menu.aboutButton.setClicked(true);
		this.menu.aboutOverlay.show();
		this.setButtonsClickability(false);
	}

	resetLayer(event: GameEvent) {
		if (event.type.includes('START')) {
			this.resetStartOptions();

			this.menu.startXButton.setHidden(true);
			this.menu.menuHidden.addChild(this.menu.startXButton.getContainer());

			this.menu.startButton.setHidden(false);
			this.menu.playButton.setHidden(true);
			this.menu.menuContainer.addChild(this.menu.startButton.getContainer());
			this.menu.menuHidden.addChild(this.menu.playButton.getContainer());

			this.menu.onlineButton.setHidden(true);
			this.menu.localButton.setHidden(true);
			this.menu.IAButton.setHidden(true);
			this.menu.duelButton.setHidden(true);
			this.menu.tournamentButton.setHidden(true);

			this.menu.menuHidden.addChild(this.menu.onlineButton.getContainer());
			this.menu.menuHidden.addChild(this.menu.localButton.getContainer());
			this.menu.menuHidden.addChild(this.menu.IAButton.getContainer());
			this.menu.menuHidden.addChild(this.menu.duelButton.getContainer());
			this.menu.menuHidden.addChild(this.menu.tournamentButton.getContainer());
			this.menu.menuHidden.addChild(this.menu.startXButton.getContainer());

			this.menu.menuContainer.addChild(this.menu.startOrnament.getGraphic());
			this.menu.menuHidden.addChild(this.menu.playOrnament.getGraphic());
			this.menu.redrawFrame();

			this.menu.startButton.resetButton();
			this.menu.startXButton.resetButton();
		} else if (event.type.includes('OPTIONS')) {
			this.menu.optionsXButton.setHidden(!this.menu.onlineButton.getIsHidden());
			this.menu.menuHidden.addChild(this.menu.optionsXButton.getContainer());

			this.menu.optionsButton.setHidden(false);
			this.menu.filtersButton.setHidden(true);
			this.menu.classicButton.setHidden(true);

			this.menu.menuContainer.addChild(this.menu.optionsButton.getContainer());
			this.menu.menuHidden.addChild(this.menu.filtersButton.getContainer());
			this.menu.menuHidden.addChild(this.menu.classicButton.getContainer());

			this.menu.menuContainer.addChild(this.menu.optionsOrnament.getGraphic());
			this.menu.menuHidden.addChild(this.menu.optionsClickedOrnament.getGraphic());
			this.menu.redrawFrame();

			this.menu.optionsButton.resetButton();
			this.menu.optionsXButton.resetButton();
		} else if (event.type.includes('GLOSSARY')) {
			const index = this.overlayStack.indexOf('glossary');
			if (index > -1) {
				this.overlayStack.splice(index, 1);
			}

			this.menu.tournamentFiltersButton.setClickable(true);
			this.menu.tournamentGlossaryButton.setClickable(true);
			this.menu.readyButton.setClickable(true);
			this.setButtonsClickability(this.overlayStack.length === 0);

			if (this.glossaryOpenedBy === 'main') {
				this.menu.glossaryButton.setClicked(false);
				this.menu.glossaryButton.resetButton();
			}

			this.menu.glossaryOverlay.hide();
			this.glossaryOpenedBy = null;
		} else if (event.type.includes('ABOUT')) {
			this.setButtonsClickability(true);

			this.menu.aboutButton.setClicked(false);

			this.menu.aboutButton.resetButton();

			this.menu.aboutOverlay.hide();

			this.setButtonsClickability(true);
		} else if (event.type.includes('PLAY')) {
			if (this.menu.tournamentManager.getHasActiveTournament() && this.menu.tournamentManager.getTournamentConfig()!.isFinished) {	
				gameManager.destroyGame(this.menu.app.view.id);
				navigate('/pong');
			}
			
			const playIndex = this.overlayStack.indexOf('play');
			const tournamentIndex = this.overlayStack.indexOf('tournament');
			if (playIndex > -1) this.overlayStack.splice(playIndex, 1);
			if (tournamentIndex > -1) this.overlayStack.splice(tournamentIndex, 1);

			this.setButtonsClickability(this.overlayStack.length === 0);
			this.menu.playButton.setClicked(false);
			this.menu.playButton.resetButton();
			this.menu.glossaryButton.resetButton();

			if (this.menu.config.variant === 'tournament') {
				this.menu.tournamentOverlay.hide();
			} else {
				this.menu.playOverlay.hide();
			}

			this.menu.opponentData = null;

			this.menu.hasOngoingTournament = false;
			this.menu.tournamentConfig = null;
			this.menu.tournamentManager.clearTournament();
			this.handleCancelMatchmaking(); //! doubled?

			for (let button of this.menu.tournamentInputButtons) {
				button.resetButton();
			}

			this.menu.opponentData = null;

			this.menu.hasOngoingTournament = false;
			this.menu.tournamentConfig = null;
			this.menu.tournamentManager.clearTournament()
		}

		this.menu.inputFocus = null;
	}

	handleLocalClick() {
		this.menu.localButton.setClicked(!this.menu.localButton.getIsClicked());

		if (this.menu.onlineButton.getIsClicked()) {
			this.menu.onlineButton.setClicked(!this.menu.onlineButton.getIsClicked());
		}

		if (this.menu.localButton.getIsClicked()) {
			this.menu.config.mode = 'local';
			this.menu.menuHidden.addChild(this.menu.tournamentButton.getContainer());
			this.menu.menuContainer.addChild(this.menu.IAButton.getContainer());
		}

		if (this.menu.IAButton.getIsClicked()) {
			this.menu.IAButton.setClicked(!this.menu.IAButton.getIsClicked());
		}

		if (this.menu.duelButton.getIsClicked()) {
			this.menu.duelButton.setClicked(!this.menu.duelButton.getIsClicked());
		}

		this.menu.localButton.resetButton();
		this.menu.onlineButton.resetButton();
		this.menu.IAButton.resetButton();
		this.menu.duelButton.resetButton();

		this.updatePlayButtonState();
	};

	handleOnlineClick() {
		this.menu.onlineButton.setClicked(!this.menu.onlineButton.getIsClicked());

		if (this.menu.localButton.getIsClicked()) {
			this.menu.localButton.setClicked(!this.menu.localButton.getIsClicked());
		}

		if (this.menu.onlineButton.getIsClicked()) {
			this.menu.config.mode = 'online';
			this.menu.menuContainer.addChild(this.menu.tournamentButton.getContainer());
			this.menu.menuHidden.addChild(this.menu.IAButton.getContainer());
		}

		if (this.menu.tournamentButton.getIsClicked()) {
			this.menu.tournamentButton.setClicked(!this.menu.tournamentButton.getIsClicked());
		}

		if (this.menu.duelButton.getIsClicked()) {
			this.menu.duelButton.setClicked(!this.menu.duelButton.getIsClicked());
		}

		this.menu.localButton.resetButton();
		this.menu.onlineButton.resetButton();
		this.menu.tournamentButton.resetButton();
		this.menu.duelButton.resetButton();

		this.updatePlayButtonState();
	};

	handleIAClick() {
		this.menu.IAButton.setClicked(!this.menu.IAButton.getIsClicked());

		if (this.menu.duelButton.getIsClicked()) {
			this.menu.duelButton.setClicked(!this.menu.duelButton.getIsClicked());
		}

		if (this.menu.IAButton.getIsClicked()) {
			this.menu.config.variant = '1vAI';
		}

		this.menu.IAButton.resetButton();
		this.menu.duelButton.resetButton();

		this.updatePlayButtonState();
	};

	handleDuelClick() {
		this.menu.duelButton.setClicked(!this.menu.duelButton.getIsClicked());

		if (this.menu.IAButton.getIsClicked()) {
			this.menu.IAButton.setClicked(!this.menu.IAButton.getIsClicked());
		} else if (this.menu.tournamentButton.getIsClicked()) {
			this.menu.tournamentButton.setClicked(!this.menu.tournamentButton.getIsClicked());
		}

		if (this.menu.duelButton.getIsClicked()) {
			this.menu.config.variant = '1v1';
		}

		this.menu.duelButton.resetButton();
		this.menu.IAButton.resetButton();
		this.menu.tournamentButton.resetButton();

		this.updatePlayButtonState();
	};

	handleTournamentClick() {
		this.menu.tournamentButton.setClicked(!this.menu.tournamentButton.getIsClicked());

		if (this.menu.duelButton.getIsClicked()) {
			this.menu.duelButton.setClicked(!this.menu.duelButton.getIsClicked());
		}

		if (this.menu.tournamentButton.getIsClicked()) {
			this.menu.config.mode = 'online';
			this.menu.config.variant = 'tournament';
		}

		this.menu.tournamentButton.resetButton();
		this.menu.duelButton.resetButton();

		this.updatePlayButtonState();
	};

	handleFiltersClicked() {
		const text = this.menu.filtersButton.getText();
		let isClicked = this.menu.filtersButton.getIsClicked();

		if (isClicked) {
			this.menu.filtersButton.updateText(this.getUpdatedHalfButtonText(text, 'ON'));
			this.menu.tournamentFiltersButton.updateText(this.getUpdatedHalfButtonText(text, 'ON'));
			this.menu.visualRoot.filters = [];
			this.menu.menuContainer.filters = [];
			this.menu.renderLayers.overlays.filters = [];
			this.menu.renderLayers.powerups.filters = [];
			this.menu.renderLayers.powerdowns.filters = [];
			this.menu.renderLayers.ballchanges.filters = [];
			this.menu.renderLayers.overlayQuits.filters = [];
			this.menu.config.filters = false;
		} else {
			this.menu.filtersButton.updateText(this.getUpdatedHalfButtonText(text, 'OFF'));
			this.menu.tournamentFiltersButton.updateText(this.getUpdatedHalfButtonText(text, 'OFF'));
			this.menu.visualRoot.filters = this.menu.baseFilters;
			this.menu.menuContainer.filters = this.menu.baseFilters;
			this.menu.renderLayers.overlays.filters = this.menu.baseFilters;
			this.menu.renderLayers.overlayQuits.filters = this.menu.baseFilters;

			if (this.menu.config.classicMode) {
				this.menu.renderLayers.powerups.filters = this.menu.powerupClassicFilters;
				this.menu.renderLayers.powerdowns.filters = this.menu.powerupClassicFilters;
				this.menu.renderLayers.ballchanges.filters = this.menu.powerupClassicFilters;
			} else {
				this.menu.renderLayers.powerups.filters = this.menu.powerupFilters;
				this.menu.renderLayers.powerdowns.filters = this.menu.powerdownFilters;
				this.menu.renderLayers.ballchanges.filters = this.menu.ballchangeFilters;
			}

			this.menu.config.filters = true;
		}

		this.menu.filtersButton.setClicked(!this.menu.filtersButton.getIsClicked());
		this.menu.filtersButton.resetButton();
		this.menu.tournamentFiltersButton.setClicked(!this.menu.tournamentFiltersButton.getIsClicked());
		this.menu.tournamentFiltersButton.resetButton();

		this.updatePowerups();
		this.updatePaddles();
	}

	resetStartOptions() {
		this.menu.localButton.setClicked(true);
		this.menu.onlineButton.setClicked(false);
		this.menu.IAButton.setClicked(false);
		this.menu.duelButton.setClicked(false);
		this.menu.tournamentButton.setClicked(false);

		this.menu.onlineButton.resetButton();
		this.menu.localButton.resetButton();
		this.menu.IAButton.resetButton();
		this.menu.duelButton.resetButton();
		this.menu.tournamentButton.resetButton();

		this.menu.localButton.setHidden(false);
		this.menu.onlineButton.setHidden(false);
		this.menu.IAButton.setHidden(false);
		this.menu.duelButton.setHidden(false);
		this.menu.tournamentButton.setHidden(true);

		this.menu.playButton.setHidden(true);
		this.menu.playButton.setClickable(false);
		this.menu.playButton.setClicked(false);
		this.menu.playButton.resetButton();

		this.menu.startXButton.setHidden(true);
	}
	
	async handleMatchFound() {
		this.menu.readyButton.setClicked(false);
	
		const hostName = this.networkManager?.getHostName() || 'host';
		const guestName = this.networkManager?.getGuestName() || 'guest';
		const currentUsername = sessionStorage.getItem('username');
	
		try {
			const hostResponse = await fetch('/api/games/getUserByUsername', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${sessionStorage.getItem('token')}`
				},
				body: JSON.stringify({
					username: hostName
				})
			});
	
			if (!hostResponse.ok) {
				throw new Error(`HTTP error getting host data! status: ${hostResponse.status}`);
			}
	
			const hostResponseData = await hostResponse.json();
			
			const guestResponse = await fetch('/api/games/getUserByUsername', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${sessionStorage.getItem('token')}`
				},
				body: JSON.stringify({
					username: guestName
				})
			});
	
			if (!guestResponse.ok) {
				throw new Error(`HTTP error getting guest data! status: ${guestResponse.status}`);
			}
	
			const guestResponseData = await guestResponse.json();
	
			if (hostResponseData.success && guestResponseData.success) {
				const hostData = hostResponseData.userData;
				const guestData = guestResponseData.userData;
				hostData.side = 'left';
			
				this.menu.playerData = hostData;
				this.menu.opponentData = guestData;

				if (currentUsername === hostName) {
					await MenuImageManager.updateRightPlayerAvatar(this.menu);
					this.menu.playOverlay.duel.updateOpponentData(this.menu.opponentData);
				} else if (currentUsername === guestName) {
					await MenuImageManager.updateLeftPlayerAvatar(this.menu); 
					await MenuImageManager.updateRightPlayerAvatar(this.menu);
					this.menu.playOverlay.duel.updatePlayerData(this.menu.playerData);
					this.menu.playOverlay.duel.updateOpponentData(this.menu.opponentData);
				}

				this.menu.playOverlay.duel.updateNameTags();
			} else {
				console.error('Failed to get user data:', 
					hostResponseData.success ? guestResponseData.message : hostResponseData.message);
			}
	
		} catch (error) {
			console.error('Error fetching player data for matchmaking:', error);
		}
	
		const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
		this.menu.readyButton.updateText('');
		while (this.menu.readyButton.getText().length < 3) {
			this.menu.readyButton.updateText(this.menu.readyButton.getText() + '∙');
			await sleep(1000);
			if (this.menu.playQuitButton.getIsClicked()) {
				this.menu.readyButton.resetButton();
				this.menu.readyButton.updateText('READY');
				this.menu.playQuitButton.resetButton();
				this.networkManager?.playerDisconnected();
				this.networkManager = null;
				return;
			}
		}
		
		const params = new URLSearchParams({
			gameId: this.networkManager?.getGameId() || '',
			hostName: hostName,
			guestName: guestName,
			mode: 'online'
		});
		navigate(`/pong?${params.toString()}`);
	}

	handleClassicClicked() {
		this.menu.config.classicMode = !this.menu.config.classicMode;
		this.menu.ballAmount = 0;

		const text = this.menu.classicButton.getText();
		const isClicked = this.menu.classicButton.getIsClicked();

		if (isClicked) {
			this.menu.classicButton.updateText(this.getUpdatedHalfButtonText(text, 'ON'));
		} else if (!isClicked) {
			this.menu.classicButton.updateText(this.getUpdatedHalfButtonText(text, 'OFF'));
		}

		this.menu.classicButton.setClicked(!this.menu.classicButton.getIsClicked());

		const menu = this.menu;

		const entitiesToRemove: string[] = [];

		for (const entity of this.menu.entities) {
			if (isBall(entity)) {
				entitiesToRemove.push(entity.id);
			}
		}

		for (const id of entitiesToRemove) {
			this.menu.removeEntity(id);
		}

		this.resetButtons();


		if (menu.title) {
			menu.title.updateBlockingVisibility();
		}

		const titleORender = this.menu.titleO.getComponent('render') as RenderComponent;

		if (this.menu.config.classicMode) {
			this.menu.menuHidden.addChild(this.menu.ballButton.getContainer());
			this.menu.renderLayers.logo.addChild(titleORender.graphic);
			this.menu.glossaryOverlay.changeStrokeColor(GAME_COLORS.white);

			if (this.menu.config.filters) {
				this.menu.renderLayers.powerups.filters = this.menu.powerupClassicFilters;
				this.menu.renderLayers.powerdowns.filters = this.menu.powerupClassicFilters;
				this.menu.renderLayers.ballchanges.filters = this.menu.powerupClassicFilters;
			}
		} else {
			this.menu.renderLayers.foreground.addChild(this.menu.ballButton.getContainer());
			this.menu.menuHidden.addChild(titleORender.graphic);
			if (this.menu.glossaryButton.getIsClicked()) {
				this.menu.overlayBackground.changeStrokeColor(GAME_COLORS.menuOrange);
			} else if (this.menu.aboutButton.getIsClicked()) {
				this.menu.overlayBackground.changeStrokeColor(GAME_COLORS.menuPink);
			}

			if (this.menu.config.filters) {
				this.menu.renderLayers.powerups.filters = this.menu.powerupFilters;
				this.menu.renderLayers.powerdowns.filters = this.menu.powerdownFilters;
				this.menu.renderLayers.ballchanges.filters = this.menu.ballchangeFilters;
			}
		}

		this.updatePowerups();
		this.updatePaddles();

		this.menu.glossaryOverlay.redrawTitles();
		this.menu.glossaryOverlay.powerupBar.redrawBar();
		this.menu.glossaryOverlay.powerdownBar.redrawBar();
		this.menu.glossaryOverlay.ballchangeBar.redrawBar();
		this.menu.glossaryOverlay.affectationsBar.redrawBar();
		this.menu.glossaryOverlay.wallfiguresBar.redrawBar();

		this.menu.aboutOverlay.redrawTitles();
		this.menu.aboutOverlay.teamBar.redrawBar();
		this.menu.aboutOverlay.projectBar.redrawBar();

		this.menu.tournamentOverlay.nextMatchDisplay.redrawDisplay();
		this.menu.tournamentOverlay.bracket.redrawBracket();
		this.menu.playOverlay.nextMatchDisplay.redrawDisplay();
	}

	getUpdatedHalfButtonText(text: string, mode: string): string {
		switch (this.menu.language) {
			case ('en'): {
				if (mode === 'ON') {
					return text.substring(0, text.indexOf('ON')) + 'OFF';
				} else if (mode === 'OFF') {
					return text.substring(0, text.indexOf('OFF')) + 'ON';
				}
				break;
			}

			case ('es'): {
				if (mode === 'ON') {
					return text.substring(0, text.indexOf('SÍ')) + 'NO';
				} else if (mode === 'OFF') {
					return text.substring(0, text.indexOf('NO')) + 'SÍ';
				}
				break;
			}

			case ('fr'): {
				if (mode === 'ON') {
					return text.substring(0, text.indexOf('OUI')) + 'NON';
				} else if (mode === 'OFF') {
					return text.substring(0, text.indexOf('NON')) + 'OUI';
				}
				break;
			}

			case ('cat'): {
				if (mode === 'ON') {
					return text.substring(0, text.indexOf('SÍ')) + 'NO';
				} else if (mode === 'OFF') {
					return text.substring(0, text.indexOf('NO')) + 'SÍ';
				}
				break;
			}
		}
		return ('UNKNOWN');
	}

	public updatePlayButtonState(): void {
		let shouldBeClickable = false;

		if (this.menu.localButton.getIsClicked()) {
			shouldBeClickable = this.menu.IAButton.getIsClicked() || this.menu.duelButton.getIsClicked();
		} else if (this.menu.onlineButton.getIsClicked()) {
			shouldBeClickable = this.menu.tournamentButton.getIsClicked() || this.menu.duelButton.getIsClicked();
		}

		const playButton = this.menu.playButton;
		const wasClickable = playButton.getIsClickable();

		if (wasClickable !== shouldBeClickable) {
			playButton.setClickable(shouldBeClickable);

			if (shouldBeClickable) {
				playButton.getContainer().eventMode = 'static';
				playButton.getContainer().cursor = 'pointer';
				playButton.setClicked(false);

				playButton.getContainer().removeAllListeners();
				playButton.setupEventHandlers();
			} else {
				playButton.getContainer().eventMode = 'none';
				playButton.getContainer().cursor = 'default';
				playButton.setClicked(true);
				playButton.getContainer().removeAllListeners();
			}

			playButton.resetButton();
		}
	}

	resetButtons(resetPlay: boolean = true): void {
		this.menu.startButton.resetButton();
		this.menu.optionsButton.resetButton();
		this.menu.glossaryButton.resetButton();
		this.menu.aboutButton.resetButton();
		this.menu.filtersButton.resetButton();
		this.menu.classicButton.resetButton();
		this.menu.onlineButton.resetButton();
		this.menu.localButton.resetButton();
		this.menu.IAButton.resetButton();
		this.menu.duelButton.resetButton();
		this.menu.tournamentButton.resetButton();
		this.menu.startXButton.resetButton();
		this.menu.optionsXButton.resetButton();
		this.menu.glossaryQuitButton.resetButton();
		this.menu.aboutQuitButton.resetButton();
		this.menu.playQuitButton.resetButton();
		this.menu.readyButton.resetButton();
		this.menu.tournamentGlossaryButton.resetButton();
		this.menu.tournamentFiltersButton.resetButton();

		this.menu.playOrnament.resetOrnament();
		this.menu.startOrnament.resetOrnament();
		this.menu.optionsOrnament.resetOrnament();
		this.menu.optionsClickedOrnament.resetOrnament();

		if (resetPlay) {
			this.menu.playButton.resetButton();
		}
	}

	updatePowerups() {
		(this.menu.enlargePowerup as EnlargePowerup).redrawPowerup();
		(this.menu.magnetizePowerup as MagnetizePowerup).redrawPowerup();
		(this.menu.shieldPowerup as ShieldPowerup).redrawPowerup();
		(this.menu.shootPowerup as ShootPowerup).redrawPowerup();

		(this.menu.shrinkPowerdown as ShrinkPowerDown).redrawPowerup();
		(this.menu.invertPowerdown as InvertPowerDown).redrawPowerup();
		(this.menu.flattenPowerdown as FlatPowerDown).redrawPowerup();
		(this.menu.slowPowerdown as SlowPowerDown).redrawPowerup();

		(this.menu.curveBallChange as CurveBallPowerup).redrawPowerup();
		(this.menu.spinBallChange as SpinBallPowerup).redrawPowerup();
		(this.menu.burstBallChange as BurstBallPowerup).redrawPowerup();
		(this.menu.multiplyBallChange as MultiplyBallPowerup).redrawPowerup();
	}

	updatePaddles() {
		(this.menu.paddleL as Paddle).redrawFullPaddle(true, 'powerup');
		(this.menu.paddleR as Paddle).redrawFullPaddle(true, 'powerdown');
	}

	setButtonsClickability(clickable: boolean): void {
		this.menu.startButton.setClickable(clickable);
		this.menu.optionsButton.setClickable(clickable);
		this.menu.glossaryButton.setClickable(clickable);
		this.menu.aboutButton.setClickable(clickable);
		this.menu.localButton.setClickable(clickable);
		this.menu.onlineButton.setClickable(clickable);
		this.menu.IAButton.setClickable(clickable);
		this.menu.duelButton.setClickable(clickable);
		this.menu.tournamentButton.setClickable(clickable);
		this.menu.filtersButton.setClickable(clickable);
		this.menu.classicButton.setClickable(clickable);
		this.menu.startXButton.setClickable(clickable);
		this.menu.optionsXButton.setClickable(clickable);
		this.menu.ballButton.setClickable(clickable);

		if (clickable) {
			this.updatePlayButtonState();
		} else {
			this.menu.playButton.setClickable(false);
		}
	}

	cleanup(): void {
		this.menu.eventQueue = [];

		if (this.menu.startButton) this.menu.startButton.resetButton();
		if (this.menu.playButton) this.menu.playButton.resetButton();
		if (this.menu.optionsButton) this.menu.optionsButton.resetButton();
		if (this.menu.glossaryButton) this.menu.glossaryButton.resetButton();
		if (this.menu.aboutButton) this.menu.aboutButton.resetButton();
		if (this.menu.localButton) this.menu.localButton.resetButton();
		if (this.menu.onlineButton) this.menu.onlineButton.resetButton();
		if (this.menu.IAButton) this.menu.IAButton.resetButton();
		if (this.menu.duelButton) this.menu.duelButton.resetButton();
		if (this.menu.tournamentButton) this.menu.tournamentButton.resetButton();
		if (this.menu.filtersButton) this.menu.filtersButton.resetButton();
		if (this.menu.classicButton) this.menu.classicButton.resetButton();
		if (this.menu.startXButton) this.menu.startXButton.resetButton();
		if (this.menu.optionsXButton) this.menu.optionsXButton.resetButton();
		if (this.menu.ballButton) this.menu.ballButton.resetButton();
		if (this.menu.startButton) this.menu.startButton.resetButton();
	}

	protected async setFinalConfig() {
		if (this.menu.localButton.getIsClicked()) {
			this.menu.config.mode = 'local';
			if (this.menu.IAButton.getIsClicked()) {
				this.menu.config.variant = '1vAI';
			} else if (this.menu.duelButton.getIsClicked()) {
				this.menu.config.variant = '1v1';
			}
		} else if (this.menu.onlineButton.getIsClicked()) {
			this.menu.config.mode = 'online';
			if (this.menu.tournamentButton.getIsClicked()) {
				this.menu.config.variant = 'tournament';
				this.menu.config.mode = 'local';
			} else if (this.menu.duelButton.getIsClicked()) {
				this.menu.config.variant = '1v1';
			}
		}

		if (this.menu.config.variant === 'tournament') {
			this.menu.config.hostName = this.menu.tournamentConfig?.nextMatch.leftPlayerName!;
			this.menu.config.guestName= this.menu.tournamentConfig?.nextMatch.rightPlayerName!;
		} else {
			this.menu.config.players![0].name = sessionStorage.getItem('username') || 'Player 1';
			if (this.menu.opponentData) {
				this.menu.config.players![1].name = this.menu.opponentData.name || 'GUEST';
			} else {
				if (this.menu.storedGuestName) {
					this.menu.config.players![1].name = this.menu.storedGuestName;
				} else {
					this.menu.config.players![1].name = 'GUEST';
				}
			}

			if (this.menu.config.mode === 'local' && this.menu.config.variant === '1v1') {
				this.menu.config.hostName = this.menu.config.players![0].name;
				this.menu.config.guestName = this.menu.config.players![1].name;
			}
		}

		if (this.menu.config.guestName === 'butibot' && this.menu.config.variant !== 'tournament') {
			this.menu.config.variant = '1vAI';
		}

		this.menu.config.players![0].id = await this.menu.getUserId(this.menu.config.players![0].name, sessionStorage.getItem('token')!);
		this.menu.config.players![1].id = await this.menu.getUserId(this.menu.config.players![1].name, sessionStorage.getItem('token')!);
	}
}