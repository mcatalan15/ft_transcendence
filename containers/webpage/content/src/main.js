// main.js - Entry point for the application

// Wait for the page to fully load before initializing the game
window.addEventListener('load', () => {
    try {
        console.log("Window loaded, checking if PIXI is available...");
        
        // Check if PIXI is defined
        if (typeof PIXI === 'undefined') {
            throw new Error("PIXI is not defined! Make sure pixi.js is properly loaded.");
        }
        
        console.log("PIXI version:", PIXI.VERSION);
        console.log("Creating game...");
        
        // Create and start the game
        const game = new PongGame();
        game.init();
    } catch (error) {
        console.error("Error:", error);
        const errorElement = document.getElementById('error');
        errorElement.style.display = 'block';
        errorElement.innerHTML = `
            <h2>Error Loading Game</h2>
            <p>${error.message}</p>
            <p>Make sure you have downloaded the PixiJS v8.9.1 library and placed it in the libs folder.</p>
        `;
    }
});