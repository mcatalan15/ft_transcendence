/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Glossary.ts                                        :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/10 16:33:02 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/11 16:31:30 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Entity } from "../engine/Entity";
import { TextComponent } from "../components/TextComponent";
import { AnimationComponent } from "../components/AnimationComponent";
import { GAME_COLORS } from "../utils/Types";

export class Glossary extends Entity {
    private targetAlpha: number = 0;
    private currentAlpha: number = 0;
    private animationProgress: number = 0;
    private animationSpeed: number = 0.08;
    private isAnimating: boolean = false;
    private textComponents: TextComponent[] = [];

    constructor(id: string, layer: string) {
        super(id, layer);
        
        // Create three text components for three columns
        this.createColumnTexts();

        // Add animation component
        const animationComponent = new AnimationComponent();
        this.addComponent(animationComponent, 'animation');

        // Set initial alpha to 0 for all text components
        this.textComponents.forEach(textComp => {
            textComp.getRenderable().alpha = 0;
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
                tag: 'powerupsTitle',
                text: "----------------------[ POWERUPS ]----------------------",
                x: 120,
                y: 120,
                style: {
                    fill: GAME_COLORS.white,
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

            // Column 2A: Powerdowns Title (Center)
            {
                tag: 'powerdownsTitle',
                text: "---------------------[ POWERDOWNS ]---------------------" ,
                x: 650,
                y: 120,
                style: {
                    fill: GAME_COLORS.white,
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

            // Column 3A: Ball Changes Title (Right)
            {
                tag: 'ballchanges',
                text: "--------------------[ BALL CHANGES ]--------------------",
                x: 1200,
                y: 120,
                style: {
                    fill: GAME_COLORS.white,
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
                      "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Spawns an egg-shaped curved-trayectory ball\n" + 
                      "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Spawns a spinning square-shaped ball\n" + 
                      "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Spawns an arrow-like burst ball\n" +
                      "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Spawns multiple tiny balls with decoys\n",
                x: 1200,
                y: 140,
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
            }
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

        // Smooth easing function (ease in-out)
        const easedProgress = this.easeInOutCubic(this.animationProgress);
        
        // Interpolate between current and target alpha
        const startAlpha = this.targetAlpha === 1 ? 0 : 1;
        this.currentAlpha = startAlpha + (this.targetAlpha - startAlpha) * easedProgress;

        // Update alpha for ALL text components
        this.textComponents.forEach(textComponent => {
            if (textComponent && textComponent.getRenderable()) {
                textComponent.getRenderable().alpha = this.currentAlpha;
            }
        });

        // Check if animation is complete
        if (this.animationProgress >= 1.0) {
            this.isAnimating = false;
            this.currentAlpha = this.targetAlpha;
            
            // Update final alpha for all components
            this.textComponents.forEach(textComponent => {
                if (textComponent && textComponent.getRenderable()) {
                    textComponent.getRenderable().alpha = this.currentAlpha;
                }
            });
        }
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