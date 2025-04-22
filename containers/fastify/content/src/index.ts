/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   index.ts                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/22 17:17:58 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/22 17:18:00 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { PongGame } from './engine/Game';

// Error handling
const errorElement = document.getElementById('error');

async function startGame(): Promise<void> {
    try {
        const game = new PongGame();
        await game.init();
    } catch (error) {
        console.error('Failed to initialize game:', error);
        if (errorElement) {
            errorElement.style.display = 'block';
            errorElement.textContent = `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`;
        }
    }
}

// Start the game when the DOM is fully loaded
window.addEventListener('DOMContentLoaded', () => {
    startGame();
});