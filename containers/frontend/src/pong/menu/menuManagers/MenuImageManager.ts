/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   MenuImageManager.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/12 17:38:32 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/25 14:11:58 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Assets, Sprite, Texture } from "pixi.js";
import { Menu } from "../Menu";

export class MenuImageManager {
    private static assets: Map<string, Texture> = new Map();
    private static wallImages: Sprite[] = [];
    private static avatarImages: Sprite[] = [];
    private static classicAvatarImages: Sprite[] = [];
    private static tournamentAvatars: Sprite[] = [];
    private static pinkLogoImages: Sprite[] = [];
    private static classicLogoImages: Sprite[] = [];
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
        this.wallImages = [];
    
        const wallImageData = [
            { name: 'wallPyramids', x: 1075, y: 540 },
            { name: 'wallSteps', x: 1180, y: 540 },
            { name: 'wallTrenches', x: 1285, y: 540 },
            { name: 'wallHourglass', x: 1390, y: 540 },
            { name: 'wallLightning', x: 1495, y: 540 },
            { name: 'wallFangs', x: 1600, y: 540 },

            { name: 'wallWaystones', x: 1075, y: 600 },
            { name: 'wallSnakes', x: 1180, y: 600 },
            { name: 'wallVipers', x: 1285, y: 600 },
            { name: 'wallKite', x: 1390, y: 600 },
            { name: 'wallBowtie', x: 1495, y: 600 },
            { name: 'wallHoneycomb', x: 1600, y: 600 }
        ];
    
