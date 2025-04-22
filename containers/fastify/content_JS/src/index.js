/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   index.js                                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/01 11:36:04 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/01 11:36:05 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { PongGame } from './engine/Game.js';

document.addEventListener('DOMContentLoaded', () => {
    const game = new PongGame();
    game.init().catch(error => {
        console.error("Failed to initialize game:", error);
    });
});