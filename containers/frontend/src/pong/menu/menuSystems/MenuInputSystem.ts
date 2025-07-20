/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   MenuInputSystem.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/15 18:00:00 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/19 17:45:18 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Entity } from '../../engine/Entity';
import { System } from '../../engine/System';
import { FrameData, GameEvent } from '../../utils/Types';
import { Menu } from '../Menu';
import { MenuBigInputButton } from '../menuButtons/MenuBigInputButton';
import { MenuSmallInputButton } from '../menuButtons/MenuSmallInputButton';
import { getApiUrl } from '../../../config/api';
import { MenuImageManager } from '../menuManagers/MenuImageManager';

export class MenuInputSystem implements System {
	private currentInput: string = '';
	private currentInputButton: MenuBigInputButton | MenuSmallInputButton | null = null;
	private keydownHandler: (event: KeyboardEvent) => void;

	constructor(private menu: Menu) {
		this.keydownHandler = (event: KeyboardEvent) => {
			if (!menu.isProcessingInput || !menu.inputFocus) return;
			this.handleKeyInput(event);
		};
		
		this.setupEventListeners();
	}

	update(entities: Entity[], frameData: FrameData): void {
		const unhandledEvents = [];

		while (this.menu.eventQueue.length > 0) {
			const event = this.menu.eventQueue.shift() as GameEvent;
			
			if (event.type === 'PLAY_INPUT_SUBMITTED') {
				this.processInputSubmission(event);
			} else if (event.type === 'TOURNAMENT_INPUT_SUBMITTED') {
				this.processInputSubmission(event);
			} else {
				unhandledEvents.push(event);
			}
		}
		
		this.menu.eventQueue.push(...unhandledEvents);
	}

	private setupEventListeners(): void {
		document.addEventListener('keydown', this.keydownHandler);
	}

	private handleKeyInput(event: KeyboardEvent): void {
		if (!this.currentInputButton) return;

		if (event.code === 'Enter') {
			let repeatedFlag: number = 0;
			
			if (this.currentInputButton.getText() !== 'name?') {
				for (let i = 0; i < this.menu.tournamentInputButtons.length; i++) {
					if (this.currentInputButton.getText().toUpperCase() === this.menu.tournamentInputButtons[i].getText().toUpperCase()) {
						repeatedFlag++;
					}
				}

				if ((this.currentInputButton instanceof MenuBigInputButton && this.currentInputButton.getText() !== 'butibot' && this.currentInputButton.getText() !== this.menu.playerData?.name)) {
					this.finishInput();
					return;
				} else if (this.currentInputButton instanceof MenuSmallInputButton && repeatedFlag < 2 && this.currentInputButton.getText() !== 'butibot') {
					this.finishInput();
					return;
				}
			}
		}

		if (event.code === 'Backspace') {
			this.currentInput = this.currentInput.slice(0, -1);
			this.updateButtonText();
			return;
		}

		if (event.ctrlKey || event.altKey || event.metaKey || 
			event.code.startsWith('F') || 
			event.code.includes('Shift') || 
			event.code.includes('Control') || 
			event.code.includes('Alt') || 
			event.code.includes('Meta')) {
			return;
		}

		const key = event.key;

		if (/^[a-z0-9-]$/.test(key)) {
			if (this.currentInputButton.getText() === 'GUEST?' || 
				this.currentInputButton.getText().startsWith('Player')) {
				this.currentInput = '';
			}

			if (this.currentInput.length < 8) {
				this.currentInput += key;
				this.updateButtonText();
			}
		}
	}

	private updateButtonText(): void {
		if (!this.currentInputButton) return;
		
		const displayText = this.currentInput.length > 0 
			? this.currentInput 
			: this.getEmptyInputFallback();
				
		this.currentInputButton.updateText(displayText);
	}

	private finishInput(): void {
		if (!this.currentInputButton) return;

		console.log('Input finished:', this.currentInput);
		this.menu.isProcessingInput = false;
		this.menu.inputFocus = null;
		
		if (this.currentInputButton.buttonText) {
			this.currentInputButton.buttonText.alpha = 1;
		}
		
		this.currentInputButton.setClickable(false);
		this.currentInputButton.unhover();
		
		const eventType = this.currentInputButton instanceof MenuSmallInputButton 
			? 'TOURNAMENT_INPUT_SUBMITTED' 
			: 'PLAY_INPUT_SUBMITTED';
			
		const event: GameEvent = {
			type: eventType,
			target: this.currentInputButton,
		};
		
		this.menu.eventQueue.push(event);
	}

	destroy(): void {
		document.removeEventListener('keydown', this.keydownHandler);
	}