        wallImageData.forEach(data => {
            const wallImage = this.createSimpleImage(data.name, data.x, data.y, menu);
            if (wallImage) {
                this.wallImages.push(wallImage);
            }
        });
    }

    static createAvatars(menu: Menu) {
        this.avatarImages = [];
    
        const avatarData = [
            { name: 'Eva', x: 220, y: 280, url: 'https://github.com/eferre-m' },
            { name: 'Hugo', x: 450, y: 280, url: 'https://github.com/hugomgris' },
            { name: 'Marc', x: 220, y: 515, url: 'https://github.com/mcatalan15' },
            { name: 'Nico', x: 450, y: 515, url: 'https://github.com/mrlouf' }
        ];
    
        avatarData.forEach(data => {
            const avatar = this.createClickableAvatar(
                data.name, 
                data.x, 
                data.y, 
                data.url, 
                menu
            );
            
            if (avatar) {
                this.avatarImages.push(avatar);
            }
        });
    }

    static createClassicAvatars(menu: Menu) {
        this.classicAvatarImages = [];
    
        const avatarData = [
            { name: 'EvaClassic', x: 220, y: 280, url: 'https://github.com/eferre-m' },
            { name: 'HugoClassic', x: 450, y: 280, url: 'https://github.com/hugomgris' },
            { name: 'MarcClassic', x: 220, y: 515, url: 'https://github.com/mcatalan15' },
            { name: 'NicoClassic', x: 450, y: 515, url: 'https://github.com/mrlouf' }
        ];
    
        avatarData.forEach(data => {
            const avatar = this.createClickableAvatar(
                data.name, 
                data.x, 
                data.y, 
                data.url, 
                menu
            );
            
            if (avatar) {
                this.classicAvatarImages.push(avatar);
            }
        });
    }

    static createTournamentAvatars(menu: Menu): void {
        this.tournamentAvatars = [];
    
        const squareAvatarData = [
            { name: 'avatarNicoSquare', x: 1225.5, y: 340 },
            { name: 'avatarEvaSquare', x: 1524.5, y: 340 },
        ]
    
        squareAvatarData.forEach(data => {
            const squareAvatar = this.createSimpleImage(data.name, data.x, data.y, menu, 0.240);
            if (squareAvatar) {
                this.tournamentAvatars.push(squareAvatar);
            }
        });
    }

    static createPinkLogos(menu: Menu) {
        this.pinkLogoImages = [];
    
        const pinkLogoData = [
            { name: 'typescriptPink', x: 1170, y: 550,},
            { name: 'pixiPink', x: 1256, y: 550,},
            { name: 'tailwindPink', x: 1342, y: 550,},
            { name: 'nodejsPink', x: 1428, y: 550,},
            { name: 'fastifyPink', x: 1514, y: 550,},
            { name: 'SQLitePink', x: 1600, y: 550,},
            { name: 'dockerPink', x: 1213, y: 625,},
            { name: 'prometheusPink', x: 1299, y: 625,},
            { name: 'grafanaPink', x: 1385, y: 625,},
            { name: 'avalanchePink', x: 1471, y: 625,},
            { name: 'solidityPink', x: 1557, y: 625,},
        ];
    
        pinkLogoData.forEach(data => {
            const logo = this.buildPinkLogo(data.name, data.x, data.y, menu);
            if (logo) {
                this.pinkLogoImages.push(logo);
            }
        });
    }

    static createClassicLogos(menu: Menu) {
        this.classicLogoImages = [];
    
        const classicLogoData = [
            { name: 'typescriptClassic', x: 1170, y: 550,},
            { name: 'pixiClassic', x: 1256, y: 550,},
            { name: 'tailwindClassic', x: 1342, y: 550,},
            { name: 'nodejsClassic', x: 1428, y: 550,},
            { name: 'fastifyClassic', x: 1514, y: 550,},
            { name: 'SQLiteClassic', x: 1600, y: 550,},
            { name: 'dockerClassic', x: 1213, y: 625,},
            { name: 'prometheusClassic', x: 1299, y: 625,},
            { name: 'grafanaClassic', x: 1385, y: 625,},
            { name: 'avalancheClassic', x: 1471, y: 625,},
            { name: 'solidityClassic', x: 1557, y: 625,},
        ];
    
        classicLogoData.forEach(data => {
            const logo = this.buildClassicLogo(data.name, data.x, data.y, menu);
            if (logo) {
                this.classicLogoImages.push(logo);
            }
        });
    }

    static prepareWallImagesForGlossary(menu: Menu): void {
        this.wallImages.forEach(wallImage => {
            if (wallImage) {
                wallImage.alpha = 0;
                if (wallImage.parent) {
                    wallImage.parent.removeChild(wallImage);
                }
                menu.renderLayers.overlays.addChild(wallImage);
            }
        });
    }

    static preparePinkLogosForAbout(menu: Menu): void {
        this.pinkLogoImages.forEach(pinkLogo => {
            if (pinkLogo) {
                pinkLogo.alpha = 0;
                if (pinkLogo.parent) {
                    pinkLogo.parent.removeChild(pinkLogo);
                }
                menu.renderLayers.overlays.addChild(pinkLogo);
            }
        });
    }

    static prepareClassicLogosForAbout(menu: Menu): void {
        this.classicLogoImages.forEach(classicLogo => {
            if (classicLogo) {
                classicLogo.alpha = 0;
                if (classicLogo.parent) {
                    classicLogo.parent.removeChild(classicLogo);
                }
                menu.renderLayers.overlays.addChild(classicLogo);
            }
        });
    }

    static prepareTournamentAvatarImages(menu: Menu): void {
        this.tournamentAvatars.forEach(squareAvatar => {
            if (squareAvatar) {
                squareAvatar.alpha = 0;
                if (squareAvatar.parent) {
                    squareAvatar.parent.removeChild(squareAvatar);
                }
                menu.renderLayers.overlays.addChild(squareAvatar);
            }
        });
    }

    static prepareAvatarImagesForAbout(menu: Menu): void {
        this.avatarImages.forEach(avatarImage => {
            if (avatarImage) {
                avatarImage.alpha = 0;
                if (avatarImage.parent) {
                    avatarImage.parent.removeChild(avatarImage);
                }
                menu.renderLayers.overlays.addChild(avatarImage);
            }
        });
    }

    static prepareClassicAvatarImagesForAbout(menu: Menu): void {
        this.classicAvatarImages.forEach(avatarImage => {
            if (avatarImage) {
                avatarImage.alpha = 0;
                if (avatarImage.parent) {
                    avatarImage.parent.removeChild(avatarImage);
                }
                menu.renderLayers.overlays.addChild(avatarImage);
            }
        });
    }

    static hideWallImagesFromGlossary(menu: Menu): void {
        this.wallImages.forEach(wallImage => {
            if (wallImage) {
                if (wallImage.parent) {
                    wallImage.parent.removeChild(wallImage);
                }
                menu.menuHidden.addChild(wallImage);
                wallImage.alpha = 0;
            }
        });
    }

    static hidePinkLogosFromAbout(menu: Menu): void {
        this.pinkLogoImages.forEach(pinkLogo => {
            if (pinkLogo) {
                if (pinkLogo.parent) {
                    pinkLogo.parent.removeChild(pinkLogo);
                }
                menu.menuHidden.addChild(pinkLogo);
                pinkLogo.alpha = 0;
            }
        });
    }

    static hideClassicLogosFromAbout(menu: Menu): void {
        this.classicLogoImages.forEach(classicLogo => {
            if (classicLogo) {
                if (classicLogo.parent) {
                    classicLogo.parent.removeChild(classicLogo);
                }
                menu.menuHidden.addChild(classicLogo);
                classicLogo.alpha = 0;
            }
        });
    }

    static hideAvatarImagesFromAbout(menu: Menu): void {
        this.avatarImages.forEach(avatarImage => {
            if (avatarImage) {
                if (avatarImage.parent) {
                    avatarImage.parent.removeChild(avatarImage);
                }
                menu.menuHidden.addChild(avatarImage);
                avatarImage.alpha = 0;
            }
        });
    }

    static hideClassicAvatarImagesFromAbout(menu: Menu): void {
        this.classicAvatarImages.forEach(avatarImage => {
            if (avatarImage) {
                if (avatarImage.parent) {
                    avatarImage.parent.removeChild(avatarImage);
                }
                menu.menuHidden.addChild(avatarImage);
                avatarImage.alpha = 0;
            }
        });
    }

    static hideTournamentAvatarImages(menu: Menu): void {
        this.tournamentAvatars.forEach(squareAvatar => {
            if (squareAvatar) {
                if (squareAvatar.parent) {
                    squareAvatar.parent.removeChild(squareAvatar);
                }
                menu.menuHidden.addChild(squareAvatar);
                squareAvatar.alpha = 0;
            }
        });
    }

    static resetAllWallImageAlpha(): void {
        this.wallImages.forEach(wallImage => {
            if (wallImage) {
                wallImage.alpha = 0;
            }
        });
        
        this.isAnimating = false;
    }

    static resetAllAvatarImageAlpha(): void {
        this.avatarImages.forEach(avatarImage => {
            if (avatarImage) {
                avatarImage.alpha = 0;
            }
        });
        
        this.isAnimating = false;
    }

    static fadeInAllWallImages(menu: Menu): void {
        this.animateWallImagesAlpha(1, 0.15);
    }

    static fadeInAllAvatarImages(menu: Menu): void {
        this.animateAvatarImagesAlpha(1, 0.15);
    }

    static fadeOutAllWallImages(menu: Menu, onComplete?: () => void): void {
        this.animateWallImagesAlpha(0, 0.25, onComplete);
    }

    static fadeOutAllAvatarImages(menu: Menu, onComplete?: () => void): void {
        this.animateAvatarImagesAlpha(0, 0.25, onComplete);
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

    private static animateAvatarImagesAlpha(targetAlpha: number, speed: number, onComplete?: () => void): void {
        this.isAnimating = true;
        
        const animate = () => {
            let allComplete = true;

            this.avatarImages.forEach(avatarImage => {
                const current = avatarImage.alpha;
                const diff = targetAlpha - current;
                
                if (Math.abs(diff) > 0.01) {
                    avatarImage.alpha += diff * speed;
                    allComplete = false;
                } else {
                    avatarImage.alpha = targetAlpha;
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
            
            this.animateQuitButtonAlpha(quitButton, 1, 0.5);
        }
    }

    static fadeInAboutQuitButton(menu: Menu): void {
        const quitButton = menu.aboutQuitButton;
        if (quitButton) {
            const container = quitButton.getContainer();
            menu.renderLayers.overlayQuits.addChild(container);
            
            this.animateQuitButtonAlpha(quitButton, 1, 0.5);
        }
    }
    
    static fadeOutGlossaryQuitButton(menu: Menu, onComplete?: () => void): void {
        const quitButton = menu.glossaryQuitButton;
        if (quitButton) {
            this.animateQuitButtonAlpha(quitButton, 0, 0.5, () => {
                menu.menuHidden.addChild(quitButton.getContainer());
                if (onComplete) onComplete();
            });
        }
    }

    static fadeOutAboutQuitButton(menu: Menu, onComplete?: () => void): void {
        const quitButton = menu.aboutQuitButton;
        if (quitButton) {
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

    static areAvatarImagesAnimating(): boolean {
        return this.isAnimating;
    }

    static getAllWallImages(): Sprite[] {
        return this.wallImages;
    }

    static getAllAvatarImages(): Sprite[] {
        return this.avatarImages;
    }

    static getAllSquareAvatarImages(): Sprite[] {
        return this.tournamentAvatars;
    }

    static getAllClassicAvatarImages(): Sprite[] {
        return this.classicAvatarImages;
    }

    static getAllPinkLogoImages(): Sprite[] {
        return this.pinkLogoImages;
    }

    static getAllClassicLogoImages(): Sprite[] {
        return this.classicLogoImages;
    }

    // Helpers
    static createSimpleImage(name: string, x: number, y: number, menu: Menu, scale?: number): Sprite | null {
        const wallImage = MenuImageManager.createSprite(name);
        if (!wallImage) return null;
        
        wallImage.anchor.set(0.5);
        wallImage.x = x;
        wallImage.y = y;
        wallImage.scale.set(scale? scale : 0.025);
        wallImage.alpha = 0;
        menu.menuHidden.addChild(wallImage);
        
        return wallImage;
    }

    static buildPinkLogo(name: string, x: number, y: number, menu: Menu): Sprite | null {
        const pinkLogo = MenuImageManager.createSprite(name);
        if (!pinkLogo) return null;
        
        pinkLogo.anchor.set(0.5);
        pinkLogo.x = x;
        pinkLogo.y = y;
        pinkLogo.scale.set(0.025);
        pinkLogo.alpha = 0;
        menu.menuHidden.addChild(pinkLogo);
        
        return pinkLogo;
    }

    static buildClassicLogo(name: string, x: number, y: number, menu: Menu): Sprite | null {
        const classicLogo = MenuImageManager.createSprite(name);
        if (!classicLogo) return null;
        
        classicLogo.anchor.set(0.5);
        classicLogo.x = x;
        classicLogo.y = y;
        classicLogo.scale.set(0.025);
        classicLogo.alpha = 0;
        menu.menuHidden.addChild(classicLogo);
        
        return classicLogo;
    }

    static createClickableAvatar(
        name: string, 
        x: number, 
        y: number, 
        url: string, 
        menu: Menu
    ): Sprite | null {
        const avatar = MenuImageManager.createSprite(`avatar${name}`);
        if (!avatar) return null;
        
        avatar.anchor.set(0.5);
        avatar.x = x;
        avatar.y = y;
        avatar.scale.set(0.175);
        avatar.alpha = 0;
        
        avatar.eventMode = 'static';
        avatar.cursor = 'pointer';
        
        const originalScale = 0.175;
        const hoverScale = 0.19;
        const clickScale = 0.16;

        avatar.on('pointerdown', () => {
            avatar.scale.set(clickScale);
            
            setTimeout(() => {
                avatar.scale.set(originalScale);
                window.open(url, '_blank');
                console.log(`${name} avatar clicked - opening ${url}`);
            }, 100);

            if (menu.sounds && menu.sounds.menuSelect) {
                menu.sounds.menuSelect.play();
            }
        });
        
        avatar.on('pointerenter', () => {
            avatar.scale.set(hoverScale);

            avatar.tint = 0xF0F0F0;
            
            if (menu.sounds && menu.sounds.menuMove) {
                menu.sounds.menuMove.play();
            }
        });
        
        avatar.on('pointerleave', () => {
            avatar.scale.set(originalScale);
            avatar.tint = 0xFFFFFF;
        });
        
        menu.menuHidden.addChild(avatar);
        return avatar;
    }

    // Cleanup
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