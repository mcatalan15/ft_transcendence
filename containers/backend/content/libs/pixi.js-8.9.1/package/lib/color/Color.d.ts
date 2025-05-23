import type { HslaColor, HslColor, HsvaColor, HsvColor, RgbaColor, RgbColor } from '@pixi/colord';
/**
 * Pixi supports multiple color formats, including CSS color strings, hex, numbers, and arrays.
 *
 * When providing values for any of the color properties, you can use any of the {@link color.ColorSource} formats.
 * ```typescript
 * import { Color } from 'pixi.js';
 *
 * // All of these are valid:
 * sprite.tint = 'red';
 * sprite.tint = 0xff0000;
 * sprite.tint = '#ff0000';
 * sprite.tint = new Color('red');
 *
 * // Same for graphics fill/stroke colors and other  color values:
 * graphics.fill({ color: 'red' });
 * graphics.fill({ color: 0xff0000 });
 * graphics.stroke({ color: '#ff0000' });
 * graphics.stroke({ color: new Color('red')};
 * ```
 * @namespace color
 */
/**
 * RGBA color array.
 *
 * `[number, number, number, number]`
 * @memberof color
 */
export type RgbaArray = [number, number, number, number];
/**
 * Valid formats to use when defining any color properties, also valid for the {@link color.Color} constructor.
 *
 * These types are extended from [colord](https://www.npmjs.com/package/colord) with some PixiJS-specific extensions.
 *
 * Possible value types are:
 * - [Color names](https://www.w3.org/TR/css-color-4/#named-colors):
 *   `'red'`, `'green'`, `'blue'`, `'white'`, etc.
 * - RGB hex integers (`0xRRGGBB`):
 *   `0xff0000`, `0x00ff00`, `0x0000ff`, etc.
 * - [RGB(A) hex strings](https://www.w3.org/TR/css-color-4/#hex-notation):
 *   - 6 digits (`RRGGBB`): `'ff0000'`, `'#00ff00'`, `'0x0000ff'`, etc.
 *   - 3 digits (`RGB`): `'f00'`, `'#0f0'`, `'0x00f'`, etc.
 *   - 8 digits (`RRGGBBAA`): `'ff000080'`, `'#00ff0080'`, `'0x0000ff80'`, etc.
 *   - 4 digits (`RGBA`): `'f008'`, `'#0f08'`, `'0x00f8'`, etc.
 * - RGB(A) objects:
 *   `{ r: 255, g: 0, b: 0 }`, `{ r: 255, g: 0, b: 0, a: 0.5 }`, etc.
 * - [RGB(A) strings](https://www.w3.org/TR/css-color-4/#rgb-functions):
 *   `'rgb(255, 0, 0)'`, `'rgb(100% 0% 0%)'`, `'rgba(255, 0, 0, 0.5)'`, `'rgba(100% 0% 0% / 50%)'`, etc.
 * - RGB(A) arrays:
 *   `[1, 0, 0]`, `[1, 0, 0, 0.5]`, etc.
 * - RGB(A) Float32Array:
 *   `new Float32Array([1, 0, 0])`, `new Float32Array([1, 0, 0, 0.5])`, etc.
 * - RGB(A) Uint8Array:
 *   `new Uint8Array([255, 0, 0])`, `new Uint8Array([255, 0, 0, 128])`, etc.
 * - RGB(A) Uint8ClampedArray:
 *   `new Uint8ClampedArray([255, 0, 0])`, `new Uint8ClampedArray([255, 0, 0, 128])`, etc.
 * - HSL(A) objects:
 *   `{ h: 0, s: 100, l: 50 }`, `{ h: 0, s: 100, l: 50, a: 0.5 }`, etc.
 * - [HSL(A) strings](https://www.w3.org/TR/css-color-4/#the-hsl-notation):
 *   `'hsl(0, 100%, 50%)'`, `'hsl(0deg 100% 50%)'`, `'hsla(0, 100%, 50%, 0.5)'`, `'hsla(0deg 100% 50% / 50%)'`, etc.
 * - HSV(A) objects:
 *   `{ h: 0, s: 100, v: 100 }`, `{ h: 0, s: 100, v: 100, a: 0.5 }`, etc.
 * - {@link color.Color} objects.
 * @since 7.2.0
 * @memberof color
 */
