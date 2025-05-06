// blockchain.ts
export function showBlockchain(container: HTMLElement): void {
    const blockchainDiv = document.createElement('div');
    blockchainDiv.className = 'p-4 max-w-md mx-auto';
    
    blockchainDiv.innerHTML = `
        <h1 class="text-2xl font-bold mb-4 text-white">Blockchain Game</h1>
        <div class="mb-4">
            <label for="player1" class="block text-white mb-2">Player 1 Score</label>
            <input type="number" id="player1" class="w-full p-2 rounded bg-gray-700 text-white">
        </div>
        <div class="mb-6">
            <label for="player2" class="block text-white mb-2">Player 2 Score</label>
            <input type="number" id="player2" class="w-full p-2 rounded bg-gray-700 text-white">
        </div>
        <button id="toBlockchainBtn" class="w-full py-2 px-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded">
            To Blockchain
        </button>
    `;

    // Add event listener for the button
    const button = blockchainDiv.querySelector('#toBlockchainBtn');
    if (button) {
        button.addEventListener('click', () => {
            const player1Input = blockchainDiv.querySelector('#player1') as HTMLInputElement;
            const player2Input = blockchainDiv.querySelector('#player2') as HTMLInputElement;
            
            const player1 = parseInt(player1Input.value);
            const player2 = parseInt(player2Input.value);
            
            // Here you would add your blockchain logic
            console.log(`Scores to blockchain - Player1: ${player1}, Player2: ${player2}`);
        });
    }

    container.appendChild(blockchainDiv);
}