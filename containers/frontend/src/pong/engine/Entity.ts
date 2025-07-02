/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Entity.ts                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: hmunoz-g <hmunoz-g@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/04/01 11:40:50 by hmunoz-g          #+#    #+#             */
/*   Updated: 2025/07/02 16:32:18 by hmunoz-g         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

/*
This is one of the core piece of the ECS (entity-component-system architecture).
Every entity consists of several components, which can contain data or states (i.e., behavior).
Its a basic block which will act as inheritance base, and needs just to track components.
Hence, it has an id and a container of components, with functions to add/get to/from it.
*/

import { Component } from './Component'


import { RenderComponent } from '../components/RenderComponent';
import { TextComponent } from '../components/TextComponent';

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

    getAllRenderables(): any[] {
        const renderables: any[] = [];
        
        for (const component of this.components.values()) {
            if (component.type === 'render') {
                const renderComp = component as RenderComponent;
                if (renderComp.graphic) {
                    renderables.push(renderComp.graphic);
                }
            }
            
            else if (component.type === 'text') {
                const textComp = component as TextComponent;
                const renderable = textComp.getRenderable();
                if (renderable) {
                    renderables.push(renderable);
                }
            } else if (component.type === 'textCollection' || 
                     (component as any).getAllRenderables && 
                     typeof (component as any).getAllRenderables === 'function') {
                const componentRenderables = (component as any).getAllRenderables();
                if (Array.isArray(componentRenderables)) {
                    renderables.push(...componentRenderables);
                }
            }
        }
        
        return renderables;
    }

    setAllRenderablesAlpha(alpha: number): void {
        const renderables = this.getAllRenderables();
        renderables.forEach(renderable => {
            if (renderable && typeof renderable.alpha !== 'undefined') {
                renderable.alpha = alpha;
            }
        });
    }
    getPrimaryRenderable(): any {
        const renderComponent = this.getComponent('render') as RenderComponent;
        return renderComponent ? renderComponent.graphic : null;
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
            let removed = false;
    
            for (const key of this.components.keys()) {
                if (typeof key === 'string' && key.startsWith(`${type}:`)) {
                    this.components.delete(key);
                    removed = true;
                }
            }
    
            return removed;
        }
    }

    replaceComponent(type: string, newComponent: Component, instanceId: string | null = null): void {
        if (!instanceId) {
            instanceId = newComponent.instanceId || `${type}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        }
    
        const key = this._formatKey(type, instanceId);
        
        if (this.components.has(key)) {
            this.components.delete(key);
            
            const typeComponent = this.components.get(type);
            if (typeComponent && typeComponent.instanceId === instanceId) {
                this.components.delete(type);
            }
        } else {
            console.log('Component not found for key:', key, 'Available keys:', Array.from(this.components.keys()));
        }

        this.components.set(key, newComponent);

        const existingTypeComponents = this.getComponentsByType(type);
        if (existingTypeComponents.length === 1) {
            this.components.set(type, newComponent);
        }
        
        newComponent.instanceId = instanceId;
    }

    private _formatKey(type: string, instanceId: string): string {
        return `${type}:${instanceId}`;
    }
}