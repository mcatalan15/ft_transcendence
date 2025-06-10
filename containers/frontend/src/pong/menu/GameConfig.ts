/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   GameConfig.ts                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/06/02 09:17:22 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/06/09 14:07:02 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export interface GameConfig {
	mode: 'local' | 'online';
	variant: '1v1' | '1vAI' | 'tournament';
	classicMode: boolean;

	filters: boolean;

	powerupsEnabled: boolean;

	players: {
		id?: string;// Optional: database ID or socket ID
		name: string;
		type: 'human' | 'ai' | 'remote';
		side: 'left' | 'right';
		team?: number;// Optional: for 2v2/tournament
	}[];

	network?: {
		roomId?: string;
		isHost?: boolean;
		serverUrl?: string;
	};
}