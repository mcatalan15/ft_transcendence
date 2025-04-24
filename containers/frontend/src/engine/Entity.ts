/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Entity.ts                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/01 11:40:50 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/24 09:53:34 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

/*
This is one of the core piece of the ECS (entity-component-system architecture).
Every entity consists of several components, which can contain data or states (i.e., behavior).
Its a basic block which will act as inheritance base, and needs just to track components.
Hence, it has an id and a container of components, with functions to add/get to/from it.
*/

import { Component } from './Component.js'

export class Entity {
    id: string;
	layer: string;
	components: Map<string, Component>;
	
	constructor(id: string, layer: string) {
        this.id = id;
        this.layer = layer;
        this.components = new Map();
    }

    addComponent(component: Component, instanceId: string | null = null): string {
        const type = component.type;
        
        if (!instanceId) {
            instanceId = `${type}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        }
        
        const key = this._formatKey(type, instanceId);
        
        if (!this.components.has(type)) {
            this.components.set(type, component);
        }
        
        this.components.set(key, component);
        
        component.instanceId = instanceId;
        
        return instanceId;
    }

    getComponent(type: string, instanceId: string | null = null): Component | null  {
        if (instanceId) {
            const key = this._formatKey(type, instanceId);
            return this.components.get(key) || null;
        } else {
            return this.components.get(type) || null;
        }
    }

    getComponentsByType(type: string): Component[] {
        const result = [];
        
        for (const [key, component] of this.components.entries()) {
            if (key === type || (typeof key === 'string' && key.startsWith(`${type}:`))) {
                result.push(component);
            }
        }
        
        return result;
    }

    hasComponent(type: string, instanceId: string | null = null): boolean {
        if (instanceId) {
            const key = this._formatKey(type, instanceId);
            return this.components.has(key);
        }
        return this.components.has(type);
    }

    removeComponent(type: string, instanceId: string | null = null): boolean {
        if (instanceId) {
            const key = this._formatKey(type, instanceId);
            return this.components.delete(key);
        } else {
            let removed = this.components.delete(type);
            
            for (const key of this.components.keys()) {
                if (typeof key === 'string' && key.startsWith(`${type}:`)) {
                    this.components.delete(key);
                    removed = true;
                }
            }
            
            return removed;
        }
    }

    private _formatKey(type: string, instanceId: string): string {
        return `${type}:${instanceId}`;
    }
}