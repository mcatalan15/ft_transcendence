/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   AboutTexts.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/10 16:33:02 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/16 18:44:00 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Entity } from "../../engine/Entity";
import { TextComponent } from "../../components/TextComponent";
import { AnimationComponent } from "../../components/AnimationComponent";
import { GAME_COLORS } from "../../utils/Types";

export class AboutTexts extends Entity {
    private targetAlpha: number = 0;
    private currentAlpha: number = 0;
    private animationProgress: number = 0;
    private animationSpeed: number = 0.08;
    private isAnimating: boolean = false;
    private textComponents: TextComponent[] = [];

    constructor(id: string, layer: string) {
        super(id, layer);
        
        this.createColumnTexts();

        const animationComponent = new AnimationComponent();
        this.addComponent(animationComponent, 'animation');

        this.textComponents.forEach(textComp => {
            textComp.getRenderable().alpha = 1;
        });
    }

    private createColumnTexts(): void {
        const columnData = this.getColumnData();
        
        columnData.forEach((columnText, index) => {
            const textComponent = new TextComponent(columnText);
            this.addComponent(textComponent, `text_${index}`);
            this.textComponents.push(textComponent);
        });
    }

    private getColumnData() {
        return [
            // Column 1A: Team Title (Left)
            {
                tag: 'teamTitle',
                text: "----------------------[ TEAM ]----------------------",
                x: 120,
                y: 120,
                style: {
                    fill: GAME_COLORS.menuPink,
                    fontSize: 13,
                    fontWeight: 'bolder' as const,
                    align: 'left' as const,
                    wordWrap: true,
                    wordWrapWidth: 480,
                    breakWords: true,
                    lineHeight: 10,
                    fontFamily: '"Roboto Mono", monospace',
                    letterSpacing: 0.5,
                },
                anchor: { x: 0, y: 0 },
                rotation: 0,
            },

            // Column 1B: Team names 1 (Left)
            {
                tag: 'teamNamesOne',
                text: "Eva Ferré Mur\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Hugo Muñoz Gris",
                x: 175,
                y: 285,
                style: {
                    fill: GAME_COLORS.white,
                    fontSize: 12,
                    fontWeight: 'bold' as const,
                    align: 'center' as const,
                    wordWrap: true,
                    wordWrapWidth: 450,
                    breakWords: true,
                    lineHeight: 140,
                    fontFamily: '"Roboto Mono", monospace',
                    letterSpacing: 0.5,
                },
                anchor: { x: 0, y: 0 },
                rotation: 0,
            },

            // Column 1C: Team names 2 (Left)
            {
                tag: 'teamNamesTwo',
                text: "Marc Catalán Sánchez\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Nicolas Ponchon",
                x: 150,
                y: 550,
                style: {
                    fill: GAME_COLORS.white,
                    fontSize: 12,
                    fontWeight: 'bold' as const,
                    align: 'center' as const,
                    wordWrap: true,
                    wordWrapWidth: 450,
                    breakWords: true,
                    lineHeight: 140,
                    fontFamily: '"Roboto Mono", monospace',
                    letterSpacing: 0.5,
                },
                anchor: { x: 0, y: 0 },
                rotation: 0,
            },

            // Column 1D: Team logins 1 (Left)
            {
            tag: 'teamLoginsOne',
            text: "42@eferre-m\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A042@hmunoz-g",
            x: 190,
            y: 310,
            style: {
                fill: GAME_COLORS.white,
                fontSize: 10,
                fontWeight: 'lighter' as const,
                align: 'left' as const,
                wordWrap: true,
                wordWrapWidth: 450,
                breakWords: true,
                lineHeight: 120,
                fontFamily: '"Roboto Mono", monospace',
                letterSpacing: 0.5,
            },
            anchor: { x: 0, y: 0 },
            rotation: 0,
            },

            // Column 1D: Team logins 2 (Left)
            {
            tag: 'teamLoginsTwo',
            text: "42@mcatalan\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A042@nponchon",
            x: 185,
            y: 575,
            style: {
                fill: GAME_COLORS.white,
                fontSize: 10,
                fontWeight: 'lighter' as const,
                align: 'left' as const,
                wordWrap: true,
                wordWrapWidth: 450,
                breakWords: true,
                lineHeight: 120,
                fontFamily: '"Roboto Mono", monospace',
                letterSpacing: 0.5,
            },
            anchor: { x: 0, y: 0 },
            rotation: 0,
            },

            // Column 2A: Project Title (Left)
            {
                tag: 'projectTitle',
                text: "------------------------------------------------------[ PROJECT ]-------------------------------------------------------",
                x: 650,
                y: 120,
                style: {
                    fill: GAME_COLORS.menuPink,
                    fontSize: 13,
                    fontWeight: 'bolder' as const,
                    align: 'left' as const,
                    wordWrap: true,
                    wordWrapWidth: 1500,
                    breakWords: true,
                    lineHeight: 10,
                    fontFamily: '"Roboto Mono", monospace',
                    letterSpacing: 0.5,
                },
                anchor: { x: 0, y: 0 },
                rotation: 0,
            },

            // Column 2B: Project content (Left)
            {
                tag: 'projectContent',
                text: "This humble Pong recreation was developed as part of the ft_transcendence project at 42 Barcelona. It was created in accordance with the mandatory requirements, on top of which several optional modules were implemented. The game can be played in either classic mode —a homage to the original Atari game designed by Nolan Bushnell and released in 1972— or its default extended mode, which includes a variety of additional features. These additions include:\n\n" +
                    "\u00A0\u00A0\u00A0\u00A0\u00A0-power-ups and power-downs that affect paddle controls, movement, and abilities;\n\u00A0\u00A0\u00A0\u00A0\u00A0-ball-changing pickups that modify the ball’s shape and behavior;\n\u00A0\u00A0\u00A0\u00A0\u00A0-shifting and moving walls that reshape the arena;\n\u00A0\u00A0\u00A0\u00A0\u00A0-and spawning obstacles that add a tactical layer to the gameplay.\n\n" +
                    "Beyond these features, the game supports local play —either 1v1 or against an AI opponent— and online multiplayer, ranging from 1v1 matches to tournaments with up to 8 concurrent players. All of this is available in both classic and extended modes, with additional options to toggle visual effects and filtering. The game is part of a larger project structure, a web design task set up as the final project of 42 school’s student common core. It is the result of an extensive group effort through several months, and among other requirements it is comprised of both front-end and back-end developments, in-depth dev-ops deployment with microservices, multi-language support, blockchain tracking of match results, live chat and meticulous user management. The full technology stack contains:\n\n" +
                    "\u00A0\u00A0\u00A0\u00A0\u00A0-Frontend: TypeScript, PIXI.js, Tailwind CSS\n\u00A0\u00A0\u00A0\u00A0\u00A0-Backend: Node.js, Fastify\n\u00A0\u00A0\u00A0\u00A0\u00A0-Database: SQLite\n\u00A0\u00A0\u00A0\u00A0\u00A0-DevOps & Monitoring: Docker, Prometheus, Grafana\n\u00A0\u00A0\u00A0\u00A0\u00A0-Blockchain: Avalanche, Solidity\n\n",
                x: 650,
                y: 160,
                style: {
                    fill: GAME_COLORS.white,
                    fontSize: 13,
                    fontWeight: 'bolder' as const,
                    align: 'justify' as const,
                    wordWrap: true,
                    wordWrapWidth: 1000,
                    breakWords: true,
                    lineHeight: 20,
                    fontFamily: '"Roboto Mono", monospace',
                    letterSpacing: 0.5,
                },
                anchor: { x: 0, y: 0 },
                rotation: 0,
            },

            // Column 3A: Extra Credits Title (Left)
            /* {
                tag: 'extraCreditsTitle',
                text: "--------------------------------------------[ ADDITIONAL INFO AND CREDITS ]---------------------------------------------",
                x: 650,
                y: 500,
                style: {
                    fill: GAME_COLORS.menuPink,
                    fontSize: 13,
                    fontWeight: 'bolder' as const,
                    align: 'left' as const,
                    wordWrap: true,
                    wordWrapWidth: 1500,
                    breakWords: true,
                    lineHeight: 10,
                    fontFamily: '"Roboto Mono", monospace',
                    letterSpacing: 0.5,
                },
                anchor: { x: 0, y: 0 },
                rotation: 0,
            }, */
        ];
    }

    public fadeIn(): void {
        this.targetAlpha = 1;
        this.animationProgress = 0;
        this.isAnimating = true;
    }

    public fadeOut(): void {
        this.targetAlpha = 0;
        this.animationProgress = 0;
        this.isAnimating = true;
    }

    public redrawAboutTitles(classicMode: boolean): void {
        const titleColor = classicMode ? GAME_COLORS.white : GAME_COLORS.menuPink;
        
        this.textComponents.forEach((textComponent, index) => {
            const columnData = this.getColumnData();
            const correspondingData = columnData[index];
            
            if (correspondingData && correspondingData.tag.includes('Title')) {
                const renderable = textComponent.getRenderable();
                if (renderable && renderable.style) {
                    renderable.style.fill = titleColor;
                }
            }
        });
    }

    public isAnimationComplete(): boolean {
        return !this.isAnimating;
    }

    public getIsAnimating(): boolean {
        return this.isAnimating;
    }

    public getCurrentAlpha(): number {
        return this.currentAlpha;
    }


    public getAllRenderables(): any[] {
        return this.textComponents.map(comp => comp.getRenderable());
    }
}

