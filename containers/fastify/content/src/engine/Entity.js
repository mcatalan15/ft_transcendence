/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Entity.js                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/01 11:40:50 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/04/17 17:12:34 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

/*
This is the core piece of the ECS (entity-component-system architecture).
Every entity consists of several components, which can contain data or states (i.e., behavior).
Its a basic block which will act as inheritance base, and needs just to track components.
Hence, it has an id and a container of components, with functions to add/get to/from it.
*/
export class Entity {
    constructor(id, layer) {
        this.id = id;
        this.layer = layer;
        this.components = new Map();
    }

    addComponent(component, instanceId = null) {
        const type = component.type;
        
        // Generate a default instanceId if none provided
        if (!instanceId) {
            instanceId = `${type}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        }
        
        // Format for storage: [componentType, instanceId]
        const key = this._formatKey(type, instanceId);
        
        // If this is the first component of this type, also store it with just the type
        // for backward compatibility with getComponent(type)
        if (!this.components.has(type)) {
            this.components.set(type, component);
        }
        
        // Store the component with its full key
        this.components.set(key, component);
        
        // Add instanceId to the component for easy reference
        component.instanceId = instanceId;
        
        return instanceId;
    }

    getComponent(type, instanceId = null) {
        if (instanceId) {
            // Get specific instance of component
            const key = this._formatKey(type, instanceId);
            return this.components.get(key) || null;
        } else {
            // Get the first/main component of this type (backward compatibility)
            return this.components.get(type) || null;
        }
    }

    getComponentsByType(type) {
        const result = [];
        
        for (const [key, component] of this.components.entries()) {
            // Check if the key is either the type itself or starts with type:
            if (key === type || (typeof key === 'string' && key.startsWith(`${type}:`))) {
                result.push(component);
            }
        }
        
        return result;
    }

    hasComponent(type, instanceId = null) {
        if (instanceId) {
            const key = this._formatKey(type, instanceId);
            return this.components.has(key);
        }
        return this.components.has(type);
    }

    removeComponent(type, instanceId = null) {
        if (instanceId) {
            // Remove specific instance
            const key = this._formatKey(type, instanceId);
            return this.components.delete(key);
        } else {
            // Remove all components of this type
            let removed = this.components.delete(type);
            
            // Find and remove all instances of this type
            for (const key of this.components.keys()) {
                if (typeof key === 'string' && key.startsWith(`${type}:`)) {
                    this.components.delete(key);
                    removed = true;
                }
            }
            
            return removed;
        }
    }

    _formatKey(type, instanceId) {
        return `${type}:${instanceId}`;
    }
}