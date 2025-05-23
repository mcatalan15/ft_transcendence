import { Bounds } from '../../container/bounds/Bounds';
import { type IRenderLayer } from '../../layers/RenderLayer';
import { ViewContainer, type ViewContainerOptions } from '../../view/ViewContainer';
import type { Instruction } from '../../../rendering/renderers/shared/instructions/Instruction';
import type { Shader } from '../../../rendering/renderers/shared/shader/Shader';
import type { Texture } from '../../../rendering/renderers/shared/texture/Texture';
import type { ContainerChild } from '../../container/Container';
import type { DestroyOptions } from '../../container/destroyTypes';
import type { IParticle } from './Particle';
import type { ParticleRendererProperty } from './particleData';
/**
 * Represents the properties of a particle that can be dynamically updated.
 * @property {boolean} [vertices] - Indicates if vertices are dynamic.
 * @property {boolean} [position] - Indicates if position is dynamic.
 * @property {boolean} [rotation] - Indicates if rotation is dynamic.
 * @property {boolean} [uvs] - Indicates if UVs are dynamic.
 * @property {boolean} [color] - Indicates if color is dynamic.
 * @memberof scene
 */
export interface ParticleProperties {
    vertex?: boolean;
    position?: boolean;
    rotation?: boolean;
    uvs?: boolean;
    color?: boolean;
}
/**
 * Options for the ParticleContainer constructor.
 * @extends ContainerOptions
 * @property {Record<string, boolean>} dynamicProperties - Specifies which properties are dynamic.
 * @property {Shader} shader - The shader to use for rendering.
 * @property {boolean} roundPixels - Indicates if pixels should be rounded.
 * @property {Texture} texture - The texture to use for rendering - if not provided the texture of the first child is used.
 * @property {IParticle[]} particles - An array of particles to add to the container.
 * @memberof scene
 */
export interface ParticleContainerOptions extends PixiMixins.ParticleContainerOptions, Omit<ViewContainerOptions, 'children'> {
    dynamicProperties?: Record<string, boolean>;
    shader?: Shader;
    roundPixels?: boolean;
    texture?: Texture;
    particles?: IParticle[];
}
export interface ParticleContainer extends PixiMixins.ParticleContainer, ViewContainer {
}
/**
 * The ParticleContainer class is a highly optimized container that can render 1000s or particles at great speed.
 *
 * A ParticleContainer is specialized in that it can only contain and render particles. Particles are
 * lightweight objects that use minimal memory, which helps boost performance.
 *
 * It can render particles EXTREMELY fast!
 *
 * The tradeoff of using a ParticleContainer is that most advanced functionality is unavailable. Particles are simple
 * and cannot have children, filters, masks, etc. They possess only the basic properties: position, scale, rotation,
 * and color.
 *
 * All particles must share the same texture source (using something like a sprite sheet works well here).
 *
 * When creating a ParticleContainer, a developer can specify which of these properties are static and which are dynamic.
 * - Static properties are only updated when you add or remove a child, or when the `update` function is called.
 * - Dynamic properties are updated every frame.
 *
 * It is up to the developer to specify which properties are static and which are dynamic. Generally, the more static
 * properties you have (i.e., those that do not change per frame), the faster the rendering.
 *
 * If the developer modifies the children order or any static properties of the particle, they must call the `update` method.
 *
 * By default, only the `position` property is set to dynamic, which makes rendering very fast!
 *
 * Developers can also provide a custom shader to the particle container, allowing them to render particles in a custom way.
 *
 * To help with performance, the particle containers bounds are not calculated.
 * It's up to the developer to set the boundsArea property.
 *
 * It's extremely easy to use. Below is an example of rendering thousands of sprites at lightning speed.
 *
 * --------- EXPERIMENTAL ---------
 *
 * This is a new API, things may change and it may not work as expected.
 * We want to hear your feedback as we go!
 *
 * --------------------------------
 * @example
 * import { ParticleContainer, Particle } from 'pixi.js';
 *
 * const container = new ParticleContainer();
 *
 * for (let i = 0; i < 100; ++i)
 * {
 *     let particle = new Particle(texture);
 *     container.addParticle(particle);
 * }
 * @memberof scene
 */
