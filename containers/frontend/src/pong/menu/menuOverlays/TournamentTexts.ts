/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   TournamentTexts.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/10 16:33:02 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/20 18:04:10 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Menu } from "../Menu";

import { Entity } from "../../engine/Entity";
import { TextComponent } from "../../components/TextComponent";
import { AnimationComponent } from "../../components/AnimationComponent";
import { GAME_COLORS } from "../../utils/Types";

export class TournamentTexts extends Entity {
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
            {
                tag: 'teamTitle',
                text:  'WINS:\nLOSSES:\nGOALS FOR:\nGOALS AGAINST:\n',
                x: 1260,
                y: 215,
                style: {
                    fill: GAME_COLORS.menuBlue,
                    fontSize: 13,
                    fontWeight: 'bolder' as const,
                    align: 'left' as const,
                    wordWrap: true,
                    wordWrapWidth: 480,
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
            {
                tag: 'teamTitle',
                text: "----------------------[ HOLA ]----------------------",
                x: 120,
                y: 120,
                style: {
                    fill: GAME_COLORS.menuBlue,
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
        ];
    }

    private getColumnDataFR() {
        return [
            // Column 1A: Team Title (Left)
            {
                tag: 'teamTitle',
                text: "---------------[ STATISTIQUES ]---------------",
                x: 1260,
                y: 300,
                style: {
                    fill: GAME_COLORS.menuBlue,
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
        ];
    }

    private getColumnDataCAT() {
        return [
            // Column 1A: Team Title (Left)
            {
                tag: 'teamTitle',
                text: "----------------------[ BONDIA ]----------------------",
                x: 120,
                y: 120,
                style: {
                    fill: GAME_COLORS.menuBlue,
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
        ];
    }

    public recreateTexts(): void {
        this.textComponents.forEach((textComp, index) => {
            this.removeComponent(`text_${index}`);
        });
        this.textComponents = [];
        
        this.createColumnTexts();
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

    public redrawPlayTitles(classicMode: boolean): void {
        const titleColor = classicMode ? GAME_COLORS.white : GAME_COLORS.menuBlue;
        
        this.textComponents.forEach((textComponent, index) => {
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