export type ColorSource = string | number | number[] | Float32Array | Uint8Array | Uint8ClampedArray | HslColor | HslaColor | HsvColor | HsvaColor | RgbColor | RgbaColor | Color | number;
/**
 * Color utility class. Can accept any {@link color.ColorSource} format in its constructor.
 * ```js
 * import { Color } from 'pixi.js';
 *
 * new Color('red').toArray(); // [1, 0, 0, 1]
 * new Color(0xff0000).toArray(); // [1, 0, 0, 1]
 * new Color('ff0000').toArray(); // [1, 0, 0, 1]
 * new Color('#f00').toArray(); // [1, 0, 0, 1]
 * new Color('0xff0000ff').toArray(); // [1, 0, 0, 1]
 * new Color('#f00f').toArray(); // [1, 0, 0, 1]
 * new Color({ r: 255, g: 0, b: 0, a: 0.5 }).toArray(); // [1, 0, 0, 0.5]
 * new Color('rgb(255, 0, 0, 0.5)').toArray(); // [1, 0, 0, 0.5]
 * new Color([1, 1, 1]).toArray(); // [1, 1, 1, 1]
 * new Color([1, 0, 0, 0.5]).toArray(); // [1, 0, 0, 0.5]
 * new Color(new Float32Array([1, 0, 0, 0.5])).toArray(); // [1, 0, 0, 0.5]
 * new Color(new Uint8Array([255, 0, 0, 255])).toArray(); // [1, 0, 0, 1]
 * new Color(new Uint8ClampedArray([255, 0, 0, 255])).toArray(); // [1, 0, 0, 1]
 * new Color({ h: 0, s: 100, l: 50, a: 0.5 }).toArray(); // [1, 0, 0, 0.5]
 * new Color('hsl(0, 100%, 50%, 50%)').toArray(); // [1, 0, 0, 0.5]
 * new Color({ h: 0, s: 100, v: 100, a: 0.5 }).toArray(); // [1, 0, 0, 0.5]
 * ```
 * @since 7.2.0
 * @memberof color
 */
