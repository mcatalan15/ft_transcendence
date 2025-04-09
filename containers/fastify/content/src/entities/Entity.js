/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Entity.js                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/01 11:24:50 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/08 17:30:25 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export class Entity {
    constructor(id) {
        this.id = id;
        this.components = {}; // Keep using an object for O(1) lookup
    }
    
    addComponent(component) {
        // Store using component.id instead of component.type
        this.components[component.id] = component;
        component.entity = this;
        return this;
    }
    
    getComponent(id) {
        // Simple lookup in the object
        return this.components[id];
    }

    hasComponent(id) {
        // Check if the component exists
        return this.components[id] !== undefined;
    }
}