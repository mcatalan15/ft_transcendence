import { deprecation, v8_0_0 } from '../../../../utils/logging/deprecation.mjs';

"use strict";
var MSAA_QUALITY = /* @__PURE__ */ ((MSAA_QUALITY2) => {
  MSAA_QUALITY2[MSAA_QUALITY2["NONE"] = 0] = "NONE";
  MSAA_QUALITY2[MSAA_QUALITY2["LOW"] = 2] = "LOW";
  MSAA_QUALITY2[MSAA_QUALITY2["MEDIUM"] = 4] = "MEDIUM";
  MSAA_QUALITY2[MSAA_QUALITY2["HIGH"] = 8] = "HIGH";
  return MSAA_QUALITY2;
})(MSAA_QUALITY || {});
var DEPRECATED_WRAP_MODES = /* @__PURE__ */ ((DEPRECATED_WRAP_MODES2) => {
  DEPRECATED_WRAP_MODES2["CLAMP"] = "clamp-to-edge";
  DEPRECATED_WRAP_MODES2["REPEAT"] = "repeat";
  DEPRECATED_WRAP_MODES2["MIRRORED_REPEAT"] = "mirror-repeat";
  return DEPRECATED_WRAP_MODES2;
})(DEPRECATED_WRAP_MODES || {});
const WRAP_MODES = new Proxy(DEPRECATED_WRAP_MODES, {
  get(target, prop) {
    deprecation(v8_0_0, `DRAW_MODES.${prop} is deprecated, use '${DEPRECATED_WRAP_MODES[prop]}' instead`);
    return target[prop];
  }
});
var DEPRECATED_SCALE_MODES = /* @__PURE__ */ ((DEPRECATED_SCALE_MODES2) => {
  DEPRECATED_SCALE_MODES2["NEAREST"] = "nearest";
  DEPRECATED_SCALE_MODES2["LINEAR"] = "linear";
  return DEPRECATED_SCALE_MODES2;
})(DEPRECATED_SCALE_MODES || {});
const SCALE_MODES = new Proxy(DEPRECATED_SCALE_MODES, {
  get(target, prop) {
    deprecation(v8_0_0, `DRAW_MODES.${prop} is deprecated, use '${DEPRECATED_SCALE_MODES[prop]}' instead`);
    return target[prop];
  }
});

export { DEPRECATED_SCALE_MODES, DEPRECATED_WRAP_MODES, MSAA_QUALITY, SCALE_MODES, WRAP_MODES };
//# sourceMappingURL=const.mjs.map