export declare class Color {
    /**
     * Default Color object for static uses
     * @example
     * import { Color } from 'pixi.js';
     * Color.shared.setValue(0xffffff).toHex(); // '#ffffff'
     */
    static readonly shared: Color;
    /**
     * Temporary Color object for static uses internally.
     * As to not conflict with Color.shared.
     * @ignore
     */
    private static readonly _temp;
    /** Pattern for hex strings */
    private static readonly HEX_PATTERN;
    /** Internal color source, from constructor or set value */
    private _value;
    /** Normalized rgba component, floats from 0-1 */
    private _components;
    /** Cache color as number */
    private _int;
    /** An array of the current Color. Only populated when `toArray` functions are called */
    private _arrayRgba;
    private _arrayRgb;
    /**
     * @param {ColorSource} value - Optional value to use, if not provided, white is used.
     */
    constructor(value?: ColorSource);
    /** Get red component (0 - 1) */
    get red(): number;
    /** Get green component (0 - 1) */
    get green(): number;
    /** Get blue component (0 - 1) */
    get blue(): number;
    /** Get alpha component (0 - 1) */
    get alpha(): number;
    /**
     * Set the value, suitable for chaining
     * @param value
     * @see Color.value
     */
    setValue(value: ColorSource): this;
    /**
     * The current color source.
     *
     * When setting:
     * - Setting to an instance of `Color` will copy its color source and components.
     * - Otherwise, `Color` will try to normalize the color source and set the components.
     *   If the color source is invalid, an `Error` will be thrown and the `Color` will left unchanged.
     *
     * Note: The `null` in the setter's parameter type is added to match the TypeScript rule: return type of getter
     * must be assignable to its setter's parameter type. Setting `value` to `null` will throw an `Error`.
     *
     * When getting:
     * - A return value of `null` means the previous value was overridden (e.g., {@link Color.multiply multiply},
     *   {@link Color.premultiply premultiply} or {@link Color.round round}).
     * - Otherwise, the color source used when setting is returned.
     */
    set value(value: ColorSource | null);
    get value(): Exclude<ColorSource, Color> | null;
    /**
     * Copy a color source internally.
     * @param value - Color source
     */
    private _cloneSource;
    /**
     * Equality check for color sources.
     * @param value1 - First color source
     * @param value2 - Second color source
     * @returns `true` if the color sources are equal, `false` otherwise.
     */
    private _isSourceEqual;
    /**
     * Convert to a RGBA color object.
     * @example
     * import { Color } from 'pixi.js';
     * new Color('white').toRgb(); // returns { r: 1, g: 1, b: 1, a: 1 }
     */
    toRgba(): RgbaColor;
    /**
     * Convert to a RGB color object.
     * @example
     * import { Color } from 'pixi.js';
     * new Color('white').toRgb(); // returns { r: 1, g: 1, b: 1 }
     */
    toRgb(): RgbColor;
    /** Convert to a CSS-style rgba string: `rgba(255,255,255,1.0)`. */
    toRgbaString(): string;
    /**
     * Convert to an [R, G, B] array of clamped uint8 values (0 to 255).
     * @example
     * import { Color } from 'pixi.js';
     * new Color('white').toUint8RgbArray(); // returns [255, 255, 255]
     * @param {number[]|Uint8Array|Uint8ClampedArray} [out] - Output array
     */
    toUint8RgbArray(): number[];
    toUint8RgbArray<T extends number[] | Uint8Array | Uint8ClampedArray>(out: T): T;
    /**
     * Convert to an [R, G, B, A] array of normalized floats (numbers from 0.0 to 1.0).
     * @example
     * import { Color } from 'pixi.js';
     * new Color('white').toArray(); // returns [1, 1, 1, 1]
     * @param {number[]|Float32Array} [out] - Output array
     */
    toArray(): number[];
    toArray<T extends number[] | Float32Array>(out: T): T;
    /**
     * Convert to an [R, G, B] array of normalized floats (numbers from 0.0 to 1.0).
     * @example
     * import { Color } from 'pixi.js';
     * new Color('white').toRgbArray(); // returns [1, 1, 1]
     * @param {number[]|Float32Array} [out] - Output array
     */
    toRgbArray(): number[];
    toRgbArray<T extends number[] | Float32Array>(out: T): T;
    /**
     * Convert to a hexadecimal number.
     * @example
     * import { Color } from 'pixi.js';
     * new Color('white').toNumber(); // returns 16777215
     */
    toNumber(): number;
    /**
     * Convert to a BGR number
     * @example
     * import { Color } from 'pixi.js';
     * new Color(0xffcc99).toBgrNumber(); // returns 0x99ccff
     */
    toBgrNumber(): number;
    /**
     * Convert to a hexadecimal number in little endian format (e.g., BBGGRR).
     * @example
     * import { Color } from 'pixi.js';
     * new Color(0xffcc99).toLittleEndianNumber(); // returns 0x99ccff
     * @returns {number} - The color as a number in little endian format.
     */
    toLittleEndianNumber(): number;
    /**
     * Multiply with another color. This action is destructive, and will
     * override the previous `value` property to be `null`.
     * @param {ColorSource} value - The color to multiply by.
     */
    multiply(value: ColorSource): this;
    /**
     * Converts color to a premultiplied alpha format. This action is destructive, and will
     * override the previous `value` property to be `null`.
     * @param alpha - The alpha to multiply by.
     * @param {boolean} [applyToRGB=true] - Whether to premultiply RGB channels.
     * @returns {Color} - Itself.
     */
    premultiply(alpha: number, applyToRGB?: boolean): this;
    /**
     * Premultiplies alpha with current color.
     * @param {number} alpha - The alpha to multiply by.
     * @param {boolean} [applyToRGB=true] - Whether to premultiply RGB channels.
     * @returns {number} tint multiplied by alpha
     */
    toPremultiplied(alpha: number, applyToRGB?: boolean): number;
    /**
     * Convert to a hexadecimal string.
     * @example
     * import { Color } from 'pixi.js';
     * new Color('white').toHex(); // returns "#ffffff"
     */
    toHex(): string;
    /**
     * Convert to a hexadecimal string with alpha.
     * @example
     * import { Color } from 'pixi.js';
     * new Color('white').toHexa(); // returns "#ffffffff"
     */
    toHexa(): string;
    /**
     * Set alpha, suitable for chaining.
     * @param alpha
     */
    setAlpha(alpha: number): this;
    /**
     * Normalize the input value into rgba
     * @param value - Input value
     */
    private _normalize;
    /** Refresh the internal color rgb number */
    private _refreshInt;
    /**
     * Clamps values to a range. Will override original values
     * @param value - Value(s) to clamp
     * @param min - Minimum value
     * @param max - Maximum value
     */
    private _clamp;
    /**
     * Check if the value is a color-like object
     * @param value - Value to check
     * @returns True if the value is a color-like object
     * @static
     * @example
     * import { Color } from 'pixi.js';
     * Color.isColorLike('white'); // returns true
     * Color.isColorLike(0xffffff); // returns true
     * Color.isColorLike([1, 1, 1]); // returns true
     */
    static isColorLike(value: unknown): value is ColorSource;
}
