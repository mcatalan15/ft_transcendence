// backend/pong/ClassicGameSession.js
const ClassicPhysicsEngine = require('./ClassicPhysicsEngine');

class ClassicGameSession {
    constructor(sessionId, player1, player2) {
        this.sessionId = sessionId;
        this.players = {
            player1: { id: player1.id, socket: player1.socket, ready: false },
            player2: { id: player2.id, socket: player2.socket, ready: false }
        };
        
        // Create game state directly (replacing GameCore)
        this.gameState = {
            ball: { x: 900, y: 400 },
            ballVelocity: { x: 200, y: 100 },
            paddle1: { x: 30, y: 400 },
            paddle2: { x: 1770, y: 400 },
            paddleHeight: 100,
            paddleWidth: 20,
            ballRadius: 10,
            width: 1800,
            height: 800,
            score1: 0,
            score2: 0
        };
        
        this.physicsEngine = new ClassicPhysicsEngine(this.gameState); // Pass gameState instead of core
        this.gameStarted = false;
        this.gameEnded = false;
        this.winner = null;
        
        // Input tracking
        this.paddleInputs = { p1: 0, p2: 0 };
        
        // Game loop
        this.tickRate = 60;
        this.lastUpdate = Date.now();
        this.gameLoop = null;
        this.externalBroadcast = null;
        
        console.log(`Classic game session ${sessionId} created with players:`, player1.id, player2.id);
    }

    // Add getState method (replacing GameCore.getState)
    getState() {
        return {
            ball: this.gameState.ball,
            ballVelocity: this.gameState.ballVelocity,
            paddle1: this.gameState.paddle1,
            paddle2: this.gameState.paddle2,
            score1: this.gameState.score1,
            score2: this.gameState.score2
        };
    }

    setExternalBroadcast(broadcastFunction) {
        this.externalBroadcast = broadcastFunction;
    }
    
    addPlayer(player) {
        if (!this.players.player1.socket) {
            this.players.player1 = { ...player, ready: false };
        } else if (!this.players.player2.socket) {
            this.players.player2 = { ...player, ready: false };
        }
        
        this.broadcastToPlayer(player.socket, 'gameJoined', {
            sessionId: this.sessionId,
            yourPlayerNumber: this.players.player1.id === player.id ? 1 : 2
        });
        
        // If both players are connected, they can start
        if (this.players.player1.socket && this.players.player2.socket) {
            this.broadcastToAll('bothPlayersConnected', {
                player1: this.players.player1.id,
                player2: this.players.player2.id
            });
            
            // Auto-start the game when both players are connected
            console.log('Both players connected, auto-starting game...');
            this.players.player1.ready = true;
            this.players.player2.ready = true;
            this.startGame();
        }
    }
    
    setPlayerReady(playerId) {
        console.log(`Player ${playerId} setting ready state`);
        
        if (this.players.player1.id === playerId) {
            this.players.player1.ready = true;
            console.log('Player 1 is now ready');
        } else if (this.players.player2.id === playerId) {
            this.players.player2.ready = true;
            console.log('Player 2 is now ready');
        }
        
        this.broadcastToAll('playerReady', { playerId });
        
        console.log(`Ready state: P1=${this.players.player1.ready}, P2=${this.players.player2.ready}`);
        
        // Start game if both players are ready
        if (this.players.player1.ready && this.players.player2.ready && !this.gameStarted) {
            console.log('Both players ready, starting game!');
            this.startGame();
        }
    }
    
    startGame() {
        this.gameStarted = true;
        console.log(`Starting classic game session ${this.sessionId}`);
        
        this.broadcastToAll('gameStarted', {
            gameState: this.getState(),
            timestamp: Date.now()
        });
        
        this.startGameLoop();
    }
    
    startGameLoop() {
        this.gameLoop = setInterval(() => {
            if (this.gameEnded) {
                this.stopGameLoop();
                return;
            }
            
            const now = Date.now();
            const deltaTime = (now - this.lastUpdate) / 1000;
            
            this.update(deltaTime);
            this.broadcastGameState();
            
            this.lastUpdate = now;
        }, 1000 / this.tickRate);
    }
    
