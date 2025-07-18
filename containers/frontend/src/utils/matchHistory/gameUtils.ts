import { getApiUrl } from '../../config/api';

export interface GameHistory {
  id_game: number;
  created_at: string;
  is_tournament: boolean;
  player1_name: string;
  player2_name: string;
  player1_score: number;
  player2_score: number;
  winner_name: string;
  player1_is_ai: boolean;
  player2_is_ai: boolean;
  game_mode: string;
  smart_contract_link?: string;
}

// export async function loadGames(
//   currentPage: number,
//   gamesPerPage: number,
//   username: string
// ): Promise<{ games: GameHistory[]; totalGames: number }> {
//   const usernameParam = username ? username : sessionStorage.getItem('username') || '';
//   const response = await fetch(getApiUrl(`/games/history?page=${currentPage}&limit=${gamesPerPage}&user=${usernameParam}`), {
//     credentials: 'include',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//   });
  
//   if (!response.ok) {
//     throw new Error(`HTTP error! status: ${response.status}`);
//   }

//   const data = await response.json();
//   console.log('History response:', data);
//   return {
//     games: data.games || [],
//     totalGames: data.total || 0,
//   };
// }

export async function loadGames(
	currentPage: number,
	gamesPerPage: number,
	username: string
): Promise<{ games: GameHistory[]; totalGames: number }> {
	try {
		const token = sessionStorage.getItem('token');
		if (!token) {
			console.error('No token found in sessionStorage');
			navigate('/signin');
			throw new Error('No token found');
		}
		const usernameParam = username || sessionStorage.getItem('username') || '';
		const response = await fetch(
			`${getApiUrl('/games/history')}?page=${currentPage}&limit=${gamesPerPage}&user=${encodeURIComponent(usernameParam)}`,
			{
				headers: {
					'Accept': 'application/json',
					'Authorization': `Bearer ${token}`,
				},
			}
		);
		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			if (response.status === 401) {
				console.error('Unauthorized access, redirecting to signin');
				navigate('/signin');
				throw new Error('Unauthorized: Please sign in again');
			}
			throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || 'Unknown error'}`);
		}
		const data = await response.json();
		console.log('History response:', data);
		return {
			games: data.games || [],
			totalGames: data.total || 0,
		};
	} catch (error) {
		console.error('Error loading games:', error);
		throw error;
	}
}