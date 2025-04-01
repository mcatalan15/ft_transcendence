/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   InputSystem.js                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/01 11:32:55 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/01 11:32:56 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export class InputSystem {
    constructor() {
        this.setupKeyboard();
    }
    
    update(entities, delta) {
        // Update entity states based on input
        entities.forEach(entity => {
            if (entity.hasComponent('input')) {
                // Input logic is handled by event listeners
            }
        });
    }
    
    setupKeyboard() {
        window.addEventListener('keydown', (e) => {
            this.handleKeyDown(e);
        });

        window.addEventListener('keyup', (e) => {
            this.handleKeyUp(e);
        });
    }
    
    handleKeyDown(e) {
        const leftPaddleKeys = ['w', 'W', 's', 'S'];
        const rightPaddleKeys = ['ArrowUp', 'ArrowDown'];
        
        if (leftPaddleKeys.includes(e.key)) {
            document.dispatchEvent(new CustomEvent('paddleInput', {
                detail: {
                    paddle: 'left',
                    key: e.key.toLowerCase(),
                    state: 'down'
                }
            }));
        } else if (rightPaddleKeys.includes(e.key)) {
            document.dispatchEvent(new CustomEvent('paddleInput', {
                detail: {
                    paddle: 'right',
                    key: e.key,
                    state: 'down'
                }
            }));
        }
    }
    
    handleKeyUp(e) {
        const leftPaddleKeys = ['w', 'W', 's', 'S'];
        const rightPaddleKeys = ['ArrowUp', 'ArrowDown'];
        
        if (leftPaddleKeys.includes(e.key)) {
            document.dispatchEvent(new CustomEvent('paddleInput', {
                detail: {
                    paddle: 'left',
                    key: e.key.toLowerCase(),
                    state: 'up'
                }
            }));
        } else if (rightPaddleKeys.includes(e.key)) {
            document.dispatchEvent(new CustomEvent('paddleInput', {
                detail: {
                    paddle: 'right',
                    key: e.key,
                    state: 'up'
                }
            }));
        }
    }
}