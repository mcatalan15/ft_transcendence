'use strict';

"use strict";
function transformVertices(vertices, m, offset, stride, size) {
  const a = m.a;
  const b = m.b;
  const c = m.c;
  const d = m.d;
  const tx = m.tx;
  const ty = m.ty;
  offset || (offset = 0);
  stride || (stride = 2);
  size || (size = vertices.length / stride - offset);
  let index = offset * stride;
  for (let i = 0; i < size; i++) {
    const x = vertices[index];
    const y = vertices[index + 1];
    vertices[index] = a * x + c * y + tx;
    vertices[index + 1] = b * x + d * y + ty;
    index += stride;
  }
}

exports.transformVertices = transformVertices;
//# sourceMappingURL=transformVertices.js.map
