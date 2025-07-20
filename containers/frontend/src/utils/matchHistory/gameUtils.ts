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

export async function loadGames(
  currentPage: number,
  gamesPerPage: number,
  userId: string
): Promise<{ games: GameHistory[]; totalGames: number }> {

  const response = await fetch(getApiUrl(`/games/history?page=${currentPage}&limit=${gamesPerPage}&user=${userId}`), {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  
  return {
    games: data.games || [],
    totalGames: data.total || 0,
  };
}