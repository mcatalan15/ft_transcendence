/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   GlossaryTexts.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/10 16:33:02 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/20 11:48:16 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Menu } from "../Menu";
import { Entity } from "../../engine/Entity";
import { TextComponent } from "../../components/TextComponent";
import { GAME_COLORS } from "../../utils/Types";

export class GlossaryTexts extends Entity {
    private menu: Menu;
    private currentAlpha: number = 0;
    private isAnimating: boolean = false;
    private textComponents: TextComponent[] = [];

    constructor(menu: Menu, id: string, layer: string) {
        super(id, layer);

        this.menu = menu;
        
        this.createColumnTexts();
        
        this.textComponents.forEach(textComp => {
            textComp.getRenderable().alpha = 0;
        });
    }

    private createColumnTexts(): void {
        let columnData;

        if (this.menu.language === 'es') {
            columnData = this.getColumnDataES();
        } else if (this.menu.language === 'fr') {
            columnData = this.getColumnDataFR();
        } else if (this.menu.language === 'cat') {
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
            // Column 1A: Powerups Title (Left)
            {
                tag: 'powerupsTitle',
                text: "----------------------[ POWERUPS ]----------------------",
                x: 120,
                y: 160,
                style: {
                    fill: GAME_COLORS.menuOrange,
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

            // Column 1B: Powerups Content (Left)
            {
                tag: 'powerupsContent',
                text: 
                      "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Doubles the size of the paddle\n" + 
                      "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Makes the paddle attract balls\n" + 
                      "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Spawns a protecting shield behind the paddle\n" +
                      "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Makes the paddle shoot 3 stunning projectiles\n",
                x: 120,
                y: 180,
                style: {
                    fill: GAME_COLORS.white,
                    fontSize: 12,
                    fontWeight: 'lighter' as const,
                    align: 'left' as const,
                    wordWrap: true,
                    wordWrapWidth: 450,
                    breakWords: true,
                    lineHeight: 71,
                    fontFamily: '"Roboto Mono", monospace',
                    letterSpacing: 0.5,
                },
                anchor: { x: 0, y: 0 },
                rotation: 0,
            },

            // Column 2A: Powerdowns Title (Center)
            {
                tag: 'powerdownsTitle',
                text: "---------------------[ POWERDOWNS ]---------------------" ,
                x: 650,
                y: 160,
                style: {
                    fill: GAME_COLORS.menuOrange,
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

            // Column 2B: Powerdowns Content (Center)
            {
                tag: 'powerdownsContent',
                text: 
                      "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Halves the size of the paddle\n" + 
                      "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Inverts control directions of the paddle\n" + 
                      "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Flattens all the paddle's ball returns\n" +
                      "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Slows down the paddle's movements\n",
                x: 650,
                y: 180,
                style: {
                    fill: GAME_COLORS.white,
                    fontSize: 12,
                    fontWeight: 'lighter' as const,
                    align: 'left' as const,
                    wordWrap: true,
                    wordWrapWidth: 450,
                    breakWords: true,
                    lineHeight: 71,
                    fontFamily: '"Roboto Mono", monospace',
                    letterSpacing: 0.5,
                },
                anchor: { x: 0, y: 0 },
                rotation: 0,
            },

            // Column 3A: Ball Changes Title (Right)
            {
                tag: 'ballchangesTitle',
                text: "--------------------[ BALL CHANGES ]--------------------",
                x: 1200,
                y: 160,
                style: {
                    fill: GAME_COLORS.menuOrange,
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

            // Column 3B: Ball Changes Content (Right)
            {
                tag: 'ballchangesContent',
                text: 
                      "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Spawns an egg-shaped curved-trajectory ball\n" + 
                      "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Spawns a spinning square-shaped ball\n" + 
                      "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Spawns an arrow-like burst ball\n" +
                      "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Spawns multiple tiny balls with decoys\n",
                x: 1200,
                y: 180,
                style: {
                    fill: GAME_COLORS.white,
                    fontSize: 12,
                    fontWeight: 'lighter' as const,
                    align: 'left' as const,
                    wordWrap: true,
                    wordWrapWidth: 450,
                    breakWords: true,
                    lineHeight: 70,
                    fontFamily: '"Roboto Mono", monospace',
                    letterSpacing: 0.5,
                },
                anchor: { x: 0, y: 0 },
                rotation: 0,
            },

            // Column 4A: Affectations title (Down - Left)
            {
                tag: 'affectationsTitle',
                text: "--------------------[ AFFECTATIONS ]--------------------",
                x: 120,
                y: 470,
                style: {
                    fill: GAME_COLORS.menuOrange,
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

            // Column 4B: Affectations content (Down - Left)
            {
                tag: 'affectationsContent',
                text: 
                      "Affected paddles change visually when they collect a powerup or a powerdown.\n\n" + 
                      "Their affectation timer is tracked by the bar at the bottom of their side of the screen.",
                x: 240,
                y: 510,
                style: {
                    fill: GAME_COLORS.white,
                    fontSize: 12,
                    fontWeight: 'lighter' as const,
                    align: 'left' as const,
                    wordWrap: true,
                    wordWrapWidth: 335,
                    breakWords: true,
                    lineHeight: 20,
                    fontFamily: '"Roboto Mono", monospace',
                    letterSpacing: 0.5,
                },
                anchor: { x: 0, y: 0 },
                rotation: 0,
            },

            // Column 5A: Wall shapes (Down - center/right)
            {
                tag: 'wallShapesTitle',
                text: "----------------------------------------------------[ WALL FIGURES ]----------------------------------------------------",
                x: 650,
                y: 470,
                style: {
                    fill: GAME_COLORS.menuOrange,
                    fontSize: 13,
                    fontWeight: 'bolder' as const,
                    align: 'left' as const,
                    wordWrap: true,
                    wordWrapWidth: 1000,
                    breakWords: true,
                    lineHeight: 10,
                    fontFamily: '"Roboto Mono", monospace',
                    letterSpacing: 0.5,
                },
                anchor: { x: 0, y: 0 },
                rotation: 0,
            },

            // Column 5B: Wall shapes (Down - center/right)
            {
                tag: 'wallShapesContent',
                text: 
                      "Walls change, warp and move over time, affecting the balls' paths and trajectories.\n\n" + 
                      "Sometimes, blocking figures spawn in the middle of the arena as solid obstacles.",
                x: 670,
                y: 510,
                style: {
                    fill: GAME_COLORS.white,
                    fontSize: 12,
                    fontWeight: 'lighter' as const,
                    align: 'left' as const,
                    wordWrap: true,
                    wordWrapWidth: 335,
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
            // Column 1A: Powerups Title (Left)
            {
                tag: 'powerupsTitle',
                text: "----------------------[ POWERUPS ]----------------------",
                x: 120,
                y: 160,
                style: {
                    fill: GAME_COLORS.menuOrange,
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

            // Column 1B: Powerups Content (Left)
            {
                tag: 'powerupsContent',
                text: 
                      "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Dobla el tamaño de la pala\n" + 
                      "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Magnetiza la pala\n" + 
                      "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Invoca un escudo protector detrás de la pala\n" +
                      "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Hace que la pala dispare 3 proyectiles aturdidores\n",
                x: 120,
                y: 180,
                style: {
                    fill: GAME_COLORS.white,
                    fontSize: 12,
                    fontWeight: 'lighter' as const,
                    align: 'left' as const,
                    wordWrap: true,
                    wordWrapWidth: 510,
                    breakWords: true,
                    lineHeight: 71,
                    fontFamily: '"Roboto Mono", monospace',
                    letterSpacing: 0.5,
                },
                anchor: { x: 0, y: 0 },
                rotation: 0,
            },

            // Column 2A: Powerdowns Title (Center)
            {
                tag: 'powerdownsTitle',
                text: "---------------------[ POWERDOWNS ]---------------------" ,
                x: 650,
                y: 160,
                style: {
                    fill: GAME_COLORS.menuOrange,
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

            // Column 2B: Powerdowns Content (Center)
            {
                tag: 'powerdownsContent',
                text: 
                      "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Reduce a la mitad el tamaño de la pala\n" + 
                      "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Invierte las direcciones de control de la pala\n" + 
                      "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Aplana todas las devoluciones de la pala\n" +
                      "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Ralentiza la velocidad de la pala\n",
                x: 650,
                y: 180,
                style: {
                    fill: GAME_COLORS.white,
                    fontSize: 12,
                    fontWeight: 'lighter' as const,
                    align: 'left' as const,
                    wordWrap: true,
                    wordWrapWidth: 450,
                    breakWords: true,
                    lineHeight: 71,
                    fontFamily: '"Roboto Mono", monospace',
                    letterSpacing: 0.5,
                },
                anchor: { x: 0, y: 0 },
                rotation: 0,
            },

            // Column 3A: Ball Changes Title (Right)
            {
                tag: 'ballchangesTitle',
                text: "------------------[ CAMBIOS DE PELOTA ]-----------------",
                x: 1200,
                y: 160,
                style: {
                    fill: GAME_COLORS.menuOrange,
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

            // Column 3B: Ball Changes Content (Right)
            {
                tag: 'ballchangesContent',
                text: 
                      "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Genera un huevo de trayectoria curva\n" + 
                      "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Genera una cuadrado giratorio\n" + 
                      "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Genera una flecha explosiva\n" +
                      "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Genera varias pelotas pequeñas con señuelos\n",
                x: 1200,
                y: 180,
                style: {
                    fill: GAME_COLORS.white,
                    fontSize: 12,
                    fontWeight: 'lighter' as const,
                    align: 'left' as const,
                    wordWrap: true,
                    wordWrapWidth: 450,
                    breakWords: true,
                    lineHeight: 70,
                    fontFamily: '"Roboto Mono", monospace',
                    letterSpacing: 0.5,
                },
                anchor: { x: 0, y: 0 },
                rotation: 0,
            },

            // Column 4A: Affectations title (Down - Left)
            {
                tag: 'affectationsTitle',
                text: "--------------------[ AFECTACIONES ]--------------------",
                x: 120,
                y: 470,
                style: {
                    fill: GAME_COLORS.menuOrange,
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

            // Column 4B: Affectations content (Down - Left)
            {
                tag: 'affectationsContent',
                text: 
                      "Las palas afectadas cambian visualmente al recoger un power-up o un power-down.\n\n" + 
                      "El tiempo restante del efecto se muestra en la barra de la parte inferior de su lado de pantalla.",
                x: 240,
                y: 510,
                style: {
                    fill: GAME_COLORS.white,
                    fontSize: 12,
                    fontWeight: 'lighter' as const,
                    align: 'left' as const,
                    wordWrap: true,
                    wordWrapWidth: 335,
                    breakWords: true,
                    lineHeight: 20,
                    fontFamily: '"Roboto Mono", monospace',
                    letterSpacing: 0.5,
                },
                anchor: { x: 0, y: 0 },
                rotation: 0,
            },

            // Column 5A: Wall shapes (Down - center/right)
            {
                tag: 'wallShapesTitle',
                text: "------------------------------------------------[ FIGURAS DE LOS MUROS ]------------------------------------------------",
                x: 650,
                y: 470,
                style: {
                    fill: GAME_COLORS.menuOrange,
                    fontSize: 13,
                    fontWeight: 'bolder' as const,
                    align: 'left' as const,
                    wordWrap: true,
                    wordWrapWidth: 1000,
                    breakWords: true,
                    lineHeight: 10,
                    fontFamily: '"Roboto Mono", monospace',
                    letterSpacing: 0.5,
                },
                anchor: { x: 0, y: 0 },
                rotation: 0,
            },

            // Column 5B: Wall shapes (Down - center/right)
            {
                tag: 'wallShapesContent',
                text: 
                      "Los muros cambian, se deforman y se mueven con el tiempo, afectando las trayectorias de las pelotas.\n\n" + 
                      "A veces, aparecen figuras en el centro de la arena como obstáculos sólidos.",
                x: 670,
                y: 510,
                style: {
                    fill: GAME_COLORS.white,
                    fontSize: 12,
                    fontWeight: 'lighter' as const,
                    align: 'left' as const,
                    wordWrap: true,
                    wordWrapWidth: 335,
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
            // Column 1A: Powerups Title (Left)
            {
                tag: 'powerupsTitle',
                text: "----------------------[ POWERUPS ]----------------------",
                x: 120,
                y: 160,
                style: {
                    fill: GAME_COLORS.menuOrange,
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

            // Column 1B: Powerups Content (Left)
            {
                tag: 'powerupsContent',
                text: 
                      "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Double la taille de la raquette\n" + 
                      "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Fait que la raquette attire les balles\n" + 
                      "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Génère un bouclier derrière la raquette\n" +
                      "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0La raquette tire 3 projectiles étourdissants\n",
                x: 120,
                y: 180,
                style: {
                    fill: GAME_COLORS.white,
                    fontSize: 12,
                    fontWeight: 'lighter' as const,
                    align: 'left' as const,
                    wordWrap: true,
                    wordWrapWidth: 450,
                    breakWords: true,
                    lineHeight: 71,
                    fontFamily: '"Roboto Mono", monospace',
                    letterSpacing: 0.5,
                },
                anchor: { x: 0, y: 0 },
                rotation: 0,
            },

            // Column 2A: Powerdowns Title (Center)
            {
                tag: 'powerdownsTitle',
                text: "---------------------[ POWERDOWNS ]---------------------" ,
                x: 650,
                y: 160,
                style: {
                    fill: GAME_COLORS.menuOrange,
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

            // Column 2B: Powerdowns Content (Center)
            {
                tag: 'powerdownsContent',
                text: 
                      "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Réduit la taille de la raquette de moitié\n" + 
                      "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Inverse les contrôles de la raquette\n" + 
                      "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Aplatis tous les renvois de la raquette\n" +
                      "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Ralentit les mouvements de la raquette\n",
                x: 650,
                y: 180,
                style: {
                    fill: GAME_COLORS.white,
                    fontSize: 12,
                    fontWeight: 'lighter' as const,
                    align: 'left' as const,
                    wordWrap: true,
                    wordWrapWidth: 450,
                    breakWords: true,
                    lineHeight: 71,
                    fontFamily: '"Roboto Mono", monospace',
                    letterSpacing: 0.5,
                },
                anchor: { x: 0, y: 0 },
                rotation: 0,
            },

            // Column 3A: Ball Changes Title (Right)
            {
                tag: 'ballchangesTitle',
                text: "----------------[ CHANGEMENTS DE BALLE ]----------------",
                x: 1200,
                y: 160,
                style: {
                    fill: GAME_COLORS.menuOrange,
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

            // Column 3B: Ball Changes Content (Right)
            {
                tag: 'ballchangesContent',
                text: 
                      "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Génère un œuf avec une trajectoire courbe\n" + 
                      "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Génère un carrée en rotation\n" + 
                      "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Génère une flèche avec une poussée rapide\n" +
                      "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Génère plusieurs petites balles et leurres\n",
                x: 1200,
                y: 180,
                style: {
                    fill: GAME_COLORS.white,
                    fontSize: 12,
                    fontWeight: 'lighter' as const,
                    align: 'left' as const,
                    wordWrap: true,
                    wordWrapWidth: 450,
                    breakWords: true,
                    lineHeight: 70,
                    fontFamily: '"Roboto Mono", monospace',
                    letterSpacing: 0.5,
                },
                anchor: { x: 0, y: 0 },
                rotation: 0,
            },

            // Column 4A: Affectations title (Down - Left)
            {
                tag: 'affectationsTitle',
                text: "--------------------[ AFFECTATIONS ]--------------------",
                x: 120,
                y: 470,
                style: {
                    fill: GAME_COLORS.menuOrange,
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

            // Column 4B: Affectations content (Down - Left)
            {
                tag: 'affectationsContent',
                text: 
                      "Les raquettes affectées changent visuellement lorsqu’elles collectent un bonus ou un malus.\n\n" + 
                      "La durée de l’effet est indiquée par la barre située en bas de leur côté de l’écran.",
                x: 240,
                y: 510,
                style: {
                    fill: GAME_COLORS.white,
                    fontSize: 12,
                    fontWeight: 'lighter' as const,
                    align: 'left' as const,
                    wordWrap: true,
                    wordWrapWidth: 335,
                    breakWords: true,
                    lineHeight: 20,
                    fontFamily: '"Roboto Mono", monospace',
                    letterSpacing: 0.5,
                },
                anchor: { x: 0, y: 0 },
                rotation: 0,
            },

            // Column 5A: Wall shapes (Down - center/right)
            {
                tag: 'wallShapesTitle',
                text: "--------------------------------------------------[ FIGURES MURALES ]---------------------------------------------------",
                x: 650,
                y: 470,
                style: {
                    fill: GAME_COLORS.menuOrange,
                    fontSize: 13,
                    fontWeight: 'bolder' as const,
                    align: 'left' as const,
                    wordWrap: true,
                    wordWrapWidth: 1000,
                    breakWords: true,
                    lineHeight: 10,
                    fontFamily: '"Roboto Mono", monospace',
                    letterSpacing: 0.5,
                },
                anchor: { x: 0, y: 0 },
                rotation: 0,
            },

            // Column 5B: Wall shapes (Down - center/right)
            {
                tag: 'wallShapesContent',
                text: 
                      "Les murs changent, se déforment et se déplacent avec le temps, influençant les trajectoires des balles.\n\n" + 
                      "Parfois, des formes bloquantes apparaissent au centre de l’arène en tant qu’obstacles solides.",
                x: 670,
                y: 510,
                style: {
                    fill: GAME_COLORS.white,
                    fontSize: 12,
                    fontWeight: 'lighter' as const,
                    align: 'left' as const,
                    wordWrap: true,
                    wordWrapWidth: 335,
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
            // Column 1A: Powerups Title (Left)
            {
                tag: 'powerupsTitle',
                text: "----------------------[ POWERUPS ]----------------------",
                x: 120,
                y: 160,
                style: {
                    fill: GAME_COLORS.menuOrange,
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

            // Column 1B: Powerups Content (Left)
            {
                tag: 'powerupsContent',
                text: 
                      "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Doble la mida de la pala\n" + 
                      "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Fa que la pala atregui pilotes\n" + 
                      "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Genera un escut protector darrere de la pala\n" +
                      "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Fa que la pala dispari 3 projectils atordidors\n",
                x: 120,
                y: 180,
                style: {
                    fill: GAME_COLORS.white,
                    fontSize: 12,
                    fontWeight: 'lighter' as const,
                    align: 'left' as const,
                    wordWrap: true,
                    wordWrapWidth: 450,
                    breakWords: true,
                    lineHeight: 71,
                    fontFamily: '"Roboto Mono", monospace',
                    letterSpacing: 0.5,
                },
                anchor: { x: 0, y: 0 },
                rotation: 0,
            },

            // Column 2A: Powerdowns Title (Center)
            {
                tag: 'powerdownsTitle',
                text: "---------------------[ POWERDOWNS ]---------------------" ,
                x: 650,
                y: 160,
                style: {
                    fill: GAME_COLORS.menuOrange,
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

            // Column 2B: Powerdowns Content (Center)
            {
                tag: 'powerdownsContent',
                text: 
                      "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Redueix a la meitat la grandària de la pala\n" + 
                      "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Inverteix les direccions de control de la pala\n" + 
                      "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Aplana totes les devolucions de la pala\n" +
                      "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Alenteix la velocitat de la pala\n",
                x: 650,
                y: 180,
                style: {
                    fill: GAME_COLORS.white,
                    fontSize: 12,
                    fontWeight: 'lighter' as const,
                    align: 'left' as const,
                    wordWrap: true,
                    wordWrapWidth: 450,
                    breakWords: true,
                    lineHeight: 71,
                    fontFamily: '"Roboto Mono", monospace',
                    letterSpacing: 0.5,
                },
                anchor: { x: 0, y: 0 },
                rotation: 0,
            },

            // Column 3A: Ball Changes Title (Right)
            {
                tag: 'ballchangesTitle',
                text: "-------------------[ CANVIS DE BOLA ]-------------------",
                x: 1200,
                y: 160,
                style: {
                    fill: GAME_COLORS.menuOrange,
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

            // Column 3B: Ball Changes Content (Right)
            {
                tag: 'ballchangesContent',
                text: 
                      "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Genera un ou de trajectòria corba\n" + 
                      "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Genera una quadrat giratori\n" + 
                      "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Genera una fletxa explosiva\n" +
                      "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Genera diverses pilotes petites amb cimbells\n",
                x: 1200,
                y: 180,
                style: {
                    fill: GAME_COLORS.white,
                    fontSize: 12,
                    fontWeight: 'lighter' as const,
                    align: 'left' as const,
                    wordWrap: true,
                    wordWrapWidth: 450,
                    breakWords: true,
                    lineHeight: 70,
                    fontFamily: '"Roboto Mono", monospace',
                    letterSpacing: 0.5,
                },
                anchor: { x: 0, y: 0 },
                rotation: 0,
            },

            // Column 4A: Affectations title (Down - Left)
            {
                tag: 'affectationsTitle',
                text: "---------------------[ AFECTACIONS ]--------------------",
                x: 120,
                y: 470,
                style: {
                    fill: GAME_COLORS.menuOrange,
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

            // Column 4B: Affectations content (Down - Left)
            {
                tag: 'affectationsContent',
                text: 
                      "Les pales afectades canvien visualment quan recullen una potenciació o un retrocés.\n\n" + 
                      "El seu temporitzador d'afectació és seguit per la barra a la part inferior de la pantalla.",
                x: 240,
                y: 510,
                style: {
                    fill: GAME_COLORS.white,
                    fontSize: 12,
                    fontWeight: 'lighter' as const,
                    align: 'left' as const,
                    wordWrap: true,
                    wordWrapWidth: 335,
                    breakWords: true,
                    lineHeight: 20,
                    fontFamily: '"Roboto Mono", monospace',
                    letterSpacing: 0.5,
                },
                anchor: { x: 0, y: 0 },
                rotation: 0,
            },

            // Column 5A: Wall shapes (Down - center/right)
            {
                tag: 'wallShapesTitle',
                text: "-----------------------------------------------[ FIGURES DE LAS PARETS ]------------------------------------------------",
                x: 650,
                y: 470,
                style: {
                    fill: GAME_COLORS.menuOrange,
                    fontSize: 13,
                    fontWeight: 'bolder' as const,
                    align: 'left' as const,
                    wordWrap: true,
                    wordWrapWidth: 1000,
                    breakWords: true,
                    lineHeight: 10,
                    fontFamily: '"Roboto Mono", monospace',
                    letterSpacing: 0.5,
                },
                anchor: { x: 0, y: 0 },
                rotation: 0,
            },

            // Column 5B: Wall shapes (Down - center/right)
            {
                tag: 'wallShapesContent',
                text: 
                      "Les parets canvien, deformen i es mouen amb el temps, afectant les trajectòries de les boles.\n\n" + 
                      "De vegades, les figures que bloquegen al mig de l'arena com a obstacles sòlids.",
                x: 670,
                y: 510,
                style: {
                    fill: GAME_COLORS.white,
                    fontSize: 12,
                    fontWeight: 'lighter' as const,
                    align: 'left' as const,
                    wordWrap: true,
                    wordWrapWidth: 335,
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

    public redrawGlossaryTitles(classicMode: boolean): void {
        const titleColor = classicMode ? GAME_COLORS.white : GAME_COLORS.menuOrange;
        
        this.textComponents.forEach((textComponent, index) => {
            const columnData = this.getColumnDataEN();
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

