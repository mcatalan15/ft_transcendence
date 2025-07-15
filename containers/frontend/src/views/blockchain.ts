// // blockchain.ts (updated with winner_name)
// export function showBlockchain(container: HTMLElement): void {
//     const blockchainDiv = document.createElement('div');
//     blockchainDiv.className = 'p-4 max-w-md mx-auto';

//     blockchainDiv.innerHTML = `
//         <h1 class="text-2xl font-bold mb-4 text-white text-center">Blockchain Game</h1>
//         <div class="mb-4">
//             <div class="flex items-center space-x-4 mb-2">
//                 <div class="w-1/2">
//                     <label for="player1Name" class="block text-white mb-1">Player 1 Name</label>
//                     <input type="text" id="player1Name" class="w-full p-2 rounded bg-gray-700 text-white">
//                 </div>
//                 <div class="w-1/2">
//                     <label for="player1Score" class="block text-white mb-1">Player 1 Score</label>
//                     <input type="number" id="player1Score" class="w-full p-2 rounded bg-gray-700 text-white">
//                 </div>
//             </div>
//         </div>
//         <div class="mb-6">
//             <div class="flex items-center space-x-4 mb-2">
//                 <div class="w-1/2">
//                     <label for="player2Name" class="block text-white mb-1">Player 2 Name</label>
//                     <input type="text" id="player2Name" class="w-full p-2 rounded bg-gray-700 text-white">
//                 </div>
//                 <div class="w-1/2">
//                     <label for="player2Score" class="block text-white mb-1">Player 2 Score</label>
//                     <input type="number" id="player2Score" class="w-full p-2 rounded bg-gray-700 text-white">
//                 </div>
//             </div>
//         </div>
//         <button id="toBlockchainBtn" class="w-full py-2 px-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded">
//             To Blockchain
//         </button>
//         <div id="message" class="mt-4 text-white text-center"></div>
//     `;

//     const button = blockchainDiv.querySelector('#toBlockchainBtn');
//     if (button) {
//         button.addEventListener('click', async () => {
//             const player1NameInput = blockchainDiv.querySelector('#player1Name') as HTMLInputElement;
//             const player1ScoreInput = blockchainDiv.querySelector('#player1Score') as HTMLInputElement;
//             const player2NameInput = blockchainDiv.querySelector('#player2Name') as HTMLInputElement;
//             const player2ScoreInput = blockchainDiv.querySelector('#player2Score') as HTMLInputElement;
//             const messageDiv = blockchainDiv.querySelector('#message') as HTMLDivElement;

//             const player1Name = player1NameInput.value.trim();
//             const player1Score = parseInt(player1ScoreInput.value);
//             const player2Name = player2NameInput.value.trim();
//             const player2Score = parseInt(player2ScoreInput.value);

//             if (!player1Name || !player2Name) {
//                 messageDiv.textContent = 'Please enter names for both players';
//                 return;
//             }

//             if (isNaN(player1Score) || isNaN(player2Score)) {
//                 messageDiv.textContent = 'Please enter valid scores for both players';
//                 return;
//             }

//             // Determine the winner
//             let winner_name: string;
//             if (player1Score > player2Score) {
//                 winner_name = player1Name;
//                 console.log(`Winner: ${winner_name}`);
//             } else if (player2Score > player1Score) {
//                 winner_name = player2Name;
//                 console.log(`Winner: ${winner_name}`);
//             } else {
//                 winner_name = 'tie';
//                 console.log('The game ended in a tie');
//             }

//             try {
//                 // First save the game data
//                 const response = await fetch('/api/games', {
//                     method: 'POST',
//                     headers: {
//                         'Content-Type': 'application/json',
//                     },
//                     body: JSON.stringify({
//                         player1_name: player1Name,
//                         player1_score: player1Score,
//                         player2_name: player2Name,
//                         player2_score: player2Score,
//                         winner_name: winner_name 
//                     })
//                 });

//                 if (response.ok) {
//                     messageDiv.textContent = 'Game saved successfully! Deploying contract...';
//                     player1NameInput.value = '';
//                     player1ScoreInput.value = '';
//                     player2NameInput.value = '';
//                     player2ScoreInput.value = '';

//                     // After saving game, get latest game data
//                     const gameResponse = await fetch('/api/games/latest');
//                     const gameData = await gameResponse.json();

