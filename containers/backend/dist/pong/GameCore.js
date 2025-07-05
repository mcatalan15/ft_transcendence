"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameCore = void 0;
class GameCore {
    constructor() {
        this.ball = { x: 750, y: 250 };
        this.ballVelocity = { x: 5, y: 3 };
        this.paddle1 = { x: 30, y: 250 };
        this.paddle2 = { x: 1470, y: 250 };
        this.paddleHeight = 100;
        this.paddleWidth = 20;
        this.ballRadius = 10;
        this.width = 1800;
        this.height = 800;
        this.score1 = 0;
        this.score2 = 0;
    }
    update(paddle1Dir, paddle2Dir) {
        // Move paddles
        this.paddle1.y += paddle1Dir * 10;
        this.paddle2.y += paddle2Dir * 10;
        // Clamp paddles
        this.paddle1.y = Math.max(this.paddleHeight / 2, Math.min(this.height - this.paddleHeight / 2, this.paddle1.y));
        this.paddle2.y = Math.max(this.paddleHeight / 2, Math.min(this.height - this.paddleHeight / 2, this.paddle2.y));
        // Move ball
        this.ball.x += this.ballVelocity.x;
        this.ball.y += this.ballVelocity.y;
        // Ball collision with top/bottom
        if (this.ball.y < this.ballRadius || this.ball.y > this.height - this.ballRadius) {
            this.ballVelocity.y *= -1;
        }
        // Ball collision with paddles
        if (this.ball.x - this.ballRadius < this.paddle1.x + this.paddleWidth / 2 &&
            Math.abs(this.ball.y - this.paddle1.y) < this.paddleHeight / 2) {
            this.ballVelocity.x *= -1;
            this.ball.x = this.paddle1.x + this.paddleWidth / 2 + this.ballRadius;
        }
        if (this.ball.x + this.ballRadius > this.paddle2.x - this.paddleWidth / 2 &&
            Math.abs(this.ball.y - this.paddle2.y) < this.paddleHeight / 2) {
            this.ballVelocity.x *= -1;
            this.ball.x = this.paddle2.x - this.paddleWidth / 2 - this.ballRadius;
        }
        // Score
        if (this.ball.x < 0) {
            this.score2++;
            this.reset();
        }
        if (this.ball.x > this.width) {
            this.score1++;
            this.reset();
        }
    }
    reset() {
        this.ball = { x: this.width / 2, y: this.height / 2 };
        this.ballVelocity = { x: (Math.random() > 0.5 ? 5 : -5), y: (Math.random() - 0.5) * 6 };
    }
    getState() {
        return {
            ball: this.ball,
            paddle1: this.paddle1,
            paddle2: this.paddle2,
            score1: this.score1,
            score2: this.score2,
        };
    }
}
exports.GameCore = GameCore;
