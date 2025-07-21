import { initGame } from '../pong/pong';
import { HeaderTest } from '../components/generalComponents/testmenu'
import { LanguageSelector } from '../components/generalComponents/languageSelector';
import { GameConfig, Preconfiguration } from '../pong/utils/GameConfig';
import i18n from '../i18n';
import { navigate } from '../utils/router';

async function initDirectOnlineGame(container: HTMLElement, inviteId: string, currentPlayer: string) {
    
    try {
        const { PongGame } = await import('../pong/engine/Game');
        const { PongNetworkManager } = await import('../pong/network/PongNetworkManager');
        const { Application } = await import('pixi.js');
        const { gameManager } = await import('../utils/GameManager');

        const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');
        const browserSettings = {
            antialias: !isFirefox,
            resolution: isFirefox ? 1 : 2,
            powerPreference: isFirefox ? 'default' : 'high-performance',
            autoDensity: !isFirefox
        };

        const urlParams = new URLSearchParams(window.location.search);
        const hostName = urlParams.get('hostName') || 'Host';
        const guestName = urlParams.get('guestName') || 'Guest';


        const isHost = hostName === currentPlayer;
        const opponentName = isHost ? guestName : hostName;

        const gameData = {
            gameId: inviteId,
            hostId: hostName,
            guestId: guestName,
            status: 'waiting'
        };

        const app = new Application();
        await app.init({
            background: '#171717',
            width: 1800,
            height: 750,
            antialias: browserSettings.antialias,
            resolution: browserSettings.resolution,
            autoDensity: browserSettings.autoDensity,
            powerPreference: undefined,
            
            ...(isFirefox && {
                clearBeforeRender: true,
                preserveDrawingBuffer: false
            })
        });

        const language = localStorage.getItem('i18nextLng') || 'en';
        container.appendChild(app.canvas);

        const config: GameConfig = {
            mode: 'online',
            variant: '1v1',
            classicMode: true,
            filters: false,
            gameId: inviteId,
            hostName: hostName,
            guestName: guestName,
            currentPlayerName: currentPlayer,
            isCurrentPlayerHost: isHost,
            players: [
                {
                    id: isHost ? hostName : guestName,
                    name: currentPlayer,
                    type: 'remote',
                    side: isHost ? 'left' : 'right',
                },
                {
                    id: isHost ? guestName : hostName,
                    name: opponentName,
                    type: 'remote',
                    side: isHost ? 'right' : 'left',
                },
            ],
            network: {
                roomId: inviteId,
                isHost: isHost,
                serverUrl: 'ws://localhost:8080/socket/game',
            },
        };
        
        const pongGame = new PongGame(app, config, language, isFirefox);
        await pongGame.init();
		
		const networkManager = new PongNetworkManager(pongGame, inviteId);
		
		(window as any).currentPongGame = pongGame;
		(window as any).currentNetworkManager = networkManager;

		gameManager.registerGame(container.id, pongGame, networkManager, app);
		
	} catch (error) {
		console.error('Failed to initialize direct online game:', error);
    
    	const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
		
		container.innerHTML = `
			<div style="color: white; text-align: center; margin-top: 100px;">
				<h2>Connection Failed</h2>
				<p>Error: ${errorMessage}</p>
				<button onclick="location.reload()" style="margin: 10px; padding: 10px 20px; background: #333; color: white; border: none; border-radius: 5px;">
					Retry
				</button>
				<button onclick="window.location.href='/chat'" style="margin: 10px; padding: 10px 20px; background: #333; color: white; border: none; border-radius: 5px;">
					Back to Chat
				</button>
			</div>
		`;
	}
}

export function showPong(container: HTMLElement): void {
    const urlParams = new URLSearchParams(window.location.search);
    const isFromInvitation = urlParams.get('invitation') === 'true';
    const inviteId = urlParams.get('inviteId');
    
    i18n
        .loadNamespaces('history')
        .then(() => i18n.changeLanguage(i18n.language))
        .then(async () => {
            container.innerHTML = '';
            
            const headerWrapper = new HeaderTest().getElement();
            headerWrapper.classList.add('fixed', 'top-0', 'left-0', 'w-full', 'z-30');
            container.appendChild(headerWrapper);

            const langSelector = new LanguageSelector(() => showPong(container)).getElement();
            container.appendChild(langSelector);

            if (isFromInvitation && inviteId) {
                const currentPlayer = sessionStorage.getItem('username');
                
                if (!currentPlayer) {
                    console.error('No username in session storage');
                    container.innerHTML += '<div class="error">Please login first</div>';
                    return;
                }
                
                await initDirectOnlineGame(container, inviteId, currentPlayer);
                return;
            }
            
            const preconfiguration: Preconfiguration = {
                mode: 'local',
                variant: '1v1',
                classicMode: false,
                hasInvitationContext: false,
                invitationData: null
            };

            initGame(container, preconfiguration);
        })
        .catch(error => {
            console.error('Failed to load Pong:', error);
            container.innerHTML += '<div class="error">Failed to load game</div>';
        });
}