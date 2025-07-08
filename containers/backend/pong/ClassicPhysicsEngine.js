// backend/pong/ClassicPhysicsEngine.js
class ClassicPhysicsEngine {
    constructor(gameState) {  // Change from gameCore to gameState
        this.gameState = gameState;  // Use gameState instead of core
        this.paddleSpeed = 300;
        this.ballSpeedIncrease = 0.1;
    }

    update(deltaTime, paddleInputs) {
        this.updatePaddles(deltaTime, paddleInputs);
        this.updateBall(deltaTime);
        this.checkCollisions();
        return this.checkScoring();  // Return goal result
    }

    updatePaddles(deltaTime, paddleInputs) {
        // Update paddle 1 (left)
        if (paddleInputs.p1 === -1) {
            this.gameState.paddle1.y -= this.paddleSpeed * deltaTime;
        } else if (paddleInputs.p1 === 1) {
            this.gameState.paddle1.y += this.paddleSpeed * deltaTime;
        }

        // Update paddle 2 (right)
        if (paddleInputs.p2 === -1) {
            this.gameState.paddle2.y -= this.paddleSpeed * deltaTime;
        } else if (paddleInputs.p2 === 1) {
            this.gameState.paddle2.y += this.paddleSpeed * deltaTime;
        }

        // Clamp paddles to screen bounds
        this.gameState.paddle1.y = Math.max(
            this.gameState.paddleHeight / 2, 
            Math.min(this.gameState.height - this.gameState.paddleHeight / 2, this.gameState.paddle1.y)
        );
        this.gameState.paddle2.y = Math.max(
            this.gameState.paddleHeight / 2, 
            Math.min(this.gameState.height - this.gameState.paddleHeight / 2, this.gameState.paddle2.y)
        );
    }

    updateBall(deltaTime) {
        // Move ball
        this.gameState.ball.x += this.gameState.ballVelocity.x * deltaTime;
        this.gameState.ball.y += this.gameState.ballVelocity.y * deltaTime;

        // Ball collision with top/bottom walls
        if (this.gameState.ball.y <= this.gameState.ballRadius || 
            this.gameState.ball.y >= this.gameState.height - this.gameState.ballRadius) {
            this.gameState.ballVelocity.y *= -1;
            
            // Clamp ball position
            this.gameState.ball.y = Math.max(
                this.gameState.ballRadius, 
                Math.min(this.gameState.height - this.gameState.ballRadius, this.gameState.ball.y)
            );
        }

        // Gradually increase ball speed
        this.increaseBallSpeed(deltaTime);
    }

    increaseBallSpeed(deltaTime) {
        const currentSpeed = Math.sqrt(
            this.gameState.ballVelocity.x * this.gameState.ballVelocity.x + 
            this.gameState.ballVelocity.y * this.gameState.ballVelocity.y
        );
        
        const maxSpeed = 500;
        
        if (currentSpeed < maxSpeed) {
            const speedMultiplier = 1 + (this.ballSpeedIncrease * deltaTime);
            this.gameState.ballVelocity.x *= speedMultiplier;
            this.gameState.ballVelocity.y *= speedMultiplier;
        }
    }

    checkCollisions() {
        const ballLeft = this.gameState.ball.x - this.gameState.ballRadius;
        const ballRight = this.gameState.ball.x + this.gameState.ballRadius;
        const ballTop = this.gameState.ball.y - this.gameState.ballRadius;
        const ballBottom = this.gameState.ball.y + this.gameState.ballRadius;

        // Left paddle collision
        if (ballLeft <= this.gameState.paddle1.x + this.gameState.paddleWidth / 2 &&
            ballRight >= this.gameState.paddle1.x - this.gameState.paddleWidth / 2 &&
            ballTop <= this.gameState.paddle1.y + this.gameState.paddleHeight / 2 &&
            ballBottom >= this.gameState.paddle1.y - this.gameState.paddleHeight / 2 &&
            this.gameState.ballVelocity.x < 0) {
            
            this.handlePaddleCollision(this.gameState.paddle1, 'left');
        }

        // Right paddle collision
        if (ballLeft <= this.gameState.paddle2.x + this.gameState.paddleWidth / 2 &&
            ballRight >= this.gameState.paddle2.x - this.gameState.paddleWidth / 2 &&
            ballTop <= this.gameState.paddle2.y + this.gameState.paddleHeight / 2 &&
            ballBottom >= this.gameState.paddle2.y - this.gameState.paddleHeight / 2 &&
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
            this.gameState.ballVelocity.x = Math.abs(Math.cos(bounceAngle)) * speed;
            this.gameState.ball.x = paddle.x + this.gameState.paddleWidth / 2 + this.gameState.ballRadius;
        } else {
            this.gameState.ballVelocity.x = -Math.abs(Math.cos(bounceAngle)) * speed;
            this.gameState.ball.x = paddle.x - this.gameState.paddleWidth / 2 - this.gameState.ballRadius;
        }
        
        this.gameState.ballVelocity.y = Math.sin(bounceAngle) * speed;
    }

    checkScoring() {
        // Left goal (right player scores)
        if (this.gameState.ball.x <= 0) {
            this.gameState.score2++;
            this.resetBall();
            return { scorer: 'player2', score: { player1: this.gameState.score1, player2: this.gameState.score2 } };
        }
        
        // Right goal (left player scores)
        if (this.gameState.ball.x >= this.gameState.width) {
            this.gameState.score1++;
            this.resetBall();
            return { scorer: 'player1', score: { player1: this.gameState.score1, player2: this.gameState.score2 } };
        }
        
        return null;
    }

    resetBall() {
        this.gameState.ball.x = this.gameState.width / 2;
        this.gameState.ball.y = this.gameState.height / 2;
        
        const angle = (Math.random() - 0.5) * Math.PI / 2;
        const speed = 200;
        const direction = Math.random() > 0.5 ? 1 : -1;
        
        this.gameState.ballVelocity.x = Math.cos(angle) * speed * direction;
        this.gameState.ballVelocity.y = Math.sin(angle) * speed;
    }
}

module.exports = ClassicPhysicsEngine;