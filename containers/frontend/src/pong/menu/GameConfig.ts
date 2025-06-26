/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   GameConfig.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/02 09:17:22 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/26 11:21:27 by hmunoz-g         ###   ########.fr       */
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

	network?: {
		roomId?: string;
		isHost?: boolean;
		serverUrl?: string;
	};
}