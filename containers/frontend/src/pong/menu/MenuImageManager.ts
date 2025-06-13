/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   MenuImageManager.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/12 17:38:32 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/13 18:53:24 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Assets, Sprite, Texture } from "pixi.js";
import { Menu } from "./Menu";

export class MenuImageManager {
    private static assets: Map<string, Texture> = new Map();
    private static wallImages: Sprite[] = [];
    private static isAnimating: boolean = false;
    
    static async loadAssets(assetList: Array<{name: string, url: string}>): Promise<void> {
        const promises = assetList.map(async (asset) => {
            try {
                const texture = await Assets.load(asset.url);
                this.assets.set(asset.name, texture);
            } catch (error) {
                console.error(`Failed to load asset ${asset.name} from ${asset.url}:`, error);
            }
        });
        
        await Promise.allSettled(promises);
    }
    
    static getAsset(name: string): Texture | null {
        return this.assets.get(name) || null;
    }
    
    static createSprite(assetName: string): Sprite | null {
        const texture = this.getAsset(assetName);
        return texture ? new Sprite(texture) : null;
    }
    
    static createSpriteWithFallback(assetName: string, fallbackColor: number = 0xFF0000): Sprite {
        const texture = this.getAsset(assetName);
        
        if (texture) {
            return new Sprite(texture);
        } else {
            const canvas = document.createElement('canvas');
            canvas.width = 64;
            canvas.height = 64;
            const ctx = canvas.getContext('2d')!;
            ctx.fillStyle = `#${fallbackColor.toString(16).padStart(6, '0')}`;
            ctx.fillRect(0, 0, 64, 64);
            
            const fallbackTexture = Texture.from(canvas);
            return new Sprite(fallbackTexture);
        }
    }

    static createImages(menu: Menu): void {
        // Store all wall images for fade animation
        this.wallImages = [];

        const wallPyramids = MenuImageManager.createSprite('wallPyramids');
        if (wallPyramids) {
            wallPyramids.anchor.set(0.5);
            wallPyramids.x = 1075;
            wallPyramids.y = 540;
            wallPyramids.scale.set(0.025);
            wallPyramids.alpha = 0; // Start invisible
            menu.menuHidden.addChild(wallPyramids);
            this.wallImages.push(wallPyramids);
        }

        const wallSteps = MenuImageManager.createSprite('wallSteps');
        if (wallSteps) {
            wallSteps.anchor.set(0.5);
            wallSteps.x = 1180;
            wallSteps.y = 540;
            wallSteps.scale.set(0.025);
            wallSteps.alpha = 0; // Start invisible
            menu.menuHidden.addChild(wallSteps);
            this.wallImages.push(wallSteps);
        }

        const wallTrenches = MenuImageManager.createSprite('wallTrenches');
        if (wallTrenches) {
            wallTrenches.anchor.set(0.5);
            wallTrenches.x = 1285;
            wallTrenches.y = 540;
            wallTrenches.scale.set(0.025);
            wallTrenches.alpha = 0; // Start invisible
            menu.menuHidden.addChild(wallTrenches);
            this.wallImages.push(wallTrenches);
        }

        const wallHourglass = MenuImageManager.createSprite('wallHourglass');
        if (wallHourglass) {
            wallHourglass.anchor.set(0.5);
            wallHourglass.x = 1390;
            wallHourglass.y = 540;
            wallHourglass.scale.set(0.025);
            wallHourglass.alpha = 0; // Start invisible
            menu.menuHidden.addChild(wallHourglass);
            this.wallImages.push(wallHourglass);
        }

        const wallLightning = MenuImageManager.createSprite('wallLightning');
        if (wallLightning) {
            wallLightning.anchor.set(0.5);
            wallLightning.x = 1495;
            wallLightning.y = 540;
            wallLightning.scale.set(0.025);
            wallLightning.alpha = 0; // Start invisible
            menu.menuHidden.addChild(wallLightning);
            this.wallImages.push(wallLightning);
        }

        const wallFangs = MenuImageManager.createSprite('wallFangs');
        if (wallFangs) {
            wallFangs.anchor.set(0.5);
            wallFangs.x = 1600;
            wallFangs.y = 540;
            wallFangs.scale.set(0.025);
            wallFangs.alpha = 0; // Start invisible
            menu.menuHidden.addChild(wallFangs);
            this.wallImages.push(wallFangs);
        }
        
        const wallWaystones = MenuImageManager.createSprite('wallWaystones');
        if (wallWaystones) {
            wallWaystones.anchor.set(0.5);
            wallWaystones.x = 1075;
            wallWaystones.y = 600;
            wallWaystones.scale.set(0.025);
            wallWaystones.alpha = 0; // Start invisible
            menu.menuHidden.addChild(wallWaystones);
            this.wallImages.push(wallWaystones);
        }

        const wallSnakes = MenuImageManager.createSprite('wallSnakes');
        if (wallSnakes) {
            wallSnakes.anchor.set(0.5);
            wallSnakes.x = 1180;
            wallSnakes.y = 600;
            wallSnakes.scale.set(0.025);
            wallSnakes.alpha = 0; // Start invisible
            menu.menuHidden.addChild(wallSnakes);
            this.wallImages.push(wallSnakes);
        }

        const wallVipers = MenuImageManager.createSprite('wallVipers');
        if (wallVipers) {
            wallVipers.anchor.set(0.5);
            wallVipers.x = 1285;
            wallVipers.y = 600;
            wallVipers.scale.set(0.025);
            wallVipers.alpha = 0; // Start invisible
            menu.menuHidden.addChild(wallVipers);
            this.wallImages.push(wallVipers);
        }

        const wallKite = MenuImageManager.createSprite('wallKite');
        if (wallKite) {
            wallKite.anchor.set(0.5);
            wallKite.x = 1390;
            wallKite.y = 600;
            wallKite.scale.set(0.025);
            wallKite.alpha = 0; // Start invisible
            menu.menuHidden.addChild(wallKite);
            this.wallImages.push(wallKite);
        }

        const wallBowtie = MenuImageManager.createSprite('wallBowtie');
        if (wallBowtie) {
            wallBowtie.anchor.set(0.5);
            wallBowtie.x = 1495;
            wallBowtie.y = 600;
            wallBowtie.scale.set(0.025);
            wallBowtie.alpha = 0; // Start invisible
            menu.menuHidden.addChild(wallBowtie);
            this.wallImages.push(wallBowtie);
        }

        const wallHoneycomb = MenuImageManager.createSprite('wallHoneycomb');
        if (wallHoneycomb) {
            wallHoneycomb.anchor.set(0.5);
            wallHoneycomb.x = 1600;
            wallHoneycomb.y = 600;
            wallHoneycomb.scale.set(0.025);
            wallHoneycomb.alpha = 0; // Start invisible
            menu.menuHidden.addChild(wallHoneycomb);
            this.wallImages.push(wallHoneycomb);
        }
    }

