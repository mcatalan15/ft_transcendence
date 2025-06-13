/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   AboutTexts.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/10 16:33:02 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/13 18:53:29 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Entity } from "../engine/Entity";
import { TextComponent } from "../components/TextComponent";
import { AnimationComponent } from "../components/AnimationComponent";
import { GAME_COLORS } from "../utils/Types";

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
            // Column 1A: Powerups Title (Left)
            {
                tag: 'teamTitle',
                text: "----------------------[ TEAM ]----------------------",
                x: 120,
                y: 120,
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
                tag: 'teamContent',
                text: 
                      "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Eva\n" + 
                      "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Marc\n" + 
                      "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Nico\n" +
                      "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Hugo\n",
                x: 120,
                y: 140,
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

    public updateAnimation(deltaTime: number): void {
        if (!this.isAnimating) return;

        this.animationProgress += this.animationSpeed * deltaTime;
        this.animationProgress = Math.min(this.animationProgress, 1.0);

        const easedProgress = this.easeInOutCubic(this.animationProgress);
        
        const startAlpha = this.targetAlpha === 1 ? 0 : 1;
        this.currentAlpha = startAlpha + (this.targetAlpha - startAlpha) * easedProgress;

        this.textComponents.forEach(textComponent => {
            if (textComponent && textComponent.getRenderable()) {
                textComponent.getRenderable().alpha = this.currentAlpha;
            }
        });

        if (this.animationProgress >= 1.0) {
            this.isAnimating = false;
            this.currentAlpha = this.targetAlpha;
            

            this.textComponents.forEach(textComponent => {
                if (textComponent && textComponent.getRenderable()) {
                    textComponent.getRenderable().alpha = this.currentAlpha;
                }
            });
        }
    }

    public redrawGlossaryTitles(classicMode: boolean): void {
        const titleColor = classicMode ? GAME_COLORS.white : GAME_COLORS.menuOrange;
        
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

    private easeInOutCubic(t: number): number {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
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

