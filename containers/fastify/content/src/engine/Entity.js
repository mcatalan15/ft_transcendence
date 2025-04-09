/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Entity.js                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/01 11:40:50 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/08 17:32:22 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export class Entity {
    constructor(id) {
        this.id = id;
        this.components = {};
    }
    
    addComponent(component) {
        this.components[component.type] = component;
        component.entity = this;
        return this;
    }
    
    getComponent(type) {
        return this.components[type];
    }

    hasComponent(type) {
        return this.components[type] !== undefined;
    }
}