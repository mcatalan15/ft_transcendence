import { WebSocketManager } from '../../utils/network/WebSocketManager';
import { PongGame } from '../engine/Game';

export class PongNetworkManager {
  private wsManager: WebSocketManager;
  private game: PongGame;
  private playerNumber: number = 0;
  private lastUpdateTime: number = 0;
  
  constructor(game: PongGame, gameId: string) {
  this.game = game;
  
  // Create a new WebSocketManager instance specifically for this game
  // Don't use getInstance() - create a dedicated instance for the game
  this.wsManager = new WebSocketManager(
    sessionStorage.getItem('username') ?? 'undefined',
    `ws://localhost:3100/ws/socket/game` // Base URL, gameId will be appended
  );

  // Set reference in game for bidirectional communication
  this.game.networkManager = this;

  // Register handlers
  this.setupHandlers();
  
  // Connect to game
  this.connect(gameId);
}
  
  private setupHandlers() {
    this.wsManager.registerHandler('GAME_START', () => {
      console.log('Game started by server!');
      this.game.start();
    });
    
    this.wsManager.registerHandler('PLAYER_ASSIGNED', (message) => {
      this.playerNumber = message.playerNumber;
      this.game.localPlayerNumber = message.playerNumber;
      console.log('Server assigned player number:', this.playerNumber);
      
      // Show player assignment in UI
      this.showPlayerAssignment();
    });
    
    this.wsManager.registerHandler('PLAYER_CONNECTED', (message) => {
      console.log('Player connected:', message);
      // Show opponent connection status
    });
    
    this.wsManager.registerHandler('PLAYER_DISCONNECTED', () => {
      console.log('Other player disconnected');
      // Show disconnection message in game
      this.showDisconnectionMessage();
    });
    
    this.wsManager.registerHandler('GAME_STATE_UPDATE', (message) => {
      this.lastUpdateTime = Date.now();
      
      // Extract game state and update the game
      const gameState = message.data || message;
      if (gameState) {
        this.game.updateFromServer(gameState);
      }
    });
    
    this.wsManager.registerHandler('GAME_READY', () => {
      console.log('Both players connected, game is ready to start');
      // Hide loading UI, show ready state
    });
  }
  
  async connect(gameId: string) {
    try {
      console.log('Connecting to game session:', gameId);
      
      // Use WebSocketManager to join the game
      const success = await this.wsManager.joinGame(gameId);
      
      if (success) {
        console.log('Successfully joined game session');
        // Setup input handlers after successful connection
        this.setupInputHandlers();
      } else {
        throw new Error('Failed to join game session');
      }
      
    } catch (error) {
      console.error('Failed to connect to game:', error);
      throw error;
    }
  }

  private showPlayerAssignment() {
    const playerText = this.playerNumber === 1 ? 'Left Paddle (Player 1)' : 'Right Paddle (Player 2)';
    console.log(`You are: ${playerText}`);
    // TODO: Show this in the game UI
  }
  
  private showDisconnectionMessage() {
    console.log('Opponent disconnected from the game');
    // TODO: Show disconnection overlay in game
  }
  
  getPlayerNumber(): number {
    return this.playerNumber;
  }

private handleKeyDown = (e: KeyboardEvent) => {
  if (!this.playerNumber) return;
  
  const isPlayer1 = this.playerNumber === 1;
  const validKeys = isPlayer1 ? ['w', 's'] : ['ArrowUp', 'ArrowDown'];
  
  if (validKeys.includes(e.key)) {
    const isUp = e.key === 'w' || e.key === 'ArrowUp';
    const dir = isUp ? -1 : 1;
    
    // Apply input locally first for responsive controls
    const paddle = this.game.entities.find(e => 
      e.id === (isPlayer1 ? 'paddleL' : 'paddleR'));
    if (paddle) {
      const input = paddle.getComponent('input');
      if (input) {
        // Set the correct properties
        input.upPressed = dir < 0;
        input.downPressed = dir > 0;
        console.log(`Set local input: up=${input.upPressed}, down=${input.downPressed}`);
      }
    }
    
    // Then send to server
    this.wsManager.sendPaddleInput(this.playerNumber, dir);
  }
};

private handleKeyUp = (e: KeyboardEvent) => {
  if (!this.playerNumber) return;
  
  const isPlayer1 = this.playerNumber === 1;
  const validKeys = isPlayer1 ? ['w', 's'] : ['ArrowUp', 'ArrowDown'];
  
  if (validKeys.includes(e.key)) {
    const isUp = e.key === 'w' || e.key === 'ArrowUp';
    
    // Apply input locally first
    const paddle = this.game.entities.find(e => 
      e.id === (isPlayer1 ? 'paddleL' : 'paddleR'));
    if (paddle) {
      const input = paddle.getComponent('input');
      if (input) {
        // Only reset the property for the key that was released
        if (isUp) {
          input.upPressed = false;
        } else {
          input.downPressed = false;
        }
      }
    }
    
    // Then send to server
    this.wsManager.sendPaddleInput(this.playerNumber, 0);
  }
};

  setupInputHandlers() {
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);
  }

  destroy() {
    // Proper cleanup with the correctly bound handlers
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
    
    // Close connection
    this.wsManager.close();
  }
}