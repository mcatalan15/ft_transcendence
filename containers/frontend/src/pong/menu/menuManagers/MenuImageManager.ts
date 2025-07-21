/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   MenuImageManager.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/12 17:38:32 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/20 20:55:55 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Assets, Graphics, Sprite, Texture } from "pixi.js";
import { Menu } from "../Menu";

export class MenuImageManager {
	private static assets: Map<string, Texture> = new Map();
	private static wallImages: Sprite[] = [];
	private static avatarImages: Sprite[] = [];
	private static classicAvatarImages: Sprite[] = [];
	private static tournamentAvatars: Sprite[] = [];
	private static playAvatars: Sprite[] = [];
	private static pinkLogoImages: Sprite[] = [];
	private static classicLogoImages: Sprite[] = [];
	private static headerImages: Sprite[] = [];
	private static isAnimating: boolean = false;

	static isFirefox = navigator.userAgent.toLowerCase().includes('firefox');
	
	static async loadAssets(assetList: Array<{name: string, url: string}>): Promise<void> {
		const promises = assetList.map(async (asset) => {
			try {
				let texture;
				if (asset.url.endsWith('.svg')) {
					texture = await Assets.load({
						src: asset.url,
						data: {
							resolution: 2, // Match your app's resolution
							width: 1397 * 1.1725, // Scale up the SVG dimensions
							height: 74 * 1.1725   // to match the resolution
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
		const texture = this.assets.get(assetName);
		if (!texture) {
			console.warn(`Asset ${assetName} not found`);
			return null;
		}
		
		const sprite = new Sprite(texture);
		
		if (this.isFirefox && assetName.toLowerCase().includes('header')) {
			console.log(`Applying Firefox fixes for SVG asset: ${assetName}`);
			
			if (texture.source) {
				texture.source.scaleMode = 'nearest';
				
				if ('resolution' in texture.source) {
					(texture.source as any).resolution = 1;
				}
				
				if ('generateMipmaps' in texture.source) {
					(texture.source as any).generateMipmaps = false;
				}
			}
		}
		
		return sprite;
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
			{ name: 'Eva', x: 235, y: 280, url: 'https://github.com/eferre-m' },
			{ name: 'Hugo', x: 465, y: 280, url: 'https://github.com/hugomgris' },
			{ name: 'Marc', x: 235, y: 515, url: 'https://github.com/mcatalan15' },
			{ name: 'Nico', x: 465, y: 515, url: 'https://github.com/mrlouf' }
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
			{ name: 'EvaClassic', x: 235, y: 280, url: 'https://github.com/eferre-m' },
			{ name: 'HugoClassic', x: 465, y: 280, url: 'https://github.com/hugomgris' },
			{ name: 'MarcClassic', x: 235, y: 515, url: 'https://github.com/mcatalan15' },
			{ name: 'NicoClassic', x: 465, y: 515, url: 'https://github.com/mrlouf' }
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
		this.tournamentAvatars.forEach(avatar => {
			if (avatar && avatar.parent) {
				avatar.parent.removeChild(avatar);
			}
			if (avatar) {
				avatar.destroy();
			}
		});
		this.tournamentAvatars = [];
	
		let squareAvatarData: { name: string, x: number, y: number }[];

		if (menu.config.classicMode) {
			squareAvatarData = [
				{ name: 'avatarUnknownClassic', x: 1225.5, y: 344.5 },
				{ name: 'avatarUnknownClassic', x: 1524.5, y: 344.5 },
			];
		} else {
			squareAvatarData = [
				{ name: 'avatarUnknownSquare', x: 1225.5, y: 344.5 },
				{ name: 'avatarUnknownSquare', x: 1524.5, y: 344.5 },
			];
		}
	
		squareAvatarData.forEach(data => {
			const squareAvatar = this.createSimpleImage(data.name, data.x, data.y, menu, 0.240);
			if (squareAvatar) {
				this.tournamentAvatars.push(squareAvatar);
			}
		});
	}

	static createPlayAvatars(menu: Menu): void {
		this.playAvatars.forEach(avatar => {
			if (avatar && avatar.parent) {
				avatar.parent.removeChild(avatar);
			}
			if (avatar) {
				avatar.destroy();
			}
		});
		this.playAvatars = [];
	
		let squareAvatarData: { name: string, x: number, y: number }[];
	
		switch (menu.config.variant) {
			case ('1vAI'): {
				if (menu.config.classicMode) {
					squareAvatarData = [
						{ name: 'avatarUnknownClassic', x: 335, y: 369.5 },
						{ name: 'avatarBotClassic', x: 785, y: 365 },
					];
				} else {
					squareAvatarData = [
						{ name: 'avatarUnknownSquare', x: 335, y: 369.5 },
						{ name: 'avatarBotSquare', x: 785, y: 365 },
					];
				}
				break;
			}
	
			default: {
				if (menu.config.classicMode) {
					squareAvatarData = [
						{ name: 'avatarUnknownClassic', x: 335, y: 369.5 },
						{ name: 'avatarUnknownClassic', x: 785, y: 369.5 },
					];
				} else {
					squareAvatarData = [
						{ name: 'avatarUnknownSquare', x: 335, y: 369.5 },
						{ name: 'avatarUnknownSquare', x: 785, y: 369.5 },
					];
				}
				break;
			}
		}
	
		squareAvatarData.forEach(data => {
			const squareAvatar = this.createSimpleImage(data.name, data.x, data.y, menu, 0.35);
			if (squareAvatar) {
				this.playAvatars.push(squareAvatar);
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
		this.createTournamentAvatars(menu);
		
		this.tournamentAvatars.forEach(avatar => {
			if (avatar) {
				avatar.alpha = 0;
				if (avatar.parent) {
					avatar.parent.removeChild(avatar);
				}
				menu.renderLayers.overlays.addChild(avatar);
			}
		});
	}

	static async createPlayerAvatarFromAsset(avatarKey: string, menu: Menu, tournament: boolean = false): Promise<Sprite | null> {
		try {
			console.log('Creating player avatar from:', avatarKey);

			if (avatarKey.startsWith('http') || avatarKey.startsWith('/')) {
				console.log('Loading custom avatar from URL:', avatarKey);

				let finalUrl: string;
				if (avatarKey.includes('?')) {
					finalUrl = `${avatarKey}&t=${Date.now()}`;
				} else {
					finalUrl = `${avatarKey}?t=${Date.now()}`;
				}

				console.log('Loading avatar from:', finalUrl);
				
				try {
					const texture = await Assets.load({
						src: finalUrl,
						loadParser: 'loadTextures'
					});
					
					console.log('Loaded texture:', texture);
					
					if (!texture) {
						console.error('Texture is null, falling back to default avatar');
						return this.createSimpleImage(
							menu.config.classicMode ? 'avatarUnknownClassic' : 'avatarUnknownSquare',
							0, 0, menu, 0.35
						);
					}
					
					const sprite = new Sprite(texture);
					sprite.anchor.set(0.5);
					
					let targetWidth, targetHeight;
					
					if (tournament) {
						targetWidth = 240;
						targetHeight = 240;
					} else {
						targetWidth = 360;
						targetHeight = 360;
					}
					
					const scaleX = targetWidth / texture.width;
					const scaleY = targetHeight / texture.height;
					const scale = Math.min(scaleX, scaleY);
					
					sprite.scale.set(scale * 0.95);
					
					sprite.alpha = 0;
					return sprite;
				} catch (loadError) {
					console.error('Failed to load texture from URL:', loadError);
					return this.createSimpleImage(
						menu.config.classicMode ? 'avatarUnknownClassic' : 'avatarUnknownSquare',
						0, 0, menu, 0.35
					);
				}
			} else {
				if (!this.assets.has(avatarKey)) {
					console.warn(`Avatar asset ${avatarKey} not found, using fallback`);
					return this.createSimpleImage(
						menu.config.classicMode ? 'avatarUnknownClassic' : 'avatarUnknownSquare',
						0, 0, menu, 0.35
					);
				}
				
				const texture = this.assets.get(avatarKey);
				const sprite = new Sprite(texture);
				sprite.anchor.set(0.5);
				sprite.scale.set(0.35);
				sprite.alpha = 0;
				return sprite;
			}
		} catch (error) {
			console.error('Failed to create player avatar:', error);
			return null;
		}
	}

	static async preparePlayAvatarImages(menu: Menu): Promise<void> {
		// Clean up existing avatars
		this.playAvatars.forEach(avatar => {
			if (avatar && avatar.parent) {
				avatar.parent.removeChild(avatar);
			}
			if (avatar) {
				avatar.destroy();
			}
		});
		this.playAvatars = [];

		// Create player avatar (left)
		if (menu.playerData?.avatar) {
			console.log('Loading player avatar:', menu.playerData.avatar);
			try {
				const leftAvatar = await MenuImageManager.createPlayerAvatarFromAsset(
					menu.playerData.avatar,
					menu
				);
				if (leftAvatar) {
					leftAvatar.x = 335;
					leftAvatar.y = 365;
					leftAvatar.alpha = 0; // Start with alpha 0
					// Don't add to scene here - let the overlay system handle it
					this.playAvatars.push(leftAvatar);
				}
			} catch (error) {
				console.error('Failed to load custom avatar, using fallback:', error);
				const fallbackAvatar = MenuImageManager.createSimpleImage(
					menu.config.classicMode ? 'avatarUnknownClassic' : 'avatarUnknownSquare',
					335,
					365,
					menu,
					0.35
				);
				if (fallbackAvatar) {
					fallbackAvatar.alpha = 0;
					this.playAvatars.push(fallbackAvatar);
				}
			}
		} else {
			const defaultLeftAvatar = MenuImageManager.createSimpleImage(
				menu.config.classicMode ? 'avatarUnknownClassic' : 'avatarUnknownSquare',
				335,
				369.5,
				menu,
				0.35
			);
			if (defaultLeftAvatar) {
				defaultLeftAvatar.alpha = 0;
				this.playAvatars.push(defaultLeftAvatar);
			}
		}

		// Create opponent avatar (right)
		let rightAvatar;
		if (menu.opponentData?.avatar) {
			try {
				rightAvatar = await this.createPlayerAvatarFromAsset(
					menu.opponentData.avatar,
					menu
				);
				if (rightAvatar) {
					rightAvatar.x = 785;
					rightAvatar.y = 365;
					rightAvatar.alpha = 0;
					this.playAvatars.push(rightAvatar);
				}
			} catch (error) {
				console.error('Failed to load opponent avatar, using fallback:', error);
				rightAvatar = this.createRightPlayerFallback(menu);
				if (rightAvatar) {
					rightAvatar.alpha = 0;
					this.playAvatars.push(rightAvatar);
				}
			}
		} else {
			rightAvatar = this.createRightPlayerFallback(menu);
			if (rightAvatar) {
				rightAvatar.alpha = 0;
				this.playAvatars.push(rightAvatar);
			}
		}
	}

	private static createRightPlayerFallback(menu: Menu): Sprite | null {
		console.log('Creating right player fallback');
		const rightAvatarData = this.getRightPlayerAvatarData(menu);
		console.log('Right avatar data:', rightAvatarData);

		const avatar = this.createSimpleImage(
			rightAvatarData.name,
			rightAvatarData.x,
			rightAvatarData.y,
			menu,
			0.35
		);
		
		console.log('Created fallback avatar:', avatar);
		return avatar;
	}

	private static getRightPlayerAvatarData(menu: Menu): { name: string, x: number, y: number } {
		console.log(`Game Config ${menu.config.variant}, Guest Name: ${menu.config.guestName}`);
		if (menu.config.variant === '1vAI' || menu.config.guestName === 'butibot') {
			return {
				name: menu.config.classicMode ? 'avatarBotClassic' : 'avatarBotSquare',
				x: 785,
				y: 365
			};
		} else {
			return {
				name: menu.config.classicMode ? 'avatarUnknownClassic' : 'avatarUnknownSquare',
				x: 785,
				y: 369.5
			};
		}
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

	static hidePlayAvatarImages(menu: Menu): void {
		this.playAvatars.forEach(squareAvatar => {
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

	static getAllTournamentAvatarImages(): Sprite[] {
		return this.tournamentAvatars;
	}

	static getAllPlayAvatarImages(): Sprite[] {
		return this.playAvatars;
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
		
		avatar.eventMode = 'none';
		avatar.cursor = 'default';
		
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

	static createHeaderImages(menu: Menu): void {
		this.headerImages.forEach(header => {
			if (header && header.parent) {
				header.parent.removeChild(header);
			}
			if (header) {
				header.destroy();
			}
		});
		this.headerImages = [];
	}
	
	static createHeaderSprite(headerType: string, menu: Menu): Sprite | null {
		let assetName: string;
		
		if (menu.config.classicMode) {
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
		menu.menuHidden.addChild(headerSprite);
		
		return headerSprite;
	}
	
	static getAllHeaderImages(): Sprite[] {
		return this.headerImages;
	}
	
	static prepareHeaderForOverlay(headerSprite: Sprite, menu: Menu): void {
		if (headerSprite) {
			headerSprite.alpha = 0;
			if (headerSprite.parent) {
				headerSprite.parent.removeChild(headerSprite);
			}
			menu.renderLayers.overlays.addChild(headerSprite);
		}
	}
	
	static hideHeaderFromOverlay(headerSprite: Sprite, menu: Menu): void {
		if (headerSprite) {
			if (headerSprite.parent) {
				headerSprite.parent.removeChild(headerSprite);
			}
			menu.menuHidden.addChild(headerSprite);
			headerSprite.alpha = 0;
		}
	}

	static async updateRightPlayerAvatar(menu: Menu): Promise<void> {
		const rightAvatarIndex = this.playAvatars.findIndex(avatar => avatar && avatar.x === 785);
		
		if (rightAvatarIndex !== -1) {
			const rightAvatar = this.playAvatars[rightAvatarIndex];
			if (rightAvatar && rightAvatar.parent) {
				rightAvatar.parent.removeChild(rightAvatar);
			}
			if (rightAvatar) {
				rightAvatar.destroy();
			}
			this.playAvatars.splice(rightAvatarIndex, 1);
		}

		let rightAvatar;
		if (menu.opponentData?.avatar) {
			try {
				rightAvatar = await this.createPlayerAvatarFromAsset(
					menu.opponentData.avatar,
					menu
				);
				if (rightAvatar) {
					rightAvatar.x = 785;
					rightAvatar.y = 365;
					rightAvatar.alpha = 0;
					menu.renderLayers.overlays.addChild(rightAvatar);
					this.playAvatars.push(rightAvatar);
					
					this.animateAvatarFadeIn(rightAvatar);
				}
			} catch (error) {
				console.error('Failed to load opponent avatar, using fallback:', error);
				rightAvatar = this.createRightPlayerFallback(menu);
			}
		} else {
			rightAvatar = this.createRightPlayerFallback(menu);
		}

		if (rightAvatar && !menu.renderLayers.overlays.children.includes(rightAvatar)) {
			rightAvatar.alpha = 0;
			menu.renderLayers.overlays.addChild(rightAvatar);
			this.playAvatars.push(rightAvatar);
			
			this.animateAvatarFadeIn(rightAvatar);
		}
	}

	static async updateLeftPlayerAvatar(menu: Menu): Promise<void> {
		const leftAvatarIndex = this.playAvatars.findIndex(avatar => avatar && avatar.x === 335); // Assuming left avatar x position
		
		if (leftAvatarIndex !== -1) {
			const leftAvatar = this.playAvatars[leftAvatarIndex];
			if (leftAvatar && leftAvatar.parent) {
				leftAvatar.parent.removeChild(leftAvatar);
			}
			if (leftAvatar) {
				leftAvatar.destroy();
			}
			this.playAvatars.splice(leftAvatarIndex, 1);
		}
	
		let leftAvatar;
		if (menu.playerData?.avatar) {
			try {
				leftAvatar = await this.createPlayerAvatarFromAsset(
					menu.playerData.avatar,
					menu
				);
				if (leftAvatar) {
					leftAvatar.x = 335;
					leftAvatar.y = 365;
					leftAvatar.alpha = 0;
					menu.renderLayers.overlays.addChild(leftAvatar);
					this.playAvatars.push(leftAvatar);
					
					this.animateAvatarFadeIn(leftAvatar);
				}
			} catch (error) {
				console.error('Failed to load opponent avatar, using fallback:', error);
				leftAvatar = this.createRightPlayerFallback(menu);
			}
		} else {
			leftAvatar = this.createRightPlayerFallback(menu);
		}
	
		if (leftAvatar && !menu.renderLayers.overlays.children.includes(leftAvatar)) {
			leftAvatar.alpha = 0;
			menu.renderLayers.overlays.addChild(leftAvatar);
			this.playAvatars.push(leftAvatar);
			
			this.animateAvatarFadeIn(leftAvatar);
		}
	}

	private static animateAvatarFadeIn(avatar: any): void {
		const fadeInDuration = 300;
		const startTime = Date.now();
		
		const animate = () => {
			const elapsed = Date.now() - startTime;
			const progress = Math.min(elapsed / fadeInDuration, 1);
			
			avatar.alpha = progress;
			
			if (progress < 1) {
				requestAnimationFrame(animate);
			}
		};
		
		requestAnimationFrame(animate);
	}

	// Cleanup
	static cleanup(): void {
		const imageArrays = [
			this.wallImages,
			this.avatarImages, 
			this.classicAvatarImages,
			this.tournamentAvatars,
			this.playAvatars,
			this.pinkLogoImages,
			this.classicLogoImages,
			this.headerImages
		];
		
		imageArrays.forEach(imageArray => {
			imageArray.forEach(image => {
				if (image?.parent) {
					image.parent.removeChild(image);
				}
				if (image) {
					image.destroy();
				}
			});
		});
		
		this.wallImages = [];
		this.avatarImages = [];
		this.classicAvatarImages = [];
		this.tournamentAvatars = [];
		this.playAvatars = [];
		this.pinkLogoImages = [];
		this.classicLogoImages = [];
		this.headerImages = [];
		
		this.isAnimating = false;
		
		this.assets.clear();
	}

	static bringAvatarsToFront(menu: Menu): void {
		this.playAvatars.forEach((avatar, index) => {
			if (avatar && avatar.parent) {
				avatar.parent.removeChild(avatar);
				menu.renderLayers.overlays.addChild(avatar);
			}
		});
		
		if (menu.renderLayers.overlays.sortableChildren !== undefined) {
			menu.renderLayers.overlays.sortableChildren = true;
		}
	}

	static enableAvatarInteractivity(): void {
		this.avatarImages.forEach(avatar => {
			if (avatar) {
				avatar.eventMode = 'static';
				avatar.cursor = 'pointer';
			}
		});
		this.classicAvatarImages.forEach(avatar => {
			if (avatar) {
				avatar.eventMode = 'static';
				avatar.cursor = 'pointer';
			}
		});
	}
	
	static disableAvatarInteractivity(): void {
		this.avatarImages.forEach(avatar => {
			if (avatar) {
				avatar.eventMode = 'none';
				avatar.cursor = 'default';
				avatar.interactiveChildren = false;
			}
		});
		this.classicAvatarImages.forEach(avatar => {
			if (avatar) {
				avatar.eventMode = 'none';
				avatar.cursor = 'default';
				avatar.interactiveChildren = false;
			}
		});
	}

	static async updateTournamentPlayerAvatars(
		menu: Menu,
		leftPlayerData: any,
		rightPlayerData: any
	): Promise<void> {
		if (leftPlayerData?.avatar) {
			try {
				const leftAvatar = await this.createPlayerAvatarFromAsset(
					leftPlayerData.avatar,
					menu,
					true
				);
				if (leftAvatar) {
					leftAvatar.x = 1225.5;
					leftAvatar.y = 344.5;
					leftAvatar.alpha = 0;
					
					const oldLeftIndex = this.tournamentAvatars.findIndex(a => a.x === 1225.5);
					if (oldLeftIndex !== -1) {
						const oldLeft = this.tournamentAvatars[oldLeftIndex];
						if (oldLeft && oldLeft.parent) {
							oldLeft.parent.removeChild(oldLeft);
						}
						this.tournamentAvatars.splice(oldLeftIndex, 1);
					}
					
					menu.renderLayers.overlays.addChild(leftAvatar);
					this.tournamentAvatars.push(leftAvatar);
					this.animateAvatarFadeIn(leftAvatar);
				}
			} catch (error) {
				console.error('Failed to load left player avatar:', error);
			}
		}
		
		if (rightPlayerData?.avatar) {
			try {
				const rightAvatar = await this.createPlayerAvatarFromAsset(
					rightPlayerData.avatar,
					menu,
					true
				);
				if (rightAvatar) {
					rightAvatar.x = 1524.5;
					rightAvatar.y = 344.5;
					rightAvatar.alpha = 0;
					
					const oldRightIndex = this.tournamentAvatars.findIndex(a => a.x === 1524.5);
					if (oldRightIndex !== -1) {
						const oldRight = this.tournamentAvatars[oldRightIndex];
						if (oldRight && oldRight.parent) {
							oldRight.parent.removeChild(oldRight);
						}
						this.tournamentAvatars.splice(oldRightIndex, 1);
					}
					
					menu.renderLayers.overlays.addChild(rightAvatar);
					this.tournamentAvatars.push(rightAvatar);
					this.animateAvatarFadeIn(rightAvatar);
				}
			} catch (error) {
				console.error('Failed to load right player avatar:', error);
			}
		}
	}
}
