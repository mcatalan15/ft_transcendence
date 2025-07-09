import { Application, Graphics, Text } from 'pixi.js';
import { WebSocketManager } from '../utils/network/WebSocketManager';
import { initGame } from '../pong/pong';
import { PongGame } from '../pong/engine/Game';
import { GameConfig } from '../pong/utils/GameConfig';
import { PongNetworkManager } from '../pong/network/PongNetworkManager';
import { HeaderTest } from '../components/generalComponents/testmenu'
import { LanguageSelector } from '../components/generalComponents/languageSelector';
import i18n from '../i18n';
import { navigate } from '../utils/router';

export function showPong(container: HTMLElement): void {
  i18n
    .loadNamespaces('history')
    .then(() => i18n.changeLanguage(i18n.language))
    .then(() => {
    // Clear the container
    container.innerHTML = '';
    
    // Header and Menu
    const headerWrapper = new HeaderTest().getElement();
    headerWrapper.classList.add('fixed', 'top-0', 'left-0', 'w-full', 'z-30');
    container.appendChild(headerWrapper);

    // Language Selector
    const langSelector = new LanguageSelector(() => showPong(container)).getElement();
    container.appendChild(langSelector);

    // Check URL parameters to determine game mode
    const urlParams = new URLSearchParams(window.location.search);
    const gameId = urlParams.get('gameId');
    const mode = urlParams.get('mode');
    const opponent = urlParams.get('opponent');
    
    if (mode === 'online' && gameId) {
      // Initialize online multiplayer game
      initOnlineGame(container, gameId, opponent);
    } else {
      // Initialize local game (existing logic)
      initGame(container);
    }
  });
}

async function initOnlineGame(container: HTMLElement, gameId: string, opponent: string | null) {
  // Create a more comprehensive UI for online game
  container.innerHTML = `  
      <div id="game-canvas-container" class="mb-4">
        <!-- Canvas will be inserted here -->
      </div>
  `;
  
  // Add back button functionality
  const backButton = document.getElementById('back-to-chat');
  if (backButton) {
    backButton.addEventListener('click', () => {
      // Clean up any existing game connections before leaving
      if ((window as any).currentPongGame) {
        (window as any).currentPongGame.destroy?.();
      }
      if ((window as any).currentNetworkManager) {
        (window as any).currentNetworkManager.disconnect?.();
      }
      navigate('/chat');
    });
  }

  try {
    // Get the canvas container
    const canvasContainer = document.getElementById('game-canvas-container');
    if (!canvasContainer) {
      throw new Error('Canvas container not found');
    }

    // Create canvas for the game
    const canvas = document.createElement('canvas');
/*     canvas.style.display = 'block';
    canvas.style.margin = '0 auto';
    canvas.style.border = '2px solid #374151'; */
    canvasContainer.appendChild(canvas);
    
    // Initialize PIXI application
    const app = new Application();
    await app.init({
      view: canvas,
      background: "#171717",
      width: 1800,
      height: 800,
      antialias: false,
      resolution: 2,
      autoDensity: true,
    });
    
    // Create game configuration for online mode
    const config: GameConfig = {
	  mode: 'online',
	  variant: '1v1',
	  classicMode: true,
	  filters: false,
	  players: [
		{
		  id: localStorage.getItem('playerId') || 'player1',
		  name: localStorage.getItem('playerName') || 'Player 1',
		  type: 'remote',
		  side: 'left',
		  team: 0,
		},
		{
		  id: opponent || 'player2',
		  name: opponent || 'Player 2',
		  type: 'remote',
		  side: 'right',
		  team: 1,
		},
	  ],
	  player2Id: opponent || null,
	  network: {
		roomId: gameId,
		isHost: false,
		serverUrl: WebSocketManager.getInstance().getGameWebSocketUrl() || getWsUrl('/game'),
	  },
	};
    
    console.log('Creating PongGame with default config:', config);
	const language = localStorage.getItem('language') || 'en';

    // Initialize the PongGame with online configuration
    const pongGame = new PongGame(app, config, language);
    await pongGame.init();
    
    // Initialize network manager for this game
    console.log('Creating PongNetworkManager...');
    const networkManager = new PongNetworkManager(pongGame, gameId);
    
    // Store references for cleanup
    (window as any).currentPongGame = pongGame;
    (window as any).currentNetworkManager = networkManager;
    
    console.log('Online Pong game initialized successfully');
    
  } catch (error) {
    console.error('Failed to initialize online game:', error);
    
    // Show error message
    container.innerHTML = `
      <div class="min-h-screen bg-gray-900 flex flex-col items-center justify-center">
        <div class="text-center">
          <h1 class="text-4xl font-bold text-red-500 mb-4">Connection Failed</h1>
          <p class="text-xl text-white mb-4">Failed to connect to game session</p>
          <p class="text-lg text-gray-400 mb-8">Error: ${error.message}</p>
          <div class="space-x-4">
            <button onclick="location.reload()" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded">
              Retry
            </button>
            <button onclick="navigate('/chat')" class="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded">
              Back to Chat
            </button>
          </div>
        </div>
      </div>
    `;
  }
}