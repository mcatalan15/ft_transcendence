import { type InstructionSet } from '../../rendering/renderers/shared/instructions/InstructionSet';
import { type Renderer } from '../../rendering/renderers/types';
import { type Bounds } from '../container/bounds/Bounds';
import { Container } from '../container/Container';
import type EventEmitter from 'eventemitter3';
/**
 * Options for configuring a RenderLayer.
 * @memberof scene
 */
export interface RenderLayerOptions {
    /**
     * If true, the layer's children will be sorted by zIndex before rendering
     * If false, you can manually sort the children using sortRenderLayerChildren when ever you need!
     * @default false
     */
    sortableChildren?: boolean;
    /**
     * Custom sort function to sort layer children. Default sorts by zIndex.
     * @param a - First container to compare
     * @param b - Second container to compare
     * @returns Negative if a should render before b, positive if b should render before a
     */
    sortFunction?: (a: Container, b: Container) => number;
}
type ContainerKeys = keyof Container;
type PartialContainerKeys = Exclude<ContainerKeys, 'parent' | 'didChange' | '_updateFlags' | keyof EventEmitter | 'parentRenderLayer' | 'destroyed' | 'layerParentId' | 'sortableChildren' | 'getFastGlobalBounds'>;
export type IRenderLayer = Omit<RenderLayerClass, PartialContainerKeys>;
/**
 * The RenderLayer API provides a way to control the rendering order of objects independently
 * of their logical parent-child relationships in the scene graph.
 * This allows developers to decouple how objects are transformed
 * (via their logical parent) from how they are rendered on the screen.
 *
 * ### Key Concepts
 *
 * #### RenderLayers Control Rendering Order:
 * - RenderLayers define where in the render stack objects are drawn,
 * but they do not affect an object's transformations (e.g., position, scale, rotation) or logical hierarchy.
 * - RenderLayers can be added anywhere in the scene graph.
 *
 * #### Logical Parenting Remains Unchanged:
 * - Objects still have a logical parent for transformations via addChild.
 * - Assigning an object to a layer does not reparent it.
 *
 * #### Explicit Control:
 * - Developers assign objects to layers using renderLayer.add and remove them using renderLayer.remove.
 * ---
 * ### API Details
 *
 * #### 1. Creating a RenderLayer
 * A RenderLayer is a lightweight object responsible for controlling render order.
 * It has no children or transformations of its own
 * but can be inserted anywhere in the scene graph to define its render position.
 * ```js
 * const layer = new RenderLayer();
 * app.stage.addChild(layer); // Insert the layer into the scene graph
 * ```
 *
 * #### 2. Adding Objects to a Layer
 * Use renderLayer.add to assign an object to a layer.
 * This overrides the object's default render order defined by its logical parent.
 * ```js
 * const rect = new PIXI.Graphics();
 * container.addChild(rect);    // Add to logical parent
 * layer.attach(rect);      // Control render order via the layer
 * ```
 *
 * #### 3. Removing Objects from a Layer
 * To stop an object from being rendered in the layer, use remove.
 * ```js
 * layer.remove(rect); // Stop rendering rect via the layer
 * ```
 * When an object is removed from its logical parent (removeChild), it is automatically removed from the layer.
 *
 * #### 4. Re-Adding Objects to Layers
 * If an object is re-added to a logical parent, it does not automatically reassign itself to the layer.
 * Developers must explicitly reassign it.
 * ```js
 * container.addChild(rect);    // Logical parent
 * layer.attach(rect);      // Explicitly reassign to the layer
 * ```
 *
 * #### 5. Layer Position in Scene Graph
 * A layer's position in the scene graph determines its render priority relative to other layers and objects.
 * Layers can be inserted anywhere in the scene graph.
 * ```js
 * const backgroundLayer = new RenderLayer();
 * const uiLayer = new RenderLayer();
 *
 * app.stage.addChild(backgroundLayer);
 * app.stage.addChild(world);
 * app.stage.addChild(uiLayer);
 * ```
 * This is a new API and therefore considered experimental at this stage.
 * While the core is pretty robust, there are still a few tricky issues we need to tackle.
 * However, even with the known issues below, we believe this API is incredibly useful!
 *
 * Known issues:
 *  - Interaction may not work as expected since hit testing does not account for the visual render order created by layers.
 *    For example, if an object is visually moved to the front via a layer, hit testing will still use its original position.
 *  - RenderLayers and their children must all belong to the same renderGroup to work correctly
 * @memberof scene
 * @class RenderLayer
 * @extends null
 */
export declare class RenderLayerClass extends Container {
    /**
     * Default options for RenderLayer instances
     * @property {boolean} sortableChildren - If true, layer children will be automatically sorted each render.
     * Default false.
     * @property {Function} sortFunction - Function used to sort layer children. Default sorts by zIndex.
     */
    static defaultOptions: RenderLayerOptions;
    /** Function used to sort layer children if sortableChildren is true */
    sortFunction: (a: Container, b: Container) => number;
    /** List of objects to be rendered by this layer */
    renderLayerChildren: Container[];
    /**
     * Creates a new RenderLayer instance
     * @param options - Configuration options for the RenderLayer
     * @param {boolean} [options.sortableChildren=false] - If true, layer children will be automatically sorted each render
     * @param {Function} [options.sortFunction] - Custom function to sort layer children. Default sorts by zIndex
     */
    constructor(options?: RenderLayerOptions);
    /**
     * Add an Container to this render layer. The Container will be rendered as part of this layer
     * while maintaining its original parent in the scene graph.
     * If the Container already belongs to a layer, it will be removed from the old layer before being added to this one.
     * @param children - The Container(s) to add to this layer
     */
    attach<U extends Container[]>(...children: U): U[0];
    /**
     * Remove an Container from this render layer. The Container will no longer be rendered
     * as part of this layer but maintains its original parent.
     * @param children - The Container(s) to remove from this layer
     */
    detach<U extends Container[]>(...children: U): U[0];
    /** Remove all objects from this render layer. */
    detachAll(): void;
    collectRenderables(instructionSet: InstructionSet, renderer: Renderer, _currentLayer: RenderLayerClass): void;
    /**
     * Sort the layer's children using the defined sort function.
     * Will be called each render if sortableChildren is true.
     * Otherwise can call this manually.
     */
    sortRenderLayerChildren(): void;
    _getGlobalBoundsRecursive(factorRenderLayers: boolean, bounds: Bounds, _currentLayer: RenderLayerClass): void;
}
export declare const RenderLayer: new (options?: RenderLayerOptions) => IRenderLayer;
export {};
