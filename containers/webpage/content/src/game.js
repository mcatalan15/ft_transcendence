/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   game.js                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/03/31 18:04:03 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/03/31 20:20:31 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

class PongGame {
    constructor() {
        this.width = 1920;
        this.height = 1080;
        this.app = null;

        // Border
		this.border = null;
		
		// Paddles and Ball (already initialized before)
        this.paddleL = null;
        this.paddleR = null;
        this.ball = null;

        // Movement states
        this.paddleLUp = false;
        this.paddleLDown = false;
        this.paddleRUp = false;
        this.paddleRDown = false;

		// Direction of the ball
		this.direction = true;
    }

    async init() {
        console.log("Initializing PongGame...");
        this.app = new PIXI.Application();

        await this.app.init({ background: 'black', width: 1920, height: 1080 });

        const gameContainer = document.getElementById('game-container');
        if (!gameContainer) {
            throw new Error("Game container not found!");
        }

        gameContainer.appendChild(this.app.canvas);

        console.log("Canvas added to game container");

		this.createPaddles();
        this.createBall();
		this.drawBorder();

        this.app.ticker.add(this.gameLoop.bind(this));

        this.setupKeyboard();
    }

	drawBorder() {
		console.log("Drawing border...");
		this.border = new PIXI.Graphics();
		this.border.rect(0, 0, 1920, 1080);
		this.border.stroke({ color: "white", width: 10 });
		this.border.x = 0;
		this.border.y = 0;
		this.app.stage.addChild(this.border);
	}

    createPaddles() {
        console.log("Creating paddles...");
        this.paddleL = new PIXI.Graphics();
        this.paddleL.rect(0, 0, 10, 50);
		this.paddleL.fill('white');
        this.paddleL.x = 20;
        this.paddleL.y = this.height / 2 - 25;
        this.app.stage.addChild(this.paddleL);

        this.paddleR = new PIXI.Graphics();
        this.paddleR.rect(0, 0, 10, 50);
        this.paddleR.fill('white');
        this.paddleR.x = this.width - 20 - 10;
        this.paddleR.y = this.height / 2 - 25;
        this.app.stage.addChild(this.paddleR);

        console.log("Paddles added");
    }

    createBall() {
        console.log("Creating ball...");
        this.ball = new PIXI.Graphics();
        this.ball.rect(0, 0, 10, 10);
		this.ball.fill(0xFFAC1C);
        this.ball.x = this.width / 2;
        this.ball.y = this.height / 2;
		this.ball.pivot.set(this.ball.width / 2, this.ball.height / 2);
        this.app.stage.addChild(this.ball);

        console.log("Ball added");
    }

    gameLoop(delta) {
        this.updateBall();
        this.updatePaddles();
    }

    updateBall() {
		const prevX = this.ball.x;
		
		if (this.direction) {
			this.ball.x += 15;
			this.ball.rotation += 0.1;
		} else {
			this.ball.x -= 15;
			this.ball.rotation -= 0.1;
		}
	
		const ballLeft = this.ball.x - this.ball.width / 2;
		const ballRight = this.ball.x + this.ball.width / 2;
		const ballTop = this.ball.y - this.ball.height / 2;
		const ballBottom = this.ball.y + this.ball.height / 2;
		
		if (
			prevX + this.ball.width / 2 < this.paddleR.x &&
			ballRight >= this.paddleR.x &&
			ballBottom >= this.paddleR.y &&
			ballTop <= this.paddleR.y + this.paddleR.height
		) {
			this.direction = false;
			this.ball.x = this.paddleR.x - this.ball.width / 2;
		}
		
		if (
			prevX - this.ball.width / 2 > this.paddleL.x + this.paddleL.width &&
			ballLeft <= this.paddleL.x + this.paddleL.width &&
			ballBottom >= this.paddleL.y &&
			ballTop <= this.paddleL.y + this.paddleL.height
		) {
			this.direction = true; // Reverse direction
			this.ball.x = this.paddleL.x + this.paddleL.width + this.ball.width / 2;
		}
		
		if (ballTop <= 0 || ballBottom >= this.height) {
			// Bounce off top or bottom by reversing vertical movement
		}
		
		if (ballRight > this.width || ballLeft < 0) {
			this.ball.x = this.width / 2;
			this.ball.y = this.height / 2;
		}
	}

    updatePaddles() {
        if (this.paddleLUp && this.paddleL.y > 0) {
            this.paddleL.y -= 5;
        }
        if (this.paddleLDown && this.paddleL.y < this.height - 50) {
            this.paddleL.y += 5;
        }
        if (this.paddleRUp && this.paddleR.y > 0) {
            this.paddleR.y -= 5;
        }
        if (this.paddleRDown && this.paddleR.y < this.height - 50) {
            this.paddleR.y += 5;
        }
    }

    setupKeyboard() {
        window.addEventListener('keydown', (e) => {
            if (e.key === 'w' || e.key === 'W') {
                this.paddleLUp = true;
            }
            if (e.key === 's' || e.key === 'S') {
                this.paddleLDown = true;
            }
            if (e.key === 'ArrowUp') {
                this.paddleRUp = true;
            }
            if (e.key === 'ArrowDown') {
                this.paddleRDown = true;
            }
        });

        window.addEventListener('keyup', (e) => {
            if (e.key === 'w' || e.key === 'W') {
                this.paddleLUp = false;
            }
            if (e.key === 's' || e.key === 'S') {
                this.paddleLDown = false;
            }
            if (e.key === 'ArrowUp') {
                this.paddleRUp = false;
            }
            if (e.key === 'ArrowDown') {
                this.paddleRDown = false;
            }
        });
    }
}
