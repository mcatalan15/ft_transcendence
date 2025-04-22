/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   MathUtils.js                                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/01 11:34:54 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/01 11:34:54 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export class MathUtils {
    static randomRange(min, max) {
        return Math.random() * (max - min) + min;
    }
    
    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
    
    static calculateAngle(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    }
}
