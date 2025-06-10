import { WebSocketManager } from '../../utils/network/WebSocketManager';
import { PongGame } from '../engine/Game';

export class PongNetworkManager {
  private wsManager: WebSocketManager;
  private game: PongGame;
  private playerNumber: number = 0;
  private lastUpdateTime: number = 0;
  
  constructor(game: PongGame, gameId: string) {
    this.game = game;
    this.wsManager = WebSocketManager.getInstance(sessionStorage.getItem('username') ?? 'undefined');
    
    // Register handlers
    this.setupHandlers();
    
    // Connect to game
    this.connect(gameId);
  }
  
  private setupHandlers() {
    this.wsManager.registerHandler('GAME_START', () => {
      console.log('Game started!');
      this.game.start();
    });
    
    this.wsManager.registerHandler('PLAYER_ASSIGNED', (message) => {
      this.playerNumber = message.playerNumber;
      // Also set on the game for reference in updateFromServer
      this.game.localPlayerNumber = message.playerNumber;
      console.log('Server assigned player number:', this.playerNumber);
    });
    
    this.wsManager.registerHandler('PLAYER_DISCONNECTED', () => {
      console.log('Other player disconnected');
      // Show disconnection message in game
    });
    
    this.wsManager.registerHandler('GAME_STATE_UPDATE', (message) => {
      this.lastUpdateTime = Date.now();
      
      // Extract game state and update the game
      const gameState = message.data || message;
      if (gameState) {
        this.game.updateFromServer(gameState);
      }
    });
  }
  
  async connect(gameId: string) {
    try {
      await this.wsManager.connect(gameId);
      console.log('Connected to game session');
      
      // Set up input handlers
      this.setupInputHandlers();
    } catch (err) {
      console.error('Failed to connect to game session', err);
    }
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