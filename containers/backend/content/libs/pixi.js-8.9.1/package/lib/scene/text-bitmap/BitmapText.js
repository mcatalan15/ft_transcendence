'use strict';

var warn = require('../../utils/logging/warn.js');
var AbstractText = require('../text/AbstractText.js');
var TextStyle = require('../text/TextStyle.js');
var BitmapFontManager = require('./BitmapFontManager.js');

"use strict";
class BitmapText extends AbstractText.AbstractText {
  constructor(...args) {
    var _a;
    const options = AbstractText.ensureTextOptions(args, "BitmapText");
    options.style ?? (options.style = options.style || {});
    (_a = options.style).fill ?? (_a.fill = 16777215);
    super(options, TextStyle.TextStyle);
    this.renderPipeId = "bitmapText";
  }
  /** @private */
  updateBounds() {
    const bounds = this._bounds;
    const anchor = this._anchor;
    const bitmapMeasurement = BitmapFontManager.BitmapFontManager.measureText(this.text, this._style);
    const scale = bitmapMeasurement.scale;
    const offset = bitmapMeasurement.offsetY * scale;
    let width = bitmapMeasurement.width * scale;
    let height = bitmapMeasurement.height * scale;
    const stroke = this._style._stroke;
    if (stroke) {
      width += stroke.width;
      height += stroke.width;
    }
    bounds.minX = -anchor._x * width;
    bounds.maxX = bounds.minX + width;
    bounds.minY = -anchor._y * (height + offset);
    bounds.maxY = bounds.minY + height;
  }
  /**
   * The resolution / device pixel ratio of the canvas.
   * @default 1
   */
  set resolution(value) {
    if (value !== null) {
      warn.warn(
        // eslint-disable-next-line max-len
        "[BitmapText] dynamically updating the resolution is not supported. Resolution should be managed by the BitmapFont."
      );
    }
  }
  get resolution() {
    return this._resolution;
  }
}

exports.BitmapText = BitmapText;
//# sourceMappingURL=BitmapText.js.map