    static fadeInAllWallImages(menu: Menu): void {
        this.wallImages.forEach(wallImage => {
            menu.renderLayers.overlays.addChild(wallImage);
        });

        this.animateWallImagesAlpha(1, 0.15);
    }

    static fadeOutAllWallImages(menu: Menu, onComplete?: () => void): void {
        this.animateWallImagesAlpha(0, 0.25, () => {
            this.wallImages.forEach(wallImage => {
                menu.menuHidden.addChild(wallImage);
            });
            
            if (onComplete) {
                onComplete();
            }
        });
    }

    private static animateWallImagesAlpha(targetAlpha: number, speed: number, onComplete?: () => void): void {
        this.isAnimating = true;
        
        const animate = () => {
            let allComplete = true;

            this.wallImages.forEach(wallImage => {
                const current = wallImage.alpha;
                const diff = targetAlpha - current;
                
                if (Math.abs(diff) > 0.01) {
                    wallImage.alpha += diff * speed;
                    allComplete = false;
                } else {
                    wallImage.alpha = targetAlpha;
                }
            });

            if (!allComplete) {
                requestAnimationFrame(animate);
            } else {
                this.isAnimating = false;
                if (onComplete) {
                    onComplete();
                }
            }
        };

        animate();
    }

    static fadeInGlossaryQuitButton(menu: Menu): void {
        const quitButton = menu.glossaryQuitButton;
        if (quitButton) {
            const container = quitButton.getContainer();
            menu.renderLayers.overlayQuits.addChild(container);
            
            // Match the new faster overlay background speed (0.12)
            this.animateQuitButtonAlpha(quitButton, 1, 0.5);
        }
    }
    
    static fadeOutGlossaryQuitButton(menu: Menu, onComplete?: () => void): void {
        const quitButton = menu.glossaryQuitButton;
        if (quitButton) {
            // Match the new faster overlay background speed (0.12)
            this.animateQuitButtonAlpha(quitButton, 0, 0.5, () => {
                menu.menuHidden.addChild(quitButton.getContainer());
                if (onComplete) onComplete();
            });
        }
    }
    
    private static animateQuitButtonAlpha(quitButton: any, targetAlpha: number, speed: number, onComplete?: () => void): void {
        const container = quitButton.getContainer();
        
        const animate = () => {
            const current = container.alpha;
            const diff = targetAlpha - current;
            
            if (Math.abs(diff) > 0.01) {
                container.alpha += diff * speed;
                requestAnimationFrame(animate);
            } else {
                container.alpha = targetAlpha;
                if (onComplete) onComplete();
            }
        };
        
        animate();
    }
    
    static isQuitButtonAnimating(menu: Menu): boolean {
        const quitButton = menu.glossaryQuitButton;
        if (!quitButton) return false;
        
        const container = quitButton.getContainer();
        return container.alpha > 0 && container.alpha < 1;
    }

    static areWallImagesAnimating(): boolean {
        return this.isAnimating;
    }

    static getAllWallImages(): Sprite[] {
        return this.wallImages;
    }

    static cleanup(): void {
        this.wallImages.forEach(wallImage => {
            if (wallImage.parent) {
                wallImage.parent.removeChild(wallImage);
            }
            wallImage.destroy();
        });
        this.wallImages = [];
    }
}