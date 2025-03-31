class PongGame {
    constructor() {
        this.width = 800;
        this.height = 600;
        this.backgroundColor = 0x000000;
        this.app = null;
    }

    async init() {
        console.log("Initializing PongGame...");

        this.app = new PIXI.Application();
        await this.app.init({
            width: this.width,
            height: this.height,
            backgroundColor: this.backgroundColor,
            resolution: window.devicePixelRatio || 1,
            antialias: true,
            autoDensity: true
        });

        console.log("PIXI Application initialized:", this.app);

        const gameContainer = document.getElementById('game-container');
        if (!gameContainer) {
            throw new Error("Game container not found!");
        }

        gameContainer.appendChild(this.app.canvas); // ✅ USE `canvas`

        console.log("Canvas added to game container");

        this.createWelcomeText();
    }

    createWelcomeText() {
        console.log("Creating welcome text...");

        const welcomeText = new PIXI.Text("Hello Npooooooonchon", new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 48,
            fill: 0xFFFFFF,
            align: 'center',
            fontWeight: 'bold'
        }));

        welcomeText.anchor.set(0.5);
        welcomeText.x = this.width / 2;
        welcomeText.y = this.height / 2;

        this.app.stage.addChild(welcomeText);
    }
}
