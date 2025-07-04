/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   ImageManager.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/07/02 17:06:16 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/04 16:05:00 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Assets, Sprite, Texture } from "pixi.js";

import { PongGame } from "../engine/Game";

export class ImageManager {
	private static assets: Map<string, Texture> = new Map();
	private static headerImages: Sprite[] = [];

	static async loadAssets(assetList: Array<{name: string, url: string}>): Promise<void> {
        const promises = assetList.map(async (asset) => {
            try {
                let texture;
                if (asset.url.endsWith('.svg')) {
                    texture = await Assets.load({
                        src: asset.url,
                        data: {
                            resolution: 2,
                            width: 1397 * 0.7194,
                            height: 74 * 0.7194,
                        }
                    });
                } else {
                    texture = await Assets.load(asset.url);
                }
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

	static createHeaderSprite(headerType: string, game: PongGame): Sprite | null {
        let assetName: string;
        
        if (game.config.classicMode) {
            assetName = 'pongHeaderWhite';
        } else {
            switch (headerType) {
                case 'tournament':
                case 'play':
                    assetName = 'pongHeaderBlue';
                    break;
                case 'info':
                    assetName = 'pongHeaderPink';
                    break;
                case 'glossary':
                    assetName = 'pongHeaderOrange';
                    break;
                default:
                    assetName = 'pongHeaderWhite';
            }
        }
        
        const headerSprite = this.createSprite(assetName);
        if (!headerSprite) {
            console.warn(`Failed to create header sprite for asset: ${assetName}`);
            return null;
        }
        
        headerSprite.anchor.set(0, 0);
        headerSprite.x = 73.5;
        headerSprite.y = 63;
        headerSprite.alpha = 0;
        
        headerSprite.scale.set(1, 1);
        
        this.headerImages.push(headerSprite);
        game.renderLayers.hidden.addChild(headerSprite);
        
        return headerSprite;
    }
    
    static getAllHeaderImages(): Sprite[] {
        return this.headerImages;
    }
    
    static prepareHeaderForOverlay(headerSprite: Sprite, game: PongGame): void {
        if (headerSprite) {
            headerSprite.alpha = 0;
            if (headerSprite.parent) {
                headerSprite.parent.removeChild(headerSprite);
            }
            game.renderLayers.overlays.addChild(headerSprite);
        }
    }
    
    static hideHeaderFromOverlay(headerSprite: Sprite, game: PongGame): void {
        if (headerSprite) {
            if (headerSprite.parent) {
                headerSprite.parent.removeChild(headerSprite);
            }
            game.renderLayers.hidden.addChild(headerSprite);
            headerSprite.alpha = 0;
        }
    }

    static cleanup(): void {
        this.headerImages.forEach(headerImage => {
            if (headerImage.parent) {
                headerImage.parent.removeChild(headerImage);
            }
            headerImage.destroy({ children: true });
        });
        this.headerImages = [];
        
        this.assets.clear();
        
        console.log('ImageManager cleanup completed');
    }
}