/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   InputSystem.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/24 10:52:06 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/21 21:28:43 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { PongGame } from '../engine/Game';

import { Entity } from '../engine/Entity';
import type { System } from '../engine/System'

import { InputComponent } from '../components/InputComponent'
import { isPaddle } from '../utils/Guards';
import { Paddle } from '../entities/Paddle';

export class InputSystem implements System {
    private game: PongGame;
    private keysDown: Set<string> = new Set();
    private handleKeyDown!: (e: KeyboardEvent) => void;
    private handleKeyUp!: (e: KeyboardEvent) => void;
    private lastInputSent: any = { up: false, down: false };

    constructor(game: PongGame) {
        this.game = game;
        
        this.handleKeyDown = (e) => this.keysDown.add(e.key);
        this.handleKeyUp = (e) => this.keysDown.delete(e.key);
        
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
    }

    update(entities: Entity[]): void {
        if (this.game.hasEnded) return;

        if (this.game.isOnline && this.game.config.classicMode) {
            return;
        }

        this.handleLocalInput(entities);
    }

    private handleLocalInput(entities: Entity[]): void {
        for (const entity of entities) {
            if (isPaddle(entity)) {
                const paddle = entity as Paddle;
            
                if (paddle.isAI) {
                    continue;
                }

                const input = entity.getComponent('input') as InputComponent;
                if (!input) return;
                input.upPressed = input.keys.up.some((key: string) => this.keysDown.has(key));
                input.downPressed = input.keys.down.some((key: string) => this.keysDown.has(key));
            }
        }
    }

    cleanup(): void {
        this.keysDown.clear();
        
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);

        for (const entity of this.game.entities) {
            if (isPaddle(entity)) {
                const input = entity.getComponent('input') as InputComponent;
                if (input) {
                    input.upPressed = false;
                    input.downPressed = false;
                }
            }
        }
    }
}