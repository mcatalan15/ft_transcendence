/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   MenuSecretCodeSystem.ts                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/10 09:18:15 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/10 10:08:36 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// SecretCodeSystem.ts
import { Entity } from '../engine/Entity';
import { System } from '../engine/System';
import { FrameData, GAME_COLORS } from '../utils/Types';
import { Menu } from './Menu';
import { MenuParticleSpawner } from './MenuParticleSpawner';
import { SecretCode, getRandomGameColor } from '../utils/MenuUtils';


export class SecretCodeSystem implements System {
    private inputBuffer: string[] = [];
    private lastInputTime: number = 0;
    private codes: SecretCode[] = [];
    private isActive: boolean = true;
    private keydownHandler: (event: KeyboardEvent) => void;

    constructor(private menu: Menu) {
        this.keydownHandler = (event: KeyboardEvent) => {
            if (!this.isActive) return;
            this.handleKeyInput(event.code);
        };
        
        this.setupEventListeners();
        this.registerDefaultCodes();
    }

    update(entities: Entity[], frameData: FrameData): void {
        const currentTime = Date.now();
        if (this.inputBuffer.length > 0 && 
            currentTime - this.lastInputTime > this.getMaxTimeout()) {
            this.inputBuffer = [];
        }
    }

    private setupEventListeners(): void {
        document.addEventListener('keydown', this.keydownHandler);
    }

    private handleKeyInput(keyCode: string): void {
        const currentTime = Date.now();
        
        if (currentTime - this.lastInputTime > this.getMaxTimeout()) {
            this.inputBuffer = [];
        }
        
        this.lastInputTime = currentTime;
        this.inputBuffer.push(keyCode);
        
        const maxBufferSize = Math.max(...this.codes.map(c => c.sequence.length)) + 5;
        if (this.inputBuffer.length > maxBufferSize) {
            this.inputBuffer.shift();
        }
        
        this.checkForMatches();
    }

    private checkForMatches(): void {
        for (const code of this.codes) {
            if (this.matchesSequence(code.sequence)) {
                console.log(`Secret code "${code.name}" activated!`);
                code.effect();
                this.inputBuffer = [];
                break;
            }
        }
    }

    private matchesSequence(sequence: string[]): boolean {
        if (this.inputBuffer.length < sequence.length) return false;
        
        const recentInputs = this.inputBuffer.slice(-sequence.length);
        return sequence.every((key, index) => key === recentInputs[index]);
    }

    private getMaxTimeout(): number {
        return this.codes.length > 0 ? Math.max(...this.codes.map(c => c.timeout)) : 2000;
    }

    public registerCode(code: SecretCode): void {
        this.codes.push(code);
    }

    public removeCode(codeName: string): void {
        this.codes = this.codes.filter(c => c.name !== codeName);
    }

    public setActive(active: boolean): void {
        this.isActive = active;
    }

    private registerDefaultCodes(): void {
        this.registerCode({
            name: "konami",
            sequence: ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", 
                      "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", 
                      "KeyB", "KeyA"],
            timeout: 2000,
            effect: () => this.konamiEffect()
        });
        this.registerCode({
            name: "classic",
            sequence: ["KeyC", "KeyL", "KeyA", "KeyS", "KeyS", "KeyI", "KeyC"],
            timeout: 2000,
            effect: () => {
                this.menu.eventQueue.push({
                    type: 'CLASSIC_CLICK',
                    target: this.menu.classicButton,
                    buttonName: 'CLASSIC'
                });
            },
        });
        this.registerCode({
            name: "filter",
            sequence: ["KeyF", "KeyI", "KeyL", "KeyT", "KeyE", "KeyR", "KeyS"],
            timeout: 2000,
            effect: () => {
                this.menu.eventQueue.push({
                    type: 'FILTERS_CLICK',
                    target: this.menu.filtersButton,
                    buttonName: 'FILTERS'
                });
            },
        });
        this.registerCode({
            name: "quickstart",
            sequence: ["KeyQ", "KeyU", "KeyI", "KeyC", "KeyK", "KeyS", "KeyT", "KeyA", "KeyR", "KeyT"],
            timeout: 2000,
            effect: () => {
                this.menu.eventQueue.push({
                    type: 'PLAY_CLICK',
                    target: this.menu.playButton,
                    buttonName: 'PLAY'
                });
                this.menu.eventQueue.push({
                    type: 'IA_CLICK',
                    target: this.menu.IAButton,
                    buttonName: '1 VS IA'
                });
                this.menu.eventQueue.push({
                    type: 'START_CLICK',
                    target: this.menu.startButton,
                    buttonName: 'START'
                });
            },
        });
    }

    private konamiEffect(): void {
        this.menu.playSound('menuConfirm');
        
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const x = Math.random() * this.menu.width;
                const y = Math.random() * (this.menu.height * 0.6) + this.menu.height * 0.2;
                const color = getRandomGameColor(['black', 'particleGray']);
                
                MenuParticleSpawner.spawnFireworksExplosion(this.menu, x, y, color, 1.5);
            }, i * 300);
        }
    }

    cleanup(): void {
        this.setActive(false);
        document.removeEventListener('keydown', this.keydownHandler);
        this.codes = [];
        this.inputBuffer = [];
    }
}