import { type BLEND_MODES } from './const';
import type { TextureSource } from '../texture/sources/TextureSource';
/**
 * Adjusts a blend mode for the current alpha mode. Returns the blend mode that works with that format.
 * eg 'normal' blend mode will return 'normal-npm' when rendering with premultiplied alpha.
 * and 'normal' if the texture is already premultiplied (the default)
 * @param blendMode - The blend mode to get the adjusted blend mode for.
 * @param textureSource - The texture to test the format of.
 * @returns - the blend mode that should be used to render this texture correctly based on its alphaMode
 */
export declare function getAdjustedBlendModeBlend(blendMode: BLEND_MODES, textureSource: TextureSource): BLEND_MODES;
