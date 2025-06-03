// blockchain.ts (updated with winner_name)
export function showBlockchain(container: HTMLElement): void {
    const blockchainDiv = document.createElement('div');
    blockchainDiv.className = 'p-4 max-w-md mx-auto';
    
    blockchainDiv.innerHTML = `
        <h1 class="text-2xl font-bold mb-4 text-white text-center">Blockchain Game</h1>
        <div class="mb-4">
            <div class="flex items-center space-x-4 mb-2">
                <div class="w-1/2">
                    <label for="player1Name" class="block text-white mb-1">Player 1 Name</label>
                    <input type="text" id="player1Name" class="w-full p-2 rounded bg-gray-700 text-white">
                </div>
                <div class="w-1/2">
                    <label for="player1Score" class="block text-white mb-1">Player 1 Score</label>
                    <input type="number" id="player1Score" class="w-full p-2 rounded bg-gray-700 text-white">
                </div>
            </div>
        </div>
        <div class="mb-6">
            <div class="flex items-center space-x-4 mb-2">
                <div class="w-1/2">
                    <label for="player2Name" class="block text-white mb-1">Player 2 Name</label>
                    <input type="text" id="player2Name" class="w-full p-2 rounded bg-gray-700 text-white">
                </div>
                <div class="w-1/2">
                    <label for="player2Score" class="block text-white mb-1">Player 2 Score</label>
                    <input type="number" id="player2Score" class="w-full p-2 rounded bg-gray-700 text-white">
                </div>
            </div>
        </div>
        <button id="toBlockchainBtn" class="w-full py-2 px-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded">
            To Blockchain
        </button>
        <div id="message" class="mt-4 text-white text-center"></div>
    `;

    const button = blockchainDiv.querySelector('#toBlockchainBtn');
    if (button) {
        button.addEventListener('click', async () => {
            const player1NameInput = blockchainDiv.querySelector('#player1Name') as HTMLInputElement;
            const player1ScoreInput = blockchainDiv.querySelector('#player1Score') as HTMLInputElement;
            const player2NameInput = blockchainDiv.querySelector('#player2Name') as HTMLInputElement;
            const player2ScoreInput = blockchainDiv.querySelector('#player2Score') as HTMLInputElement;
            const messageDiv = blockchainDiv.querySelector('#message') as HTMLDivElement;
            
            const player1Name = player1NameInput.value.trim();
            const player1Score = parseInt(player1ScoreInput.value);
            const player2Name = player2NameInput.value.trim();
            const player2Score = parseInt(player2ScoreInput.value);
    
            if (!player1Name || !player2Name) {
                messageDiv.textContent = 'Please enter names for both players';
                return;
            }
    
            if (isNaN(player1Score) || isNaN(player2Score)) {
                messageDiv.textContent = 'Please enter valid scores for both players';
                return;
            }
    
            // Determine the winner
            let winner_name: string;
            if (player1Score > player2Score) {
                winner_name = player1Name;
                console.log(`Winner: ${winner_name}`);
            } else if (player2Score > player1Score) {
                winner_name = player2Name;
                console.log(`Winner: ${winner_name}`);
            } else {
                winner_name = 'tie';
                console.log('The game ended in a tie');
            }
    
            try {
                // First save the game data
                const response = await fetch('/api/games', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        player1_name: player1Name,
                        player1_score: player1Score,
                        player2_name: player2Name,
                        player2_score: player2Score,
                        winner_name: winner_name 
                    })
                });
    
                if (response.ok) {
                    messageDiv.textContent = 'Game saved successfully! Deploying contract...';
                    player1NameInput.value = '';
                    player1ScoreInput.value = '';
                    player2NameInput.value = '';
                    player2ScoreInput.value = '';
                    
                    // After saving game, get latest game data
                    const gameResponse = await fetch('/api/games/latest');
                    const gameData = await gameResponse.json();
                    
                    // Then deploy contract
                    const deployResponse = await fetch('/api/deploy', {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            gameId: gameData.id_game
                        })
                    });
                    
                    const deployData = await deployResponse.json();
                    
                    if (deployResponse.ok) {
                        messageDiv.textContent = `Game saved and contract deployment initiated. Address: ${deployData.address}`;
                        console.log('Deployment initiated:', deployData);
                    } else {
                        messageDiv.textContent = deployData.message || 'Game saved but deployment failed';
                    }
                } else {
                    const errorData = await response.json();
                    messageDiv.textContent = errorData.message || 'Failed to save game';
                }
            } catch (error) {
                console.error('Error saving game or deploying contract:', error);
                messageDiv.textContent = 'Network error. Please try again.';
            }
        });
    }

    container.appendChild(blockchainDiv);
}