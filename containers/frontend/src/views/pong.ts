import { initGame } from '../pong/pong';
import { HeaderTest } from '../components/generalComponents/testmenu'
import { LanguageSelector } from '../components/generalComponents/languageSelector';
import { GameConfig, Preconfiguration } from '../pong/utils/GameConfig';
import i18n from '../i18n';

// Add this function for direct online game initialization
async function initDirectOnlineGame(container: HTMLElement, inviteId: string, currentPlayer: string) {
    console.log('🎮 Initializing direct online game from invitation:', { inviteId, currentPlayer });
    
    try {
        // Dynamic imports to avoid circular dependencies
        const { PongGame } = await import('../pong/engine/Game');
        const { PongNetworkManager } = await import('../pong/network/PongNetworkManager');
        const { Application } = await import('pixi.js');

        // Browser optimization (copy from your existing code)
        const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');
        const browserSettings = {
            antialias: !isFirefox,
            resolution: isFirefox ? 1 : 2,
            powerPreference: isFirefox ? 'default' : 'high-performance',
            autoDensity: !isFirefox
        };

        // Initialize PIXI application with SAME settings as regular pong
        const app = new Application();
        await app.init({
            background: '#171717', // Same as regular pong
            width: 1800,
            height: 750, // Same as regular pong (not 800)
            antialias: browserSettings.antialias,
            resolution: browserSettings.resolution,
            autoDensity: browserSettings.autoDensity,
            powerPreference: browserSettings.powerPreference,
            
            ...(isFirefox && {
                clearBeforeRender: true,
                preserveDrawingBuffer: false
            })
        });

        // Append canvas to container with SAME styling as regular pong
        const language = localStorage.getItem('i18nextLng') || 'en';
        container.appendChild(app.canvas);

        // Create online game configuration
        const config: GameConfig = {
            mode: 'online',
            variant: '1v1',
            classicMode: true,
            filters: false,
            gameId: inviteId,
            players: [
                {
                    id: currentPlayer,
                    name: currentPlayer,
                    type: 'remote',
                    side: 'left',
                },
                {
                    id: 'opponent',
                    name: 'Opponent',
                    type: 'remote',
                    side: 'right',
                },
            ],
            network: {
                roomId: inviteId,
                isHost: false,
                serverUrl: 'ws://localhost:8080/socket/game',
            },
        };

        console.log('🎮 Creating PongGame with online config:', config);
        
        // Initialize the game - EXACTLY like regular pong
        const pongGame = new PongGame(app, config, language, isFirefox);
        await pongGame.init();
        
        // Initialize network manager
        console.log('🎮 Creating PongNetworkManager...');
        const networkManager = new PongNetworkManager(pongGame, inviteId);
        
        // Store references for cleanup
        (window as any).currentPongGame = pongGame;
        (window as any).currentNetworkManager = networkManager;
        
        console.log('✅ Direct online Pong game initialized successfully');
        
    } catch (error) {
        console.error('❌ Failed to initialize direct online game:', error);
        
        // Show minimal error message (no custom styling)
        container.innerHTML = `
            <div style="color: white; text-align: center; margin-top: 100px;">
                <h2>Connection Failed</h2>
                <p>Error: ${error.message}</p>
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
            // Clear container first
            container.innerHTML = '';
            
            // Add header and language selector ALWAYS (for both invitation and regular)
            const headerWrapper = new HeaderTest().getElement();
            headerWrapper.classList.add('fixed', 'top-0', 'left-0', 'w-full', 'z-30');
            container.appendChild(headerWrapper);

            const langSelector = new LanguageSelector(() => showPong(container)).getElement();
            container.appendChild(langSelector);

            // Check if this is an invitation - if so, bypass menu entirely
            if (isFromInvitation && inviteId) {
                console.log('🎮 Direct online game via invitation detected, bypassing menu');
                const currentPlayer = sessionStorage.getItem('username') || 'Unknown';
                await initDirectOnlineGame(container, inviteId, currentPlayer);
                return;
            }

            // For non-invitation cases, use normal menu flow
            console.log('🎮 Normal pong initialization via menu');
            const preconfiguration: Preconfiguration = {
                mode: 'local',
                variant: '1v1',
                classicMode: false,
                hasInvitationContext: false,
                invitationData: null
            };

            // Pass preconfiguration to initGame (which will show menu)
            initGame(container, preconfiguration);
        });
}