/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   InputSystem.js                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/01 11:32:55 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/08 17:57:47 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export class InputSystem {
	constructor() {
		this.entities = [];
		this.setupKeyboard();
	}

	update(entities, delta) {
		this.entities = entities;
	}

	setupKeyboard() {
		window.addEventListener('keydown', (e) => this.handleKeyDown(e));
		window.addEventListener('keyup', (e) => this.handleKeyUp(e));
	}

	handleKeyDown(e) {
		const leftPaddleKeys = ['w', 'W', 's', 'S'];
		const rightPaddleKeys = ['ArrowUp', 'ArrowDown'];

		if (leftPaddleKeys.includes(e.key)) {
			this.triggerVFX('left');

			document.dispatchEvent(new CustomEvent('paddleInput', {
				detail: {
					paddle: 'left',
					key: e.key.toLowerCase(),
					state: 'down'
				}
			}));
		} else if (rightPaddleKeys.includes(e.key)) {
			this.triggerVFX('right');

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

	triggerVFX(paddleSide) {
        const paddleId = paddleSide === 'left' ? 'paddleL' : 'paddleR';
        const paddle = this.entities.find(entity => entity.id === paddleId);
        
        if (!paddle) return;
        
        const vfx = paddle.getComponent('vfx');
        if (vfx) {
            // Apply a more dramatic effect for immediate visual feedback
            vfx.targetScale.x = vfx.scaleOnMove.x;
            vfx.targetScale.y = vfx.scaleOnMove.y;
            
            // Optional: For even faster initial effect
            vfx.currentScale.x = (vfx.currentScale.x + vfx.scaleOnMove.x) / 2;
            vfx.currentScale.y = (vfx.currentScale.y + vfx.scaleOnMove.y) / 2;
        }
    }
}