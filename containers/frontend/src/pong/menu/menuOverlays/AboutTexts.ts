/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   AboutTexts.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/10 16:33:02 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/21 15:35:32 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Menu } from "../Menu";

import { Entity } from "../../engine/Entity";
import { TextComponent } from "../../components/TextComponent";
import { AnimationComponent } from "../../components/AnimationComponent";
import { GAME_COLORS } from "../../utils/Types";

export class AboutTexts extends Entity {
    private menu: Menu;
    private targetAlpha: number = 0;
    private currentAlpha: number = 0;
    private animationProgress: number = 0;
    private animationSpeed: number = 0.08;
    private isAnimating: boolean = false;
    private textComponents: TextComponent[] = [];

    constructor(menu: Menu, id: string, layer: string) {
        super(id, layer);
        
        this.menu = menu;

        this.createColumnTexts();

        const animationComponent = new AnimationComponent();
        this.addComponent(animationComponent, 'animation');

        this.textComponents.forEach(textComp => {
            textComp.getRenderable().alpha = 1;
        });
    }

    private createColumnTexts(): void {
        let columnData;
        
        if (this.menu.language === 'es') {
            columnData = this.getColumnDataES();
        } else if (this.menu.language === 'fr') {
            columnData = this.getColumnDataFR();
        } else if (this.menu.language == 'cat') {
            columnData = this.getColumnDataCAT();
        } else {
            columnData = this.getColumnDataEN();
        }
        
        columnData.forEach((columnText, index) => {
            const textComponent = new TextComponent(columnText);
            this.addComponent(textComponent, `text_${index}`);
            this.textComponents.push(textComponent);
        });
    }

