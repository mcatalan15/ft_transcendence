/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   MenuInputSystem.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/15 18:00:00 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/16 17:47:38 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Entity } from '../../engine/Entity';
import { System } from '../../engine/System';
import { FrameData, GameEvent } from '../../utils/Types';
import { Menu } from '../Menu';
import { MenuBigInputButton } from '../menuButtons/MenuBigInputButton';
import { getApiUrl } from '../../../config/api';
import { MenuImageManager } from '../menuManagers/MenuImageManager';

export class MenuInputSystem implements System {
    private currentInput: string = '';
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
				this.menu.playInputButton.resetButton(false);
                this.processPlayInputSubmission(event);
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
        if (event.code === 'Enter') {
            console.log('Input finished:', this.currentInput);
            this.menu.isProcessingInput = false;
            this.menu.inputFocus = null;
            if (this.menu.playInputButton.buttonText) {
                this.menu.playInputButton.buttonText.alpha = 1;
            }
			this.menu.playInputButton.setClickable(false);
			const shrinkEvent: GameEvent = {
						type: 'PLAY_INPUT_SUBMITTED',
						target: this.menu.playInputButton,
					};
				
					this.menu.eventQueue.push(shrinkEvent);
            return;
        }

        // Handle Backspace key
        if (event.code === 'Backspace') {
            this.currentInput = this.currentInput.slice(0, -1);
            this.updateButtonText();
            return;
        }

        // Ignore modifier keys and special keys
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
            if (this.menu.playInputButton.getText() === 'GUEST?') {
                this.currentInput = '';
            }

            if (this.currentInput.length < 8) {
                this.currentInput += key;
                this.updateButtonText();
            }
        }
    }

    private updateButtonText(): void {
        const displayText = this.currentInput.length > 0 ? this.currentInput : 'GUEST?';
        this.menu.playInputButton.updateText(displayText);
    }

    destroy(): void {
        document.removeEventListener('keydown', this.keydownHandler);
    }

	async processPlayInputSubmission(event: GameEvent): Promise<void> {
		const userName = event.target.getText();
		const token = sessionStorage.getItem('token');
		this.menu.storedGuestName = userName;
		this.menu.playInputButton.updateText(userName.toUpperCase());

		try {
			const response = await fetch('/api/games/getUserByUsername', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
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
	}
}