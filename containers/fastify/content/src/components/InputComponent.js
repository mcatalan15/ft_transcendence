/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   InputComponent.js                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/01 11:31:09 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/01 11:31:10 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export class InputComponent {
    constructor(keys) {
        this.type = 'input';
        this.entity = null;
        this.keys = keys;
        this.upPressed = false;
        this.downPressed = false;
    }
}