    private getColumnDataEN() {
        return [
            // Column 1A: Team Title (Left)
            /* {
                tag: 'teamTitle',
                text: "----------------------[ TEAM ]----------------------",
                x: 120,
                y: 160,
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
            }, */

            // Column 1B: Team names 1 (Left)
            {
                tag: 'teamNamesOne',
                text: "Eva Ferré Mur\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Hugo Muñoz Gris",
                x: 190,
                y: 315,
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
                x: 160,
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
            x: 200,
            y: 340,
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
            x: 200,
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
            /* {
                tag: 'projectTitle',
                text: "------------------------------------------------------[ PROJECT ]-------------------------------------------------------",
                x: 650,
                y: 160,
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

            // Column 2B: Project content (Left)
            {
                tag: 'projectContent',
                text: "This humble Pong recreation was developed as part of the ft_transcendence project at 42 Barcelona. It was created in accordance with the mandatory requirements, on top of which several optional modules were implemented. The game can be played in either classic mode —a homage to the original Atari game designed by Nolan Bushnell and released in 1972— or its default extended mode, which includes a variety of additional features. These additions include:\n" +
                    "\u00A0\u00A0\u00A0\u00A0\u00A0-Power-ups and power-downs that affect paddle controls, movement, and abilities;\n\u00A0\u00A0\u00A0\u00A0\u00A0-Ball-changing pickups that modify the ball’s shape and behavior;\n\u00A0\u00A0\u00A0\u00A0\u00A0-Shifting and moving walls that reshape the game arena;\n\u00A0\u00A0\u00A0\u00A0\u00A0-Spawning obstacles that add a tactical layer to the gameplay.\n\n" +
                    "Beyond these features, the game supports local play —either 1v1, against an AI opponent or 8 concurrent player tournaments— and online 1v1 classic duels. All of this is available in both classic and extended modes, with additional options to toggle visual effects and filtering. The game is part of a larger project structure, a web design task set up as the final project of 42 school’s student common core. It is the result of an extensive group effort through several months, and among other requirements it is comprised of both front-end and back-end developments, in-depth dev-ops deployment with microservices, multi-language support, blockchain tracking of match results, live chat and meticulous user management. The full technology stack contains:\n" +
                    "\u00A0\u00A0\u00A0\u00A0\u00A0-Frontend: TypeScript, PIXI.js, Tailwind CSS\n\u00A0\u00A0\u00A0\u00A0\u00A0-Backend: Node.js, Fastify\n\u00A0\u00A0\u00A0\u00A0\u00A0-Database: SQLite\n\u00A0\u00A0\u00A0\u00A0\u00A0-DevOps & Monitoring: Docker, Prometheus, Grafana\n\u00A0\u00A0\u00A0\u00A0\u00A0-Blockchain: Avalanche, Solidity\n\n",
                x: 655,
                y: 190,
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
        ];
    }

    private getColumnDataES() {
        return [
            // Column 1A: Team Title (Left)
            /* {
                tag: 'teamTitle',
                text: "---------------------[ EQUIPO ]---------------------",
                x: 120,
                y: 160,
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
            }, */

            // Column 1B: Team names 1 (Left)
            {
                tag: 'teamNamesOne',
                text: "Eva Ferré Mur\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Hugo Muñoz Gris",
                x: 190,
                y: 315,
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
                x: 160,
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
            x: 200,
            y: 335,
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
            x: 200,
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
            /* {
                tag: 'projectTitle',
                text: "------------------------------------------------------[ PROYECTO ]------------------------------------------------------",
                x: 650,
                y: 160,
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

            // Column 2B: Project content (Left)
            {
                tag: 'projectContent',
                text: "Esta humilde recreación de Pong se desarrolló como parte del proyecto ft_transcendence en 42 Barcelona. Se creó siguiendo los requisitos obligatorios, sobre los que se implementaron varios módulos opcionales. El juego puede jugarse tanto en modo clásico -un homenaje al juego original de Atari diseñado por Nolan Bushnell y lanzado en 1972- como en su modo extendido, que incluye diversas características adicionales. Estas últimas incluyen:\n" +
                    "\u00A0\u00A0\u00A0\u00A0\u00A0-Power-ups y power-downs que afectan a los controles, movimientos y habilidades de las palas;\n\u00A0\u00A0\u00A0\u00A0\u00A0-Potenciadores que cambian la pelota, afectando su forma y comportamiento;\n\u00A0\u00A0\u00A0\u00A0\u00A0-Muros móviles y cambiantes que remodelan el terreno de juego;\n\u00A0\u00A0\u00A0\u00A0\u00A0-Obstáculos emergentes que añaden una capa táctica a la jugabilidad.\n\n" +
                    "Más allá de estas características, el juego admite partidas locales -ya sea 1v1, contra una IA o torneos de 8 jugadores concurrentes- y duelos en línea en modo clásico. Todo esto está disponible tanto en el modo clásico como en el extendido, con opciones adicionales para modifica los efectos visuales y el filtrado. El juego forma parte de una estructura mayor, un trabajo de diseño web planteado como proyecto final del curso común de 42, siendo el resultado de un extenso esfuerzo grupal a lo largo de varios meses. Entre otros requisitos se compone de desarrollos tanto front-end como back-end, despliegue de dev-ops con microservicios, soporte multi-lenguage, seguimiento de los resultados de los partidos mediante blockchain, chat en vivo y una meticulosa gestión de usuarios. La pila completa de tecnologías incluye:\n" +
                    "\u00A0\u00A0\u00A0\u00A0\u00A0-Frontend: TypeScript, PIXI.js, Tailwind CSS\n\u00A0\u00A0\u00A0\u00A0\u00A0-Backend: Node.js, Fastify\n\u00A0\u00A0\u00A0\u00A0\u00A0-Base de datos: SQLite\n\u00A0\u00A0\u00A0\u00A0\u00A0-DevOps & Monitoreo: Docker, Prometheus, Grafana\n\u00A0\u00A0\u00A0\u00A0\u00A0-Blockchain: Avalanche, Solidity\n\n",
                x: 655,
                y: 190,
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
        ];
    }

    private getColumnDataFR() {
        return [
            // Column 1A: Team Title (Left)
            /* {
                tag: 'teamTitle',
                text: "---------------------[ ÉQUIPE ]---------------------",
                x: 120,
                y: 160,
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
            }, */

            // Column 1B: Team names 1 (Left)
            {
                tag: 'teamNamesOne',
                text: "Eva Ferré Mur\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Hugo Muñoz Gris",
                x: 190,
                y: 310,
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
                x: 160,
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
            x: 200,
            y: 335,
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
            x: 200,
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
            /* {
                tag: 'projectTitle',
                text: "-------------------------------------------------------[ PROJET ]-------------------------------------------------------",
                x: 650,
                y: 160,
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

            // Column 2B: Project content (Left)
            {
                tag: 'projectContent',
                text: "Cette humble recréation de Pong a été développée dans le cadre du projet ft_transcendence à 42 Barcelone. Elle a été réalisée en respectant les exigences obligatoires, sur lesquelles plusieurs modules optionnels ont été ajoutés. Le jeu peut être joué aussi bien en mode classique — un hommage au jeu original d’Atari conçu par Nolan Bushnell et sorti en 1972 — qu’en mode étendu, qui propose de nombreuses fonctionnalités supplémentaires. Celles-ci incluent notamment:\n" +
                    "\u00A0\u00A0\u00A0\u00A0\u00A0-Des power-ups et power-downs qui modifient les contrôles, les mouvements et les capacités des raquettes;\n\u00A0\u00A0\u00A0\u00A0\u00A0-Des objets modificateurs de balle, qui altèrent sa forme et son comportement;\n\u00A0\u00A0\u00A0\u00A0\u00A0-Des murs mobiles et changeants qui transforment l’arène de jeu;\n\u00A0\u00A0\u00A0\u00A0\u00A0-Des obstacles dynamiques qui ajoutent une dimension tactique à la partie.\n\n" +
                    "Au-delà de ces fonctionnalités, le jeu prend en charge les matchs locaux - 1v1, 1vAI ou tournois avec 8 joueurs simultanés - et les matchs 1v1 en ligne en mode classique. Tout cela est disponible dans les modes classique et étendu, avec des options supplémentaires pour modifier les effets visuels et le filtrage. Le jeu fait partie d'une structure plus large, un travail de conception web en tant que projet final du cours commun de 42, étant le résultat d'un effort de groupe considérable sur plusieurs mois. Entre autres exigences, il consiste en un développement front-end et back-end, un déploiement dev-ops avec des microservices, un support multilingue, un suivi des résultats des matchs basé sur la blockchain, un chat en direct et une gestion méticuleuse des utilisateurs. La stack technologique complète comprend:\n" +
                    "\u00A0\u00A0\u00A0\u00A0\u00A0-Frontend: TypeScript, PIXI.js, Tailwind CSS\n\u00A0\u00A0\u00A0\u00A0\u00A0-Backend: Node.js, Fastify\n\u00A0\u00A0\u00A0\u00A0\u00A0-Base de données: SQLite\n\u00A0\u00A0\u00A0\u00A0\u00A0-DevOps & Monitoring: Docker, Prometheus, Grafana\n\u00A0\u00A0\u00A0\u00A0\u00A0-Blockchain: Avalanche, Solidity\n\n",
                x: 655,
                y: 190,
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
        ];
    }

    private getColumnDataCAT() {
        return [
            // Column 1A: Team Title (Left)
            /* {
                tag: 'teamTitle',
                text: "----------------------[ EQUIP ]---------------------",
                x: 120,
                y: 160,
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
            }, */

            // Column 1B: Team names 1 (Left)
            {
                tag: 'teamNamesOne',
                text: "Eva Ferré Mur\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Hugo Muñoz Gris",
                x: 190,
                y: 310,
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
                x: 160,
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
            x: 200,
            y: 335,
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
            x: 200,
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
            /* {
                tag: 'projectTitle',
                text: "------------------------------------------------------[ PROJECTE ]------------------------------------------------------",
                x: 650,
                y: 160,
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

            // Column 2B: Project content (Left)
            {
                tag: 'projectContent',
                text:"Aquesta humil recreació de Pong es va desenvolupar com a part del projecte ft_*transcendence en 42 Barcelona. Es va crear seguint els requisits obligatoris, sobre els que es van implementar diversos mòduls opcionals. El joc pot jugar-se tant en mode clàssic -un homenatge al joc original d'Atari dissenyat per Nolan Bushnell i llançat en 1972- com en el seu mode estès, que inclou diverses característiques addicionals. Aquestes últimes inclouen:\n" +
                    "\u00A0\u00A0\u00A0\u00A0\u00A0-Power-ups i power-downs que afecten els controls, moviments i habilitats de les pales;\n\u00A0\u00A0\u00A0\u00A0\u00A0-Potenciadors que canvien la pilota, afectant la seva forma i comportament;\n\u00A0\u00A0\u00A0\u00A0\u00A0-Murs mòbils i canviants que remodelen el terreny de joc;\n\u00A0\u00A0\u00A0\u00A0\u00A0-Obstacles emergents que afegeixen una capa tàctica a la jugabilitat.\n\n" +
                    "Més enllà d'aquestes característiques, el joc admet partides locals -sigui 1v1, 1vIA o tornejos amb 8 jugadors simultanis- i duels en línia en modo clàssic. Tot això està disponible tant en el mode clàssic com en l'estès, amb opcions addicionals per a modificar els efectes visuals i el filtratge. El joc forma part d'una estructura major, un treball de disseny web plantejat com a projecte final del curs comú de 42, sent el resultat d'un extens esforç grupal al llarg de diversos mesos. Entre altres requisits es compon de desenvolupaments tant front-end com back-end, desplegament de dev-ops amb microserveis, suport multi llenguatge, seguiment dels resultats dels partits mitjançant blockchain, xat en viu i una meticulosa gestió d'usuaris. La pila completa de tecnologies inclou:\n" +
                    "\u00A0\u00A0\u00A0\u00A0\u00A0-Frontend: TypeScript, PIXI.js, Tailwind CSS\n\u00A0\u00A0\u00A0\u00A0\u00A0-Backend: Node.js, Fastify\n\u00A0\u00A0\u00A0\u00A0\u00A0-Base de dades: SQLite\n\u00A0\u00A0\u00A0\u00A0\u00A0-DevOps & Monitoreo: Docker, Prometheus, Grafana\n\u00A0\u00A0\u00A0\u00A0\u00A0-Blockchain: Avalanche, Solidity\n\n",
                x: 655,
                y: 190,
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
            const columnData = this.getColumnDataEN(); //!OJO
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