export declare class ParticleContainer extends ViewContainer implements Instruction {
    /**
     * Defines the default options for creating a ParticleContainer.
     * @property {Record<string, boolean>} dynamicProperties - Specifies which properties are dynamic.
     * @property {boolean} roundPixels - Indicates if pixels should be  rounded.
     */
    static defaultOptions: ParticleContainerOptions;
    /** The unique identifier for the render pipe of this ParticleContainer. */
    readonly renderPipeId: string;
    batched: boolean;
    /**
     * A record of properties and their corresponding ParticleRendererProperty.
     * @internal
     */
    _properties: Record<string, ParticleRendererProperty>;
    /** Indicates if the children of this ParticleContainer have changed and need to be updated. */
    _childrenDirty: boolean;
    /**
     * An array of particles that are children of this ParticleContainer.
     * it can be modified directly, after which the 'update' method must be called.
     * to ensure the container is rendered correctly.
     */
    particleChildren: IParticle[];
    /** The shader used for rendering particles in this ParticleContainer. */
    shader: Shader;
    /**
     * The texture used for rendering particles in this ParticleContainer.
     * Defaults to the first childs texture if not set
     */
    texture: Texture;
    /**
     * @param options - The options for creating the sprite.
     */
    constructor(options?: ParticleContainerOptions);
    /**
     * Adds one or more particles to the container.
     *
     * Multiple items can be added like so: `myContainer.addParticle(thingOne, thingTwo, thingThree)`
     * @param {...IParticle} children - The Particle(s) to add to the container
     * @returns {IParticle} - The first child that was added.
     */
    addParticle(...children: IParticle[]): IParticle;
    /**
     * Removes one or more particles from the container.
     * @param {...IParticle} children - The Particle(s) to remove
     * @returns {IParticle} The first child that was removed.
     */
    removeParticle(...children: IParticle[]): IParticle;
    /**
     * Updates the particle container.
     * Please call this when you modify the particleChildren array.
     * or any static properties of the particles.
     */
    update(): void;
    protected onViewUpdate(): void;
    /**
     * ParticleContainer does not calculated bounds as it would slow things down,
     * its up to you to set this via the boundsArea property
     */
    get bounds(): Bounds;
    /** @private */
    protected updateBounds(): void;
    /**
     * Destroys this sprite renderable and optionally its texture.
     * @param options - Options parameter. A boolean will act as if all options
     *  have been set to that value
     * @param {boolean} [options.texture=false] - Should it destroy the current texture of the renderable as well
     * @param {boolean} [options.textureSource=false] - Should it destroy the textureSource of the renderable as well
     */
    destroy(options?: DestroyOptions): void;
    /**
     * Removes all particles from this container that are within the begin and end indexes.
     * @param beginIndex - The beginning position.
     * @param endIndex - The ending position. Default value is size of the container.
     * @returns - List of removed particles
     */
    removeParticles(beginIndex?: number, endIndex?: number): IParticle[];
    /**
     * Removes a particle from the specified index position.
     * @param index - The index to get the particle from
     * @returns The particle that was removed.
     */
    removeParticleAt<U extends IParticle>(index: number): U;
    /**
     * Adds a particle to the container at a specified index. If the index is out of bounds an error will be thrown.
     * If the particle is already in this container, it will be moved to the specified index.
     * @param {Container} child - The particle to add.
     * @param {number} index - The absolute index where the particle will be positioned at the end of the operation.
     * @returns {Container} The particle that was added.
     */
    addParticleAt<U extends IParticle>(child: U, index: number): U;
    /**
     * This method is not available in ParticleContainer.
     *
     * Calling this method will throw an error. Please use `ParticleContainer.addParticle()` instead.
     * @param {...any} _children
     * @throws {Error} Always throws an error as this method is not available.
     */
    addChild<U extends (ContainerChild | IRenderLayer)[]>(..._children: U): U[0];
    /**
     * This method is not available in ParticleContainer.
     * Calling this method will throw an error. Please use `ParticleContainer.removeParticle()` instead.
     * @param {...any} _children
     * @throws {Error} Always throws an error as this method is not available.
     */
    removeChild<U extends (ContainerChild | IRenderLayer)[]>(..._children: U): U[0];
    /**
     * This method is not available in ParticleContainer.
     *
     * Calling this method will throw an error. Please use `ParticleContainer.removeParticles()` instead.
     * @param {number} [_beginIndex]
     * @param {number} [_endIndex]
     * @throws {Error} Always throws an error as this method is not available.
     */
    removeChildren(_beginIndex?: number, _endIndex?: number): ContainerChild[];
    /**
     * This method is not available in ParticleContainer.
     *
     * Calling this method will throw an error. Please use `ParticleContainer.removeParticleAt()` instead.
     * @param {number} _index
     * @throws {Error} Always throws an error as this method is not available.
     */
    removeChildAt<U extends (ContainerChild | IRenderLayer)>(_index: number): U;
    /**
     * This method is not available in ParticleContainer.
     *
     * Calling this method will throw an error. Please use `ParticleContainer.getParticleAt()` instead.
     * @param {number} _index
     * @throws {Error} Always throws an error as this method is not available.
     */
    getChildAt<U extends (ContainerChild | IRenderLayer)>(_index: number): U;
    /**
     * This method is not available in ParticleContainer.
     *
     * Calling this method will throw an error. Please use `ParticleContainer.setParticleIndex()` instead.
     * @param {ContainerChild} _child
     * @param {number} _index
     * @throws {Error} Always throws an error as this method is not available.
     */
    setChildIndex(_child: ContainerChild, _index: number): void;
    /**
     * This method is not available in ParticleContainer.
     *
     * Calling this method will throw an error. Please use `ParticleContainer.getParticleIndex()` instead.
     * @param {ContainerChild} _child
     * @throws {Error} Always throws an error as this method is not available.
     */
    getChildIndex(_child: ContainerChild): number;
    /**
     * This method is not available in ParticleContainer.
     *
     * Calling this method will throw an error. Please use `ParticleContainer.addParticleAt()` instead.
     * @param {ContainerChild} _child
     * @param {number} _index
     * @throws {Error} Always throws an error as this method is not available.
     */
    addChildAt<U extends (ContainerChild | IRenderLayer)>(_child: U, _index: number): U;
    /**
     * This method is not available in ParticleContainer.
     *
     * Calling this method will throw an error. Please use `ParticleContainer.swapParticles()` instead.
     * @param {ContainerChild} _child
     * @param {ContainerChild} _child2
     */
    swapChildren<U extends (ContainerChild | IRenderLayer)>(_child: U, _child2: U): void;
    /**
     * This method is not available in ParticleContainer.
     *
     * Calling this method will throw an error.
     * @param _child - The child to reparent
     * @throws {Error} Always throws an error as this method is not available.
     */
    reparentChild(..._child: ContainerChild[]): any;
    /**
     * This method is not available in ParticleContainer.
     *
     * Calling this method will throw an error.
     * @param _child - The child to reparent
     * @param _index - The index to reparent the child to
     * @throws {Error} Always throws an error as this method is not available.
     */
    reparentChildAt(_child: ContainerChild, _index: number): any;
}
