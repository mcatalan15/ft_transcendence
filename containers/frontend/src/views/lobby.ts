// src/views/lobby.ts
import { WebSocketManager } from '../network/WebSocketManager';

export function showLobby(container: HTMLElement, userId: string) {
  const wsManager = WebSocketManager.getInstance(userId);
  let gameId: string | null = null;
  
  const lobbyDiv = document.createElement('div');
  lobbyDiv.className = 'lobby-container';
  
  lobbyDiv.innerHTML = `
    <h1>Pong Multiplayer Lobby</h1>
    <div class="lobby-actions">
      <button id="create-game">Create New Game</button>
      <div class="join-game">
        <input type="text" id="game-id-input" placeholder="Enter Game ID">
        <button id="join-game">Join Game</button>
      </div>
    </div>
    <div id="lobby-status" class="lobby-status"></div>
    <button id="back-button">Back to Home</button>
  `;
  
  container.appendChild(lobbyDiv);
  
  // Connect to WebSocket
  wsManager.connect().then(() => {
    console.log('Connected to game server');
    updateStatus('Connected to server');
  }).catch(err => {
    updateStatus('Failed to connect: ' + err.message, true);
  });
  
  // Status updates
  function updateStatus(message: string, isError = false) {
    const statusEl = document.getElementById('lobby-status');
    if (statusEl) {
      statusEl.textContent = message;
      statusEl.className = isError ? 'lobby-status error' : 'lobby-status';
    }
  }
  
  // Create Game
  document.getElementById('create-game')?.addEventListener('click', async () => {
    try {
      updateStatus('Creating game...');
      gameId = await wsManager.createGame();
      
      updateStatus(`Game created! Waiting for opponent... Game ID: ${gameId}`);
      
      // Listen for opponent joining
      wsManager.registerHandler('PLAYER_JOINED', (data) => {
        updateStatus(`Player ${data.playerName} joined! Starting game...`);
        setTimeout(() => {
          navigate(`/pong?gameId=${gameId}&isHost=true`);
        }, 2000);
      });
      
    } catch (error) {
      updateStatus('Failed to create game: ' + (error as Error).message, true);
    }
  });
  
  // Join Game
  document.getElementById('join-game')?.addEventListener('click', async () => {
    const inputEl = document.getElementById('game-id-input') as HTMLInputElement;
    const gameIdToJoin = inputEl.value.trim();
    
    if (!gameIdToJoin) {
      updateStatus('Please enter a valid Game ID', true);
      return;
    }
    
    try {
      updateStatus('Joining game...');
      await wsManager.joinGame(gameIdToJoin);
      updateStatus('Successfully joined! Starting game...');
      
      setTimeout(() => {
        navigate(`/pong?gameId=${gameIdToJoin}&isHost=false`);
      }, 2000);
      
    } catch (error) {
      updateStatus('Failed to join game: ' + (error as Error).message, true);
    }
  });
  
  // Back button
  document.getElementById('back-button')?.addEventListener('click', () => {
    wsManager.close();
    navigate('/home');
  });
  
  // Clean up on view change
  return () => {
    wsManager.close();
  };
}