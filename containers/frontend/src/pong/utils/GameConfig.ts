/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   GameConfig.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/02 09:17:22 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/16 13:38:56 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export interface GameConfig {
	mode: 'local' | 'online';
	variant: '1v1' | '1vAI' | 'tournament';
	classicMode: boolean;
	filters: boolean;
	gameId?: string;
	
	hostName?: string;
	guestName?: string;
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
}