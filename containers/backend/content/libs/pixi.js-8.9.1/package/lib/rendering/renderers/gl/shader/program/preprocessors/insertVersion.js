'use strict';

"use strict";
function insertVersion(src, isES300) {
  if (!isES300)
    return src;
  return `#version 300 es
${src}`;
}

exports.insertVersion = insertVersion;
//# sourceMappingURL=insertVersion.js.map
