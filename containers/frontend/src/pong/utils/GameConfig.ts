/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   GameConfig.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/02 09:17:22 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/19 12:47:59 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export interface GameConfig {
	mode: 'local' | 'online';
	variant: '1v1' | '1vAI' | 'tournament';
	classicMode: boolean;
	filters: boolean;
	gameId?: string;
	
	hostName?: string | null ;
	guestName?: string | null ;
	currentPlayerName?: string;
	isCurrentPlayerHost?: boolean;
	
	players?: {
		id: string;
		name: string;
		type: 'local' | 'remote' | 'ai';
		side: 'left' | 'right';
	}[];
	
	network?: {
		roomId: string;
		isHost: boolean;
		serverUrl: string;
	};
}

export interface Preconfiguration {
	mode: 'local' | 'online' | string;
	variant: '1v1' | '1vAI' | 'tournament' | string;
	classicMode?: boolean;
	hasInvitationContext?: boolean;
	invitationData?: {
		inviteId: string;
		currentPlayer: string;
		timestamp: string;
	} | null;
}

export interface GameData {
	config: GameConfig;
	createdAt: Date | string | null;
	endedAt: Date | string | null;
	generalResult: 'leftWin' | 'rightWin' | 'draw' | null;
	winner: string | null;
	finalScore: {
		leftPlayer: number;
		rightPlayer: number;
	} 

	balls:{
		defaultBalls: number;
		curveBalls: number;
		multiplyBalls: number;
		spinBalls: number;
		burstBalls: number;

	}

	specialItems: {
		bullets: number;
		shields: number;
	}

	walls: {
		pyramids: number;
		escalators: number;
		hourglasses: number;
		lightnings: number;
		maws: number;
		rakes: number;
		trenches: number;
		kites: number;
		bowties: number;
		honeycombs: number;
		snakes: number;
		vipers: number;
		waystones: number;
	}

	leftPlayer: {
		// name: string;
		name: string;
		isDisconnected: boolean;
		score: number;
		result: 'win' | 'lose' | 'draw' | null;
		hits: number;
		goalsInFavor: number;
		goalsAgainst: number;
		powerupsPicked: number;
		powerdownsPicked: number;
		ballchangesPicked: number;
	}

	rightPlayer: {
		// name: string;
		name: string;
		isDisconnected: boolean;
		score: number;
		result: 'win' | 'lose' | 'draw' | null;
		hits: number;
		goalsInFavor: number;
		goalsAgainst: number;
		powerupsPicked: number;
		powerdownsPicked: number;
		ballchangesPicked: number;
	};
}

export interface PlayerData {
	id: string;
	name: string;
	avatar: string;
	type: 'human' | 'ai';
	side: 'left' | 'right';
	goalsScored: number;
	goalsConceded: number;
	tournaments: number;
	wins: number;
	losses: number;
	draws: number;
	rank: number;
	totalPlayers?: number;
	isBot?: boolean;
}

export type PlayerKey = `player${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8}`;

export interface TournamentConfig {
	tournamentId?: string | number;
	isPrepared: boolean;
	isFinished: boolean;
	classicMode:boolean;

	currentPhase?: 1 | 2 | 3 | 4 ;
	currentMatch?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

	matchWinners: {
		match1Winner: string | null;
		match2Winner: string | null;
		match3Winner: string | null;
		match4Winner: string | null;
		match5Winner: string | null;
		match6Winner: string | null;
		match7Winner: string | null;
	}

	nextMatch: {
		matchOrder: number;
		leftPlayerName: string | null;
		rightPlayerName: string | null;
	}

	registeredPlayerNames: {
		player1: string | PlayerKey | null;
		player2: string | PlayerKey | null;

		player3: string | PlayerKey | null;
		player4: string | PlayerKey | null;

		player5: string | PlayerKey | null;
		player6: string | PlayerKey | null;

		player7: string | PlayerKey | null;
		player8: string | PlayerKey | null;
	}

	registeredPlayerData: {
		player1Data: PlayerData | null;
		player2Data: PlayerData | null;
		player3Data: PlayerData | null;
		player4Data: PlayerData | null;
		player5Data: PlayerData | null;
		player6Data: PlayerData | null;
		player7Data: PlayerData | null;
		player8Data: PlayerData | null;
	}

	firstRoundPlayers: {
		player1: string | null;
		player2: string | null;

		player3: string | null;
		player4: string | null;

		player5: string | null;
		player6: string | null;

		player7: string | null;
		player8: string | null;
	}

	secondRoundPlayers: {
		player1: string | null;
		player2: string | null;

		player3: string | null;
		player4: string | null;
	}

	thirdRoundPlayers: {
		player1: string | null;
		player2: string | null;
	}

	tournamentWinner: string | null;

	finalTournamentData?: {}
}