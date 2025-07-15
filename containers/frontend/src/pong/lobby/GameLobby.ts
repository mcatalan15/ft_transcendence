// containers/frontend/src/pong/lobby/GameLobby.ts

import { Container, Text, Graphics } from 'pixi.js';
import { WebSocketManager } from '../../utils/network/WebSocketManager';

export class GameLobby {
  private container: Container;
  private wsManager: WebSocketManager;
  private gameId: string = '';
  private isHost: boolean = false;
  private onGameStart: (gameId: string) => void;

  constructor(container: Container, onGameStart: (gameId: string) => void) {
    this.container = container;
    this.onGameStart = onGameStart;
    this.wsManager = WebSocketManager.getInstance(sessionStorage.getItem('username') ?? 'undefined');
  }

  async createGame(): Promise<void> {
    try {
      // Create background
      const bg = new Graphics();
      bg.beginFill(0x000000, 0.8);
      bg.drawRect(0, 0, 1800, 750);
      bg.endFill();
      this.container.addChild(bg);

      // Show "Creating game..." message
      const creatingText = new Text('Creating game...', {
        fontFamily: 'Arial',
        fontSize: 48,
        fill: 0xFFFFFF,
        align: 'center'
      });
      creatingText.anchor.set(0.5);
      creatingText.position.set(900, 300);
      this.container.addChild(creatingText);

      // Set up handlers
      this.setupLobbyHandlers();

      // Create game on server
      const response = await this.wsManager.createGame();
      this.gameId = response.gameId;
      this.isHost = true;

      // Update UI with game ID
      creatingText.text = `Game Created!\nGame ID: ${this.gameId}\nWaiting for opponent...`;

      // Add copy button
      const copyButton = this.createButton('Copy Game ID', 900, 400, () => {
        navigator.clipboard.writeText(this.gameId);
      });
      this.container.addChild(copyButton);

    } catch (error) {
      console.error('Failed to create game:', error);
      this.showError('Failed to create game');
    }
  }

  async joinGame(gameId: string): Promise<void> {
    try {
      // Create background
      const bg = new Graphics();
      bg.beginFill(0x000000, 0.8);
      bg.drawRect(0, 0, 1800, 750);
      bg.endFill();
      this.container.addChild(bg);

      // Show "Joining game..." message
      const joiningText = new Text('Joining game...', {
        fontFamily: 'Arial',
        fontSize: 48,
        fill: 0xFFFFFF,
        align: 'center'
      });
      joiningText.anchor.set(0.5);
      joiningText.position.set(900, 375);
      this.container.addChild(joiningText);

      // Set up handlers
      this.setupLobbyHandlers();

      // Join game on server
      await this.wsManager.joinGame(gameId);
      this.gameId = gameId;
      this.isHost = false;

    } catch (error) {
      console.error('Failed to join game:', error);
      this.showError('Failed to join game');
    }
  }

  private setupLobbyHandlers(): void {
    this.wsManager.registerHandler('GAME_CREATED', (message) => {
      console.log('Game created successfully');
    });

    this.wsManager.registerHandler('PLAYER_JOINED', (message) => {
      console.log('Player joined the game');
      // Update UI to show both players ready
      this.showBothPlayersReady();
    });

    this.wsManager.registerHandler('GAME_START', () => {
      console.log('Game starting!');
      this.container.removeChildren();
      this.onGameStart(this.gameId);
    });

    this.wsManager.registerHandler('ERROR', (message) => {
      this.showError(message.error || 'An error occurred');
    });
  }

  private showBothPlayersReady(): void {
    this.container.removeChildren();
    
    const bg = new Graphics();
    bg.beginFill(0x000000, 0.8);
    bg.drawRect(0, 0, 1800, 750);
    bg.endFill();
    this.container.addChild(bg);

    const readyText = new Text('Both players ready!\nStarting game...', {
      fontFamily: 'Arial',
      fontSize: 48,
      fill: 0x00FF00,
      align: 'center'
    });
    readyText.anchor.set(0.5);
    readyText.position.set(900, 375);
    this.container.addChild(readyText);
  }

  private createButton(text: string, x: number, y: number, onClick: () => void): Container {
    const button = new Container();
    
    const bg = new Graphics();
    bg.beginFill(0x333333);
    bg.drawRoundedRect(-100, -25, 200, 50, 10);
    bg.endFill();
    bg.interactive = true;
    bg.buttonMode = true;
    bg.on('pointerdown', onClick);
    
    const buttonText = new Text(text, {
      fontFamily: 'Arial',
      fontSize: 24,
      fill: 0xFFFFFF,
      align: 'center'
    });
    buttonText.anchor.set(0.5);
    
    button.addChild(bg);
    button.addChild(buttonText);
    button.position.set(x, y);
    
    return button;
  }

  private showError(error: string): void {
    this.container.removeChildren();
    
    const bg = new Graphics();
    bg.beginFill(0x000000, 0.8);
    bg.drawRect(0, 0, 1800, 750);
    bg.endFill();
    this.container.addChild(bg);

    const errorText = new Text(`Error: ${error}`, {
      fontFamily: 'Arial',
      fontSize: 36,
      fill: 0xFF0000,
      align: 'center'
    });
    errorText.anchor.set(0.5);
    errorText.position.set(900, 375);
    this.container.addChild(errorText);
  }

  destroy(): void {
    this.container.removeChildren();
  }
}