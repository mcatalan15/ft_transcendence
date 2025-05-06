// blockchain.ts (updated)
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
        <div id="message" class="mt-4 text-white"></div>
    `;

    const button = blockchainDiv.querySelector('#toBlockchainBtn');
    if (button) {
        button.addEventListener('click', async () => {
            const player1Input = blockchainDiv.querySelector('#player1') as HTMLInputElement;
            const player2Input = blockchainDiv.querySelector('#player2') as HTMLInputElement;
            const messageDiv = blockchainDiv.querySelector('#message') as HTMLDivElement;
            
            const player1 = parseInt(player1Input.value);
            const player2 = parseInt(player2Input.value);

            if (isNaN(player1) || isNaN(player2)) {
                messageDiv.textContent = 'Please enter valid scores for both players';
                return;
            }

            try {
                const response = await fetch('/api/games', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        player1_score: player1,
                        player2_score: player2
                    })
                });

                if (response.ok) {
                    messageDiv.textContent = 'Game saved successfully!';
                    player1Input.value = '';
                    player2Input.value = '';
                } else {
                    const errorData = await response.json();
                    messageDiv.textContent = errorData.message || 'Failed to save game';
                }
            } catch (error) {
                console.error('Error saving game:', error);
                messageDiv.textContent = 'Network error. Please try again.';
            }
        });
    }

    container.appendChild(blockchainDiv);
}