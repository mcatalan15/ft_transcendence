/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Entity.js                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/01 11:40:50 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/10 17:49:48 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

/*
This is the core piece of the ECS (entity-component-system architecture).
Every entity consists of several components, which can contain data or states (i.e., behavior).
Its a basic block which will act as inheritance base, and needs just to track components.
Hence, it has an id and a container of components, with functions to add/get to/from it.
*/
export class Entity {
    constructor(id) {
        this.id = id;
        this.components = new Map();
    }

    addComponent(component) {
        this.components.set(component.type, component);
    }

    getComponent(type) {
        return this.components.get(type);
    }

    hasComponent(type) {
        //!DEBUG
        /*if (this.id === 'paddleL' && !this.components.has(type)){
            console.log(`Entity ${this.id} has no component ${type}.`)
        }*/

        return this.components.has(type);
    }
}