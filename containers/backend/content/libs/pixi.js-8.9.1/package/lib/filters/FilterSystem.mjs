import { ExtensionType } from '../extensions/Extensions.mjs';
import { Matrix } from '../maths/matrix/Matrix.mjs';
import { Point } from '../maths/point/Point.mjs';
import { BindGroup } from '../rendering/renderers/gpu/shader/BindGroup.mjs';
import { Geometry } from '../rendering/renderers/shared/geometry/Geometry.mjs';
import { UniformGroup } from '../rendering/renderers/shared/shader/UniformGroup.mjs';
import { Texture } from '../rendering/renderers/shared/texture/Texture.mjs';
import { TexturePool } from '../rendering/renderers/shared/texture/TexturePool.mjs';
import { RendererType } from '../rendering/renderers/types.mjs';
import { Bounds } from '../scene/container/bounds/Bounds.mjs';
import { getGlobalRenderableBounds } from '../scene/container/bounds/getRenderableBounds.mjs';
import { warn } from '../utils/logging/warn.mjs';

"use strict";
const quadGeometry = new Geometry({
  attributes: {
    aPosition: {
      buffer: new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]),
      format: "float32x2",
      stride: 2 * 4,
      offset: 0
    }
  },
  indexBuffer: new Uint32Array([0, 1, 2, 0, 2, 3])
});
class FilterSystem {
  constructor(renderer) {
    this._filterStackIndex = 0;
    this._filterStack = [];
    this._filterGlobalUniforms = new UniformGroup({
      uInputSize: { value: new Float32Array(4), type: "vec4<f32>" },
      uInputPixel: { value: new Float32Array(4), type: "vec4<f32>" },
      uInputClamp: { value: new Float32Array(4), type: "vec4<f32>" },
      uOutputFrame: { value: new Float32Array(4), type: "vec4<f32>" },
      uGlobalFrame: { value: new Float32Array(4), type: "vec4<f32>" },
      uOutputTexture: { value: new Float32Array(4), type: "vec4<f32>" }
    });
    this._globalFilterBindGroup = new BindGroup({});
    this.renderer = renderer;
  }
  /**
   * The back texture of the currently active filter. Requires the filter to have `blendRequired` set to true.
   * @readonly
   */
  get activeBackTexture() {
    return this._activeFilterData?.backTexture;
  }
  push(instruction) {
    const renderer = this.renderer;
    const filters = instruction.filterEffect.filters;
    if (!this._filterStack[this._filterStackIndex]) {
      this._filterStack[this._filterStackIndex] = this._getFilterData();
    }
    const filterData = this._filterStack[this._filterStackIndex];
    this._filterStackIndex++;
    if (filters.length === 0) {
      filterData.skip = true;
      return;
    }
    const bounds = filterData.bounds;
    if (instruction.renderables) {
      getGlobalRenderableBounds(instruction.renderables, bounds);
    } else if (instruction.filterEffect.filterArea) {
      bounds.clear();
      bounds.addRect(instruction.filterEffect.filterArea);
      bounds.applyMatrix(instruction.container.worldTransform);
    } else {
      instruction.container.getFastGlobalBounds(true, bounds);
    }
    if (instruction.container) {
      const renderGroup = instruction.container.renderGroup || instruction.container.parentRenderGroup;
      const filterFrameTransform = renderGroup.cacheToLocalTransform;
      if (filterFrameTransform) {
        bounds.applyMatrix(filterFrameTransform);
      }
    }
    const colorTextureSource = renderer.renderTarget.renderTarget.colorTexture.source;
    let resolution = Infinity;
    let padding = 0;
    let antialias = true;
    let blendRequired = false;
    let enabled = false;
    let clipToViewport = true;
    for (let i = 0; i < filters.length; i++) {
      const filter = filters[i];
      resolution = Math.min(resolution, filter.resolution === "inherit" ? colorTextureSource._resolution : filter.resolution);
      padding += filter.padding;
      if (filter.antialias === "off") {
        antialias = false;
      } else if (filter.antialias === "inherit") {
        antialias && (antialias = colorTextureSource.antialias);
      }
      if (!filter.clipToViewport) {
        clipToViewport = false;
      }
      const isCompatible = !!(filter.compatibleRenderers & renderer.type);
      if (!isCompatible) {
        enabled = false;
        break;
      }
      if (filter.blendRequired && !(renderer.backBuffer?.useBackBuffer ?? true)) {
        warn("Blend filter requires backBuffer on WebGL renderer to be enabled. Set `useBackBuffer: true` in the renderer options.");
        enabled = false;
        break;
      }
      enabled = filter.enabled || enabled;
      blendRequired || (blendRequired = filter.blendRequired);
    }
    if (!enabled) {
      filterData.skip = true;
      return;
    }
    if (clipToViewport) {
      const viewPort = renderer.renderTarget.rootViewPort;
      const rootResolution = renderer.renderTarget.renderTarget.resolution;
      bounds.fitBounds(0, viewPort.width / rootResolution, 0, viewPort.height / rootResolution);
    }
    bounds.scale(resolution).ceil().scale(1 / resolution).pad(padding | 0);
    if (!bounds.isPositive) {
      filterData.skip = true;
      return;
    }
    filterData.skip = false;
    filterData.bounds = bounds;
    filterData.blendRequired = blendRequired;
    filterData.container = instruction.container;
    filterData.filterEffect = instruction.filterEffect;
    filterData.previousRenderSurface = renderer.renderTarget.renderSurface;
    filterData.inputTexture = TexturePool.getOptimalTexture(
      bounds.width,
      bounds.height,
      resolution,
      antialias
    );
    renderer.renderTarget.bind(filterData.inputTexture, true);
    renderer.globalUniforms.push({
      offset: bounds
    });
  }
  pop() {
    const renderer = this.renderer;
    this._filterStackIndex--;
    const filterData = this._filterStack[this._filterStackIndex];
    if (filterData.skip) {
      return;
    }
    this._activeFilterData = filterData;
    const inputTexture = filterData.inputTexture;
    const bounds = filterData.bounds;
    let backTexture = Texture.EMPTY;
    renderer.renderTarget.finishRenderPass();
    if (filterData.blendRequired) {
      const previousBounds = this._filterStackIndex > 0 ? this._filterStack[this._filterStackIndex - 1].bounds : null;
      const renderTarget = renderer.renderTarget.getRenderTarget(filterData.previousRenderSurface);
      backTexture = this.getBackTexture(renderTarget, bounds, previousBounds);
    }
    filterData.backTexture = backTexture;
    const filters = filterData.filterEffect.filters;
    this._globalFilterBindGroup.setResource(inputTexture.source.style, 2);
    this._globalFilterBindGroup.setResource(backTexture.source, 3);
    renderer.globalUniforms.pop();
    if (filters.length === 1) {
      filters[0].apply(this, inputTexture, filterData.previousRenderSurface, false);
      TexturePool.returnTexture(inputTexture);
    } else {
      let flip = filterData.inputTexture;
      let flop = TexturePool.getOptimalTexture(
        bounds.width,
        bounds.height,
        flip.source._resolution,
        false
      );
      let i = 0;
      for (i = 0; i < filters.length - 1; ++i) {
        const filter = filters[i];
        filter.apply(this, flip, flop, true);
        const t = flip;
        flip = flop;
        flop = t;
      }
      filters[i].apply(this, flip, filterData.previousRenderSurface, false);
      TexturePool.returnTexture(flip);
      TexturePool.returnTexture(flop);
    }
    if (filterData.blendRequired) {
      TexturePool.returnTexture(backTexture);
    }
  }
  getBackTexture(lastRenderSurface, bounds, previousBounds) {
    const backgroundResolution = lastRenderSurface.colorTexture.source._resolution;
    const backTexture = TexturePool.getOptimalTexture(
      bounds.width,
      bounds.height,
      backgroundResolution,
      false
    );
    let x = bounds.minX;
    let y = bounds.minY;
    if (previousBounds) {
      x -= previousBounds.minX;
      y -= previousBounds.minY;
    }
    x = Math.floor(x * backgroundResolution);
    y = Math.floor(y * backgroundResolution);
    const width = Math.ceil(bounds.width * backgroundResolution);
    const height = Math.ceil(bounds.height * backgroundResolution);
    this.renderer.renderTarget.copyToTexture(
      lastRenderSurface,
      backTexture,
      { x, y },
      { width, height },
      { x: 0, y: 0 }
    );
    return backTexture;
  }
  applyFilter(filter, input, output, clear) {
    const renderer = this.renderer;
    const filterData = this._filterStack[this._filterStackIndex];
    const bounds = filterData.bounds;
    const offset = Point.shared;
    const previousRenderSurface = filterData.previousRenderSurface;
    const isFinalTarget = previousRenderSurface === output;
    let resolution = this.renderer.renderTarget.rootRenderTarget.colorTexture.source._resolution;
    let currentIndex = this._filterStackIndex - 1;
    while (currentIndex > 0 && this._filterStack[currentIndex].skip) {
      --currentIndex;
    }
    if (currentIndex > 0) {
      resolution = this._filterStack[currentIndex].inputTexture.source._resolution;
    }
    const filterUniforms = this._filterGlobalUniforms;
    const uniforms = filterUniforms.uniforms;
    const outputFrame = uniforms.uOutputFrame;
    const inputSize = uniforms.uInputSize;
    const inputPixel = uniforms.uInputPixel;
    const inputClamp = uniforms.uInputClamp;
    const globalFrame = uniforms.uGlobalFrame;
    const outputTexture = uniforms.uOutputTexture;
    if (isFinalTarget) {
      let lastIndex = this._filterStackIndex;
      while (lastIndex > 0) {
        lastIndex--;
        const filterData2 = this._filterStack[this._filterStackIndex - 1];
        if (!filterData2.skip) {
          offset.x = filterData2.bounds.minX;
          offset.y = filterData2.bounds.minY;
          break;
        }
      }
      outputFrame[0] = bounds.minX - offset.x;
      outputFrame[1] = bounds.minY - offset.y;
    } else {
      outputFrame[0] = 0;
      outputFrame[1] = 0;
    }
    outputFrame[2] = input.frame.width;
    outputFrame[3] = input.frame.height;
    inputSize[0] = input.source.width;
    inputSize[1] = input.source.height;
    inputSize[2] = 1 / inputSize[0];
    inputSize[3] = 1 / inputSize[1];
    inputPixel[0] = input.source.pixelWidth;
    inputPixel[1] = input.source.pixelHeight;
    inputPixel[2] = 1 / inputPixel[0];
    inputPixel[3] = 1 / inputPixel[1];
    inputClamp[0] = 0.5 * inputPixel[2];
    inputClamp[1] = 0.5 * inputPixel[3];
    inputClamp[2] = input.frame.width * inputSize[2] - 0.5 * inputPixel[2];
    inputClamp[3] = input.frame.height * inputSize[3] - 0.5 * inputPixel[3];
    const rootTexture = this.renderer.renderTarget.rootRenderTarget.colorTexture;
    globalFrame[0] = offset.x * resolution;
    globalFrame[1] = offset.y * resolution;
    globalFrame[2] = rootTexture.source.width * resolution;
    globalFrame[3] = rootTexture.source.height * resolution;
    const renderTarget = this.renderer.renderTarget.getRenderTarget(output);
    renderer.renderTarget.bind(output, !!clear);
    if (output instanceof Texture) {
      outputTexture[0] = output.frame.width;
      outputTexture[1] = output.frame.height;
    } else {
      outputTexture[0] = renderTarget.width;
      outputTexture[1] = renderTarget.height;
    }
    outputTexture[2] = renderTarget.isRoot ? -1 : 1;
    filterUniforms.update();
    if (renderer.renderPipes.uniformBatch) {
      const batchUniforms = renderer.renderPipes.uniformBatch.getUboResource(filterUniforms);
      this._globalFilterBindGroup.setResource(batchUniforms, 0);
    } else {
      this._globalFilterBindGroup.setResource(filterUniforms, 0);
    }
    this._globalFilterBindGroup.setResource(input.source, 1);
    this._globalFilterBindGroup.setResource(input.source.style, 2);
    filter.groups[0] = this._globalFilterBindGroup;
    renderer.encoder.draw({
      geometry: quadGeometry,
      shader: filter,
      state: filter._state,
      topology: "triangle-list"
    });
    if (renderer.type === RendererType.WEBGL) {
      renderer.renderTarget.finishRenderPass();
    }
  }
  _getFilterData() {
    return {
      skip: false,
      inputTexture: null,
      bounds: new Bounds(),
      container: null,
      filterEffect: null,
      blendRequired: false,
      previousRenderSurface: null
    };
  }
  /**
   * Multiply _input normalized coordinates_ to this matrix to get _sprite texture normalized coordinates_.
   *
   * Use `outputMatrix * vTextureCoord` in the shader.
   * @param outputMatrix - The matrix to output to.
   * @param {Sprite} sprite - The sprite to map to.
   * @returns The mapped matrix.
   */
  calculateSpriteMatrix(outputMatrix, sprite) {
    const data = this._activeFilterData;
    const mappedMatrix = outputMatrix.set(
      data.inputTexture._source.width,
      0,
      0,
      data.inputTexture._source.height,
      data.bounds.minX,
      data.bounds.minY
    );
    const worldTransform = sprite.worldTransform.copyTo(Matrix.shared);
    const renderGroup = sprite.renderGroup || sprite.parentRenderGroup;
    if (renderGroup && renderGroup.cacheToLocalTransform) {
      worldTransform.prepend(renderGroup.cacheToLocalTransform);
    }
    worldTransform.invert();
    mappedMatrix.prepend(worldTransform);
    mappedMatrix.scale(
      1 / sprite.texture.frame.width,
      1 / sprite.texture.frame.height
    );
    mappedMatrix.translate(sprite.anchor.x, sprite.anchor.y);
    return mappedMatrix;
  }
}
/** @ignore */
FilterSystem.extension = {
  type: [
    ExtensionType.WebGLSystem,
    ExtensionType.WebGPUSystem
  ],
  name: "filter"
};

export { FilterSystem };
//# sourceMappingURL=FilterSystem.mjs.map
