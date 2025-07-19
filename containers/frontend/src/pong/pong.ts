// pong.ts
import { Application } from "pixi.js";
import { Menu } from './menu/Menu';
import { Preconfiguration } from "./utils/GameConfig";
import { gameManager } from "../utils/GameManager";
import { TournamentManager } from "../utils/TournamentManager";

class BrowserOptimizer {
static isFirefox = navigator.userAgent.toLowerCase().includes('firefox');
static isChrome = navigator.userAgent.toLowerCase().includes('chrome');

static getOptimalSettings(): {
	antialias: boolean;
	resolution: number;
	powerPreference: 'default' | 'high-performance' | 'low-power';
	autoDensity: boolean;
} {
	if (this.isFirefox) {
		return {
			antialias: false,
			resolution: 1,
			powerPreference: 'default',
			autoDensity: false
		};
	} else {
		return {
			antialias: true,
			resolution: 2,
			powerPreference: 'high-performance',
			autoDensity: true
		};
	}
}
}

export async function initGame(container: HTMLElement, preconfiguration?: Preconfiguration) {
    if (!container.id) {
        container.id = `pong-container-${Date.now()}`;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    const gameId = urlParams.get('gameId');
    const hostName = urlParams.get('hostName');
    const guestName = urlParams.get('guestName');

	if (mode === 'online' && gameId) {
		console.log('Direct online game detected, initializing game directly');
		
		const browserSettings = BrowserOptimizer.getOptimalSettings();
		const app = new Application();
		await app.init({
			background: '#171717',
			width: 1800,
			height: 750,
			antialias: browserSettings.antialias,
			resolution: browserSettings.resolution,
			autoDensity: browserSettings.autoDensity,
			powerPreference: BrowserOptimizer.isFirefox ? 'high-performance' : 'low-power',
			
			...(BrowserOptimizer.isFirefox && {
				clearBeforeRender: true,
				preserveDrawingBuffer: false
			})
		});

		const language = localStorage.getItem('i18nextLng') || 'en';
		container.appendChild(app.canvas);

		const gameConfig = {
			mode: 'online' as const,
			variant: '1v1' as const,
			classicMode: true,
			filters: false,
			gameId: gameId,
			hostName: hostName,
			guestName: guestName,
			isCurrentPlayerHost: hostName === sessionStorage.getItem('username'),
			currentPlayerName: sessionStorage.getItem('username') || undefined
		};

		console.log('🎮 Creating direct online game with config:', gameConfig);

		const { PongGame } = await import('./engine/Game');
		const game = new PongGame(app, gameConfig, language);
		
		gameManager.registerGame(container.id, game, undefined, app);
		
		await game.init();
		
		console.log('🌐 Creating PongNetworkManager for direct game...');
		const { PongNetworkManager } = await import('./network/PongNetworkManager');
		const networkManager = new PongNetworkManager(game, gameId);
		
		console.log('🌐 PongNetworkManager created and connecting...');
		
		return;
	}

    const browserSettings = BrowserOptimizer.getOptimalSettings();
    
    console.log(`Browser detected: ${BrowserOptimizer.isFirefox ? 'Firefox' : 'Chrome'}`);
    console.log('Using settings:', browserSettings);

    const app = new Application();
    await app.init({
        background: '#171717',
        width: 1800,
        height: 750,
        antialias: browserSettings.antialias,
        resolution: browserSettings.resolution,
        autoDensity: browserSettings.autoDensity,
        powerPreference: BrowserOptimizer.isFirefox ? 'high-performance' : 'low-power',
        
        ...(BrowserOptimizer.isFirefox && {
            clearBeforeRender: true,
            preserveDrawingBuffer: false
        })
    });

    const language = localStorage.getItem('i18nextLng') || 'en';
    container.appendChild(app.canvas);

    const finalPreconfiguration: Preconfiguration = preconfiguration || {
        mode: 'local',
        variant: '1v1',
        classicMode: true,
        hasInvitationContext: false,
        invitationData: null
    };

    console.log('🎮 initGame received preconfiguration:', finalPreconfiguration);
	
	const menu = new Menu(app, language, BrowserOptimizer.isFirefox, true, finalPreconfiguration);

	const tournamentManager = new TournamentManager(app);
	menu.tournamentManager = tournamentManager;
	
    await menu.init(false, true);

	

    gameManager.registerGame(container.id, menu, undefined, app);
}