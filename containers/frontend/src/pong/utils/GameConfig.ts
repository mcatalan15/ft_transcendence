/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   GameConfig.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: nponchon <nponchon@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/02 09:17:22 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/01 16:24:00 by nponchon         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export interface GameConfig {
    mode: 'local' | 'online';
    variant: '1v1' | '1vAI' | 'tournament';
    classicMode: boolean;
    filters: boolean;
    
    players: {
        id?: string;
        name: string;
        type: 'human' | 'ai' | 'remote';
        side: 'left' | 'right';
        team?: number;
    }[];

    player2Id?: string;
    
    network?: {
        roomId?: string;
        isHost?: boolean;
        serverUrl?: string;
    };
}

export interface Preconfiguration {
	
}

export interface GameData {
	// gameId: string;
	//!change
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

	specialItmes: {
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
		name: string;
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
		name: string;
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