	async processInputSubmission(event: GameEvent): Promise<void> {
		const inputButton = event.target;
		const userName = inputButton.getText();
		
		if (inputButton === this.menu.playInputButton) {
			this.menu.storedGuestName = userName;
			inputButton.updateText(userName.toUpperCase());
			
			try {
				const response = await fetch('/api/games/getUserByUsername', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${sessionStorage.getItem('token')}`
					},
					body: JSON.stringify({
						username: userName
					})
				});

				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				const data = await response.json();
				
				if (data.success) {
					console.log('User data:', data.userData);
					this.menu.opponentData = data.userData;

					if (this.menu.playOverlay?.duel) {
						this.menu.playOverlay.duel.updateOpponentData(data.userData);
						await MenuImageManager.updateRightPlayerAvatar(this.menu);
					}
				} else {
					console.error('Failed to get user data:', data.message);
				}
			} catch (error) {
				console.error('Error fetching user data:', error);
			}
		} else {
			inputButton.updateText(userName.toUpperCase());
			
			if (!this.menu.hasOngoingTournament) {
				this.menu.hasOngoingTournament = true;

				this.menu.initTournamentConfiguration();
			}

			this.processTournamentName(inputButton.getButtonId(), userName);
			this.getTournamentPlayerData(inputButton.getButtonId(), userName);
			(this.currentInputButton as MenuSmallInputButton).isFilled = true;
			this.checkIfTournamentReady();
		}

		this.currentInputButton = null;
	}

	public setCurrentInputButton(button: MenuBigInputButton | MenuSmallInputButton): void {
		this.currentInputButton = button;
		this.currentInput = button.getText() === 'GUEST?' || button.getText().startsWith('Player') 
			? '' 
			: button.getText();
			
		if (button.buttonText) {
			button.buttonText.alpha = 0.5;
		}
		this.menu.inputFocus = button.getButtonId();
		this.menu.isProcessingInput = true;
	}

	processTournamentName(buttonId: string, userName: string): void {
			const buttonNumber = parseInt(buttonId.charAt(buttonId.length - 1), 10);
		switch (buttonNumber) {
			case (0): {
				this.menu.tournamentConfig!.registeredPlayerNames.player1 = userName;
				this.menu.tournamentConfig!.firstRoundPlayers.player1 = userName;
				break;
			}

			case (1): {
				this.menu.tournamentConfig!.registeredPlayerNames.player2 = userName;
				this.menu.tournamentConfig!.firstRoundPlayers.player2 = userName;
				break;
			}

			case (2): {
				this.menu.tournamentConfig!.registeredPlayerNames.player3 = userName;
				this.menu.tournamentConfig!.firstRoundPlayers.player3 = userName;
				break;
			}

			case (3): {
				this.menu.tournamentConfig!.registeredPlayerNames.player4 = userName;
				this.menu.tournamentConfig!.firstRoundPlayers.player4 = userName;
				break;
			}

			case (4): {
				this.menu.tournamentConfig!.registeredPlayerNames.player5 = userName;
				this.menu.tournamentConfig!.firstRoundPlayers.player5 = userName;
				break;
			}

			case (5): {
				this.menu.tournamentConfig!.registeredPlayerNames.player6 = userName;
				this.menu.tournamentConfig!.firstRoundPlayers.player6 = userName;
				break;
			}

			case (6): {
				this.menu.tournamentConfig!.registeredPlayerNames.player7 = userName;
				this.menu.tournamentConfig!.firstRoundPlayers.player7 = userName;
				break;
			}

			case (7): {
				this.menu.tournamentConfig!.registeredPlayerNames.player8 = userName;
				this.menu.tournamentConfig!.firstRoundPlayers.player8 = userName;
				break;
			}
			
			default: {
				this.menu.tournamentConfig!.registeredPlayerNames.player8 = userName;
				this.menu.tournamentConfig!.firstRoundPlayers.player8 = userName;
			}
		}
	}

	async getTournamentPlayerData(buttonId: string, userName: string): Promise<void> {
		const buttonNumber = parseInt(buttonId.charAt(buttonId.length - 1), 10);
		const playerData = this.menu.tournamentConfig!.registeredPlayerData;

		const response = await fetch('/api/games/getUserByUsername', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${sessionStorage.getItem('token')}`
			},
			body: JSON.stringify({
				username: userName
			})
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data = await response.json();

		if (data.success) {
			switch (buttonNumber) {
				case (0): {
					playerData.player1Data = data.userData;
					console.log('Player 1 data:', playerData.player1Data);
					break;
				}

				case (1): {
					playerData.player2Data = data.userData;
					console.log('Player 2 data:', playerData.player2Data);
					break;
				}

				case (2): {
					playerData.player3Data = data.userData;
					console.log('Player 3 data:', playerData.player3Data);
					break;
				}

				case (3): {
					playerData.player4Data = data.userData;
					console.log('Player 4 data:', playerData.player4Data);
					break;
				}

				case (4): {
					playerData.player5Data = data.userData;
					console.log('Player 5 data:', playerData.player5Data);
					break;
				}

				case (5): {
					playerData.player6Data = data.userData;
					console.log('Player 6 data:', playerData.player6Data);
					break;
				}

				case (6): {
					playerData.player7Data = data.userData;
					console.log('Player 7 data:', playerData.player7Data);
					break;
				}

				case (7): {
					playerData.player8Data = data.userData;
					console.log('Player 8 data:', playerData.player8Data);
					break;
				}

				default: {
					playerData.player8Data = data.userData;
					console.log('Player 8 data:', playerData.player8Data);
				}
			}
		} else {
			console.error('Failed to get user data:', data.message);
		}
	}

	checkIfTournamentReady(): void {
		for (let i = 0; i < this.menu.tournamentInputButtons.length; i++) {
			const button = this.menu.tournamentInputButtons[i];
			if (button instanceof MenuSmallInputButton && !button.isFilled) {
				return;
			}
		}

		this.menu.tournamentConfig!.isPrepared = true;
		this.menu.tournamentConfig!.classicMode = this.menu.config.classicMode;

		const startTournamentEvent: GameEvent = {
            type: 'START_TOURNAMENT',
        };

        this.menu.eventQueue.push(startTournamentEvent);

		console.log('Tournament is ready to start with the following configuration:', this.menu.tournamentConfig!);
	}

	private getEmptyInputFallback(): string {
		switch (this.menu.language) {
			case ('en'): {
				return 'name?';
			}

			case ('es'): {
				return 'nombre?';
			}

			case ('fr'): {
				return 'nom?';
			}

			default: {
				return 'nom?';
			}
		}
	}

	public getCurrentInputButton(): MenuBigInputButton | MenuSmallInputButton | null {
		return this.currentInputButton;
	}
}