/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   InputComponent.js                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/10 10:36:40 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/10 10:38:01 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export class InputComponent {
	constructor(keys){
		this.type = 'input';
		this.keys = keys;
		this.upPressed = false;
		this.downPressed = false;
	}
}