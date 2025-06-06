/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   SoundManager.ts                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: marvin <marvin@student.42.fr>              +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/24 10:44:36 by marvin            #+#    #+#             */
/*   Updated: 2025/05/24 10:44:36 by marvin           ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import { Howl } from 'howler';

export class SoundManager {
	private sounds: { [key: string]: Howl };
	private music: Howl | null = null;
	private musicPlaying: boolean = false;

	constructor(sounds: { [key: string]: Howl }) {
		this.sounds = sounds;
		this.music = this.sounds['bgm'];
	}

	play(name: string): void {
		const sfx = this.sounds[name];
		if (sfx) sfx.play();
	}

	playRandom(variants: string[]): void {
		const pick = variants[Math.floor(Math.random() * variants.length)];
		this.play(pick);
	}

	startMusic(): void {
		if (this.music && !this.musicPlaying) {
			this.music.play();
			this.musicPlaying = true;
		}
	}

	switchMusic(name: string): void {
		if (this.music) this.music.stop();
		this.music = this.sounds[name];
		this.musicPlaying = false;
		this.startMusic();
	}
}