//                     // // Then deploy contract
//                     const deployResponse = await fetch('/api/deploy', {
//                         method: 'POST',
//                         headers: { 
//                             'Content-Type': 'application/json',
//                         },
//                         body: JSON.stringify({
//                             gameId: gameData.id_game
//                         })
//                     });

//                     const deployData = await deployResponse.json();

//                     if (deployResponse.ok) {
//                         messageDiv.textContent = `Game saved and contract deployment initiated. Address: ${deployData.address}`;
//                         console.log('Deployment initiated:', deployData);
//                     } else {
//                         messageDiv.textContent = deployData.message || 'Game saved but deployment failed';
//                     }
//                 } else {
//                     const errorData = await response.json();
//                     messageDiv.textContent = errorData.message || 'Failed to save game';
//                 }
//             } catch (error) {
//                 console.error('Error saving game or deploying contract:', error);
//                 messageDiv.textContent = 'Network error. Please try again.';
//             }
//         });
//     }

//     container.appendChild(blockchainDiv);
// }

// *********************************************************************************************************
// *********************************************************************************************************
// *********************************************************************************************************
// *********************************************************************************************************
// *********************************************************************************************************
import { getApiUrl } from "../config/api";

export function showBlockchain(container: HTMLElement): void {
	const blockchainDiv = document.createElement('div');
	blockchainDiv.className = 'p-4 max-w-md mx-auto';

	blockchainDiv.innerHTML = `
        <h1 class="text-2xl font-bold mb-4 text-white text-center">Blockchain Game</h1>
        <div class="mb-4">
            <div class="flex items-center space-x-4 mb-2">
                <div class="w-1/2">
                    <label for="player1Name" class="block text-white mb-1">Player 1 Name</label>
                    <input type="text" id="player1Name" class="w-full p-2 rounded bg-gray-700 text-white" value="mcatalan">
                </div>
                <div class="w-1/2">
                    <label for="player1Score" class="block text-white mb-1">Player 1 Score</label>
                    <input type="number" id="player1Score" class="w-full p-2 rounded bg-gray-700 text-white" value="7">
                </div>
            </div>
            <div class="flex items-center space-x-4 mb-2">
                <div class="w-1/2">
                    <label for="player1Id" class="block text-white mb-1">Player 1 ID</label>
                    <input type="number" id="player1Id" class="w-full p-2 rounded bg-gray-700 text-white" value="1">
                </div>
                <div class="w-1/2">
                    <label for="player1IsAi" class="block text-white mb-1">Player 1 is AI</label>
                    <input type="checkbox" id="player1IsAi" class="w-full p-2 rounded bg-gray-700 text-white" checked>
                </div>
            </div>
        </div>
        <div class="mb-4">
            <div class="flex items-center space-x-4 mb-2">
                <div class="w-1/2">
                    <label for="player2Name" class="block text-white mb-1">Player 2 Name</label>
                    <input type="text" id="player2Name" class="w-full p-2 rounded bg-gray-700 text-white" value="pep1">
                </div>
                <div class="w-1/2">
                    <label for="player2Score" class="block text-white mb-1">Player 2 Score</label>
                    <input type="number" id="player2Score" class="w-full p-2 rounded bg-gray-700 text-white" value="3">
                </div>
            </div>
            <div class="flex items-center space-x-4 mb-2">
                <div class="w-1/2">
                    <label for="player2Id" class="block text-white mb-1">Player 2 ID</label>
                    <input type="number" id="player2Id" class="w-full p-2 rounded bg-gray-700 text-white" value="2">
                </div>
                <div class="w-1/2">
                    <label for="player2IsAi" class="block text-white mb-1">Player 2 is AI</label>
                    <input type="checkbox" id="player2IsAi" class="w-full p-2 rounded bg-gray-700 text-white" checked>
                </div>
            </div>
        </div>
        <div class="mb-4">
            <div class="flex items-center space-x-4 mb-2">
                <div class="w-1/2">
                    <label for="gameMode" class="block text-white mb-1">Game Mode</label>
                    <input type="text" id="gameMode" class="w-full p-2 rounded bg-gray-700 text-white" value="local">
                </div>
                <div class="w-1/2">
                    <label for="isTournament" class="block text-white mb-1">Is Tournament</label>
                    <input type="checkbox" id="isTournament" class="w-full p-2 rounded bg-gray-700 text-white">
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
			const player1IdInput = blockchainDiv.querySelector('#player1Id') as HTMLInputElement;
			const player1IsAiInput = blockchainDiv.querySelector('#player1IsAi') as HTMLInputElement;
			const player2NameInput = blockchainDiv.querySelector('#player2Name') as HTMLInputElement;
			const player2ScoreInput = blockchainDiv.querySelector('#player2Score') as HTMLInputElement;
			const player2IdInput = blockchainDiv.querySelector('#player2Id') as HTMLInputElement;
			const player2IsAiInput = blockchainDiv.querySelector('#player2IsAi') as HTMLInputElement;
			const gameModeInput = blockchainDiv.querySelector('#gameMode') as HTMLInputElement;
			const isTournamentInput = blockchainDiv.querySelector('#isTournament') as HTMLInputElement;
			const messageDiv = blockchainDiv.querySelector('#message') as HTMLDivElement;

			// Default values
			let player1Name = player1NameInput.value.trim() || 'mcatalan';
			let player1Score = parseInt(player1ScoreInput.value) || 7;
			let player1Id = parseInt(player1IdInput.value) || 1;
			let player1IsAi = player1IsAiInput.checked || true;
			let player2Name = player2NameInput.value.trim() || 'pep1';
			let player2Score = parseInt(player2ScoreInput.value) || 3;
			let player2Id = parseInt(player2IdInput.value) || 2;
			let player2IsAi = player2IsAiInput.checked || true;
			let gameMode = gameModeInput.value.trim() || 'local';
			let isTournament = isTournamentInput.checked || false;
			const smartContractLink = 'https://testnet.snowtrace.io/address/0x752faE8b84C883C4593db03ACDa77a723722A41e';
			const contractAddress = '0x752faE8b84C883C4593db03ACDa77a723722A41e';

			// Input validation
			if (!player1Name || !player2Name) {
				messageDiv.textContent = 'Please enter names for both players';
				return;
			}

			if (isNaN(player1Score) || isNaN(player2Score)) {
				messageDiv.textContent = 'Please enter valid scores for both players';
				return;
			}

			if (isNaN(player1Id) || isNaN(player2Id)) {
				messageDiv.textContent = 'Please enter valid IDs for both players';
				return;
			}

			// Determine the winner
			let winner_name: string;
			let winner_id: number;
			if (player1Score > player2Score) {
				winner_name = player1Name;
				winner_id = player1Id;
				console.log(`Winner: ${winner_name}`);
			} else if (player2Score > player1Score) {
				winner_name = player2Name;
				winner_id = player2Id;
				console.log(`Winner: ${winner_name}`);
			} else {
				winner_name = 'tie';
				winner_id = 0; // No winner in case of tie
				console.log('The game ended in a tie');
			}

			try {
				// Save game data
				const response = await fetch(getApiUrl('/games'), {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						player1_id: player1Id,
						player2_id: player2Id,
						winner_id: winner_id,
						player1_name: player1Name,
						player2_name: player2Name,
						player1_score: player1Score,
						player2_score: player2Score,
						winner_name: winner_name,
						player1_is_ai: player1IsAi,
						player2_is_ai: player2IsAi,
						game_mode: gameMode,
						is_tournament: isTournament,
						smart_contract_link: smartContractLink,
						contract_address: contractAddress
					}),
					credentials: 'include'
				});

				if (response.ok) {
					messageDiv.textContent = 'Game saved successfully! Deploying contract...';
					// Clear inputs
					player1NameInput.value = '';
					player1ScoreInput.value = '';
					player1IdInput.value = '';
					player1IsAiInput.checked = false;
					player2NameInput.value = '';
					player2ScoreInput.value = '';
					player2IdInput.value = '';
					player2IsAiInput.checked = false;
					gameModeInput.value = '';
					isTournamentInput.checked = false;

					// // Get latest game data
					// const gameResponse = await fetch('/api/games/latest');
					// const gameData = await gameResponse.json();

					// // Deploy contract
					// const deployResponse = await fetch('/api/deploy', {
					//     method: 'POST',
					//     headers: {
					//         'Content-Type': 'application/json',
					//     },
					//     body: JSON.stringify({
					//         gameId: gameData.id_game
					//     })
					// });

					// const deployData = await deployResponse.json();

					// if (deployResponse.ok) {
					//     messageDiv.textContent = `Game saved and contract deployment initiated. Address: ${deployData.address}`;
					//     console.log('Deployment initiated:', deployData);
					// } else {
					//     messageDiv.textContent = deployData.message || 'Game saved but deployment failed';
					// }
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