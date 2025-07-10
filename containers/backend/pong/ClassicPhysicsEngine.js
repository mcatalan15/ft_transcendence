class ClassicPhysicsEngine {
	constructor(gameState) {
        this.gameState = gameState;
        
        this.paddleSpeed = 800;
        this.ballSpeedMultiplier = 120; 
        this.ballSpeedIncrease = 0.3;
        
        this.ballDelayed = false;
        this.ballDelayTime = 0;
        this.ballDelayDuration = 2.0;
        
        this.gameState.ballVisible = false;

        this.wallT = {
            x: this.gameState.width / 2,
            y: 50,
            width: this.gameState.width,
            height: 20 
        };

        this.wallB = {
            x: this.gameState.width / 2,
            y: 750,
            width: this.gameState.width,
            height: 20
        };

        this.gameData = {
            balls: {
                defaultBalls: 0,
                curveBalls: 0,
                multiplyBalls: 0,
                spinBalls: 0,
                burstBalls: 0,
            },
            leftPlayer: {
                hits: 0,
                goalsInFavor: 0,
                goalsAgainst: 0,
                powerupsPicked: 0,
                powerdownsPicked: 0,
                ballchangesPicked: 0
            },
            rightPlayer: {
                hits: 0,
                goalsInFavor: 0,
                goalsAgainst: 0,
                powerupsPicked: 0,
                powerdownsPicked: 0,
                ballchangesPicked: 0
            }
        };
    }

	update(deltaTime, paddleInputs) {
		this.updatePaddles(deltaTime, paddleInputs);
		
		if (this.ballDelayed) {
			this.ballDelayTime -= deltaTime;
			if (this.ballDelayTime <= 0) {
				this.ballDelayed = false;
				this.spawnBall();
			}
			return (null);
		}
		
		this.updateBall(deltaTime);
		this.checkCollisions();

		if (this.lastPaddleHit) {
			if (this.externalBroadcast) {
				this.externalBroadcast(this.lastPaddleHit);
			}
			this.lastPaddleHit = null;
		}

		return this.checkScoring();
	}

	checkScoring() {
		if (this.gameState.ball.x < -50 || this.gameState.ball.y < -50) {
			return (null);
		}
	
		if (this.gameState.ball.x <= 0) {
			this.gameState.score2++;

			this.gameData.rightPlayer.goalsInFavor++;
            this.gameData.leftPlayer.goalsAgainst++;

			console.log(`🎮 GOAL! Player 2 scores! Score: ${this.gameState.score1} - ${this.gameState.score2}`);
			this.startBallDelay();
			return { 
				scorer: 'player2', 
				score: { 
					player1: this.gameState.score1, 
					player2: this.gameState.score2 
				},
				goalType: 'left_goal'
			};
		}

		if (this.gameState.ball.x >= this.gameState.width) {
			this.gameState.score1++;

			this.gameData.leftPlayer.goalsInFavor++;
            this.gameData.rightPlayer.goalsAgainst++;

			console.log(`🎮 GOAL! Player 1 scores! Score: ${this.gameState.score1} - ${this.gameState.score2}`);
			this.startBallDelay();
			return { 
				scorer: 'player1', 
				score: { 
					player1: this.gameState.score1, 
					player2: this.gameState.score2 
				},
				goalType: 'right_goal'
			};
		}
		
		return (null);
	}

	startBallDelay() {
		this.ballDelayed = true;
		this.ballDelayTime = this.ballDelayDuration;
		
		this.gameState.ball.x = -100;
		this.gameState.ball.y = -100;
		this.gameState.ballVelocity.x = 0;
		this.gameState.ballVelocity.y = 0;
	}

	spawnBall() {
		this.gameState.ball.x = this.gameState.width / 2;
		this.gameState.ball.y = this.gameState.height / 2;

		const angle = (Math.random() - 0.5) * Math.PI / 3;
		const speed = 4;
		const direction = Math.random() > 0.5 ? 1 : -1;
		
		this.gameState.ballVelocity.x = Math.cos(angle) * speed * direction;
		this.gameState.ballVelocity.y = Math.sin(angle) * speed;

		this.gameData.balls.defaultBalls++;
	}

	updatePaddles(deltaTime, paddleInputs) {
        // Time-based paddle movement
        const paddleMovement = this.paddleSpeed * deltaTime;
        
        const originalP1Y = this.gameState.paddle1.y;
        const originalP2Y = this.gameState.paddle2.y;
        
        // Apply time-based movement
        if (paddleInputs.p1 === -1) {
            this.gameState.paddle1.y -= paddleMovement;
        } else if (paddleInputs.p1 === 1) {
            this.gameState.paddle1.y += paddleMovement;
        }
    
        if (paddleInputs.p2 === -1) {
            this.gameState.paddle2.y -= paddleMovement;
        } else if (paddleInputs.p2 === 1) {
            this.gameState.paddle2.y += paddleMovement;
        }

        const wallTBottom = this.wallT.y + (this.wallT.height / 2);
        
        const wallBTop = this.wallB.y - (this.wallB.height / 2) - 50;
        
        const minPaddleY = wallTBottom + (this.gameState.paddleHeight / 2); 
        const maxPaddleY = wallBTop - (this.gameState.paddleHeight / 2);
    
        this.gameState.paddle1.y = Math.max(minPaddleY, Math.min(maxPaddleY, this.gameState.paddle1.y));
        this.gameState.paddle2.y = Math.max(minPaddleY, Math.min(maxPaddleY, this.gameState.paddle2.y));
    }
    
    updateBall(deltaTime) {
        if (this.gameState.ball.x < 0 || this.gameState.ball.y < 0) {
            return;
        }
    
        const ballMovementX = this.gameState.ballVelocity.x * this.ballSpeedMultiplier * deltaTime;
        const ballMovementY = this.gameState.ballVelocity.y * this.ballSpeedMultiplier * deltaTime;
        
        this.gameState.ball.x += ballMovementX;
        this.gameState.ball.y += ballMovementY;

        const ballTop = this.gameState.ball.y - this.gameState.ballRadius;
        const ballBottom = this.gameState.ball.y + this.gameState.ballRadius;
        
        const wallTBottom = this.wallT.y + (this.wallT.height / 2);
        if (ballTop <= wallTBottom) {
            this.gameState.ballVelocity.y *= -1;
            this.gameState.ball.y = wallTBottom + this.gameState.ballRadius;
            console.log(`🎮 BALL: Top wall collision at y=${this.gameState.ball.y}`);
        }
        
        const wallBTop = this.wallB.y - (this.wallB.height / 2) - 50;
        if (ballBottom >= wallBTop) {
            this.gameState.ballVelocity.y *= -1;
            this.gameState.ball.y = wallBTop - this.gameState.ballRadius;
            console.log(`🎮 BALL: Bottom wall collision at y=${this.gameState.ball.y}`);
        }
    
        this.increaseBallSpeed(deltaTime);
    }
	
	increaseBallSpeed(deltaTime) {
        const speedIncreaseThisFrame = this.ballSpeedIncrease * deltaTime;
        
        if (this.gameState.ballVelocity.x > 0) {
            this.gameState.ballVelocity.x += speedIncreaseThisFrame;
        } else if (this.gameState.ballVelocity.x < 0) {
            this.gameState.ballVelocity.x -= speedIncreaseThisFrame;
        }
        
        const maxSpeed = 20;
        if (Math.abs(this.gameState.ballVelocity.x) > maxSpeed) {
            this.gameState.ballVelocity.x = this.gameState.ballVelocity.x > 0 ? maxSpeed : -maxSpeed;
        }
    }

    checkCollisions() {
        if (this.gameState.ball.x < 0 || this.gameState.ball.y < 0) {
            return;
        }
        
        const ballLeft = this.gameState.ball.x - this.gameState.ballRadius;
        const ballRight = this.gameState.ball.x + this.gameState.ballRadius;
        const ballTop = this.gameState.ball.y - this.gameState.ballRadius;
        const ballBottom = this.gameState.ball.y + this.gameState.ballRadius;

        const paddle1Left = this.gameState.paddle1.x - this.gameState.paddleWidth / 2;
        const paddle1Right = this.gameState.paddle1.x + this.gameState.paddleWidth / 2;
        const paddle1Top = this.gameState.paddle1.y - this.gameState.paddleHeight / 2;
        const paddle1Bottom = this.gameState.paddle1.y + this.gameState.paddleHeight / 2;
        
        if (ballRight >= paddle1Left &&
            ballLeft <= paddle1Right &&
            ballBottom >= paddle1Top &&
            ballTop <= paddle1Bottom &&
            this.gameState.ballVelocity.x < 0) {
            
            this.handlePaddleCollision(this.gameState.paddle1, 'left');
        }

        const paddle2Left = this.gameState.paddle2.x - this.gameState.paddleWidth / 2;
        const paddle2Right = this.gameState.paddle2.x + this.gameState.paddleWidth / 2;
        const paddle2Top = this.gameState.paddle2.y - this.gameState.paddleHeight / 2;
        const paddle2Bottom = this.gameState.paddle2.y + this.gameState.paddleHeight / 2;
        
        if (ballLeft <= paddle2Right &&
            ballRight >= paddle2Left &&
            ballBottom >= paddle2Top &&
            ballTop <= paddle2Bottom &&
            this.gameState.ballVelocity.x > 0) {
            
            this.handlePaddleCollision(this.gameState.paddle2, 'right');
        }
    }

    handlePaddleCollision(paddle, side) {
        const relativeIntersectY = (this.gameState.ball.y - paddle.y) / (this.gameState.paddleHeight / 2);
        const normalizedIntersectY = Math.max(-1, Math.min(1, relativeIntersectY));
        
        const maxBounceAngle = Math.PI / 4;
        const bounceAngle = normalizedIntersectY * maxBounceAngle;
        
        const speed = Math.sqrt(
            this.gameState.ballVelocity.x * this.gameState.ballVelocity.x + 
            this.gameState.ballVelocity.y * this.gameState.ballVelocity.y
        );
        
        if (side === 'left') {
            this.gameData.leftPlayer.hits++;
            this.gameState.ballVelocity.x = Math.abs(Math.cos(bounceAngle)) * speed;
            this.gameState.ball.x = paddle.x + this.gameState.paddleWidth / 2 + this.gameState.ballRadius + 1;
        } else {
            this.gameData.rightPlayer.hits++;
            this.gameState.ballVelocity.x = -Math.abs(Math.cos(bounceAngle)) * speed;
            this.gameState.ball.x = paddle.x - this.gameState.paddleWidth / 2 - this.gameState.ballRadius - 1;
        }
        
        this.gameState.ballVelocity.y = Math.sin(bounceAngle) * speed;
        
        const minHorizontalSpeed = speed * 0.7;
        if (Math.abs(this.gameState.ballVelocity.x) < minHorizontalSpeed) {
            const sign = this.gameState.ballVelocity.x >= 0 ? 1 : -1;
            this.gameState.ballVelocity.x = sign * minHorizontalSpeed;
            
            const remainingSpeed = Math.sqrt(speed * speed - this.gameState.ballVelocity.x * this.gameState.ballVelocity.x);
            this.gameState.ballVelocity.y = Math.sign(this.gameState.ballVelocity.y) * remainingSpeed;
        }
    }

	getGameData() {
        console.log('🔍 getGameData() called in ClassicPhysicsEngine');
        console.log('Current game data:', JSON.stringify(this.gameData, null, 2));
        return this.gameData;
    }
}

module.exports = ClassicPhysicsEngine;