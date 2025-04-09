/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   PhysicsSystem copy.js                              :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/01 11:31:54 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/09 09:52:34 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export class PhysicsSystem {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }
    
    update(entities, delta) {
        const ball = entities.find(e => e.id === 'ball');
        const paddleL = entities.find(e => e.id === 'paddleL');
        const paddleR = entities.find(e => e.id === 'paddleR');
        
        if (ball && paddleL && paddleR) {
            this.updateBall(ball, paddleL, paddleR, entities);
        }
        
        // Update paddle positions based on their physics components
        entities.forEach(entity => {
            if (entity.hasComponent('physics') && entity.id.includes('paddle')) {
                const physics = entity.getComponent('physics');
                const input = entity.getComponent('input');
                
                if (input) {
                    const speed = physics.speed || 20;
                    
                    if (input.upPressed && physics.y > 0) {
                        physics.y -= speed;
                    }
                    if (input.downPressed && physics.y < this.height - physics.height) {
                        physics.y += speed;
                    }
                    
                    // Track velocity for paddle impact on ball
                    physics.velocityY = physics.y - (physics.previousY || physics.y);
                    physics.previousY = physics.y;
                }
            }
        });
    }
    
    updateBall(ball, paddleL, paddleR, allEntities) {
        const physics = ball.getComponent('physics');
        const prevX = physics.x;
        const prevY = physics.y;
        
        // Initialize rotation if it doesn't exist
        if (physics.rotation === undefined) {
            physics.rotation = 0;
        }
        if (physics.rotationSpeed === undefined) {
            physics.rotationSpeed = 0.1;
        }
        
        // Track which side last scored for ball direction
        if (physics.lastScoredSide === undefined) {
            physics.lastScoredSide = 0; // 0 for none, -1 for left, 1 for right
        }
        
        // Ball movement
        physics.x += physics.velocityX;
        physics.y += physics.velocityY;
        
        // Set rotation based on horizontal direction
        const rotationMagnitude = Math.abs(physics.rotationSpeed);
        physics.rotationSpeed = physics.velocityX > 0 ? rotationMagnitude : -rotationMagnitude;
        
        // Apply rotation
        physics.rotation += physics.rotationSpeed;
        
        // Ball Bounds
        const ballLeft = physics.x - physics.width / 2;
        const ballRight = physics.x + physics.width / 2;
        const ballTop = physics.y - physics.height / 2;
        const ballBottom = physics.y + physics.height / 2;
        
        // Get paddle physics components
        const paddleLPhysics = paddleL.getComponent('physics');
        const paddleRPhysics = paddleR.getComponent('physics');
        
        // Find border entities for collision detection
        const borders = allEntities.filter(entity => 
            entity.id === "top-wall" || entity.id === "bottom-wall");
        
        // Check for collision with borders
        for (const border of borders) {
            const borderPhysics = border.getComponent('physics');
            if (!borderPhysics) continue;
            
            const isTopWall = border.id === "top-wall";
            const borderLeft = borderPhysics.x;
            const borderRight = borderPhysics.x + borderPhysics.width;
            const borderTop = borderPhysics.y;
            const borderBottom = borderPhysics.y + borderPhysics.height;
            
            // Check for collision with this border
            if (ballRight >= borderLeft && ballLeft <= borderRight &&
                ballBottom >= borderTop && ballTop <= borderBottom) {
                
                // Determine if we hit from top or bottom
                if (prevY + physics.height/2 < borderTop || prevY - physics.height/2 > borderBottom) {
                    // Vertical collision - reverse Y velocity
                    physics.velocityY = -physics.velocityY;
                    
                    // Reposition the ball to avoid getting stuck in the border
                    if (isTopWall) {
                        physics.y = borderBottom + physics.height/2;
                    } else {
                        physics.y = borderTop - physics.height/2;
                    }
                    
                    console.log(`Collision with ${border.id}`);
                }
            }
        }
        
        // Right Paddle Collision
        if (
            prevX + physics.width / 2 < paddleRPhysics.x &&
            ballRight >= paddleRPhysics.x &&
            ballBottom >= paddleRPhysics.y &&
            ballTop <= paddleRPhysics.y + paddleRPhysics.height
        ) {
            // Calculate angle based on where it hits the paddle
            const paddleCenterY = paddleRPhysics.y + paddleRPhysics.height / 2;
            const ballDistanceFromCenter = physics.y - paddleCenterY;
            const normalizedDistance = ballDistanceFromCenter / (paddleRPhysics.height / 2);
            const maxBounceAngle = Math.PI / 4; // 45 degrees
            const bounceAngle = normalizedDistance * maxBounceAngle;
        
            // Constant horizontal speed
            const speed = Math.sqrt(physics.velocityX * physics.velocityX + 
                                physics.velocityY * physics.velocityY);
            
            // Speed clamp
            const minSpeed = 5;
            const actualSpeed = Math.max(speed, minSpeed);
            
            // Calculate new velocities
            physics.velocityX = -Math.cos(bounceAngle) * actualSpeed;
            physics.velocityY = Math.sin(bounceAngle) * actualSpeed;
            
            // Add some of the paddle's movement to the ball
            if (Math.abs(paddleRPhysics.velocityY) > 0.5) {
                physics.velocityY += paddleRPhysics.velocityY * 0.2;
            }
            
            physics.x = paddleRPhysics.x - physics.width / 2;
            
            console.log("Right paddle collision:", physics.velocityX, physics.velocityY);
        }
        
        // Left Paddle Collision
        if (
            prevX - physics.width / 2 > paddleLPhysics.x + paddleLPhysics.width &&
            ballLeft <= paddleLPhysics.x + paddleLPhysics.width &&
            ballBottom >= paddleLPhysics.y &&
            ballTop <= paddleLPhysics.y + paddleLPhysics.height
        ) {
            const paddleCenterY = paddleLPhysics.y + paddleLPhysics.height / 2;
            const ballDistanceFromCenter = physics.y - paddleCenterY;
            const normalizedDistance = ballDistanceFromCenter / (paddleLPhysics.height / 2);
            const maxBounceAngle = Math.PI / 4; // 45 degrees
            const bounceAngle = normalizedDistance * maxBounceAngle;
        
            const speed = Math.sqrt(physics.velocityX * physics.velocityX + 
                                  physics.velocityY * physics.velocityY);
            
            const minSpeed = 5;
            const actualSpeed = Math.max(speed, minSpeed);
            
            physics.velocityX = Math.cos(bounceAngle) * actualSpeed;
            physics.velocityY = Math.sin(bounceAngle) * actualSpeed;
            
            if (Math.abs(paddleLPhysics.velocityY) > 0.5) {
                physics.velocityY += paddleLPhysics.velocityY * 0.2;
            }
            
            physics.x = paddleLPhysics.x + paddleLPhysics.width + physics.width / 2;
            
            console.log("Left paddle collision:", physics.velocityX, physics.velocityY);
        }
        
        // Goal detection
        if (ballRight > this.width) {
            physics.lastScoredSide = -1;
            this.resetBall(physics, physics.lastScoredSide);
            console.log("Ball out on right, left scores");
        } else if (ballLeft < 0) {
            physics.lastScoredSide = 1;
            this.resetBall(physics, physics.lastScoredSide);
            console.log("Ball out on left, right scores");
        }
        
        // Error detection
        if (isNaN(physics.x) || isNaN(physics.y) || 
            Math.abs(physics.velocityX) < 0.1 || Math.abs(physics.velocityX) > 20) {
            console.log("Ball velocity error detected, resetting:", 
                    physics.velocityX, physics.velocityY);
            this.resetBall(physics, 0);
        }
    }
    
    resetBall(physics, direction) {
        physics.x = this.width / 2;
        physics.y = this.height / 2;
    
        let launchDirection;
        if (direction === 0) {
            launchDirection = Math.random() < 0.5 ? -1 : 1;
        } else {
            launchDirection = direction;
        }
        
        const angle = (Math.random() * 60 - 30) * (Math.PI / 180);
        const speed = 10;
        
        physics.velocityX = Math.cos(angle) * speed * launchDirection;
        physics.velocityY = Math.sin(angle) * speed;
        
        physics.rotation = 0;
        physics.rotationSpeed = Math.abs(physics.rotationSpeed) * (physics.velocityX > 0 ? 1 : -1);
        
        console.log("Ball reset with direction:", launchDirection, physics.velocityX, physics.velocityY);
    }
}