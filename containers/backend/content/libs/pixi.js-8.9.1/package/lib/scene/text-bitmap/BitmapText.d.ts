import { AbstractText } from '../text/AbstractText';
import { TextStyle } from '../text/TextStyle';
import type { View } from '../../rendering/renderers/shared/view/View';
import type { TextOptions, TextString } from '../text/AbstractText';
import type { TextStyleOptions } from '../text/TextStyle';
export interface BitmapText extends PixiMixins.BitmapText, AbstractText<TextStyle, TextStyleOptions> {
}
/**
 * A BitmapText Object will create a line or multiple lines of text.
 *
 * To split a line you can use '\n' in your text string, or, on the `style` object,
 * change its `wordWrap` property to true and and give the `wordWrapWidth` property a value.
 *
 * The text is created using a bitmap font (a sprite sheet of characters).
 *
 * The primary advantage of this render mode over `text` is that all of your textures are pre-generated and loaded,
 * meaning that rendering is fast, and changing text is much faster than Text.
 *
 * The primary disadvantage is that supporting character sets other than latin, such as CJK languages,
 * may be impractical due to the number of characters.
 *
 * <b>Pre-loaded BitmapFonts:</b>
 *
 *
 * PixiJS enables the loading of BitmapFonts through its Asset Manager, supporting both XML and FNT formats.
 * Additionally, PixiJS is compatible with MSDF (Multi-channel Signed Distance Field) and SDF (Signed Distance Field) fonts.
 * These advanced font types allow for scaling without quality degradation and must be created with specific tools,
 * such as the one available at https://msdf-bmfont.donmccurdy.com/.
 *
 * <b>Dynamically Generated BitmapFonts:</b>
 *
 *
 * PixiJS also offers the capability to generate BitmapFonts dynamically. This means that fonts are created in real-time
 * based on specified styles, eliminating the need for pre-loading. This process is initiated simply by assigning a style
 * to a BitmapText object, which then automatically generates the required font.
 *
 * However, dynamically generating a large number of fonts may lead to significant memory use. To prevent this,
 * PixiJS smartly attempts to reuse fonts that closely match the desired style parameters. For instance, if a text style
 * requires a font size of 80 but a similar font of size 100 has already been generated, PixiJS will scale the existing
 * font to fit the new requirement, rather than creating a new font from scratch.
 *
 * For those who prefer to manage BitmapFonts manually, PixiJS provides the BitmapFont.install method. This method
 * allows for the pre-generation and preparation of fonts, making them readily available for use by specifying the
 * fontFamily in your text styling.
 *
 * This approach ensures efficient font management within PixiJS, balancing between dynamic generation for flexibility
 * and manual management for optimized performance.
 * @example
 * import { BitmapText, BitmapFont } from 'pixi.js';
 *
 * // generate a dynamic font behind the scenes:
 * const text = new BitmapText({
 *     text: 'Hello Pixi!',
 *     style: {
 *         fontFamily: 'Arial',
 *         fontSize: 24,
 *         fill: 0xff1010,
 *         align: 'center',
 *     }
 * });
 *
 * // pre install
 * BitmapFont.install({
 *    name: 'myFont',
 *    style:{
 *        fontFamily: 'Arial',
 *    }
 * })
 *
 * // new bitmap text with preinstalled font
 * const text = new BitmapText({
 *     text: 'Hello Pixi!',
 *     style: {
 *        fontFamily: 'myFont',
 *        fontSize: 24,
 *        fill: 0xff1010,
 *        align: 'center',
 *     }
 * }
 *
 * // load a font from an xml file
 * const font = await Assets.load('path/to/myLoadedFont.fnt');
 *
 * // new bitmap text with loaded font
 * const text = new BitmapText({
 *     text: 'Hello Pixi!',
 *     style: {
 *        fontFamily: 'myLoadedFont', // the name of the font in the fnt file
 *        fontSize: 24,
 *        fill: 0xff1010,
 *        align: 'center',
 *     }
 * }
 * @memberof scene
 */
export declare class BitmapText extends AbstractText<TextStyle, TextStyleOptions> implements View {
    readonly renderPipeId: string;
    /**
     * **Note:** Our docs parser struggles to properly understand the constructor signature.
     * This is the correct signature.
     * ```ts
     * new BitmapText(options?: TextOptions);
     * ```
     * @param { text.TextOptions } options - The options of the bitmap text.
     */
    constructor(options?: TextOptions);
    /** @deprecated since 8.0.0 */
    constructor(text?: TextString, options?: Partial<TextStyle>);
    /** @private */
    protected updateBounds(): void;
    /**
     * The resolution / device pixel ratio of the canvas.
     * @default 1
     */
    set resolution(value: number);
    get resolution(): number;
}
