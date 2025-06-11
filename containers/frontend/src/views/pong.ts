import { Application, Graphics, Text } from 'pixi.js';
import { WebSocketManager } from '../utils/network/WebSocketManager';
import { initGame } from '../pong/pong';
import { PongGame } from '../pong/engine/Game';
import { PongNetworkManager } from '../pong/network/PongNetworkManager';

export function showPong(container: HTMLElement): void {
  // Clear the container
  container.innerHTML = '';
  
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
}

async function initOnlineGame(container: HTMLElement, gameId: string, opponent: string | null) {
  // Create canvas for the game
  const canvas = document.createElement('canvas');
  canvas.style.display = 'block';
  canvas.style.margin = '0 auto';
  container.appendChild(canvas);
  
  // Show loading message
  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'text-center text-white mt-4';
  loadingDiv.innerHTML = `
    <div class="text-xl mb-2">Connecting to game session...</div>
    <div class="text-lg">Game ID: ${gameId}</div>
    ${opponent ? `<div class="text-lg">Opponent: ${opponent}</div>` : ''}
  `;
  container.appendChild(loadingDiv);
  
  try {
    // Initialize PIXI application
    const app = new Application();
    await app.init({
      view: canvas,
      background: "#171717",
      width: 1500,
      height: 500,
      antialias: false,
      resolution: 2,
      autoDensity: true,
    });
    
    // Create game configuration for online mode
    const gameConfig = {
      classicMode: false,
      isOnline: true,
      gameId: gameId,
      opponent: opponent
    };
    
    // Initialize the PongGame with online configuration
    const pongGame = new PongGame(app, gameConfig);
    await pongGame.init();
    
    // Initialize network manager for this game
    const networkManager = new PongNetworkManager(pongGame, gameId);
    
    // Store reference for cleanup
    (window as any).currentPongGame = pongGame;
    (window as any).currentNetworkManager = networkManager;
    
    // Remove loading message once connected
    loadingDiv.remove();
    
    console.log('Online Pong game initialized successfully');
    
  } catch (error) {
    console.error('Failed to initialize online game:', error);
    loadingDiv.innerHTML = `
      <div class="text-red-500 text-xl">Failed to connect to game session</div>
      <div class="text-white mt-2">Error: ${error}</div>
      <button onclick="window.history.back()" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded mt-4">
        Go Back
      </button>
    `;
  }
}