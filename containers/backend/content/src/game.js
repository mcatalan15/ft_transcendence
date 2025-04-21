/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   game.js                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/03/31 18:04:03 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/01 11:03:10 by hmunoz-g         ###   ########.fr       */
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
		this.paddleLSpeed = 20;
		this.paddleR = null;
		this.paddleRSpeed = 20;
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
		this.paddleL.rect(0, 0, 10, 100);
		this.paddleL.fill('white');
		this.paddleL.x = 20;
		this.paddleL.y = this.height / 2 - 25;
		this.paddleL.speed = 20;
		this.app.stage.addChild(this.paddleL);

		this.paddleR = new PIXI.Graphics();
		this.paddleR.rect(0, 0, 10, 100);
		this.paddleR.fill('white');
		this.paddleR.x = this.width - 20 - 10;
		this.paddleR.y = this.height / 2 - 25;
		this.paddleR.speed = 20;
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
		
		this.speed = 10;
		let angle = (Math.random() * 120 - 60) * (Math.PI / 180);
		
		this.ball.velocityX = this.speed;
		this.ball.velocityY = 0;

		this.app.stage.addChild(this.ball);

		console.log("Ball added with velocity");
	}

	gameLoop(delta) {
		this.updateBall();
		this.updatePaddles();
	}

	updateBall() {
		const prevX = this.ball.x;
		const prevY = this.ball.y;
		
		// Track paddle velocities for each paddle
		this.paddleL.velocityY = this.paddleL.y - (this.paddleL.previousY || this.paddleL.y);
		this.paddleL.previousY = this.paddleL.y;
		
		this.paddleR.velocityY = this.paddleR.y - (this.paddleR.previousY || this.paddleR.y);
		this.paddleR.previousY = this.paddleR.y;
		
		// Ball movement
		this.ball.x += this.ball.velocityX;
		this.ball.y += this.ball.velocityY;
		this.ball.rotation += 0.1;
	
		// Ball Bounds
		const ballLeft = this.ball.x - this.ball.width / 2;
		const ballRight = this.ball.x + this.ball.width / 2;
		const ballTop = this.ball.y - this.ball.height / 2;
		const ballBottom = this.ball.y + this.ball.height / 2;
	
		// Right Paddle Collision
		if (
			prevX + this.ball.width / 2 < this.paddleR.x &&
			ballRight >= this.paddleR.x &&
			ballBottom >= this.paddleR.y &&
			ballTop <= this.paddleR.y + this.paddleR.height
		) {
			// Calculate angle based on where it hits the paddle
			const paddleCenterY = this.paddleR.y + this.paddleR.height / 2;
			const ballDistanceFromCenter = this.ball.y - paddleCenterY;
			const normalizedDistance = ballDistanceFromCenter / (this.paddleR.height / 2);
			const maxBounceAngle = Math.PI / 4; // 45 degrees
			const bounceAngle = normalizedDistance * maxBounceAngle;
	
			// Constant horizontal speed
			const speed = Math.sqrt(this.ball.velocityX * this.ball.velocityX + 
								this.ball.velocityY * this.ball.velocityY);
			
			// Speed clamp
			const minSpeed = 5;
			const actualSpeed = Math.max(speed, minSpeed);
			
			// Calculate new velocities
			this.ball.velocityX = -Math.cos(bounceAngle) * actualSpeed;
			this.ball.velocityY = Math.sin(bounceAngle) * actualSpeed;
			
			// Add some of the paddle's movement to the ball
			if (Math.abs(this.paddleR.velocityY) > 0.5) {
				this.ball.velocityY += this.paddleR.velocityY * 0.2;
			}
			
			// Position the ball exactly at the paddle edge to prevent sticking
			this.ball.x = this.paddleR.x - this.ball.width / 2;
			
			console.log("Right paddle collision:", this.ball.velocityX, this.ball.velocityY);
		}
	
		// Left Paddle Collision
		if (
			prevX - this.ball.width / 2 > this.paddleL.x + this.paddleL.width &&
			ballLeft <= this.paddleL.x + this.paddleL.width &&
			ballBottom >= this.paddleL.y &&
			ballTop <= this.paddleL.y + this.paddleL.height
		) {
			const paddleCenterY = this.paddleL.y + this.paddleL.height / 2;
			const ballDistanceFromCenter = this.ball.y - paddleCenterY;
			const normalizedDistance = ballDistanceFromCenter / (this.paddleL.height / 2);
			const maxBounceAngle = Math.PI / 4; // 45 degrees
			const bounceAngle = normalizedDistance * maxBounceAngle;
	
			const speed = Math.sqrt(this.ball.velocityX * this.ball.velocityX + 
								this.ball.velocityY * this.ball.velocityY);
			
			const minSpeed = 5;
			const actualSpeed = Math.max(speed, minSpeed);
			
			this.ball.velocityX = Math.cos(bounceAngle) * actualSpeed;
			this.ball.velocityY = Math.sin(bounceAngle) * actualSpeed;
			
			if (Math.abs(this.paddleL.velocityY) > 0.5) {
				this.ball.velocityY += this.paddleL.velocityY * 0.2;
			}
			
			this.ball.x = this.paddleL.x + this.paddleL.width + this.ball.width / 2;
			
			console.log("Left paddle collision:", this.ball.velocityX, this.ball.velocityY);
		}
	
		if (ballTop <= 0) {
			this.ball.velocityY = Math.abs(this.ball.velocityY);
			this.ball.y = this.ball.height / 2;
		} else if (ballBottom >= this.height) {
			this.ball.velocityY = -Math.abs(this.ball.velocityY);
			this.ball.y = this.height - this.ball.height / 2;
		}
	
		// Reset Ball on Out-of-Bounds (Left or Right)
		if (ballRight > this.width || ballLeft < 0) {
			this.ball.x = this.width / 2;
			this.ball.y = this.height / 2;
	
			// Launch in a random direction with controlled angle
			const angle = (Math.random() * 60 - 30) * (Math.PI / 180);
			const speed = 10;
			const direction = Math.random() < 0.5 ? -1 : 1;
			
			this.ball.velocityX = Math.cos(angle) * speed * direction;
			this.ball.velocityY = Math.sin(angle) * speed;
			
			console.log("Ball reset:", this.ball.velocityX, this.ball.velocityY);
		}
		
		// Safety check to prevent the ball from getting stuck or disappearing
		if (isNaN(this.ball.x) || isNaN(this.ball.y) || 
			Math.abs(this.ball.velocityX) < 0.1 || Math.abs(this.ball.velocityX) > 20) {
			console.log("Ball velocity error detected, resetting:", 
					this.ball.velocityX, this.ball.velocityY);
			// Reset
			this.ball.x = this.width / 2;
			this.ball.y = this.height / 2;
			this.ball.velocityX = 5 * (Math.random() < 0.5 ? -1 : 1);
			this.ball.velocityY = (Math.random() * 2 - 1) * 3;
		}
	}
	

	updatePaddles() {
		if (this.paddleLUp && this.paddleL.y > 0) {
			this.paddleL.y -= this.paddleL.speed;
		}
		if (this.paddleLDown && this.paddleL.y < this.height - 50) {
			this.paddleL.y += this.paddleL.speed;
		}
		if (this.paddleRUp && this.paddleR.y > 0) {
			this.paddleR.y -= this.paddleR.speed;
		}
		if (this.paddleRDown && this.paddleR.y < this.height - 50) {
			this.paddleR.y += this.paddleR.speed;
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