    update(deltaTime) {
        // Use physics engine
        const goal = this.physicsEngine.update(deltaTime, this.paddleInputs);
        
        // Handle scoring
        if (goal) {
            const goalEvent = {
                type: 'GOAL',
                scorer: goal.scorer,    
                score: goal.score
            };

            // Internal broadcast
            this.broadcastToAll('goalScored', goalEvent);

            // External broadcast
            if (this.externalBroadcast) {
                this.externalBroadcast(goalEvent);
            }
            
            // Check for game end
            if (this.gameState.score1 >= 11 || this.gameState.score2 >= 11) {
                this.endGame();
            }
        }
    }
    
    handlePlayerInput(playerId, input) {
        if (!this.gameStarted || this.gameEnded) return;
        
        let playerNumber = 0;
        if (this.players.player1.id === playerId) {
            playerNumber = 1;
        } else if (this.players.player2.id === playerId) {
            playerNumber = 2;
        }
        
        if (playerNumber === 0) return;
        
        // Convert input to direction: 'up' = -1, 'down' = 1, 'stop' = 0
        let direction = 0;
        if (input.up) direction = -1;
        else if (input.down) direction = 1;
        
        if (playerNumber === 1) {
            this.paddleInputs.p1 = direction;
        } else {
            this.paddleInputs.p2 = direction;
        }
        
        console.log(`Player ${playerNumber} input: ${direction}`);
    }
    
    broadcastGameState() {
        const stateUpdate = {
            type: 'GAME_STATE_UPDATE',
            gameState: this.getState(),
            timestamp: Date.now()
        };

        // Internal broadcast (to session sockets - if any)
        this.broadcastToAll('gameState', stateUpdate);

        // External broadcast (to WebSocket clients)
        if (this.externalBroadcast) {
            this.externalBroadcast(stateUpdate);
        }
    }
    
    endGame() {
        this.gameEnded = true;
        this.winner = this.gameState.score1 > this.gameState.score2 ? 'player1' : 'player2';
        
        console.log(`Game ${this.sessionId} ended. Winner: ${this.winner}`);
        
        const gameResults = {
            sessionId: this.sessionId,
            winner: this.winner,
            finalScore: {
                player1: this.gameState.score1,
                player2: this.gameState.score2
            },
            players: {
                player1: this.players.player1.id,
                player2: this.players.player2.id
            }
        };
        
        this.broadcastToAll('gameEnded', gameResults);
        
        // TODO: Save game results to database
        this.saveGameResults(gameResults);
        
        this.stopGameLoop();
    }
    
    async saveGameResults(results) {
        try {
            // Implementation for saving to database
            console.log('Saving game results:', results);
            // Call your existing saveGameToDatabase function
        } catch (error) {
            console.error('Error saving game results:', error);
        }
    }
    
    stopGameLoop() {
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
    }
    
    broadcastToAll(event, data) {
        if (this.players.player1.socket) {
            this.players.player1.socket.emit(event, data);
        }
        if (this.players.player2.socket) {
            this.players.player2.socket.emit(event, data);
        }
    }
    
    broadcastToPlayer(socket, event, data) {
        if (socket) {
            socket.emit(event, data);
        }
    }
    
    removePlayer(playerId) {
        if (this.players.player1.id === playerId) {
            this.players.player1.socket = null;
        } else if (this.players.player2.id === playerId) {
            this.players.player2.socket = null;
        }
        
        // If game is in progress, end it
        if (this.gameStarted && !this.gameEnded) {
            this.broadcastToAll('playerDisconnected', { playerId });
            this.endGame();
        }
    }
    
    cleanup() {
        this.stopGameLoop();
        console.log(`Cleaned up game session ${this.sessionId}`);
    }
}

module.exports = ClassicGameSession;